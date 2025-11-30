import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";

import AuthModal from "@/components/auth/AuthModal";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import ResponsiveNav from "@/components/Header/ResponsiveNav";
import Providers from "@/providers/Providers";
import { META_DATA_CONTENT } from "@/utils/constants";
import { getSettings } from "@/services/settings/getSettings";

// Suppress S3 image errors
import "@/utils/imageErrorHandler";

// Import only necessary Swiper CSS modules
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Import styles in optimized order
import "@/assets/styles/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/assets/styles/main.css";
import BackToTop from "@/components/shared/BackToTop";
import DownloadApp from "@/components/shared/DownloadApp";

// Hreflang links for SEO (can be used in metadata if needed)
const _hreflangs = [
  { href: "https://monsbah.com/sa-ar", hreflang: "ar-sa" },
  { href: "https://monsbah.com/kw-ar", hreflang: "ar-kw" },
  { href: "https://monsbah.com/ae-ar", hreflang: "ar-ae" },
  { href: "https://monsbah.com/bh-ar", hreflang: "ar-bh" },
  { href: "https://monsbah.com/om-ar", hreflang: "ar-om" },
  { href: "https://monsbah.com/qa-ar", hreflang: "ar-qa" },
  { href: "https://monsbah.com/sa-en", hreflang: "en-sa" },
  { href: "https://monsbah.com/kw-en", hreflang: "en-kw" },
  { href: "https://monsbah.com/ae-en", hreflang: "en-ae" },
  { href: "https://monsbah.com/bh-en", hreflang: "en-bh" },
  { href: "https://monsbah.com/om-en", hreflang: "en-om" },
  { href: "https://monsbah.com/qa-en", hreflang: "en-qa" },
];

export async function generateMetadata({ params }) {
  const locale = await params;

  const lang = locale["country-locale"].split("-")[1];
  const content = META_DATA_CONTENT[lang] ?? META_DATA_CONTENT.ar;
  const settings = await getSettings();
  const siteTitle = settings?.meta_title || settings?.name || content.title;
  const siteDescription = settings?.meta_description || content.description;

  return {
    metadataBase: new URL("https://monsbah.com"),
    title: {
      template: `%s - ${siteTitle}`,
      default: siteTitle,
    },
    description: siteDescription,
    keywords: content.keywords,
    authors: [{ name: siteTitle }],
    robots: "index, follow",
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: "https://www.monsbah.com",
      type: "website",
      images: [
        {
          url: "/branding/storeicon.svg",
          width: 800,
          height: 600,
          alt: "Monsbah Icon",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: ["/branding/storeicon.svg"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        { rel: "mask-icon", url: "/branding/icon.svg", color: "#00CCBB" },
      ],
    },
    manifest: "/manifest.json",
  };
}
export const viewport = {
  themeColor: "#000000",
};

// Generate static params for all locales
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({
    "country-locale": locale,
  }));
}

export default async function RootLayout(props) {
  const params = await props.params;
  const fullLocale = params["country-locale"];

  if (!hasLocale(routing.locales, fullLocale)) {
    notFound();
  }

  setRequestLocale(fullLocale);
  const lang = fullLocale.split("-")[1];
  const messages = await getMessages(lang);

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <head>
        <meta name="google-site-verification" content="e-AefwQFw80wb3obNRXpVfY1KGT-VmL7nMEuG5cxi3I" />
        
        {/* Preload critical fonts */}
        <link 
          rel="preload" 
          as="style" 
          href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400..800&display=swap"
        />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400..800&display=swap" 
          media="print" 
          onLoad="this.media='all'"
        />
        <noscript>
          <link 
            rel="stylesheet" 
            href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400..800&display=swap"
          />
        </noscript>
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://monsba.sfo3.cdn.digitaloceanspaces.com" />
        <link rel="dns-prefetch" href="https://backendv1.monsbah.com" />
        
        {/* Centralized noscript styles: allowed when placed in head */}
        <noscript>
          <style>{`
            /* Hide JS-only UI when JS is disabled */
            .js-only { display: none !important; }
            /* Product favorite button adjustments for no-JS */
            .priceInfo .favorite, .priceInfo .dropdown { display: none !important; }
            .priceInfo .no-js-login { display: inline-block !important; }
          `}</style>
        </noscript>
        {/* Microsoft Clarity tracking (placed in head) */}
        <Script
          id="clarity"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "uambnmri4i");`
          }}
        />
      </head>
      <body>
        {/* Suppress console errors in production */}
        {process.env.NODE_ENV === 'production' && (
          <Script 
            id="suppress-console-production"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Override console methods to suppress all output in production
                  console.error = function() {};
                  console.warn = function() {};
                  console.log = function() {};
                  console.info = function() {};
                  console.debug = function() {};
                  
                  // Suppress unhandled promise rejections
                  window.addEventListener('unhandledrejection', function(event) {
                    event.preventDefault();
                  });
                  
                  // Suppress all global errors including third-party scripts
                  window.addEventListener('error', function(event) {
                    event.preventDefault();
                    return false;
                  }, true);
                })();
              `
            }}
          />
        )}
        <Script 
          id="gtm" 
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-M2Z82BND');
            `
          }}
        />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M2Z82BND"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <Providers locale={fullLocale} messages={messages}>
          <NextTopLoader 
            color="#1abc9c"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #1abc9c,0 0 5px #1abc9c"
          />
          <Toaster expand={false} richColors position="bottom-right" />
          <Header />
          <main>
            {props.children}
          </main>
          <Footer />
          <ResponsiveNav />
          <AuthModal />
          <BackToTop />
          <DownloadApp />
        </Providers>
      </body>
    </html>
  );
}
