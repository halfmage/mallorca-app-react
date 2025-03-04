import React, { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { languages } from '@/app/i18n/settings'
import LanguageButton from '@/components/EditProvider/LanguageButton'

// @ts-expect-error: skip type for now
const Descriptions = ({ register, descriptions }) => {
  const { t, i18n: { language } } = useTranslation()
  const [activeLng, setActiveLng] = useState(language)

  return (
    <div className="">
      <div className="">
        <div className="">
          <h2 className="text-2xl font-bold mb-4">{t('admin.descriptions.title')}</h2>
          <div className="flex gap-2">
            {languages.map((lng: string) => (
              <LanguageButton
                lng={lng}
                onClick={setActiveLng}
                key={lng}
                isActive={lng === activeLng}
                isEmpty={(descriptions?.[lng] || '').trim() === ''}
              />
            ))}
          </div>
          <div className="mt-6">
            {languages.map((lng: string) => (
              <div key={`field-${lng}`}>
                {activeLng === lng && (
                  <textarea
                    className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white min-h-[400px]"
                    placeholder={t('admin.descriptions.placeholder')}
                    {...register(`description.${lng}`)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Descriptions
