"use client"

import React from 'react';
import { useTranslation } from '@/app/i18n/client';
import Link from 'next/link';
import { Heart } from 'lucide-react';

const ProviderCard = ({ provider }) => {
  const { t, i18n: { language } } = useTranslation();

  return (
    <Link
      href={`/${language}/provider/${provider.slug || provider.id}`}
      className="group"
    >
      {/* Provider Image */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {provider?.mainImage?.publicUrl ? (
          <img
            src={provider.mainImage.publicUrl}
            alt={provider.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {t('common.noImage')}
          </div>
        )}
      </div>

      {/* Provider Details */}
      <div className="mt-2">
        <div className="font-bold group-hover:underline text-lg tracking-tight truncate flex items-center gap-1">
          {provider.name}
        </div>
        <div className='flex items-center gap-1 text-sm overflow-hidden'>
          <Heart size={16} strokeWidth={3} className='text-primary relative top-px shrink-0' />
          <span className='font-bold text-primary'>{provider.savedCount || 0} </span>
          <span>·</span>
          <span className='text-gray-500 dark:text-gray-400'>{provider.maincategories?.name || t('home.noCategory')}</span>
          {provider?.subcategories?.length > 0 &&
              provider?.subcategories?.slice(0, 2).map(
                  (subcategory) => (
                      <span key={subcategory.id}>
                        <span>·</span>
                        <span className='text-gray-500 dark:text-gray-400 whitespace-nowrap'> {subcategory?.name}</span>
                      </span>
                  )
              )
          }
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{provider.address}</div>
      </div>
    </Link>
  );
};

export default ProviderCard;
