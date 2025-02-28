import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import React from 'react'
import { redirect } from 'next/navigation'
import ProviderService from '@/app/api/utils/services/ProviderService'
import CategoryService from '@/app/api/utils/services/CategoryService'
import { isAdmin } from '@/app/api/utils/services/UserService'
import EditProvider from '@/components/EditProvider'

interface Props {
  params: Promise<{ lng: string, id: string }>
}
export default async function EditProviderPage({ params }: Props) {
    const { id, lng } = await params
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return redirect(`/${lng}/403`)
    }
    const providerService = new ProviderService(supabase)
    const isProviderAdmin = await providerService.isProviderAdmin(user.id, id, true)
    if (!isAdmin(user) && !isProviderAdmin) {
        return redirect(`/${lng}/403`)
    }

    const provider = await providerService.get(id)
    const categoryService = new CategoryService(supabase)
    const mainCategories = await categoryService.getMainCategories(lng)
    const subCategories = await categoryService.getAllSubCategories(lng)

    return (
        <EditProvider
          provider={provider}
          mainCategories={mainCategories}
          subCategories={subCategories}
          isProviderAdmin={isProviderAdmin && !isAdmin(user)}
        />
    )
}
