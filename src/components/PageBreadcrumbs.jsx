import Link from "next/link";

export default function PageBreadcrumbs({ items }) {
  return (
    <nav className="seo-breadcrumbs" aria-label="Fil d'Ariane">
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
