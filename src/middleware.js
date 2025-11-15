import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { API_URL } from "./utils/constants";

// Create middleware without automatic Link headers
// We handle hreflang manually in metadata for correct ISO format
const intlMiddleware = createMiddleware({
  ...routing,
  alternateLinks: false, // Disable automatic Link headers with wrong format
});

// Public file extensions
const PUBLIC_FILE = /\.(?:js|mjs|css|map|json|png|jpg|jpeg|gif|svg|ico|webp|avif|txt|woff2?|ttf|eot)$/i;

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/mockServiceWorker.js" ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/branding") ||
    pathname.startsWith("/.well-known") || // Skip .well-known paths (Chrome DevTools, etc.)
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    try {
      const res = await fetch(`${API_URL}/client/current_location`);

      if (!res.ok) throw new Error("Location API failed");
      const data = await res.json();

      const countrySlug = data?.data?.iso_code ?? "default";

      const redirectUrl = new URL(`/${countrySlug}-ar`, req.url);
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error("Error detecting location:", error);
      // Fallback redirect
      const fallbackUrl = new URL("/kuwait-en", req.url);
      return NextResponse.redirect(fallbackUrl);
    }
  }

  // ===  Proceed with intlMiddleware + your custom logic ===
  // Note: alternateLinks config might not work in all next-intl versions
  // We handle hreflang manually in metadata for correct format (ar-KW not kw-ar)
  let res = intlMiddleware(req);

  // FORCE remove any Link headers that might have been added
  // This ensures no HTTP Link headers with wrong format are sent
  if (res && res.headers) {
    res.headers.delete('Link');
    res.headers.delete('link');
  }

  const token = req.cookies.get("token");
  const role = req.cookies.get("user_type")?.value;

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] || "";
  const normalizedPathname = pathname.replace(/\/$/, "");

  const protectedRoutes = [
    "/profile",
    "/chats",
    "/profile/notifications",
    "/profile/settings",
    "/profile/ads",
    "/profile/addAd",
    "/profile/favorites",
    "/profile/verification",
    "/company-profile",
    "/edit-company-profile",
    "/add-company-product",
    "/company-verification",
    "/company-favorites",
    "/company-notification",
  ].map((route) => `/${locale}${route}`);

  const restrictedForCompany = [
    "/profile",
    "/profile/notifications",
    "/profile/settings",
    "/profile/ads",
    "/profile/addAd",
    "/profile/favorites",
    "/profile/verification",
  ].map((route) => `/${locale}${route}`);

  const restrictedForUserOrClient = [
    "/company-profile",
    "/edit-company-profile",
    "/add-company-product",
    "/company-verification",
    "/company-favorites",
    "/company-notification",
  ].map((route) => `/${locale}${route}`);

  // Block unauthenticated users from protected routes
  if (protectedRoutes.some((route) => normalizedPathname.startsWith(route))) {
    if (!token) {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = `/${locale}/`;
      homeUrl.searchParams.set("authModal", "true");
      return NextResponse.redirect(homeUrl);
    }
  }

  //  Block company from user-only routes
  if (
    role === "company" &&
    restrictedForCompany.some((route) => normalizedPathname.startsWith(route))
  ) {
    const referer = req.headers.get("referer");
    const redirectUrl = referer?.startsWith("http")
      ? referer
      : `${req.nextUrl.origin}/${locale}/`;
    return NextResponse.redirect(redirectUrl);
  }

  //  Block user/client from company-only routes
  if (
    (role === "user" || role === "client") &&
    restrictedForUserOrClient.some((route) =>
      normalizedPathname.startsWith(route)
    )
  ) {
    const referer = req.headers.get("referer");
    const redirectUrl = referer?.startsWith("http")
      ? referer
      : `${req.nextUrl.origin}/${locale}/`;
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|icons|branding|.*\\..*).*)"],
};
