import { BASE_URL } from "@/utils/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Helper to fetch chunk count for each type
async function getChunkInfo(locale) {
  const info = {
    static: 1,
    categories: 1,
    companies: 1,
    blogs: 1,
    products: 1,
  };

  try {
    // Try to detect chunks by checking headers
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    // Check companies chunks
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(`${baseUrl}/${locale}/companies/sitemap-companies${i}.xml`, {
          method: "HEAD",
          cache: "no-store",
        });
        if (res.ok) {
          info.companies = i + 1;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    // Check categories chunks
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(`${baseUrl}/${locale}/categories/sitemap-categories${i}.xml`, {
          method: "HEAD",
          cache: "no-store",
        });
        if (res.ok) {
          info.categories = i + 1;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    // Check blogs chunks
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(`${baseUrl}/${locale}/blogs/sitemap-blogs${i}.xml`, {
          method: "HEAD",
          cache: "no-store",
        });
        if (res.ok) {
          info.blogs = i + 1;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    // Check products chunks
    for (let i = 0; i < 100; i++) {
      try {
        const res = await fetch(`${baseUrl}/${locale}/products/sitemap${i}.xml`, {
          method: "HEAD",
          cache: "no-store",
        });
        if (res.ok) {
          info.products = i + 1;
        } else {
          break;
        }
      } catch {
        break;
      }
    }
  } catch (error) {
    console.error("Error detecting chunks:", error);
  }

  return info;
}

export default async function SitemapsPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams["country-locale"] || "kw-ar";
  const [countrySlug, lang] = locale.split("-");
  
  const countryNames = {
    sa: lang === "ar" ? "السعودية" : "Saudi Arabia",
    kw: lang === "ar" ? "الكويت" : "Kuwait",
    ae: lang === "ar" ? "الإمارات" : "UAE",
    bh: lang === "ar" ? "البحرين" : "Bahrain",
    om: lang === "ar" ? "عمان" : "Oman",
    qa: lang === "ar" ? "قطر" : "Qatar",
  };

  const countryName = countryNames[countrySlug] || countrySlug.toUpperCase();
  
  // Get chunk information
  const chunkInfo = await getChunkInfo(locale);

  const isArabic = lang === "ar";

  return (
    <html lang={lang} dir={isArabic ? "rtl" : "ltr"}>
      <head>
        <title>
          {isArabic 
            ? `خريطة الموقع - ${countryName}` 
            : `Sitemap Index - ${countryName}`}
        </title>
        <meta name="robots" content="noindex, follow" />
      </head>
      <body style={{
        fontFamily: isArabic ? "Arial, sans-serif" : "system-ui, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f5f5f5",
      }}>
        <header style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
          <h1 style={{ margin: 0, color: "#333" }}>
            {isArabic ? "🗺️ خريطة الموقع" : "🗺️ Sitemap Index"}
          </h1>
          <p style={{ margin: "10px 0 0 0", color: "#666" }}>
            {isArabic 
              ? `جميع خرائط الموقع لـ ${countryName}` 
              : `All sitemaps for ${countryName}`}
          </p>
        </header>

        <main>
          {/* Main Sitemap Index */}
          <section style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}>
            <h2 style={{ marginTop: 0, color: "#2563eb" }}>
              {isArabic ? "📋 الفهرس الرئيسي" : "📋 Main Index"}
            </h2>
            <Link 
              href="/sitemap.xml" 
              style={{
                display: "block",
                padding: "12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
                textDecoration: "none",
                color: "#2563eb",
                border: "1px solid #e5e7eb",
              }}
            >
              📄 {BASE_URL}/sitemap.xml
            </Link>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              {isArabic 
                ? "يحتوي على روابط جميع خرائط الموقع الفرعية" 
                : "Contains links to all sub-sitemaps"}
            </p>
          </section>

          {/* Static Pages */}
          <section style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}>
            <h2 style={{ marginTop: 0, color: "#2563eb" }}>
              {isArabic ? "📄 الصفحات الثابتة" : "📄 Static Pages"}
            </h2>
            <Link 
              href={`/${locale}/sitemap-static.xml`}
              style={{
                display: "block",
                padding: "12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
                textDecoration: "none",
                color: "#2563eb",
                border: "1px solid #e5e7eb",
              }}
            >
              📄 {BASE_URL}/{locale}/sitemap-static.xml
            </Link>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              {isArabic 
                ? "الصفحات الرئيسية، من نحن، اتصل بنا، إلخ" 
                : "Home, About, Contact, etc."}
            </p>
          </section>

          {/* Categories */}
          <section style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}>
            <h2 style={{ marginTop: 0, color: "#2563eb" }}>
              {isArabic ? "🏷️ التصنيفات" : "🏷️ Categories"}
            </h2>
            {chunkInfo.categories === 1 ? (
              <Link 
                href={`/${locale}/sitemap-categories.xml`}
                style={{
                  display: "block",
                  padding: "12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "#2563eb",
                  border: "1px solid #e5e7eb",
                  marginBottom: "8px",
                }}
              >
                📄 {BASE_URL}/{locale}/sitemap-categories.xml
              </Link>
            ) : (
              Array.from({ length: chunkInfo.categories }, (_, i) => (
                <Link 
                  key={i}
                  href={`/${locale}/categories/sitemap-categories${i}.xml`}
                  style={{
                    display: "block",
                    padding: "12px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "#2563eb",
                    border: "1px solid #e5e7eb",
                    marginBottom: "8px",
                  }}
                >
                  📄 {BASE_URL}/{locale}/categories/sitemap-categories{i}.xml
                  <span style={{ 
                    float: isArabic ? "left" : "right", 
                    color: "#666",
                    fontSize: "14px",
                  }}>
                    {isArabic ? `الجزء ${i + 1}` : `Chunk ${i + 1}`}
                  </span>
                </Link>
              ))
            )}
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              {isArabic 
                ? `${chunkInfo.categories} ملف (حد أقصى 50,000 رابط لكل ملف)` 
                : `${chunkInfo.categories} file(s) (max 50,000 URLs each)`}
            </p>
          </section>

          {/* Companies */}
          <section style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}>
            <h2 style={{ marginTop: 0, color: "#2563eb" }}>
              {isArabic ? "🏢 الشركات" : "🏢 Companies"}
            </h2>
            {chunkInfo.companies === 1 ? (
              <Link 
                href={`/${locale}/sitemap-companies.xml`}
                style={{
                  display: "block",
                  padding: "12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "#2563eb",
                  border: "1px solid #e5e7eb",
                  marginBottom: "8px",
                }}
              >
                📄 {BASE_URL}/{locale}/sitemap-companies.xml
              </Link>
            ) : (
              Array.from({ length: chunkInfo.companies }, (_, i) => (
                <Link 
                  key={i}
                  href={`/${locale}/companies/sitemap-companies${i}.xml`}
                  style={{
                    display: "block",
                    padding: "12px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "#2563eb",
                    border: "1px solid #e5e7eb",
                    marginBottom: "8px",
                  }}
                >
                  📄 {BASE_URL}/{locale}/companies/sitemap-companies{i}.xml
                  <span style={{ 
                    float: isArabic ? "left" : "right", 
                    color: "#666",
                    fontSize: "14px",
                  }}>
                    {isArabic ? `الجزء ${i + 1}` : `Chunk ${i + 1}`}
                  </span>
                </Link>
              ))
            )}
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              {isArabic 
                ? `${chunkInfo.companies} ملف (حد أقصى 50,000 رابط لكل ملف)` 
                : `${chunkInfo.companies} file(s) (max 50,000 URLs each)`}
            </p>
          </section>

          {/* Blogs */}
          <section style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}>
            <h2 style={{ marginTop: 0, color: "#2563eb" }}>
              {isArabic ? "📝 المدونات" : "📝 Blogs"}
            </h2>
            {chunkInfo.blogs === 1 ? (
              <Link 
                href={`/${locale}/sitemap-blogs.xml`}
                style={{
                  display: "block",
                  padding: "12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "#2563eb",
                  border: "1px solid #e5e7eb",
                  marginBottom: "8px",
                }}
              >
                📄 {BASE_URL}/{locale}/sitemap-blogs.xml
              </Link>
            ) : (
              Array.from({ length: chunkInfo.blogs }, (_, i) => (
                <Link 
                  key={i}
                  href={`/${locale}/blogs/sitemap-blogs${i}.xml`}
                  style={{
                    display: "block",
                    padding: "12px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "#2563eb",
                    border: "1px solid #e5e7eb",
                    marginBottom: "8px",
                  }}
                >
                  📄 {BASE_URL}/{locale}/blogs/sitemap-blogs{i}.xml
                  <span style={{ 
                    float: isArabic ? "left" : "right", 
                    color: "#666",
                    fontSize: "14px",
                  }}>
                    {isArabic ? `الجزء ${i + 1}` : `Chunk ${i + 1}`}
                  </span>
                </Link>
              ))
            )}
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              {isArabic 
                ? `${chunkInfo.blogs} ملف (حد أقصى 50,000 رابط لكل ملف)` 
                : `${chunkInfo.blogs} file(s) (max 50,000 URLs each)`}
            </p>
          </section>

          {/* Products */}
          <section style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}>
            <h2 style={{ marginTop: 0, color: "#2563eb" }}>
              {isArabic ? "🛍️ المنتجات" : "🛍️ Products"}
            </h2>
            {Array.from({ length: Math.min(chunkInfo.products, 20) }, (_, i) => (
              <Link 
                key={i}
                href={`/${locale}/products/sitemap${i}.xml`}
                style={{
                  display: "block",
                  padding: "12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "#2563eb",
                  border: "1px solid #e5e7eb",
                  marginBottom: "8px",
                }}
              >
                📄 {BASE_URL}/{locale}/products/sitemap{i}.xml
                <span style={{ 
                  float: isArabic ? "left" : "right", 
                  color: "#666",
                  fontSize: "14px",
                }}>
                  {isArabic ? `الجزء ${i + 1}` : `Chunk ${i + 1}`}
                </span>
              </Link>
            ))}
            {chunkInfo.products > 20 && (
              <p style={{ fontSize: "14px", color: "#666", fontStyle: "italic" }}>
                {isArabic 
                  ? `... و ${chunkInfo.products - 20} ملف آخر` 
                  : `... and ${chunkInfo.products - 20} more file(s)`}
              </p>
            )}
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              {isArabic 
                ? `${chunkInfo.products} ملف (حد أقصى 5,000 رابط لكل ملف للسرعة)` 
                : `${chunkInfo.products} file(s) (max 5,000 URLs each for speed)`}
            </p>
          </section>
        </main>

        <footer style={{
          textAlign: "center",
          padding: "20px",
          color: "#666",
          fontSize: "14px",
        }}>
          <p>
            {isArabic 
              ? "📢 ملاحظة: هذه الصفحة تعمل بدون JavaScript لتحسين SSR" 
              : "📢 Note: This page works without JavaScript for better SSR"}
          </p>
          <p style={{ marginTop: "10px" }}>
            <Link href="/" style={{ color: "#2563eb", textDecoration: "none" }}>
              {isArabic ? "← العودة للصفحة الرئيسية" : "← Back to Homepage"}
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
