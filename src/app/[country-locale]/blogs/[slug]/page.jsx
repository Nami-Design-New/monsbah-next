import ShareButton from "@/components/shared/ShareButton";
import { Link } from "@/i18n/navigation";
import { getBlogs } from "@/services/blogs/getBlogs";
import { getBlogsDetails } from "@/services/blogs/getBlogsDetails";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { cache } from "react";
import { generateBlogSEO } from "@/utils/seo";
import { notFound, redirect } from "next/navigation";

const fetchBlogDetails = cache(async (id) => {
  return await getBlogsDetails(id);
});

function normalizeSlug(slug) {
  if (!slug) return "";
  return slug
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function resolveBlog(slug) {
  const candidates = [];
  let decoded = slug || "";
  if (slug) {
    try {
      decoded = decodeURIComponent(slug);
    } catch {
      decoded = slug;
    }
  }
  if (decoded) {
    candidates.push(decoded);
    const hyphenated = normalizeSlug(decoded);
    if (hyphenated && hyphenated !== decoded) {
      candidates.push(hyphenated);
    }
    const spaced = decoded.replace(/-/g, " ").trim();
    if (spaced && spaced !== decoded && spaced !== hyphenated) {
      candidates.push(spaced);
    }
  }

  for (const candidate of [...new Set(candidates)]) {
    try {
      const blog = await fetchBlogDetails(candidate);
      if (blog) {
        return { blog, matchedSlug: candidate };
      }
    } catch {
      // continue to next candidate
    }
  }

  return { blog: null, matchedSlug: normalizeSlug(decoded) };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug;
  const locale = await getLocale();
  const { blog } = await resolveBlog(rawSlug);
  
  if (!blog) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  // Use the new SEO utility with canonical URL support
  const seoData = generateBlogSEO(blog, locale);

  return {
    title: seoData.metaTags.title,
    description: seoData.metaTags.description,
    keywords: seoData.metaTags.keywords,
    
    // Use canonical URL (either custom or generated)
    alternates: {
      canonical: seoData.canonicalUrl,
      ...seoData.hreflangAlternates,
    },

    openGraph: seoData.openGraph,
    twitter: seoData.twitterCard,

    robots: {
      index: seoData.robots.index,
      follow: seoData.robots.follow,
    },

    // Add structured data
    other: {
      'application/ld+json': JSON.stringify(seoData.structuredData),
    },
  };
}

export default async function page({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const localeParam = resolvedParams["country-locale"];
  const t = await getTranslations();
  const { blog, matchedSlug } = await resolveBlog(slug);

  if (!blog) {
    notFound();
  }

  const fallbackId = blog.id ? String(blog.id) : "";
  const canonicalSlugFromBlog = normalizeSlug(blog.slug || "");
  const canonicalSlug =
    canonicalSlugFromBlog ||
    normalizeSlug(matchedSlug || "") ||
    normalizeSlug(fallbackId) ||
    fallbackId;

  let decodedRequestSlug = slug || "";
  if (slug) {
    try {
      decodedRequestSlug = decodeURIComponent(slug);
    } catch {
      decodedRequestSlug = slug;
    }
  }
  const requestSlugNormalized =
    normalizeSlug(decodedRequestSlug) ||
    normalizeSlug(matchedSlug || "") ||
    normalizeSlug(fallbackId) ||
    fallbackId;

  if (
    canonicalSlugFromBlog &&
    requestSlugNormalized &&
    requestSlugNormalized !== canonicalSlugFromBlog
  ) {
    const targetLocale = localeParam || (await getLocale());
    redirect(`/${targetLocale}/blogs/${encodeURIComponent(canonicalSlugFromBlog)}`);
  }

  const blogs = await getBlogs();

  return (
    <section className="blog_details">
      <div className="container">
        <div className="row">
          <div className="col-lg-9 col-12 p-2">
            <div className="blog_header">
              <h1>{blog?.title}</h1>
              <div className="blog_header_actions">
                <span className="date">
                  <i className="fa-light fa-calendar-days"></i> {blog?.date}
                </span>
                <ShareButton className="color-white" />
              </div>
            </div>
            <div className="blog_content">
              <div className="img">
                <img src={blog?.image} alt="فساتين زفاف 2024" />
              </div>{" "}
              <div
                className="content-text"
                dangerouslySetInnerHTML={{ __html: blog?.description }}
              />
            </div>
          </div>
          <div className="col-lg-3 col-12 p-2">
            <div className="recent_blogs">
              <h3>{t("recentArticles")}</h3>
              <ul>
                {blogs?.map((blogItem) => {
                  const normalizedSlug =
                    normalizeSlug(blogItem?.slug || "") ||
                    (blogItem?.id ? String(blogItem.id) : "");

                  if (!normalizedSlug || normalizedSlug === canonicalSlug) {
                    return null;
                  }

                  return (
                    <li key={blogItem?.id ?? normalizedSlug}>
                      <Link
                        href={`/blogs/${encodeURIComponent(normalizedSlug)}`}
                      >
                        <h4>{blogItem?.title}</h4>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
