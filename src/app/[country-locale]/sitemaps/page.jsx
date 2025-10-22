import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sitemaps",
  description: "Quick access to all sitemap endpoints for this locale.",
};

const SITEMAP_SECTIONS = [
  {
    title: "Primary",
    links: (locale) => [
      { label: "Locale sitemap index", href: `/${locale}/sitemap.xml` },
      { label: "Static pages", href: `/${locale}/sitemap-static.xml` },
      { label: "Categories", href: `/${locale}/sitemap-categories.xml` },
      { label: "Companies", href: `/${locale}/sitemap-companies.xml` },
      { label: "Blogs", href: `/${locale}/sitemap-blogs.xml` },
    ],
  },
  {
    title: "Products",
    description: "Chunked product sitemaps (per 10k URLs).",
    links: (locale) => [
      { label: "Chunk 0", href: `/${locale}/sitemap-products0.xml` },
      { label: "Chunk 1", href: `/${locale}/sitemap-products1.xml` },
      { label: "Chunk 2", href: `/${locale}/sitemap-products2.xml` },
    ],
  },
  {
    title: "Media",
    links: () => [
      { label: "Global image/video sitemap index", href: `/sitemap-images.xml` },
    ],
  },
];

export default function LocaleSitemapsPage({ params }) {
  const locale = params?.["country-locale"] || "";

  return (
    <section className="py-5">
      <div className="container">
        <h1 style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}>
          Sitemaps for locale {locale}
        </h1>
        <p className="mb-4">
          Use the links below to inspect or submit the sitemap files associated with
          the <strong>{locale}</strong> locale.
        </p>

        <div className="row gy-4">
          {SITEMAP_SECTIONS.map(({ title, description, links }) => (
            <div className="col-lg-4 col-md-6" key={title}>
              <div className="border rounded p-3 h-100">
                <h2 className="h5 mb-3">{title}</h2>
                {description && <p className="small text-muted mb-3">{description}</p>}
                <ul className="list-unstyled mb-0">
                  {links(locale).map(({ label, href }) => (
                    <li key={href} className="mb-2">
                      <Link href={href} className="text-decoration-none">
                        {href}
                      </Link>
                      <div className="small text-muted">{label}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
