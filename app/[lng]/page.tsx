import React from 'react'
import ProviderService from '@/app/api/utils/services/ProviderService'
import Home from '@/components/Home'

interface Props {
  params: Promise<{ lng: string }>
}

export default async function Homepage({ params }: Props) {
  const { lng } = await params
  const providerService = await ProviderService.init()
  const categories = await (providerService as ProviderService).getProvidersGroupedByCategories(lng)

  // @ts-expect-error: skip type for now
  return (<Home categories={categories} lng={lng}/>)
}
