import React, { useCallback } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { useRouter } from 'next/navigation'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { push } = useRouter()
  const handleChange = useCallback(
      (e) => {
          const lng = e.target.value
          i18n.changeLanguage(lng)
          push(`/${lng}`)
      },
      [i18n, push]
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
  );
};

export default LanguageSwitcher;
