'use client'

import React from 'react'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import Image from '@/components/shared/Image'
import SaveButton from '@/components/shared/SaveButton'
import { Provider } from '@/app/api/utils/types'

const DEFAULT_WIDTH = 358
const DEFAULT_HEIGHT = 268

interface Props {
  provider: Provider
  imageWidth?: number
  imageHeight?: number
  showSaveButton?: boolean
  isSaved?: boolean
  onSaveChange?: (providerId: string, isSaved: boolean) => void
}

const ProviderCard = ({
  provider, showSaveButton, isSaved, onSaveChange, imageWidth = DEFAULT_WIDTH, imageHeight = DEFAULT_HEIGHT
}: Props) => {
  const { t, i18n: { language } } = useTranslation()

  return (
    <Link
      href={`/${language}/provider/${provider.slug || provider.id}`}
      className="group"
    >
      {/* Provider Image */}
      <div className="aspect-[5/4] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 relative group">
        {provider?.mainImage?.publicUrl ? (
          <div className="w-full h-full *:w-full *:h-full group-hover:scale-105 transition-all">
            <Image
              src={provider.mainImage.publicUrl}
              alt={provider.name}
              width={imageWidth}
              height={imageHeight}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {t('common.noImage')}
          </div>
        )}
        {showSaveButton && (
          <div className='absolute top-3 right-3'>
            <SaveButton provider={provider} isSaved={isSaved} onClick={onSaveChange}/>
          </div>
        )}
      </div>

      {/* Provider Details */}
      <div className="mt-2">
        <div
          className="font-bold text-lg tracking-tight truncate flex items-center gap-1">
          {provider.name}
        </div>
        <div className='flex items-center gap-1 text-sm overflow-hidden'>
          <Heart size={16} strokeWidth={3} className='text-primary relative top-px shrink-0'/>
          <span className='font-bold text-primary'>{provider.savedCount || 0} </span>
          <span>·</span>
          <span
            className='text-gray-500 dark:text-gray-400'>{provider.maincategories?.name || t('home.noCategory')}</span>
          {provider?.subcategories?.length > 0 &&
            provider?.subcategories?.slice(0, 2).map(
              (subcategory) => (
                <span key={subcategory.id}>
                        <span>·</span>
                        <span
                          className='text-gray-500 dark:text-gray-400 whitespace-nowrap'> {subcategory?.name}</span>
                      </span>
              )
            )
          }
        </div>
        <div
          className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{provider.address}</div>
      </div>
    </Link>
  );
};

export default ProviderCard;
