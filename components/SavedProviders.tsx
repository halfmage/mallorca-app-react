'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import CategoryButton from '@/components/CategoryButton'

const stringifyParams = (maincategory, keyword, sort) => {
    const params = {
        maincategory,
        keyword,
        sort
    }
    const queryParams = new URLSearchParams(
        Object.entries(params).filter(([key, value]) => value != null) // eslint-disable-line @typescript-eslint/no-unused-vars
    )

    return `?${queryParams.toString()}`
}

const SavedProviders = ({ providers, mainCategories }) => {
    const [ savedProviders, setSavedProviders ] = useState(providers)
    const [ loading, setLoading ] = useState(false)
    const [ selectedMainCategory, setSelectedMainCategory ] = useState(null)
    const [ keyword, setKeyword ] = useState(null)
    const [ sort, setSort ] = useState(null)
    const { t, i18n: { language } } = useTranslation()

    const handleUnsave = useCallback(
        async (providerId) => {
            setLoading(true)
            try {
                const response = await fetch(
                    `/api/saved/${providerId}${stringifyParams(selectedMainCategory, keyword, sort)}`,
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
        [ selectedMainCategory, keyword, sort ]
    )

    const fetchProviders = useCallback(
        async (mainCategory, keyword, sort) => {
            try {
                setLoading(true)
                const response = await fetch(`/api/saved${stringifyParams(mainCategory, keyword, sort)}`)
                const { data } = await response.json()
                setSavedProviders(data)
            } catch (error) {
                console.error('Error fetching providers:', error);
            } finally {
                setLoading(false);
            }
        },
        [ ]
    )

    useEffect(() => {
        if ([ selectedMainCategory, keyword, sort ].some(field => field !== null)) {
            fetchProviders(selectedMainCategory, keyword, sort)
        }
    }, [ fetchProviders, selectedMainCategory, keyword, sort ])

    const handleKeywordChange = useCallback(
        (event) => setKeyword(event?.target?.value),
        [ ]
    )

    const handleSortChange = useCallback(
        (event) => setSort(event?.target?.value),
        [ ]
    )

    const handleCategorySelect = useCallback(
        (categoryId) => setSelectedMainCategory(selectedId => selectedId === categoryId ? null : categoryId),
        [ ]
    )

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
                {t('savedProviders.title')}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ul className="flex flex-row gap-3">
                    {mainCategories.map(mainCategory => (
                        <li key={mainCategory.id}>
                            <CategoryButton
                                category={mainCategory}
                                isSelected={mainCategory.id === selectedMainCategory}
                                onClick={handleCategorySelect}
                            />
                        </li>
                    ))}
                </ul>

                <input type="text" placeholder="Search for provider" onChange={handleKeywordChange}
                       className="px-3 py-2 border rounded"/>

                <select
                    onChange={handleSortChange}
                    value={sort}
                    className="bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                >
                    <option value="new">Newest</option>
                    <option value="old">Oldest</option>
                </select>
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
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
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

                                        <div className="flex justify-between items-center">
                                            <Link
                                                href={`/${language}/provider/${provider.id}`}
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