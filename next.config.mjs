import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // Compress responses
  compress: true,
  
  // Generate ETag for caching
  generateEtags: true,
  
  // Power by header
  poweredByHeader: false,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backendv1.monsbah.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "monsbah-s3-shared-bucket.s3.me-south-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Map clean product sitemap URLs like /sa-ar/products/sitemap1.xml -> /sa-ar/products/sitemap?id=1
        source: "/:country_locale/products/sitemap:id(\\d+).xml",
        destination: "/:country_locale/products/sitemap?id=:id",
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply headers to all static assets
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply headers to all chunk files
        source: '/_next/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
