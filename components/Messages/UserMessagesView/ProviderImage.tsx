'use client'

import React from 'react'
import { useTranslation } from '@/app/i18n/client'
import Image from '@/components/shared/Image'

// @ts-expect-error: skip type for now
const ProviderImage = ({ provider }) => {
    const { t } = useTranslation()

    return provider?.mainImage?.publicUrl ? (
        <Image
            src={provider.mainImage.publicUrl}
            alt={provider.name}
            className="h-16 w-16 object-cover rounded-full"
            width={64}
            height={64}
        />
    ) : (
        <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded">
            <span className="text-gray-400 text-sm">
                {t('common.noImage')}
            </span>
        </div>
    )
}

export default ProviderImage
