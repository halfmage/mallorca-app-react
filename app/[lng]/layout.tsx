import type { Metadata } from 'next'
// import localFont from "next/font/local";
// import '../../../src/i18n';
import './globals.css'
import Header from '@/components/Header'
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { isAdmin } from '@/app/api/utils/services/UserService'
import MessageService from '@/app/api/utils/services/MessageService'
import { cookies } from 'next/headers'
import { dir } from 'i18next'
import { languages } from '../i18n/settings'
import ProviderService from '@/app/api/utils/services/ProviderService'

export async function generateStaticParams() {
    return languages.map((lng) => ({ lng }))
}

export const metadata: Metadata = {
    title: "Mallorca Xclusive",
    description: "Mallorca Xclusive",
};

export default async function RootLayout({ children, params }: Readonly<{
  children: React.ReactNode,
  params: Promise<{ lng: typeof languages[number] }>
}>) {
    const { lng } = await params
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    const messageService = new MessageService(supabase)
    let newMessagesCount = 0
    let hasProviders = false
    if (user?.id) {
        newMessagesCount = await messageService.getNewMessagesCount(user.id)
        const providerService = new ProviderService(supabase)
        hasProviders = await providerService.hasProviders(user.id)
    }

    return (
        <html lang={lng} dir={dir(lng)}>
        <body className={`antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200`}>
        <>
            <Header user={user} isAdmin={isAdmin(user)} newMessagesCount={newMessagesCount} hasProviders={hasProviders} />
            {/*{logoutMessage && (*/}
            {/*    <div className="bg-green-500 text-white text-center py-3 fixed top-0 left-0 right-0 z-50">*/}
            {/*        {logoutMessage}*/}
            {/*    </div>*/}
            {/*)}*/}
            <main className="container">
                {children}
            </main>
        </>
        </body>
        </html>
    );
}
