"use client"

import React from 'react';
import { useTranslation } from '@/app/i18n/client';
import Link from 'next/link';

const ProviderCard = ({ provider }) => {
  const { t, i18n: { language } } = useTranslation();

  return (
    <Link
      href={`/${language}/provider/${provider.slug || provider.id}`}
      className="block bg-white dark:bg-gray-900 hover:bg-gray-100 hover:dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group transition-colors"
    >
      {/* Provider Image */}
      <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {provider?.mainImage?.publicUrl ? (
          <img
            src={provider.mainImage.publicUrl}
            alt={provider.name} 
            className="w-full h-full object-cover group-hover:brightness-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {t('common.noImage')}
          </div>
        )}
      </div>

      {/* Provider Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1">{provider.name}</h3>
        
        {/* Main Category */}
        <div className="flex items-center mb-1">
          <span className="text-sm text-gray-600 mr-2">
            {t('home.category')}:
          </span>
          <span className="text-sm font-medium text-blue-600">
            {provider.maincategories?.name || "t('home.noCategory')"}
          </span>
        </div>

        {/* Saves Count */}
        <div className="flex items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
            {t('home.saves')}:
          </span>
          <span className="text-sm font-medium text-green-600">
            {provider.savedCount}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProviderCard;
