import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName } from './app/i18n/settings'

acceptLanguage.languages(languages)

export async function middleware(request: NextRequest) {
    let lng
    if (request.cookies.has(cookieName)) lng = acceptLanguage.get(request.cookies.get(cookieName).value)
    if (!lng) lng = acceptLanguage.get(request.headers.get('Accept-Language'))
    if (!lng) lng = fallbackLng

    // Redirect if lng in path is not supported
    if (
        !languages.some(loc => request.nextUrl.pathname.startsWith(`/${loc}`)) &&
        !request.nextUrl.pathname.startsWith('/_next') &&
        !request.nextUrl.pathname.startsWith('/api')
    ) {
        return NextResponse.redirect(new URL(`/${lng}${request.nextUrl.pathname}${request.nextUrl.search}`, request.url))
    }

    if (request.headers.has('referer')) {
        const refererUrl = new URL(request.headers.get('referer'))
        const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
        const response = NextResponse.next()
        if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
        return response
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}