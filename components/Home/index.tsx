import React from 'react'
import { useTranslation } from '@/app/i18n'
import CategoryRow from './CategoryRow'
import { Provider } from '@/app/api/utils/types'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Home.module.css'

interface Props {
  categories: Array<{
    id: string
    name: string
    slug: string
    providers: Provider[]
  }>
  lng: string
}

const Home = async ({ categories, lng }: Props) => {
  const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

  return (
    <>
      <div className="relative my-4 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/mallorca-home-bg.jpg"
            alt="Mallorca Cathedral"
            fill
            className={`object-cover ${styles.zoomAnimation}`}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-800/50 to-primary-800/60" />
        </div>
        <div className="relative text-center py-10 md:py-16 px-4">
          <div className="h1 py-6 text-white max-w-xl mx-auto">{t('home.title')}</div>
          <p className="-mt-3 font-semibold max-w-xl text-white text-body mx-auto">{t('home.subtitle')}</p>
          <Link 
            href={`/${lng}/login`} 
            className="button-primary mt-8 inline-block"
          >
            {t('header.signIn')}
          </Link>
        </div>
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
