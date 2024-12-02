import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const SavedProviders = () => {
  const [savedProviders, setSavedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  const fetchSavedProviders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('saved_providers')
        .select(`
          provider_id,
          providers (
            id,
            name,
            maincategory_id,
            maincategories (
              name
            ),
            provider_images (
              id,
              image_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Process the providers to get public URLs for first images
      const processedProviders = await Promise.all(data.map(async (item) => {
        const provider = item.providers;
        const firstImage = provider.provider_images?.[0];
        
        if (firstImage) {
          const { data: publicUrlData } = supabase.storage
            .from('provider-images')
            .getPublicUrl(firstImage.image_url);
          
          return {
            ...provider,
            firstImage: publicUrlData.publicUrl
          };
        }
        
        return provider;
      }));

      setSavedProviders(processedProviders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching saved providers:', error.message);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSavedProviders();
    }
  }, [user, fetchSavedProviders]);

  const handleUnsave = async (providerId) => {
    try {
      const { error } = await supabase
        .from('saved_providers')
        .delete()
        .eq('user_id', user.id)
        .eq('provider_id', providerId);

      if (error) throw error;

      // Remove the provider from the local state
      setSavedProviders(prev => prev.filter(provider => provider.id !== providerId));
    } catch (error) {
      console.error('Error removing provider:', error.message);
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>{t('profile.notLoggedIn')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('savedProviders.title')}</h1>

      {savedProviders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">{t('savedProviders.empty')}</p>
          <Link
            to="/"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
          >
            {t('savedProviders.browseProviders')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Provider Image */}
              <div className="h-48 w-full overflow-hidden bg-gray-100">
                {provider.firstImage ? (
                  <img
                    src={provider.firstImage}
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
                <h3 className="text-xl font-semibold mb-2">{provider.name}</h3>
                {provider.maincategories && (
                  <p className="text-gray-600 mb-4">{provider.maincategories.name}</p>
                )}

                <div className="flex justify-between items-center">
                  <Link
                    to={`/provider/${provider.id}`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    {t('savedProviders.viewDetails')}
                  </Link>
                  <button
                    onClick={() => handleUnsave(provider.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    {t('savedProviders.unsave')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProviders;
