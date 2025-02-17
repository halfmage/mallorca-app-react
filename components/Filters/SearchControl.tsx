'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/app/i18n/client'

type Props = {
  onChange: (value: string) => string
}

const DELAY = 500

const SearchControl = ({ onChange }: Props) => {
  const [ inputValue, setInputValue ] = useState('')
  const [ debouncedValue, setDebouncedValue ] = useState('')
  const isFirstRender = useRef(true)

  // @ts-expect-error: skip type for now
  const handleChange = (event) => setInputValue(event.target.value)

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(inputValue), DELAY)
    return () => clearTimeout(timeoutId)
  }, [ inputValue ])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      onChange(debouncedValue)
    }
  }, [ onChange, debouncedValue ])

  const { t } = useTranslation()

  return (
    <input
      type="text"
      value={inputValue}
      placeholder={t('common.search.placeholder')}
      onChange={handleChange}
      className="px-3 py-2 border rounded"
    />
  );
};

export default SearchControl
