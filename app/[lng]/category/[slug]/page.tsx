import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Category from '@/components/Category'
import { ProviderService } from '@/app/api/utils/provider'

export default async function CategoryPage({ params }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  const providerService = new ProviderService(supabase)
  const { data: category } = await supabase
      .from('maincategories')
      .select('*')
      .eq(
          typeof slug === 'number' || (!isNaN(slug) && typeof slug === 'string') ?
              'id' : 'slug',
          slug
      )
      .single()

  if (!category) {
      return redirect('/')
  }
  const providers = await providerService.getProvidersByCategory(category.id, user?.id)
  const { data: subCategories } = await supabase.from('subcategories').select('*').eq('maincategory_id', category.id)

  return (
    <Category providers={providers} category={category} subCategories={subCategories} showSaveButton={!!user?.id} />
  );
};
