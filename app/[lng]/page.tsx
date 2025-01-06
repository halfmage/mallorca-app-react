import React from 'react'
import { ProviderService } from '@/app/api/utils/provider'
import Home from '@/components/Home'

export default async function Homepage({ params }) {
    const { lng } = await params
    const providerService = await ProviderService.init()
    const categories = await providerService.getProvidersGroupedByCategories()

    return (
        <Home categories={categories} lng={lng}/>
    )
}
