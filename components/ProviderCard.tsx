"use client"

import React from 'react';
import { useTranslation } from '@/app/i18n/client';
import Link from 'next/link';
import { Icon } from '@mdi/react';
import { mdiHeart as IconSaved } from '@mdi/js';

const ProviderCard = ({ provider }) => {
  const { t, i18n: { language } } = useTranslation();

  return (
    <Link
      href={`/${language}/provider/${provider.slug || provider.id}`}
      className=""
    >
      {/* Provider Image */}
      <div className="aspect-[6/5] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
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
        <div className="font-semibold">{provider.name}</div>
        <div className='flex items-center gap-1 text-sm'>
          <Icon path={IconSaved} size={.75} className='text-primary relative top-px' />
          <span className='font-semibold text-primary'>{provider.savedCount || 0} </span>
          <span>·</span>
          <span className='text-gray-500 dark:text-gray-400'>{provider.maincategories?.name || t('home.noCategory')}</span>
          {provider?.subcategories?.length > 0 &&
              provider?.subcategories?.length && provider?.subcategories.map(
                  (subcategory) => (
                      <span key={subcategory.id}>
                        <span>·</span>
                        <span className='text-gray-500 dark:text-gray-400'>{subcategory?.name}</span>
                      </span>
                  )
              )
          }
        </div>
      </div>
    </Link>
  );
};

export default ProviderCard;
