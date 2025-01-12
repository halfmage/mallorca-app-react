"use client"

import React from 'react';
import { useTranslation } from '@/app/i18n/client';
import Link from 'next/link';

const ProviderCard = ({ provider }) => {
  const { t, i18n: { language } } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Provider Image */}
      <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
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
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{provider.name}</h3>
        
        {/* Main Category */}
        <div className="flex items-center mb-2">
          <span className="text-sm text-gray-600 mr-2">
            {t('home.category')}:
          </span>
          <span className="text-sm font-medium text-blue-600">
            {provider.maincategories?.name || "t('home.noCategory')"}
          </span>
        </div>

        {/* Saves Count */}
        <div className="flex items-center mb-4">
          <span className="text-sm text-gray-600 mr-2">
            {t('home.saves')}:
          </span>
          <span className="text-sm font-medium text-green-600">
            {provider.savedCount}
          </span>
        </div>

         {/* View Details Button */}
        <Link
          href={`/${language}/provider/${provider.slug || provider.id}`}
          className="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {t('home.viewDetails')}
        </Link>
      </div>
    </div>
  );
};

export default ProviderCard;
