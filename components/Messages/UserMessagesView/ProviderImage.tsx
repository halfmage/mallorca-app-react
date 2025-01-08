'use client'

import React from 'react'
import { useTranslation } from '@/app/i18n/client'

const ProviderImage = ({ provider }) => {
    const { t } = useTranslation()

    return provider?.mainImage?.publicUrl ? (
        <img
            src={provider.mainImage.publicUrl}
            alt={provider.name}
            className="h-16 w-16 object-cover rounded-full"
        />
    ) : (
        <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
            <span className="text-gray-400 text-sm">
                {t('common.noImage')}
            </span>
        </div>
    )
}

export default ProviderImage
