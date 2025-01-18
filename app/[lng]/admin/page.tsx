import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import React from 'react'
import Admin from '@/components/Admin'
import { redirect } from 'next/navigation'
import ProviderService from '@/app/api/utils/services/ProviderService'
import UserService, { isAdmin } from '@/app/api/utils/services/UserService'
import CategoryService from '@/app/api/utils/services/CategoryService'

export default async function AdminPage({ params }) {
    const { lng } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
        return redirect(`/${lng}/403`)
    }
    const providerService = new ProviderService(supabase)
    const providers = await providerService.getEditableProviders()
    const userService = await UserService.init()
    const usersCount = await userService.getUsersCount()
    const categoryService = new CategoryService(supabase)
    const mainCategories = await categoryService.getMainCategories(lng)

    return (
        <Admin providers={providers} mainCategories={mainCategories} usersCount={usersCount} />
    )
}
