import React, { useCallback, useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { useRouter, usePathname } from 'next/navigation'
import { Globe, ChevronDown } from 'lucide-react';

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
        className="flex md:flex-col p-3 gap-3 md:gap-0 w-full items-center rounded-lg dark:hover:bg-gray-800"
      >
        <Globe size={24} strokeWidth={1.5}/>
        <div className="flex items-center w-full">
          <span className='w-full text-left'>
            {i18n.language === 'en' ? 'English' : i18n.language === 'de' ? 'Deutsch' : 'Español'}
          </span>
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-10 top-full mt-1 left-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-1 min-w-[120px] w-full md:w-auto">
            <button
              onClick={() => switchLanguage('en')}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${i18n.language === 'en' ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
            >
              English
            </button>
            <button
              onClick={() => switchLanguage('de')}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${i18n.language === 'de' ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
            >
              Deutsch
            </button>
            <button
              onClick={() => switchLanguage('es')}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${i18n.language === 'es' ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
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
