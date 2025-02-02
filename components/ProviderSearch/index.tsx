'use client'

import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AsyncSelect from 'react-select/async'
import { useTranslation } from '@/app/i18n/client'
import useProviderSearch from './useProviderSearch'
import { SEARCH_TYPE_PROVIDER } from '@/app/api/utils/constants'
import Group from './Group'
import Option from './Option'

const ProviderSearch = () => {
  const { push } = useRouter()
  const { loadOptions } = useProviderSearch()
  const { t, i18n: { language } } = useTranslation()
  const handleSelect = useCallback(
    ({ value, data: { type, ...data } }) => {
      console.log('value = ', value, data)
      if (value) {
        push(
            type === SEARCH_TYPE_PROVIDER ?
                `/${language}/provider/${data?.slug || data?.id}` :
                `/${language}/category/${data?.maincategories?.slug || data?.maincategories?.id}`
        )
      }
    },
    [ push, language ]
  )
  const noOptionsMessage = useCallback(
    () => t('header.providerSearch.noOptions'),
    [ t ]
  )

  return <div className="flex items-center justify-end">
    <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        onChange={handleSelect}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors w-full"
        placeholder={t('header.providerSearch.placeholder')}
        noOptionsMessage={noOptionsMessage}
        components={{ Group, Option }}
    />
  </div>
}

export default ProviderSearch