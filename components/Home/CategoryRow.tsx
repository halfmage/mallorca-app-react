import React from 'react'
import { useTranslation } from '@/app/i18n'
import ProviderCard from '@/components/ProviderCard'
import Link from "next/link"

import { HandPlatter, BedDouble, Tickets, ShoppingBag } from 'lucide-react';

const CategoryRow = async ({category, providers, lng}) => {
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

    return (
        <div className="flex flex-col gap-3 py-6">
            <div className="flex flex-row items-center justify-between">
                <h1 className="h4 flex items-center gap-2">
                    {
                        category.slug === 'hotel' ? <BedDouble className='text-primary' size={32} strokeWidth={1.5} /> :
                        category.slug === 'leisure' ? <Tickets className='text-primary' size={32} strokeWidth={1.5} /> :
                        category.slug === 'shopping' ? <ShoppingBag className='text-primary' size={32} strokeWidth={1.5} /> :
                        <HandPlatter className='text-primary' size={32} strokeWidth={1.5} />
                    }
                    {t('category.title', {category: category.name})}
                </h1>
                <Link
                    href={`/${lng}/category/${category.slug || category.id}`}
                    className="button-outline"
                >
                    {t('home.showAll')}
                </Link>
            </div>

            {providers.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {providers.map((provider) => (
                        <ProviderCard
                            key={provider.id}
                            provider={provider}
                            imageWidth={285}
                            imageHeight={214}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CategoryRow
