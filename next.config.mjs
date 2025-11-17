import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // Compress responses
  compress: true,
  
  // Generate ETag for caching
  generateEtags: true,
  
  // Power by header
  poweredByHeader: false,

  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['react-icons', '@tanstack/react-query'],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backendv1.monsbah.com",
        pathname: "/**",
      },
        {
      protocol: "http", // add this
      hostname: "backendv1.monsbah.com",
      pathname: "/**",
    },
      {
        protocol: "https",
        hostname: "monsbah-s3-shared-bucket.s3.me-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "monsba.sfo3.cdn.digitaloceanspaces.com",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',
  },
  async rewrites() {
    return [
      {
        // Ensure locale-specific sitemap variants don't collide with category slugs
        source: "/:country_locale/sitemap-:filename.xml",
        destination: "/:country_locale/sitemaps/:filename",
      },
      {
        // Map clean product sitemap URLs like /sa-ar/products/sitemap1.xml -> /sa-ar/products/sitemap?id=1
        source: "/:country_locale/products/sitemap:id(\\d+).xml",
        destination: "/:country_locale/products/sitemap?id=:id",
      },
      {
        // Allow global sitemap-image0.xml style URLs to resolve to the chunk handler
        source: "/sitemap-image:id(\\d+).xml",
        destination: "/sitemap-image/:id",
      },
    ];
  },
  async headers() {
    return [
      {
        // X-Robots-Tag for all pages (SEO)
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
        ],
      },
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
      {
        // Cache images from Next.js image optimization
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache public assets (images, fonts, etc.)
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache public assets
        source: '/branding/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache font files
        source: '/:path*.(woff|woff2|eot|ttf|otf)',
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
