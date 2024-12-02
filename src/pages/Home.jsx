import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient';
import ProviderCard from '../components/ProviderCard';

const Home = () => {
  const { t } = useTranslation();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // First, check the status of the providers table
        const { count, error: countError } = await supabase
          .from('providers')
          .select('*', { count: 'exact' });

        console.log('Total providers count:', count);
        if (countError) {
          console.error('Error counting providers:', countError);
        }

        // Fetch providers with main category
        const { data, error } = await supabase
          .from('providers')
          .select(`
            id,
            name,
            image_url,
            status,
            maincategory_id,
            maincategories (
              name
            )
          `)
          .in('status', ['active', 'pending']) // Broaden status filter
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Providers fetch error:', error);
          throw error;
        }

        console.log('Raw providers data:', data);

        // If no providers found, log table structure
        if (!data || data.length === 0) {
          const { data: tableInfo, error: tableError } = await supabase
            .from('providers')
            .select('*')
            .limit(1);

          console.log('Table info:', tableInfo);
          console.error('Table error:', tableError);
        }

        // Process image URLs
        const processedProviders = await Promise.all(
          (data || []).map(async (provider) => {
            // Get public URL for image
            if (provider.image_url) {
              try {
                const { data: publicUrlData } = supabase.storage
                  .from('provider-images')
                  .getPublicUrl(provider.image_url);
                
                provider.image_url = publicUrlData.publicUrl;
              } catch (urlError) {
                console.error(`Error getting image URL for provider ${provider.id}:`, urlError);
                provider.image_url = null;
              }
            }

            // Fetch saves count
            const { count: savesCount, error: savesError } = await supabase
              .from('saved_providers')
              .select('*', { count: 'exact' })
              .eq('provider_id', provider.id);

            if (savesError) {
              console.error(`Error fetching saves for provider ${provider.id}:`, savesError);
              provider.saves_count = 0;
            } else {
              provider.saves_count = savesCount || 0;
            }

            return provider;
          })
        );

        console.log('Processed providers:', processedProviders);

        setProviders(processedProviders);
        setLoading(false);
      } catch (err) {
        console.error('Comprehensive error fetching providers:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {t('common.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        {t('common.error')}: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {t('home.title')}
      </h1>

      {providers.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>{t('home.noProviders')}</p>
          <p className="mt-4 text-sm text-gray-500">
            Debug Info: Check console for detailed logs
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {providers.map((provider) => (
            <ProviderCard 
              key={provider.id} 
              provider={provider} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
