import React from 'react'
import { useTranslation } from '@/app/i18n/client'
import Image from '@/components/shared/Image'

interface Provider {
    mainImage?: {
        publicUrl?: string
    }
    maincategories?: {
        name?: string
        slug?: string
    }
    provider_subcategories?: Array<{
        subcategories: {
            id: string
            name: string
        }
    }>
}

interface ProviderOptionProps {
    provider: Provider
    label: string
}

const Option: React.FC<ProviderOptionProps> = ({ provider, label }) => {
    const { t } = useTranslation(undefined, 'translation', {})
    return (
        <div className="flex items-center gap-4 group w-full overflow-hidden">
            <div className="rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <Image
                    src={provider?.mainImage?.publicUrl}
                    alt={label}
                    width={64}
                    height={56}
                />
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors text-lg/5 tracking-tight">{label}</span>
                <div className="flex items-center gap-1 text-sm whitespace-nowrap truncate">
                    <span className='text-gray-500 dark:text-gray-400'>{provider.maincategories?.name || t('home.noCategory')}</span>
                    {provider?.provider_subcategories?.length > 0 &&
                        provider?.provider_subcategories?.slice(0, 2).map(
                            ({ subcategories: subcategory }) => (
                                <React.Fragment key={subcategory.id}>
                                    <span className="text-gray-400 dark:text-gray-500">·</span>
                                    <span className='text-gray-500 dark:text-gray-400 whitespace-nowrap'>{subcategory?.name}</span>
                                </React.Fragment>
                            )
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Option