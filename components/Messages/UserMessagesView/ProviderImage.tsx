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
            className="h-full w-full object-cover"
            width={64}
            height={64}
        />
    ) : (
        <div className="h-full w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400 text-sm">
                {t('common.noImage')}
            </span>
        </div>
    )
}

export default ProviderImage
