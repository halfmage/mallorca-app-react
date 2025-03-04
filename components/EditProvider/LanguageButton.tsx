import React, { useCallback, useMemo } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { mdiAlert as IconAlert, mdiCheck as IconCheck } from '@mdi/js';
import { Icon } from '@mdi/react';

interface Props {
  lng: string
  isActive: boolean
  isEmpty: boolean
  onClick: (lang: string) => void
}

const LanguageButton = ({ lng, isActive, isEmpty, onClick }: Props) => {
  const { t } = useTranslation()
  const handleClick = useCallback(
    () => onClick(lng),
    [ lng, onClick ]
  )
  const btnClass = useMemo(
    () => isActive ? 'bg-primary-500' : (isEmpty ? 'bg-red-500  hover:bg-red-600' : 'bg-gray-200  hover:bg-gray-300 text-gray-800'),
    [ isActive, isEmpty ]
  )

  return (
    <a
      className={`flex items-center gap-1 text-sm font-medium text-white cursor-pointer px-4 py-2 rounded-md ${btnClass}`}
      onClick={handleClick}
      key={lng}
    >
      <span>
        {t(`common.language.${lng}`)}
      </span>
      {!isActive &&
        <Icon
          path={isEmpty ? IconAlert : IconCheck}
          size={.75}
          className='relative shrink-0'
        />
      }
    </a>
  )
}

export default LanguageButton
