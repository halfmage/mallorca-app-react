import React from 'react'
import { useTranslation } from '@/app/i18n'
import CategoryRow from './CategoryRow'

const Home = async ({ categories, lng }) => {
  const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

  return (
    <>
      <div className="h1 py-6">
        {t('home.title')}
      </div>
      <div className='flex flex-col'>
        {categories.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>{t('home.noProviders')}</p>
            <p className="mt-4 text-sm text-gray-500">
              Debug Info: Check console for detailed logs
            </p>
          </div>
        ) : categories.map(({ providers, ...category }) => (
            <CategoryRow
                category={category}
                providers={providers}
                lng={lng}
                key={category.id}
            />
        ))}
      </div>
    </>
  );
};

export default Home;
