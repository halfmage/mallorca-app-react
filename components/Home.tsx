import React from 'react';
import { useTranslation } from '@/app/i18n';
import ProviderCard from './ProviderCard';

const Home = async ({ providers, lng }) => {
  const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

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
