#!/usr/bin/env python3
"""Crawl official Chinese university admission sites with Scrapling.

Writes LLM-ready page text to data/universities/raw/{slug}.json so
scripts/scan-universities.mjs can extract structured profiles.

Usage:
  .venv-scrapling/bin/python scripts/scrapling-crawl-universities.py
  .venv-scrapling/bin/python scripts/scrapling-crawl-universities.py --only hust,scut
  .venv-scrapling/bin/python scripts/scrapling-crawl-universities.py --limit 2 --force
  .venv-scrapling/bin/python scripts/scrapling-crawl-universities.py --no-browser
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
TARGETS_PATH = ROOT / "scripts" / "university-targets.json"
RAW_DIR = ROOT / "data" / "universities" / "raw"

MAX_PAGES_PER_UNI = 16
MAX_DEPTH = 2
MAX_CHARS_PER_PAGE = 16000
MAX_FOLLOW_PER_PAGE = 12
THIN_PAGE_CHARS = 180

LINK_KEYWORDS = (
    "admission",
    "apply",
    "application",
    "scholarship",
    "tuition",
    "fee",
    "accommodation",
    "dormitory",
    "housing",
    "visa",
    "international",
    "program",
    "requirement",
    "eligibility",
    "document",
    "language",
    "hsk",
    "undergraduate",
    "postgraduate",
    "bachelor",
    "master",
    "phd",
    "doctoral",
    "prospectus",
    "brochure",
    "degree",
    "foundation",
    "contact",
    "howtoapply",
    "how-to-apply",
    "enroll",
    "iso",
    "sie",
    "cie",
    "lxs",
    "gjy",
    "招生",
    "留学",
    "奖学金",
    "申请",
    "学费",
    "宿舍",
    "签证",
    "入学",
    "简章",
    "国际",
    "来华",
    "本科",
    "硕士",
    "博士",
    "汉语",
    "语言",
    "住宿",
    "条件",
    "材料",
    "费用",
)

SKIP_FOLLOW_HOST_PARTS = (
    "wikipedia.org",
    "google.",
    "baidu.com",
    "facebook.com",
    "twitter.com",
    "youtube.com",
    "weibo.com",
    "instagram.com",
)

SKIP_URL_RE = re.compile(
    r"javascript:|mailto:|tel:|\.(?:pdf|docx?|xlsx?|zip|rar|jpg|jpeg|png|gif|mp4|css|js)(?:\?|$)",
    re.I,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Crawl university admission pages with Scrapling")
    parser.add_argument("--only", help="Comma-separated slugs or name fragments")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--force", action="store_true", help="Re-crawl even if raw file exists")
    parser.add_argument("--no-browser", action="store_true", help="Skip Playwright fallback for thin pages")
    parser.add_argument("--max-pages", type=int, default=MAX_PAGES_PER_UNI)
    return parser.parse_args()


def load_targets(args: argparse.Namespace) -> list[dict]:
    targets = json.loads(TARGETS_PATH.read_text(encoding="utf-8"))
    if args.only:
        queries = [q.strip().lower() for q in args.only.split(",") if q.strip()]
        selected = []
        for uni in targets:
            blob = " ".join(
                [uni.get("slug", ""), uni.get("name_en", ""), *uni.get("aliases", [])]
            ).lower()
            if any(q in blob or q in uni.get("slug", "") for q in queries):
                selected.append(uni)
        if not selected:
            raise SystemExit(f"Aucune université ne correspond à --only {args.only}")
        targets = selected
    if args.limit and args.limit > 0:
        targets = targets[: args.limit]
    return targets


def allowed_domains_for(uni: dict) -> set[str]:
    domains: set[str] = set()
    for url in uni.get("seed_urls") or []:
        host = (urlparse(url).hostname or "").lower().removeprefix("www.")
        if not host or any(part in host for part in SKIP_FOLLOW_HOST_PARTS):
            continue
        parts = host.split(".")
        if len(parts) >= 3 and parts[-2:] == ["edu", "cn"]:
            domains.add(".".join(parts[-3:]))
        elif len(parts) >= 2:
            domains.add(".".join(parts[-2:]))
        else:
            domains.add(host)
    return domains


def score_link(url: str, text: str, allowed: set[str]) -> int:
    if SKIP_URL_RE.search(url):
        return 0
    blob = f"{url} {text}".lower()
    score = 0
    try:
        host = (urlparse(url).hostname or "").lower().removeprefix("www.")
    except ValueError:
        return 0
    if any(part in host for part in SKIP_FOLLOW_HOST_PARTS):
        return 0
    if any(host == d or host.endswith(f".{d}") for d in allowed):
        score += 3
    else:
        return 0
    for keyword in LINK_KEYWORDS:
        if keyword.lower() in blob:
            score += 2
    if re.search(r"en/|/en|english|intl|iso|sie|cie|admission|study|lxs|gjy", url, re.I):
        score += 2
    return score


def make_spider_class(uni: dict, args: argparse.Namespace):
    from scrapling.fetchers import AsyncDynamicSession, FetcherSession
    from scrapling.spiders import Request, Response, Spider

    class UniversityAdmissionSpider(Spider):
        name = "uni_admission"
        start_urls: list[str] = []
        allowed_domains: set[str] = set()
        use_browser = False
        max_pages_limit = MAX_PAGES_PER_UNI
        concurrent_requests = 3
        concurrent_requests_per_domain = 2
        download_delay = 0.45
        autothrottle_enabled = True
        autothrottle_start_delay = 0.6
        autothrottle_max_delay = 12.0
        robots_txt_obey = False
        logging_level = logging.INFO

        def configure_sessions(self, manager):
            manager.add(
                "http",
                FetcherSession(
                    impersonate="chrome",
                    stealthy_headers=True,
                    timeout=25,
                    verify=False,
                    follow_redirects=True,
                    retries=2,
                    headers={
                        "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,fr;q=0.7",
                    },
                ),
                default=True,
            )
            if self.use_browser:
                manager.add(
                    "browser",
                    AsyncDynamicSession(
                        headless=True,
                        disable_resources=True,
                        network_idle=True,
                        timeout=25000,
                    ),
                    lazy=True,
                )

        def __init__(self, crawldir=None, interval=300.0):
            super().__init__(crawldir=crawldir, interval=interval)
            self._page_count = 0
            self._browser_retried: set[str] = set()

        async def parse(self, response: Response):
            if self._page_count >= self.max_pages_limit:
                return

            markdown = ""
            try:
                markdown = (response.markdown(main_content_only=True) or "").strip()
            except Exception as exc:  # noqa: BLE001
                self.logger.warning("markdown failed for %s: %s", response.url, exc)

            status = getattr(response, "status", 0) or 0
            sid = (response.meta or {}).get("sid") or ""
            thin = (not markdown) or len(markdown) < THIN_PAGE_CHARS or status >= 400
            if (
                thin
                and self.use_browser
                and sid != "browser"
                and status == 200
                and response.url not in self._browser_retried
            ):
                self._browser_retried.add(response.url)
                yield Request(
                    response.url,
                    sid="browser",
                    callback=self.parse,
                    dont_filter=True,
                    meta={"depth": (response.meta or {}).get("depth", 0), "sid": "browser"},
                    priority=20,
                )
                return

            if not markdown or status >= 400:
                return

            self._page_count += 1
            title = str(response.css("title::text").get() or "").strip()[:180]
            yield {
                "url": response.url,
                "title": title,
                "status": status,
                "error": None if markdown else (f"empty page status={status}"),
                "text": markdown[:MAX_CHARS_PER_PAGE],
            }

            depth = int((response.meta or {}).get("depth") or 0)
            if depth >= MAX_DEPTH or self._page_count >= self.max_pages_limit:
                return

            scored = []
            for anchor in response.css("a"):
                href = (anchor.attrib or {}).get("href") or ""
                if not href:
                    continue
                try:
                    absolute = response.urljoin(href)
                except Exception:  # noqa: BLE001
                    continue
                text = " ".join(anchor.css("::text").getall())[:80]
                points = score_link(absolute, text, self.allowed_domains)
                if points > 0:
                    scored.append((points, absolute))
            scored.sort(key=lambda item: item[0], reverse=True)

            seen_local = set()
            for points, url in scored[:MAX_FOLLOW_PER_PAGE]:
                if url in seen_local:
                    continue
                seen_local.add(url)
                yield response.follow(
                    url,
                    callback=self.parse,
                    priority=points,
                    meta={"depth": depth + 1},
                )

    slug = re.sub(r"[^a-z0-9]+", "_", uni["slug"].lower()).strip("_")
    return type(
        f"Uni_{slug}",
        (UniversityAdmissionSpider,),
        {
            "name": f"uni_{slug}",
            "start_urls": [
                u
                for u in (uni.get("seed_urls") or [])
                if u.startswith(("http://", "https://"))
            ],
            "allowed_domains": allowed_domains_for(uni),
            "use_browser": not args.no_browser,
            "max_pages_limit": args.max_pages,
        },
    )


def crawl_university(uni: dict, args: argparse.Namespace) -> dict:
    pages = []
    seed_text = str(uni.get("seed_text") or "").strip()
    if len(seed_text) > 80:
        pages.append(
            {
                "url": (uni.get("seed_urls") or [uni.get("website") or "seed-text"])[0],
                "title": "Extraits officiels (admission / frais / bourses)",
                "status": 200,
                "error": None,
                "text": seed_text[:MAX_CHARS_PER_PAGE],
            }
        )

    spider_cls = make_spider_class(uni, args)
    if not spider_cls.start_urls:
        return {
            "slug": uni["slug"],
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "engine": "scrapling",
            "pages": pages,
        }

    result = spider_cls().start()
    seen_urls = {p["url"] for p in pages}
    for item in result.items:
        url = item.get("url")
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        pages.append(
            {
                "url": url,
                "title": item.get("title") or None,
                "status": item.get("status") or 0,
                "error": item.get("error"),
                "text": item.get("text") or "",
            }
        )

    return {
        "slug": uni["slug"],
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "engine": "scrapling",
        "pages": pages,
        "stats": {
            "requests": getattr(result.stats, "requests_count", None),
            "items": getattr(result.stats, "items_scraped", None),
            "seconds": getattr(result.stats, "elapsed_seconds", None),
        },
    }


def main() -> int:
    args = parse_args()
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    targets = load_targets(args)
    print(f"Universités à crawler : {len(targets)}")
    print(f"Moteur               : Scrapling (Fetcher + {'browser fallback' if not args.no_browser else 'HTTP only'})")
    print(f"Sortie               : {RAW_DIR}\n")

    ok = 0
    for uni in targets:
        raw_path = RAW_DIR / f"{uni['slug']}.json"
        if not args.force and raw_path.exists():
            print(f"↷  {uni['name_en']} (déjà crawlé, utilise --force pour refaire)")
            ok += 1
            continue
        print(f"→  {uni['name_en']}")
        try:
            payload = crawl_university(uni, args)
        except Exception as exc:  # noqa: BLE001
            print(f"   ✗ {exc}")
            payload = {
                "slug": uni["slug"],
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "engine": "scrapling",
                "pages": [],
                "error": str(exc),
            }
        raw_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        usable = sum(1 for p in payload.get("pages") or [] if len(p.get("text") or "") > 80)
        print(f"   ✓ {usable} pages exploitables ({len(payload.get('pages') or [])} fetch)")
        if usable:
            ok += 1

    print(f"\nTerminé. {ok}/{len(targets)} universités avec du contenu.")
    print("Ensuite : node scripts/scan-universities.mjs --force --from-raw")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
