import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Category from '@/components/Category'
import ProviderService from '@/app/api/utils/services/ProviderService'
import CategoryService from '@/app/api/utils/services/CategoryService'

export default async function CategoryPage({ params, searchParams }) {
  const { slug, lng } = await params
  const { subcategories: selectedSubcategories } = await searchParams
  const selectedSubcategoriesSlugs = selectedSubcategories ?
      selectedSubcategories.split(',').filter(Boolean) :
      []
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  const providerService = new ProviderService(supabase)
  const categoryService = new CategoryService(supabase)
  const category = await categoryService.get(slug, lng)

  if (!category) {
      return redirect('/')
  }

  const providers = await providerService.getProvidersByCategory(
      category.id,
      lng,
      user?.id,
      selectedSubcategoriesSlugs
  )
  const subCategories = await categoryService.getSubCategories(category.id, lng)

  return (
    <Category
        providers={providers}
        category={category}
        subCategories={subCategories}
        showSaveButton={!!user?.id}
        selectedSubcategories={selectedSubcategoriesSlugs}
    />
  );
};
