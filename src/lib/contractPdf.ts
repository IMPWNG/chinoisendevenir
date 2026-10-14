import { readFileSync } from "node:fs";
import { join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

/**
 * Noto Sans (OFL) in src/lib/fonts/.
 * ponytail: the CJK file only covers the fixed company name and address.
 * Regenerate NotoSansSC-Subset.ttf if CONTRACT_COMPANY or CONTRACT_ADDRESS changes.
 */
const LATIN_PATH = "src/lib/fonts/NotoSans-Regular.ttf";
const CJK_PATH = "src/lib/fonts/NotoSansSC-Subset.ttf";
const STAMP_PATH = "public/tampon-entreprise.png";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 48;
const MARGIN_TOP = 52;
const MARGIN_BOTTOM = 46;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const NAVY = rgb(29 / 255, 53 / 255, 87 / 255);
const INK = rgb(36 / 255, 61 / 255, 76 / 255);
const MUTED = rgb(90 / 255, 104 / 255, 118 / 255);
const RULE = rgb(0.82, 0.85, 0.89);
const HEAD_BG = rgb(0.94, 0.96, 0.98);

export const CONTRACT_PDF_NOTE = "Le PDF du contrat est joint à cet e-mail.";

export type ContractBlock =
  | { kind: "brand" | "h1" | "subtitle" | "title" | "p" | "li"; text: string }
  | { kind: "table"; rows: string[][] }
  | { kind: "stamp" };

let latinBytes: Uint8Array | undefined;
let cjkBytes: Uint8Array | undefined;
let stampBytes: Uint8Array | undefined;
let latinSet: Set<number> | undefined;
let cjkSet: Set<number> | undefined;

function asset(path: string) {
  return new Uint8Array(readFileSync(join(process.cwd(), path)));
}

function coverage() {
  if (!latinSet || !cjkSet || !latinBytes || !cjkBytes) {
    latinBytes = asset(LATIN_PATH);
    cjkBytes = asset(CJK_PATH);
    latinSet = new Set(fontkit.create(latinBytes).characterSet);
    cjkSet = new Set(fontkit.create(cjkBytes).characterSet);
  }
  return { latinSet, cjkSet, latinBytes, cjkBytes };
}

/** Characters the embedded fonts cannot draw. Whitespace is ignored. */
export function contractFontGaps(text: string) {
  const { latinSet, cjkSet } = coverage();
  const missing = new Set<string>();
  for (const ch of text) {
    const cp = ch.codePointAt(0) || 0;
    if (cp <= 32) continue;
    if (!latinSet.has(cp) && !cjkSet.has(cp)) missing.add(ch);
  }
  return [...missing].join("");
}

function clean(text: string) {
  const { latinSet, cjkSet } = coverage();
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0) || 0;
    if (cp === 10 || latinSet.has(cp) || cjkSet.has(cp)) out += ch;
    else if (cp > 32) out += "?";
  }
  return out;
}

