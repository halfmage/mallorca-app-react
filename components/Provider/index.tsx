"use client"

import React, { useMemo } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Markdown from 'react-markdown'
import Gallery from './Gallery'
import OpeningHours from './OpeningHours'
import SaveButton from '@/components/shared/SaveButton'
import { Icon } from '@mdi/react'
import { mdiPhone as IconCall } from '@mdi/js'
import { mdiEmail as IconEmail } from '@mdi/js'
import { mdiWeb as IconWebsite } from '@mdi/js'
import { mdiMapMarker as IconMap } from '@mdi/js'
import { mdiOpenInNew as IconExternal } from '@mdi/js'

interface ProviderTranslation {
  advantages_list?: string;
  tips_list?: string;
  description?: string;
}

interface Subcategory {
  id: number | string;
  name: string;
}

interface ProviderImage {
  url: string;
  alt?: string;
}

interface ProviderProps {
  provider: {
    id?: number | string;
    slug?: string;
    name: string;
    address?: string;
    phone?: string;
    mail?: string;
    website?: string;
    google_maps_url?: string;
    maincategories?: { name: string };
    subcategories?: Subcategory[];
    provider_images?: ProviderImage[];
    provider_translations?: ProviderTranslation[];
  };
  showSaveButton?: boolean;
  isSaved?: boolean;
}

// @ts-expect-error: skip type for now
const EMPTY_ARRAY = []

const Provider = ({ provider, showSaveButton, isSaved: isSavedInitially }: ProviderProps) => {
  // @ts-expect-error: skip type for now
  const providerImages = provider.provider_images || EMPTY_ARRAY
  const { t } = useTranslation()
  const texts = useMemo(
    () => provider?.provider_translations?.[0],
    [ provider ]
  )

  if (!provider) {
    return <div
      className="min-h-screen flex items-center justify-center">{t('providerDetail.error.fetchProvider')}</div>
  }

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="h3">{provider.name}</h1>
            <div className="flex items-center gap-4">
              {showSaveButton && (
                <SaveButton
                  provider={provider}
                  isSaved={isSavedInitially}
                  onClick={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="w-full">
        <div className="max-w-screen-xl mx-auto">
          {providerImages.length > 0 ? (
            <Gallery providerName={provider?.name} images={providerImages}/>
          ) : (
            <div className="aspect-[16/9] md:aspect-[2/1] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">{t('providerDetail.noImages')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {provider?.maincategories?.name}
              </span>
              {provider?.subcategories?.map(
                (subcategory) => (
                  <span key={subcategory.id} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                    {subcategory.name}
                  </span>
                )
              )}
            </div>

            {/* Info Boxes */}
            <div className="grid md:grid-cols-2 gap-8">
              {texts?.advantages_list && (
                <div className="space-y-4">
                  <div className='flex items-center gap-2'>
                    <div className='w-1 h-6 bg-primary-500 rounded-full'></div>
                    <h3 className='font-semibold text-gray-900 dark:text-white h4'>Advantages</h3>
                  </div>
                  <Markdown className="prose prose-sm dark:prose-invert prose-li:p-0 prose-li:leading-6 prose-ul:pl-6 prose-li:my-1.5 prose-ul:marker:text-primary-500">
                    {texts.advantages_list}
                  </Markdown>
                </div>
              )}
              {texts?.tips_list && (
                <div className="space-y-4">
                  <div className='flex items-center gap-2'>
                    <div className='w-1 h-6 bg-primary-500 rounded-full'></div>
                    <h3 className='font-semibold flex items-center gap-1 h4'>
                      <span className='bg-primary-600 text-white px-2 py-0.5 rounded-md text-sm font-sans'>Xclusive</span>
                      <span className="text-gray-900 dark:text-white">Tips</span>
                    </h3>
                  </div>
                  <Markdown className="prose prose-sm dark:prose-invert prose-li:p-0 prose-li:leading-6 prose-ul:pl-6 prose-li:my-1.5 prose-ul:marker:text-primary-500">
                    {texts.tips_list}
                  </Markdown>
                </div>
              )}
            </div>

            {/* Description */}
            {texts?.description && (
              <div className="prose prose-base dark:prose-invert max-w-none prose-headings:font-medium">
                <Markdown>{texts.description}</Markdown>
              </div>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
                <h2 className="h4 mb-4 text-gray-900 dark:text-white">Contact Information</h2>

                {/* Address */}
                {provider?.address && (
                  <div className="mb-6">
                    <p className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                      <Icon path={IconMap} size={1} className="mr-2 text-gray-400 dark:text-gray-500 shrink-0"/>
                      {provider.address}
                    </p>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className='flex flex-col gap-3'>
                  {provider?.phone && (
                    <a className="button-outline w-full justify-between hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors dark:border-gray-700"
                      href={`tel:${provider.phone}`}>
                      <Icon path={IconCall} size={.75} className='text-primary-500 relative top-px shrink-0'/>
                      {t('providerDetail.sidebar.callButton')}
                      <Icon path={IconExternal} size={.65} className='text-gray-400 dark:text-gray-500 ml-1 relative top-px shrink-0'/>
                    </a>
                  )}
                  {provider?.mail && (
                    <a className="button-outline w-full justify-between hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors dark:border-gray-700"
                      href={`mailto:${provider.mail}`}>
                      <Icon path={IconEmail} size={.75} className='text-primary-500 relative top-px shrink-0'/>
                      {t('providerDetail.sidebar.sendEmailButton')}
                      <Icon path={IconExternal} size={.65} className='text-gray-400 dark:text-gray-500 ml-1 relative top-px shrink-0'/>
                    </a>
                  )}
                  {provider?.website && (
                    <a className="button-outline w-full justify-between hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors dark:border-gray-700"
                      href={provider.website.includes('//') ? provider.website : `https://${provider.website}`}
                      target="_blank"
                      rel="noopener noreferrer">
                      <Icon path={IconWebsite} size={.75} className='text-primary-500 relative top-px shrink-0'/>
                      {t('providerDetail.sidebar.websiteButton')}
                      <Icon path={IconExternal} size={.65} className='text-gray-400 dark:text-gray-500 ml-1 relative top-px shrink-0'/>
                    </a>
                  )}
                  {provider?.google_maps_url && (
                    <a className="button-outline w-full justify-between hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors dark:border-gray-700"
                      href={provider.google_maps_url.includes('//') ? provider.google_maps_url : `https://${provider.google_maps_url}`}
                      target="_blank"
                      rel="noopener noreferrer">
                      <Icon path={IconMap} size={.75} className='text-primary-500 relative top-px shrink-0'/>
                      {t('providerDetail.sidebar.directionsButton')}
                      <Icon path={IconExternal} size={.65} className='text-gray-400 dark:text-gray-500 ml-1 relative top-px shrink-0'/>
                    </a>
                  )}
                </div>
              </div>
            </div>
            {/* @ts-expect-error: skip type for now */}
            {provider?.opening_hours?.length > 0 && (<OpeningHours days={provider.opening_hours}/>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Provider;
