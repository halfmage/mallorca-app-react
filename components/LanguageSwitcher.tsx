import React, { useCallback } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { useRouter, usePathname } from 'next/navigation'

import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const { push } = useRouter()
  const pathname = usePathname()
  const handleChange = useCallback(
    // @ts-expect-error: skip type for now
    (e) => {
      const oldLng = i18n.language
      const lng = e.target.value
      i18n.changeLanguage(lng)
      push(pathname.startsWith(`/${oldLng}`) ? pathname.replace(`/${oldLng}`, `/${lng}`) : `/${lng}`)
    },
    [ i18n, push, pathname ]
  )

  return (
    <div
      className="p-1.5 px-2.5 rounded-lg flex flex-col items-center relative opacity-70 hover:opacity-100">
      <Globe size={24} strokeWidth={1.5}/>
      {i18n.language === 'en' ? 'English' : i18n.language === 'de' ? 'Deutsch' : 'Español'}
      <select
        onChange={handleChange}
        value={i18n.language}
        className="appearance-none bg-transparent absolute inset-0 w-full h-full text-transparent text-sm cursor-pointer"
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
      </select>
    </div>
  )
}

export default LanguageSwitcher
