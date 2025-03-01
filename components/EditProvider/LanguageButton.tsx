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
    () => isActive ? 'bg-primary-500' : (isEmpty ? 'bg-red-500  hover:bg-red-600' : 'bg-green-500  hover:bg-green-600'),
    [ isActive, isEmpty ]
  )

  return (
    <a
      className={`flex items-center gap-2 text-sm font-medium text-white cursor-pointer px-4 py-2 rounded-md ${btnClass}`}
      onClick={handleClick}
      key={lng}
    >
      {!isActive &&
        <Icon
          path={isEmpty ? IconAlert : IconCheck}
          size={.75}
          className='text-white ml-1 relative top-px shrink-0'
        />
      }
      <span>
        {t(`common.language.${lng}`)}
      </span>
    </a>
  )
}

export default LanguageButton
