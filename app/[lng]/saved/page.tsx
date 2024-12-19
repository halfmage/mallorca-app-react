import React from 'react'
import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import { redirect } from 'next/navigation'
import SavedProviders from '@/components/SavedProviders'
import { ProviderService } from '@/app/api/utils/provider'

export default async function SavedPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
      redirect('/not-logged')
  }
  const providerService = new ProviderService(supabase)
  const providers = await providerService.getSavedProviders(user?.id)
  const { data: mainCategories } = await supabase.from('maincategories').select('*')

  return (
    <SavedProviders providers={providers} mainCategories={mainCategories} />
  );
};
