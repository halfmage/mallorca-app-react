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
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Process the providers to get public URLs for images
      const processedProviders = data.map(item => {
        const provider = item.providers;
        if (provider.image_url) {
          const { data: publicUrlData } = supabase.storage
            .from('provider-images')
            .getPublicUrl(provider.image_url);
          return {
            ...provider,
            image_url: publicUrlData.publicUrl
          };
        }
        return provider;
      });

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {savedProviders.map((provider) => (
            <div
              key={provider.id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Link to={`/provider/${provider.id}`}>
                {provider.image_url ? (
                  <img
                    src={provider.image_url}
                    alt={provider.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">{t('home.noImage')}</p>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{provider.name}</h2>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleUnsave(provider.id)}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  {t('savedProviders.unsave')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProviders;
