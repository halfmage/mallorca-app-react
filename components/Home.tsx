import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
import { useTranslation } from '@/app/i18n';
// import { supabase } from '../utils/supabaseClient';
import ProviderCard from './ProviderCard';

const Home = async ({ providers, lng }) => {
  const { t } = await useTranslation(lng)
  // const [providers, setProviders] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  // if (loading) {
  //   return (
  //     <div className="container mx-auto px-4 py-8 text-center">
  //       {t('common.loading')}
  //     </div>
  //   );
  // }
  //
  // if (error) {
  //   return (
  //     <div className="container mx-auto px-4 py-8 text-center text-red-500">
  //       {t('common.error')}: {error}
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-6xl mx-auto p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
