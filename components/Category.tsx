'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import { stringifyParams } from '@/app/api/utils/helpers'
import CategoryFilter from '@/components/Filters/CategoryFilter'
import SortingControl from '@/components/Filters/SortingControl'
import ProviderCard from '@/components/ProviderCard'

const Category = ({ providers, category, subCategories, showSaveButton }) => {
    const [ savedProviders, setSavedProviders ] = useState(providers)
    const [ loading, setLoading ] = useState(false)
    const [ selectedCategories, setSelectedCategories ] = useState([])
    const [ sort, setSort ] = useState('new')
    const { t, i18n: { language } } = useTranslation()
    const isFirstRender = useRef(true)

    const handleSaveChange = useCallback(
        (providerId, isSaved) => {
            setSavedProviders(
                items => items.map(
                    item => item.id === providerId ?
                        {
                            ...item,
                            savedCount: (item?.savedCount || 0) + (isSaved ? 1 : -1)
                        } : item
                )
            )
        },
        [ ]
    )

    const fetchProviders = useCallback(
        async (subCategory, sort) => {
            try {
                setLoading(true)
                const response = await fetch(
                    `/api/category/${category.id}${stringifyParams({
                        subcategory: subCategory,
                        sort,
                        language
                    })}`
                )
                const { data } = await response.json()
                setSavedProviders(data)
            } catch (error) {
                console.error('Error fetching providers:', error);
            } finally {
                setLoading(false);
            }
        },
        [ category.id, language ]
    )

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
        } else {
            fetchProviders(selectedCategories, sort)
        }
    }, [ fetchProviders, selectedCategories, sort ])

    const handleCategorySelect = useCallback(
        (categoryId) => setSelectedCategories(
            selectedIds => {
                return selectedIds && selectedIds.includes(categoryId) ?
                    selectedIds.filter(id => id !== categoryId) :
                    [...selectedIds, categoryId]
            }
        ),
        [ ]
    )

    return (
        <div className="">
            <h1 className="h1 text-center p-12">
                {t('category.title', { category: category.name })}
            </h1>

            <div className="flex justify-between mb-4">
                <CategoryFilter value={selectedCategories} options={subCategories} onChange={handleCategorySelect} />
                <SortingControl value={sort} onChange={setSort} />
            </div>
            {
                loading ? (
                    <div className="">
                        <p>{t('common.loading')}</p>
                    </div>
                ) : (
                    providers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">
                                {t('category.empty')}
                            </p>
                            <Link
                                href={`/${language}`}
                                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                            >
                                {t('category.browseProviders')}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {savedProviders.map((provider) => (
                                <ProviderCard
                                    provider={provider}
                                    isSaved={provider?.saved_providers?.[0]?.count}
                                    showSaveButton={showSaveButton} key={provider.id}
                                    onSaveChange={handleSaveChange}
                                />
                            ))}
                        </div>
                    )
                )}
        </div>
    );
};

export default Category