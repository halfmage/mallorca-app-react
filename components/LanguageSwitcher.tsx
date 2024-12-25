import React, { useCallback } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { useRouter, usePathname } from 'next/navigation'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const { push } = useRouter()
  const pathname = usePathname()
  const handleChange = useCallback(
      (e) => {
          const oldLng = i18n.language
          const lng = e.target.value
          i18n.changeLanguage(lng)
          push(pathname.startsWith(`/${oldLng}`) ? pathname.replace(`/${oldLng}`, `/${lng}`) : `/${lng}`)
      },
      [i18n, push, pathname]
  )

  return (
    <div className="flex items-center">
      <select
        onChange={handleChange}
        value={i18n.language}
        className="bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
      </select>
    </div>
  )
}

export default LanguageSwitcher
