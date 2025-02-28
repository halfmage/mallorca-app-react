import React, { useCallback } from 'react'
import { useTranslation } from '@/app/i18n/client'

interface Props {
  lng: string
  activeLng: string,
  onClick: (lang: string) => void
}

const LanguageButton = ({ lng, activeLng, onClick }: Props) => {
  const { t } = useTranslation()
  const handleClick = useCallback(
    () => onClick(lng),
    [ lng, onClick ]
  )

  return (
    <a
      className={`text-white px-4 py-2 rounded-md ${activeLng === lng ? 'bg-primary-500' : 'bg-gray-500  hover:bg-gray-600'}`}
      onClick={handleClick}
      key={lng}
    >
      {t(`common.language.${lng}`)}
    </a>
  )
}

export default LanguageButton
