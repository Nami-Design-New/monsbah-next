// SEO Configuration and Helpers for Monsbah
// This file contains SEO optimizations and structured data helpers

export const SEO_CONFIG = {
  // Default meta values
  defaultTitle: "Monsbah - Premium Marketplace",
  defaultDescription: "Discover premium products and services across the GCC region. Connect with trusted companies and find quality products in Saudi Arabia, Kuwait, UAE, Bahrain, Oman, and Qatar.",
  defaultKeywords: "marketplace, GCC, products, services, companies, Saudi Arabia, Kuwait, UAE, Bahrain, Oman, Qatar",
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://monsbah.com",
  
  // Structured data organization info
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Monsbah",
    url: "https://monsbah.com",
    logo: "https://monsbah.com/branding/logo.svg",
    description: "Premium marketplace connecting buyers and sellers across the GCC region",
    address: {
      "@type": "PostalAddress",
      addressCountry: "KW", // Kuwait as default
    },
    sameAs: [
      // Add social media URLs here
    ]
  },
  
  // Priority settings for different page types
  pagePriorities: {
    homepage: 1.0,
    category: 0.9,
    product: 0.8,
    company: 0.7,
    blog: 0.7,
    static: 0.6,
    profile: 0.5,
    search: 0.4,
  },
  
  // Change frequency settings
  changeFrequencies: {
    homepage: "daily",
    products: "weekly",
    categories: "weekly", 
    companies: "monthly",
    blogs: "monthly",
    static: "yearly",
    profile: "weekly",
  }
};

// Helper function to generate structured data for products
export function generateProductStructuredData(product, locale) {
  const [country] = locale.split('-');
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title || product.name,
    description: product.description,
    image: product.images?.map(img => img.url || img.image) || [],
    url: `${SEO_CONFIG.siteUrl}/${locale}/product/${product.slug}-id=${product.id}`,
    sku: product.id.toString(),
    brand: {
      "@type": "Brand",
      name: product.company_name || product.user?.name || "Monsbah"
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: getCurrencyByCountry(country),
      availability: product.is_available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: product.company_name || product.user?.name || "Monsbah"
      }
    },
    aggregateRating: product.rating ? {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      ratingCount: product.rating_count || 1
    } : undefined
  };
}

// Helper function to generate structured data for companies
export function generateCompanyStructuredData(company, locale) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name || company.title,
    description: company.description,
    image: company.logo || company.image,
    url: `${SEO_CONFIG.siteUrl}/${locale}/company-details/${company.slug || company.id}`,
    address: company.address ? {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressCountry: locale.split('-')[0].toUpperCase()
    } : undefined,
    telephone: company.phone,
    email: company.email,
    aggregateRating: company.rating ? {
      "@type": "AggregateRating", 
      ratingValue: company.rating,
      ratingCount: company.rating_count || 1
    } : undefined
  };
}

// Helper function to generate structured data for blog articles
export function generateBlogStructuredData(blog, locale) {
  // Generate canonical URL with custom canonical_url support
  const canonicalUrl = generateCanonicalUrl(
    `/blogs/${blog.slug || blog.id}`, 
    locale, 
    blog.canonical_url
  );

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title || blog.name,
    description: blog.meta_description || blog.description || blog.excerpt,
    image: blog.image || blog.featured_image,
    url: canonicalUrl,
    datePublished: blog.created_at || blog.published_at || blog.date,
    dateModified: blog.updated_at || blog.created_at || blog.date,
    author: {
      "@type": "Person",
      name: blog.author?.name || "Monsbah Editorial Team"
    },
    publisher: SEO_CONFIG.organization,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };
}

// Helper function to get currency by country
function getCurrencyByCountry(country) {
  const currencies = {
    'sa': 'SAR',
    'kw': 'KWD', 
    'ae': 'AED',
    'bh': 'BHD',
    'om': 'OMR',
    'qa': 'QAR',
  };
  return currencies[country.toLowerCase()] || 'USD';
}

// Helper function to generate canonical URLs
export function generateCanonicalUrl(path, locale, customCanonicalUrl = null) {
  // If custom canonical URL is provided and not null, use it
  if (customCanonicalUrl && customCanonicalUrl.trim() !== '') {
    return customCanonicalUrl.trim();
  }
  
  // Otherwise, generate the default canonical URL
  return `${SEO_CONFIG.siteUrl}/${locale}${path}`;
}

// Helper function to generate hreflang alternatives
export function generateHreflangAlternates(path, customCanonicalUrl = null) {
  const alternates = {
    canonical: customCanonicalUrl && customCanonicalUrl.trim() !== '' 
      ? customCanonicalUrl.trim() 
      : `${SEO_CONFIG.siteUrl}/kw-ar${path}`, // Default locale
    languages: {}
  };

  // Add all locale alternatives
  const locales = [
    "sa-ar", "sa-en", "kw-ar", "kw-en", 
    "ae-ar", "ae-en", "bh-ar", "bh-en",
    "om-ar", "om-en", "qa-ar", "qa-en"
  ];

  locales.forEach(locale => {
    alternates.languages[locale] = `${SEO_CONFIG.siteUrl}/${locale}${path}`;
  });

  return alternates;
}

