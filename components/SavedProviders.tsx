'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import { stringifyParams } from '@/app/api/utils/helpers'
import CategoryFilter from '@/components/Filters/CategoryFilter'
import SearchControl from '@/components/Filters/SearchControl'
import SortingControl from '@/components/Filters/SortingControl'
import ProviderCard from '@/components/ProviderCard'
import { Provider } from '@/app/api/utils/types';
import { SORTING_ORDER_NEW } from '@/app/api/utils/constants';

// @ts-expect-error: skip type for now
const SavedProviders = ({ providers, mainCategories }) => {
  const [ savedProviders, setSavedProviders ] = useState(providers)
  const [ loading, setLoading ] = useState(false)
  const [ selectedCategories, setSelectedCategories ] = useState([])
  const [ keyword, setKeyword ] = useState(null)
  const [ sort, setSort ] = useState(SORTING_ORDER_NEW)
  const { t, i18n: { language } } = useTranslation()
  const isFirstRender = useRef(true)

  const handleSaveChange = useCallback(
    (providerId: string, isSaved: boolean) => {
      if (!isSaved) {
        // @ts-expect-error: skip type for now
        setSavedProviders(items => items.filter(item => item.id !== providerId))
      }
    },
    []
  )

  const fetchProviders = useCallback(
    // @ts-expect-error: skip type for now
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
    // @ts-expect-error: skip type for now
    (categoryId) => setSelectedCategories(
      // @ts-expect-error: skip type for now
      selectedIds => {
        // @ts-expect-error: skip type for now
        return selectedIds && selectedIds.includes(categoryId) ?
          selectedIds.filter(id => id !== categoryId) :
          [ ...selectedIds, categoryId ]
      }
    ),
    []
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {t('savedProviders.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
        <CategoryFilter value={selectedCategories} options={mainCategories}
                        onChange={handleCategorySelect}/>
        {/* @ts-expect-error: skip type for now */}
        <SearchControl onChange={setKeyword}/>
        {/* @ts-expect-error: skip type for now */}
        <SortingControl value={sort} onChange={setSort}/>
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
              {savedProviders.map((provider: Provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isSaved
                  showSaveButton
                  onSaveChange={handleSaveChange}
                />
              ))}
            </div>
          )
        )}
    </div>
  );
};

export default SavedProviders
