import React from 'react'
import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import { redirect } from 'next/navigation'
import SavedProviders from '@/components/SavedProviders'
import ProviderService from '@/app/api/utils/services/ProviderService'
import CategoryService from '@/app/api/utils/services/CategoryService'

interface Props {
  params: Promise<{ lng: string }>
}

export default async function SavedPage({ params }: Props) {
  const { lng } = await params
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
      redirect('/not-logged')
  }
  const providerService = new ProviderService(supabase)
  const providers = await providerService.getSavedProviders(user?.id, lng)
  const categoryService = new CategoryService(supabase)
  const mainCategories = await categoryService.getMainCategories(lng)

  return (
    <SavedProviders providers={providers} mainCategories={mainCategories} />
  )
}
