import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { stringifyParams } from '@/app/api/utils/helpers'

const useProviderSearch = () => {
  const { i18n: { language } } = useTranslation()
  const [ isLoading, setIsLoading ] = useState(false)

  const loadOptions = async (inputValue: string) => {
    setIsLoading(true)
    const response = await fetch(`/api/provider/search${stringifyParams({
      language,
      keyword: inputValue
    })}`)
    const { data } = await response.json()
    setIsLoading(false)

    return data.map(
      // @ts-expect-error: skip type for now
      ({ type, options }) => ({
        type,
        options: options.map(
          // @ts-expect-error: skip type for now
          ({ name, ...data }) => ({
            value: data.id,
            label: name,
            data: {
              ...data,
              type
            }
          })
        )
      })
    )
  }

  return {
    loadOptions,
    isLoading
  }
}

export default useProviderSearch