// Helper function to generate Open Graph data
export function generateOpenGraphData(title, description, image, url, type = 'website') {
  return {
    title: title?.substring(0, 60) || SEO_CONFIG.defaultTitle, // Trim to optimal length
    description: description?.substring(0, 160) || SEO_CONFIG.defaultDescription, // Trim to optimal length
    url,
    siteName: 'Monsbah',
    images: [
      {
        url: image || `${SEO_CONFIG.siteUrl}/branding/logo.svg`,
        width: 1200,
        height: 630,
        alt: title || SEO_CONFIG.defaultTitle,
      },
    ],
    locale: 'ar_KW', // Default locale
    type,
  };
}

// Helper function to generate Twitter Card data
export function generateTwitterCardData(title, description, image) {
  return {
    card: 'summary_large_image',
    title: title?.substring(0, 70) || SEO_CONFIG.defaultTitle, // Twitter's title limit
    description: description?.substring(0, 200) || SEO_CONFIG.defaultDescription, // Twitter's description limit
    images: [image || `${SEO_CONFIG.siteUrl}/branding/logo.svg`],
    creator: '@monsbah', // Add your Twitter handle
    site: '@monsbah',
  };
}

// Helper function to generate meta tags for pages
export function generateMetaTags(options = {}) {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    canonicalUrl = null,
    blog = null, // Blog object for meta fields
  } = options;

  // Use blog meta fields if available, otherwise fallback to provided values
  const cleanTitle = (blog?.meta_title || title)?.substring(0, 60) || SEO_CONFIG.defaultTitle;
  const cleanDescription = (blog?.meta_description || description)?.substring(0, 160) || SEO_CONFIG.defaultDescription;
  const cleanKeywords = keywords || SEO_CONFIG.defaultKeywords;
  const finalCanonicalUrl = canonicalUrl || url;

  return {
    title: cleanTitle,
    description: cleanDescription,
    keywords: cleanKeywords,
    robots: (blog?.is_index === 1 ? 'index' : 'noindex') + ',' + (blog?.is_follow === 1 ? 'follow' : 'nofollow'),
    viewport: 'width=device-width,initial-scale=1',
    canonical: finalCanonicalUrl,
    'og:title': cleanTitle,
    'og:description': cleanDescription,
    'og:image': image || blog?.image || `${SEO_CONFIG.siteUrl}/branding/logo.svg`,
    'og:url': finalCanonicalUrl,
    'og:type': type,
    'og:site_name': 'Monsbah',
    'twitter:card': 'summary_large_image',
    'twitter:title': cleanTitle,
    'twitter:description': cleanDescription,
    'twitter:image': image || blog?.image || `${SEO_CONFIG.siteUrl}/branding/logo.svg`,
    'twitter:creator': '@monsbah',
  };
}

// Helper function to validate and clean URL
export function validateAndCleanUrl(url) {
  if (!url) return null;
  
  try {
    // Remove any invalid characters and normalize
    const cleanUrl = url.replace(/[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]/g, '');
    const urlObj = new URL(cleanUrl);
    return urlObj.href;
  } catch (error) {
    console.error('Invalid URL provided:', url, error);
    return null;
  }
}

// Helper function to generate breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs, locale) {
  if (!breadcrumbs || !Array.isArray(breadcrumbs)) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SEO_CONFIG.siteUrl}/${locale}${item.path}`
    }))
  };
}

// Helper function specifically for blog SEO
export function generateBlogSEO(blog, locale) {
  const blogPath = `/blogs/${blog.slug || blog.id}`;
  
  // Generate canonical URL (uses custom canonical_url if provided)
  const canonicalUrl = generateCanonicalUrl(blogPath, locale, blog.canonical_url);
  
  // Generate hreflang alternates
  const hreflangAlternates = generateHreflangAlternates(blogPath, blog.canonical_url);
  
  // Generate structured data
  const structuredData = generateBlogStructuredData(blog, locale);
  
  // Generate meta tags
  const metaTags = generateMetaTags({
    title: blog.meta_title || blog.title,
    description: blog.meta_description || blog.description,
    image: blog.image,
    url: canonicalUrl,
    canonicalUrl: canonicalUrl,
    type: 'article',
    blog: blog, // Pass blog object for additional meta fields
  });
  
  // Generate Open Graph data
  const openGraph = generateOpenGraphData(
    blog.meta_title || blog.title,
    blog.meta_description || blog.description,
    blog.image,
    canonicalUrl,
    'article'
  );
  
  // Generate Twitter Card data
  const twitterCard = generateTwitterCardData(
    blog.meta_title || blog.title,
    blog.meta_description || blog.description,
    blog.image
  );
  
  return {
    canonicalUrl,
    hreflangAlternates,
    structuredData,
    metaTags,
    openGraph,
    twitterCard,
    robots: {
      index: blog.is_index === 1,
      follow: blog.is_follow === 1,
    }
  };
}
