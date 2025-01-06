import React from 'react'
import { useTranslation } from '@/app/i18n'
import ProviderCard from './ProviderCard'
import Link from "next/link"

const CategoryRow = async ({category, providers, lng}) => {
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-row justify-between">
                <h1 className="text-3xl font-bold mb-8 flex-grow">
                    {t('category.title', {category: category.name})}
                </h1>
                <Link
                    href={`/${lng}/category/${category.slug || category.id}`}
                    className="block text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
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
