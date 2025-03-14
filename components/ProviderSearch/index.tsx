'use client'

import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AsyncSelect from 'react-select/async'
import { SingleValue, ActionMeta } from 'react-select'
import { useTranslation } from '@/app/i18n/client'
import useProviderSearch from './useProviderSearch'
import { SEARCH_TYPE_PROVIDER } from '@/app/api/utils/constants'
import Group from './Group'
import Option from './Option'

interface OptionData {
  label: string
  value: string
  data: {
    type: string
    slug?: string
    id?: string
    maincategories?: {
      slug?: string
      id?: string
    }
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

const ProviderSearch = () => {
  const { push } = useRouter()
  const { loadOptions } = useProviderSearch()
  const { t, i18n: { language } } = useTranslation(undefined, 'translation', {})
  
  const handleSelect = useCallback(
    (newValue: SingleValue<OptionData>, actionMeta: ActionMeta<OptionData>) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      if (newValue?.value && newValue.data) {
        const { type, ...data } = newValue.data
        const baseUrl = `/${language}`
        
        const url = type === SEARCH_TYPE_PROVIDER
          ? `${baseUrl}/provider/${data?.slug || data?.id}`
          : `${baseUrl}/category/${data?.maincategories?.slug || data?.maincategories?.id}?subcategories=${data?.slug || data?.id}`
        
        push(url)
      }
    },
    [ push, language ]
  )
  
  const noOptionsMessage = useCallback(
    () => t('header.providerSearch.noOptions'),
    [ t ]
  )

  return (
    <AsyncSelect<OptionData, false>
        cacheOptions
        loadOptions={loadOptions}
        onChange={handleSelect}
        placeholder={t('header.providerSearch.placeholder')}
        noOptionsMessage={noOptionsMessage}
        components={{ Group, Option, DropdownIndicator: null }}
        classNames={{
          container: () => 'w-full transition-all duration-300',
          control: (state) => `${state.isFocused ? 'shadow-xl' : ''} !min-h-12 !px-3 !rounded !border-gray-200 dark:!border-gray-700 !bg-white dark:!bg-gray-950`,
          menu: () => 'shadow-2xl !rounded !mt-1 !z-50 !bg-white dark:!bg-gray-900',
          menuList: () => '!p-1',
          input: () => '!text-base md:!text-sm !text-gray-900 dark:!text-gray-100',
          placeholder: () => '!text-gray-500 dark:!text-gray-400',
          option: (state) => `!text-base md:!text-sm !p-2 !rounded-xl ${
            state.isFocused 
              ? '!bg-gray-50 dark:!bg-gray-800' 
              : '!bg-transparent'
          } hover:!bg-gray-50 dark:hover:!bg-gray-800 !text-gray-700 dark:!text-gray-200`,
          noOptionsMessage: () => '!p-2 !text-gray-500 dark:!text-gray-400',
        }}
        styles={{
          menu: (base) => ({
            ...base,
            width: '100%'
          }),
          menuList: (base) => ({
            ...base,
            maxHeight: '60vh',
            '@media (min-width: 768px)': {
              maxHeight: '50vh'
            }
          }),
          option: (base) => ({
            ...base,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 200ms ease'
          })
        }}
    />
  )
}

export default ProviderSearch
