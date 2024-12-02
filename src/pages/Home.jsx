import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProviders = async () => {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          id, name, image_url
        `);
  
      if (error) {
        console.error('Error fetching providers:', error.message);
        setLoading(false);
        return;
      }
  
      // Generate public URLs for images
      const providersWithImageURLs = data.map((provider) => {
        if (provider.image_url) {
          const { data: publicUrlData } = supabase.storage
            .from('provider-images')
            .getPublicUrl(provider.image_url);
          return { ...provider, image_url: publicUrlData.publicUrl };
        }
        return provider;
      });
  
      setProviders(providersWithImageURLs);
      setLoading(false);
    };
  
    fetchProviders();
  }, []);  

  if (loading) {
    return <div>{t('home.loading')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('home.title')}</h1>
      {providers.length === 0 ? (
        <p>{t('home.noProviders')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              to={`/provider/${provider.id}`}
              className="block border rounded p-4 shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
            >
              {/* Provider Name */}
              <h2 className="text-xl font-bold">{provider.name}</h2>

              {/* Provider Image */}
              {provider.image_url ? (
                <img
                  src={provider.image_url}
                  alt={provider.name}
                  className="mt-4 w-full h-48 object-cover rounded"
                />
              ) : (
                <div className="mt-4 w-full h-48 flex items-center justify-center bg-gray-100 rounded">
                  <p className="text-gray-500">{t('home.noImage')}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
