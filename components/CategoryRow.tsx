import React from 'react'
import { useTranslation } from '@/app/i18n'
import ProviderCard from './ProviderCard'
import Link from "next/link"

const CategoryRow = async ({category, providers, lng}) => {
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <h1 className="h4">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {providers.map((provider) => (
                        <ProviderCard
                            key={provider.id}
                            provider={provider}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CategoryRow
