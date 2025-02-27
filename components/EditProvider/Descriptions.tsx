import React, { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { languages } from '@/app/i18n/settings'

// @ts-expect-error: skip type for now
const Descriptions = ({ register }) => {
  const { t, i18n: { language } } = useTranslation()
  const [activeLng, setActiveLng] = useState(language)

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="border-2 border-gray-300 p-4">
        <div className="max-w-4xl mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">{t('admin.descriptions.title')}</h2>
          <div className="flex gap-3">
            {languages.map((lng: string) => (
              <a
                className={`text-white px-4 py-2 rounded-md ${activeLng === lng ? 'bg-primary-500' : 'bg-gray-500  hover:bg-gray-600'}`}
                onClick={() => setActiveLng(lng)}
                key={lng}
              >
                {t(`common.language.${lng}`)}
              </a>
            ))}
          </div>
          <div className="mt-6">
            {languages.map((lng: string) => (
              <div key={`field-${lng}`}>
                {activeLng === lng && (
                  <textarea
                    className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white min-h-[150px]"
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
