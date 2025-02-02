import React from 'react'
import { useTranslation } from '@/app/i18n/client'
import Image from '@/components/shared/Image'

const Option = ({ provider, label }) => {
    const { t } = useTranslation()
    return (
        <div className="flex gap-3">
            <div className="rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center">
                <Image
                    src={provider?.mainImage?.publicUrl}
                    alt={label}
                    width={64}
                    height={48}
                />
            </div>
            <div>
                <span>{label}</span>
                <div>
                    <span className='text-gray-500 dark:text-gray-400'>{provider.maincategories?.name || t('home.noCategory')}</span>
                    {provider?.provider_subcategories?.length > 0 &&
                        provider?.provider_subcategories?.slice(0, 2).map(
                            ({ subcategories: subcategory }) => (
                                <span key={subcategory.id}>
                        <span>·</span>
                        <span className='text-gray-500 dark:text-gray-400 whitespace-nowrap'> {subcategory?.name}</span>
                      </span>
                            )
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Option