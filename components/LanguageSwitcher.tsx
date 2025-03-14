import React, { useCallback, useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const { push } = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const switchLanguage = useCallback(
    (lng: string) => {
      const oldLng = i18n.language
      i18n.changeLanguage(lng)
      push(pathname.startsWith(`/${oldLng}`) ? pathname.replace(`/${oldLng}`, `/${lng}`) : `/${lng}`)
      setIsOpen(false)
    },
    [i18n, push, pathname]
  )

  return (
    <div className="relative !p-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
      >
        <Globe size={20} strokeWidth={2}/>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-10 top-full mt-3 py-2 right-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 min-w-[120px] w-full md:w-auto">
            <button
              onClick={() => switchLanguage('en')}
              disabled={i18n.language === 'en'}
              className={`w-full text-left font-medium px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${i18n.language === 'en' ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50' : ''}`}
            >
              English
            </button>
            <button
              onClick={() => switchLanguage('de')}
              disabled={i18n.language === 'de'}
              className={`w-full text-left font-medium px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${i18n.language === 'de' ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50' : ''}`}
            >
              Deutsch
            </button>
            <button
              onClick={() => switchLanguage('es')}
              disabled={i18n.language === 'es'}
              className={`w-full text-left font-medium px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${i18n.language === 'es' ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50' : ''}`}
            >
              Español
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher
