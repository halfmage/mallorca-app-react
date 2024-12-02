import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ProviderCard = ({ provider }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Provider Image */}
      {provider.image_url && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={provider.image_url} 
            alt={provider.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Provider Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{provider.name}</h3>
        
        {/* Main Category */}
        <div className="flex items-center mb-2">
          <span className="text-sm text-gray-600 mr-2">
            {t('home.category')}:
          </span>
          <span className="text-sm font-medium text-blue-600">
            {provider.maincategories?.name || t('home.noCategory')}
          </span>
        </div>

        {/* Saves Count */}
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">
            {t('home.saves')}:
          </span>
          <span className="text-sm font-medium text-green-600">
            {provider.saves_count || 0}
          </span>
        </div>

        {/* View Details Button */}
        <Link 
          to={`/provider/${provider.id}`} 
          className="block mt-4 w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {t('home.viewDetails')}
        </Link>
      </div>
    </div>
  );
};

export default ProviderCard;
