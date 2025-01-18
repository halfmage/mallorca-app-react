import React from 'react'
import ProviderService from '@/app/api/utils/services/ProviderService'
import Home from '@/components/Home'

export default async function Homepage({ params }) {
    const { lng } = await params
    const providerService = await ProviderService.init()
    const categories = await providerService.getProvidersGroupedByCategories(lng)

    return (
        <Home categories={categories} lng={lng}/>
    )
}