function decode(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCodePoint(Number(num)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function plain(html: string) {
  return decode(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "))
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function contractHtmlBlocks(html: string): ContractBlock[] {
  const body = html.split(/<body[^>]*>/i)[1]?.split(/<\/body>/i)[0] || html;
  const re =
    /<h1\b[^>]*>([\s\S]*?)<\/h1>|<div class="section-title">([\s\S]*?)<\/div>|<li>([\s\S]*?)<\/li>|<p\b([^>]*)>([\s\S]*?)<\/p>|<tr>([\s\S]*?)<\/tr>|<img\b[^>]*>/gi;
  const blocks: ContractBlock[] = [];
  let expectSubtitle = false;
  for (const match of body.matchAll(re)) {
    if (match[1] != null) {
      const text = plain(match[1]);
      if (text) blocks.push({ kind: "h1", text });
      expectSubtitle = true;
      continue;
    }
    if (match[2] != null) {
      const text = plain(match[2]);
      if (text) blocks.push({ kind: "title", text });
      expectSubtitle = false;
      continue;
    }
    if (match[3] != null) {
      const text = plain(match[3]);
      if (text) blocks.push({ kind: "li", text });
      expectSubtitle = false;
      continue;
    }
    if (match[5] != null) {
      const text = plain(match[5]);
      if (!text) continue;
      const attrs = match[4] || "";
      if (/header-brand/.test(attrs)) blocks.push({ kind: "brand", text });
      else if (expectSubtitle) blocks.push({ kind: "subtitle", text });
      else blocks.push({ kind: "p", text });
      expectSubtitle = false;
      continue;
    }
    if (match[6] != null) {
      const rows = [...match[6].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
        (cell) => plain(cell[1]),
      );
      const last = blocks[blocks.length - 1];
      if (last && last.kind === "table") last.rows.push(rows);
      else blocks.push({ kind: "table", rows: [rows] });
      expectSubtitle = false;
      continue;
    }
    blocks.push({ kind: "stamp" });
    expectSubtitle = false;
  }
  return blocks;
}

export function contractEmailWithPdfNote(html: string) {
  const needle = '<div class="greeting"><p>';
  if (!html.includes(needle)) return html;
  return html.replace(needle, `<div class="greeting"><p>${CONTRACT_PDF_NOTE}</p><p>`);
}

export function contractPdfFilename(fullName: string) {
  const slug = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `contrat-${slug || "accompagnement"}.pdf`;
}

function kindOf(cp: number, latin: Set<number>, cjk: Set<number>) {
  return cjk.has(cp) && !latin.has(cp) ? "cjk" : "latin";
}

function measure(text: string, size: number, latin: PDFFont, cjk: PDFFont, latinSet: Set<number>, cjkSet: Set<number>) {
  let width = 0;
  let buf = "";
  let current: "latin" | "cjk" | "" = "";
  const flush = () => {
    if (!buf) return;
    width += (current === "cjk" ? cjk : latin).widthOfTextAtSize(buf, size);
    buf = "";
  };
  for (const ch of text) {
    const next = kindOf(ch.codePointAt(0) || 0, latinSet, cjkSet);
    if (current && next !== current) flush();
    current = next;
    buf += ch;
  }
  flush();
  return width;
}

function paint(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  color: ReturnType<typeof rgb>,
  latin: PDFFont,
  cjk: PDFFont,
  latinSet: Set<number>,
  cjkSet: Set<number>,
) {
  let cursor = x;
  let buf = "";
  let current: "latin" | "cjk" | "" = "";
  const flush = () => {
    if (!buf) return;
    const font = current === "cjk" ? cjk : latin;
    page.drawText(buf, { x: cursor, y, size, font, color });
    cursor += font.widthOfTextAtSize(buf, size);
    buf = "";
  };
  for (const ch of text) {
    const next = kindOf(ch.codePointAt(0) || 0, latinSet, cjkSet);
    if (current && next !== current) flush();
    current = next;
    buf += ch;
  }
  flush();
}

function wrap(
  text: string,
  size: number,
  maxWidth: number,
  latin: PDFFont,
  cjk: PDFFont,
  latinSet: Set<number>,
  cjkSet: Set<number>,
) {
  const lines: string[] = [];
  let current = "";
  const width = (value: string) => measure(value, size, latin, cjk, latinSet, cjkSet);
  for (const token of text.split(/(\s+)/)) {
    if (!token) continue;
    if (width(current + token) <= maxWidth) {
      current += token;
      continue;
    }
    if (current.trim()) {
      lines.push(current.trimEnd());
      current = "";
    }
    if (width(token) <= maxWidth) {
      current = token.trimStart();
      continue;
    }
    for (const ch of token.trimStart()) {
      if (current && width(current + ch) > maxWidth) {
        lines.push(current);
        current = "";
      }
      current += ch;
    }
  }
  if (current.trim()) lines.push(current.trimEnd());
  return lines;
}

export async function contractHtmlToPdf(html: string, title = "Contrat d'accompagnement") {
  const blocks = contractHtmlBlocks(html);
  if (!blocks.length) throw new Error("contrat vide");
  const { latinSet, cjkSet, latinBytes, cjkBytes } = coverage();
  stampBytes ??= asset(STAMP_PATH);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const latin = await pdf.embedFont(latinBytes, { subset: true });
  const cjk = await pdf.embedFont(cjkBytes, { subset: true });
  const stamp = await pdf.embedPng(stampBytes);
  pdf.setTitle(title);
  pdf.setAuthor("Chinois en Devenir");

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_TOP;

  const ensure = (height: number) => {
    const room = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM;
    if (height < room && y - height < MARGIN_BOTTOM) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN_TOP;
    }
  };

  const drawLines = (
    lines: string[],
    size: number,
    color: ReturnType<typeof rgb>,
    opts: { indent?: number; center?: boolean; gap?: number; before?: number },
  ) => {
    const lineHeight = size * 1.4;
    if (opts.before) ensure(opts.before);
    for (const line of lines) {
      ensure(lineHeight);
      const baseline = y - size;
      const lineWidth = measure(line, size, latin, cjk, latinSet, cjkSet);
      const x = opts.center
        ? Math.max(MARGIN_X, (PAGE_W - lineWidth) / 2)
        : MARGIN_X + (opts.indent || 0);
      paint(page, line, x, baseline, size, color, latin, cjk, latinSet, cjkSet);
      y -= lineHeight;
    }
    y -= opts.gap ?? 4;
  };

  const textLines = (text: string, size: number, maxWidth: number) =>
    text
      .split("\n")
      .flatMap((line) => wrap(clean(line), size, maxWidth, latin, cjk, latinSet, cjkSet));

  for (const block of blocks) {
    if (block.kind === "brand") {
      drawLines(textLines(block.text.toLocaleUpperCase("fr-FR"), 9, CONTENT_W), 9, MUTED, {
        center: true,
        gap: 6,
      });
    } else if (block.kind === "h1") {
      drawLines(textLines(block.text, 16, CONTENT_W), 16, NAVY, { center: true, gap: 3 });
    } else if (block.kind === "subtitle") {
      drawLines(textLines(block.text, 11, CONTENT_W), 11, MUTED, { center: true, gap: 16 });
    } else if (block.kind === "title") {
      drawLines(
        textLines(block.text.toLocaleUpperCase("fr-FR"), 11, CONTENT_W),
        11,
        NAVY,
        { before: 28, gap: 6 },
      );
    } else if (block.kind === "p") {
      drawLines(textLines(block.text, 10, CONTENT_W), 10, INK, { gap: 6 });
    } else if (block.kind === "li") {
      const lines = textLines(`– ${block.text}`, 10, CONTENT_W - 12);
      drawLines(lines, 10, INK, { indent: 12, gap: 2 });
    } else if (block.kind === "table") {
      const cols = [168, 130, CONTENT_W - 298];
      const size = 8.5;
      const lineHeight = 11;
      const pad = 4;
      for (const [index, row] of block.rows.entries()) {
        const cells = row.map((cell, col) =>
          textLines(cell, size, Math.max(20, cols[col] - pad * 2)),
        );
        const height = Math.max(...cells.map((cell) => cell.length), 1) * lineHeight + pad * 2;
        ensure(height);
        let x = MARGIN_X;
        const top = y;
        cells.forEach((cell, col) => {
          page.drawRectangle({
            x,
            y: top - height,
            width: cols[col],
            height,
            borderColor: RULE,
            borderWidth: 0.6,
            color: index === 0 ? HEAD_BG : rgb(1, 1, 1),
          });
          cell.forEach((line, lineIndex) => {
            paint(
              page,
              line,
              x + pad,
              top - pad - size - lineIndex * lineHeight,
              size,
              index === 0 ? NAVY : INK,
              latin,
              cjk,
              latinSet,
              cjkSet,
            );
          });
          x += cols[col];
        });
        y = top - height;
      }
      y -= 8;
    } else if (block.kind === "stamp") {
      const width = 150;
      const height = (stamp.height / stamp.width) * width;
      ensure(height + 4);
      page.drawImage(stamp, { x: MARGIN_X, y: y - height, width, height });
      y -= height + 8;
    }
  }

  const pages = pdf.getPages();
  pages.forEach((item, index) => {
    const label = `${index + 1} / ${pages.length}`;
    item.drawText(label, {
      x: PAGE_W - MARGIN_X - latin.widthOfTextAtSize(label, 8),
      y: 26,
      size: 8,
      font: latin,
      color: MUTED,
    });
  });

  return pdf.save();
}
