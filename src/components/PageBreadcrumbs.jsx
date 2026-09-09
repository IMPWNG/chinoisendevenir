"use client";

import Link from "next/link";
import { useSiteI18n } from "../context/SiteI18nContext";

export default function PageBreadcrumbs({ items }) {
  const { t } = useSiteI18n();

  return (
    <nav className="seo-breadcrumbs" aria-label={t("breadcrumbs.aria")}>
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path}>
              {last ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
