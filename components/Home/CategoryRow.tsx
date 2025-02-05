import React from 'react'
import { useTranslation } from '@/app/i18n'
import ProviderCard from '@/components/ProviderCard'
import Link from 'next/link'
import CategoryIcon from '@/components/shared/CategoryIcon'


const CategoryRow = async ({category, providers, lng}) => {
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

    return (
        <div className="flex flex-col gap-3 py-6">
            <div className="flex items-center justify-between">
                <h1 className="h4 flex items-center gap-2">
                    <CategoryIcon slug={category.slug} />
                    {t('category.title', {category: category.name})}
                </h1>
                <Link
                    href={`/${lng}/category/${category.slug || category.id}`}
                    className="underline text-gray-500 dark:text-gray-400"
                >
                    {t('home.showAll')}
                </Link>
            </div>

            {providers.length > 0 && (
                <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-5 gap-5 pb-4 md:pb-0 *:max-w-[250px] *:md:max-w-none *:shrink-0">
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
