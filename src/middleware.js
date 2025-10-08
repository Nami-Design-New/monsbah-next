// middleware.ts
import { routing } from '@/i18n/routing'
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import { API_URL } from './utils/constants'

const intlMiddleware = createMiddleware(routing)

// امتدادات الملفات العامة
const PUBLIC_FILE = /\.(?:js|mjs|css|map|json|png|jpg|jpeg|gif|svg|ico|webp|avif|txt|woff2?|ttf|eot)$/i

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // ✅ استثناء كل ما هو static/public قبل أي منطق
  // _next, ملفات بإمتداد، الأيقونات، البراندنج، الصور… إلخ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||                 // API لا تلمسه هنا
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/icons') ||               // مجلد أيقوناتك
    pathname.startsWith('/branding') ||            // مجلد العلامة
    pathname.startsWith('/images') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // توجيه الهوم مرة واحدة فقط
  if (pathname === '/') {
    try {
      const res = await fetch(`${API_URL}/client/current_location`)
      if (!res.ok) throw new Error('Location API failed')

      const data = await res.json()
      const countrySlug = data?.data?.iso_code ?? 'default'
      return NextResponse.redirect(new URL(`/${countrySlug}-ar`, req.url))
    } catch (e) {
      console.error('Error detecting location:', e)
      return NextResponse.redirect(new URL('/kuwait-en', req.url))
    }
  }

  // ✅ شغّل next-intl فقط على مسارات الصفحات
  const res = intlMiddleware(req)

  // ---- حمايات الدخول حسب الكوكيز (كما هي) ----
  const token = req.cookies.get('token')
  const role = req.cookies.get('user_type')?.value
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0] || ''                       // أول سيجمنت هو اللوكيل
  const normalizedPathname = pathname.replace(/\/$/, '')

  const protectedRoutes = [
    '/profile',
    '/chats',
    '/profile/notifications',
    '/profile/settings',
    '/profile/ads',
    '/profile/addAd',
    '/profile/favorites',
    '/profile/verification',
    '/company-profile',
    '/edit-company-profile',
    '/add-company-product',
    '/company-verification',
    '/company-favorites',
    '/company-notification',
  ].map((r) => `/${locale}${r}`)

  const restrictedForCompany = [
    '/profile',
    '/profile/notifications',
    '/profile/settings',
    '/profile/ads',
    '/profile/addAd',
    '/profile/favorites',
    '/profile/verification',
  ].map((r) => `/${locale}${r}`)

  const restrictedForUserOrClient = [
    '/company-profile',
    '/edit-company-profile',
    '/add-company-product',
    '/company-verification',
    '/company-favorites',
    '/company-notification',
  ].map((r) => `/${locale}${r}`)

  if (protectedRoutes.some((r) => normalizedPathname.startsWith(r))) {
    if (!token) {
      const homeUrl = req.nextUrl.clone()
      homeUrl.pathname = `/${locale}/`
      homeUrl.searchParams.set('authModal', 'true')
      return NextResponse.redirect(homeUrl)
    }
  }

  if (role === 'company' && restrictedForCompany.some((r) => normalizedPathname.startsWith(r))) {
    const referer = req.headers.get('referer')
    const redirectUrl = referer?.startsWith('http') ? referer : `${req.nextUrl.origin}/${locale}/`
    return NextResponse.redirect(redirectUrl)
  }

  if (
    (role === 'user' || role === 'client') &&
    restrictedForUserOrClient.some((r) => normalizedPathname.startsWith(r))
  ) {
    const referer = req.headers.get('referer')
    const redirectUrl = referer?.startsWith('http') ? referer : `${req.nextUrl.origin}/${locale}/`
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// ✅ وسّع الاستثناء في الـ matcher ليشمل مجلداتك العامة
export const config = {
  matcher: [
    // استبعد API و _next وكل ما له امتداد و أيضًا icons/branding/images
    '/((?!api|trpc|_next|_vercel|icons|branding|images|.*\\..*).*)',
  ],
}
