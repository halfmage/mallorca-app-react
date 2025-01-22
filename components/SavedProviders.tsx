'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import { stringifyParams } from '@/app/api/utils/helpers'
import CategoryFilter from '@/components/Filters/CategoryFilter'
import SearchControl from '@/components/Filters/SearchControl'
import SortingControl from '@/components/Filters/SortingControl'

const SavedProviders = ({ providers, mainCategories }) => {
    const [ savedProviders, setSavedProviders ] = useState(providers)
    const [ loading, setLoading ] = useState(false)
    const [ selectedCategories, setSelectedCategories ] = useState([])
    const [ keyword, setKeyword ] = useState(null)
    const [ sort, setSort ] = useState('new')
    const { t, i18n: { language } } = useTranslation()
    const isFirstRender = useRef(true)

    const handleUnsave = useCallback(
        async (providerId) => {
            setLoading(true)
            try {
                const response = await fetch(
                    `/api/saved/${providerId}${stringifyParams({
                        maincategory: selectedCategories,
                        keyword,
                        sort,
                        language
                    })}`,
                    { method: 'DELETE' }
                )
                const { data } = await response.json()
                setSavedProviders(data)
            } catch (error) {
                console.error('Error removing provider:', error.message);
            } finally {
                setLoading(false)
            }
        },
        [ selectedCategories, keyword, sort, language ]
    )

    const fetchProviders = useCallback(
        async (mainCategory, keyword, sort) => {
            try {
                setLoading(true)
                const response = await fetch(`/api/saved${stringifyParams({
                    maincategory: mainCategory,
                    keyword,
                    sort,
                    language
                })}`)
                const { data } = await response.json()
                setSavedProviders(data)
            } catch (error) {
                console.error('Error fetching providers:', error);
            } finally {
                setLoading(false);
            }
        },
        [ language ]
    )

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
        } else {
            fetchProviders(selectedCategories, keyword, sort)
        }
    }, [ fetchProviders, selectedCategories, keyword, sort ])

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
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
                {t('savedProviders.title')}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
                <CategoryFilter value={selectedCategories} options={mainCategories} onChange={handleCategorySelect} />
                <SearchControl onChange={setKeyword} />
                <SortingControl value={sort} onChange={setSort} />
            </div>
            {
                loading ? (
                    <div className="max-w-6xl mx-auto p-6">
                        <p>{t('common.loading')}</p>
                    </div>
                ) : (
                    providers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">
                                {t('savedProviders.empty')}
                            </p>
                            <Link
                                href={`/${language}`}
                                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                            >
                                {t('savedProviders.browseProviders')}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedProviders.map((provider) => (
                                <div
                                    key={provider.id}
                                    className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                >
                                    {/* Provider Image */}
                                    <div className="h-48 w-full overflow-hidden bg-gray-100">
                                        {provider?.mainImage?.publicUrl ? (
                                            <img
                                                src={provider?.mainImage?.publicUrl}
                                                alt={provider.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center text-gray-400">
                                                {t('common.noImage')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Provider Details */}
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold mb-2">{provider.name}</h3>
                                        {provider.maincategories && (
                                            <p className="text-gray-600 mb-4">{provider.maincategories.name}</p>
                                        )}
                                        {provider?.subcategories?.length > 0 &&
                                            provider?.subcategories?.length && provider?.subcategories.map(
                                                (subcategory) => (
                                                    <span key={subcategory.id}>
                                                        <span>·</span>
                                                        <span className='text-gray-500 dark:text-gray-400'>{subcategory?.name}</span>
                                                    </span>
                                                )
                                            )
                                        }

                                        <div className="flex justify-between items-center">
                                            <Link
                                                href={`/${language}/provider/${provider.slug || provider.id}`}
                                                className="text-blue-500 hover:text-blue-600"
                                            >
                                                {t('savedProviders.viewDetails')}
                                            </Link>
                                            <button
                                                onClick={() => handleUnsave(provider.id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                {t('savedProviders.unsave')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
        </div>
    );
};

export default SavedProviders