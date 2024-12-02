import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const ProviderCard = ({ provider }) => {
  const { t } = useTranslation();
  const [firstImage, setFirstImage] = useState(null);

  useEffect(() => {
    const fetchFirstImage = async () => {
      try {
        const { data, error } = await supabase
          .from('provider_images')
          .select('image_url')
          .eq('provider_id', provider.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching provider image:', error.message);
          return;
        }

        if (data) {
          const { data: publicUrlData } = supabase.storage
            .from('provider-images')
            .getPublicUrl(data.image_url);
          setFirstImage(publicUrlData.publicUrl);
        }
      } catch (error) {
        console.error('Error processing provider image:', error.message);
      }
    };

    fetchFirstImage();
  }, [provider.id]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Provider Image */}
      <div className="h-48 w-full overflow-hidden bg-gray-100">
        {firstImage ? (
          <img 
            src={firstImage} 
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
