import { LOCALES } from "@/i18n/routing";
import getProducts from "@/services/products/getProducts";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to get products with images for sitemap
async function getAllProductsWithImagesForSitemap() {
  try {
    const allProducts = [];
    const MAX_PRODUCTS_PER_LOCALE = 1000; // Limit for performance
    
    // Fetch products for each locale to get comprehensive image data
    for (const locale of LOCALES) {
      const [country_slug, lang] = locale.split("-");
      
      try {
        // Fetch multiple pages to get more products
        for (let page = 1; page <= 5; page++) { // Limit to 5 pages per locale
          const data = await getProducts({
            pageParam: page,
            lang,
            country_slug,
            user: "client",
            per_page: 50, // Optimize page size
          });
          
          const products = data?.data?.data || [];
          if (products.length === 0) break;
          
          // Only include products with images
          const productsWithImages = products.filter(p => 
            p?.images && Array.isArray(p.images) && p.images.length > 0
          );
          
          allProducts.push(...productsWithImages.map(p => ({ ...p, locale })));
          
          // Stop if we have enough products for this locale
          if (allProducts.filter(p => p.locale === locale).length >= MAX_PRODUCTS_PER_LOCALE) {
            break;
          }
          
          // Stop if no more pages
          const hasNext = Boolean(data?.data?.links?.next);
          if (!hasNext) break;
        }
      } catch (error) {
        console.error(`Error fetching products for locale ${locale}:`, error);
        continue;
      }
    }
    
    return allProducts;
  } catch (error) {
    console.error("Error fetching products with images for sitemap:", error);
    return [];
  }
}

export async function GET() {
  try {
    const imageEntries = [];

    // Get products with images
    const products = await getAllProductsWithImagesForSitemap();

    // Process each product's images
    products.forEach((product) => {
      if (product?.images && Array.isArray(product.images)) {
        product.images.forEach((image, index) => {
          if (image?.url || image?.image) {
            const imageUrl = image.url || image.image;
            const productUrl = `${BASE_URL}/${product.locale}/product/${product.slug || product.id}`;
            
            imageEntries.push({
              pageUrl: productUrl,
              imageUrl: imageUrl,
              caption: image.caption || product.title || product.name || `Product ${product.id} - Image ${index + 1}`,
              geoLocation: product.locale.split('-')[0].toUpperCase(),
              title: image.title || `${product.title || product.name} - Image ${index + 1}`,
              license: `${BASE_URL}/terms-and-conditions`,
            });
          }
        });
      }
    });

    // Remove duplicates based on image URL
    const uniqueEntries = imageEntries.filter((entry, index, self) =>
      index === self.findIndex(e => e.imageUrl === entry.imageUrl)
    );

    // Limit to Google's recommended maximum
    const limitedEntries = uniqueEntries.slice(0, 1000);

    // Generate XML sitemap for images
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${limitedEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.pageUrl}</loc>
    <image:image>
      <image:loc>${entry.imageUrl}</image:loc>
      <image:caption><![CDATA[${entry.caption}]]></image:caption>
      <image:geo_location>${entry.geoLocation}</image:geo_location>
      <image:title><![CDATA[${entry.title}]]></image:title>
      <image:license>${entry.license}</image:license>
    </image:image>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=UTF-8",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating images sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
