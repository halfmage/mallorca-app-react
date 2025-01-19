"use client"

import React, { useMemo, useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'
import Markdown from 'react-markdown'
import SaveButton from '@/components/shared/SaveButton'

const Provider = ({ provider, showSaveButton, isSaved: isSavedInitially }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const providerImages = provider.provider_images || []
    const { t, i18n: { language } } = useTranslation()
    const texts = useMemo(
        () => provider?.provider_translations?.[0],
        [ provider ]
    )

    if (!provider) {
        return <div className="max-w-6xl mx-auto p-6">{t('providerDetail.error.fetchProvider')}</div>
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            {provider ? (
                <div>
                    <h1 className="text-3xl font-bold mb-4">{provider.name}</h1>

                    {/* Image Gallery */}
                    <div className="mb-6">
                        {providerImages.length > 0 ? (
                            <div>
                                {/* Main Image Display */}
                                <div className="relative aspect-w-16 aspect-h-9 mb-4">
                                    <img
                                        src={providerImages[activeImageIndex].publicUrl}
                                        alt={`${provider.name} - ${activeImageIndex + 1}`}
                                        className="object-cover w-full h-full rounded-lg"
                                    />
                                </div>

                                {/* Thumbnail Navigation */}
                                {providerImages.length > 1 && (
                                    <div className="flex space-x-2 overflow-x-auto" key="thumbnails">
                                        {providerImages.map((image, index) => (
                                            <button
                                                key={image.id}
                                                onClick={() => setActiveImageIndex(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 
                          ${index === activeImageIndex ? 'border-blue-500' : 'border-transparent'}`}
                                            >
                                                <img
                                                    src={image.publicUrl}
                                                    alt={`${provider.name} thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                className="bg-gray-100 dark:bg-gray-800 aspect-w-16 aspect-h-9 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">{t('providerDetail.noImages')}</span>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-6">
                            <span>
                                {provider?.maincategories?.name}
                            </span>
                            {provider?.subcategories?.length > 0 && provider?.subcategories.map(
                                (subcategory) => (
                                    <span key={subcategory.id}>
                                        {subcategory.name}
                                    </span>
                                )
                            )}
                        </h2>
                    </div>

                    {showSaveButton &&
                      <SaveButton
                        provider={provider}
                        isSaved={isSavedInitially}
                      />
                    }
                    <div>
                        <div className="grid md:grid-cols-12 gap-12 max-w-screen-lg mx-auto">
                            <div className="md:col-span-8">
                                <p className="text-gray-700 text-sm">
                                    { provider?.address || '' }
                                </p>
                                <div className="grid md:grid-cols-12 gap-12">
                                    {texts?.advantages_list &&
                                      <div className="md:col-span-6 border rounded p-4">
                                        <Markdown>
                                            {texts.advantages_list}
                                        </Markdown>
                                      </div>
                                    }
                                    {texts?.tips_list &&
                                      <div className="md:col-span-6 border rounded p-4">
                                        <Markdown>
                                            {texts.tips_list}
                                        </Markdown>
                                      </div>
                                    }
                                </div>
                                {texts?.description &&
                                  <Markdown>
                                      {texts.description}
                                  </Markdown>
                                }
                            </div>
                            <div className="md:col-span-4">
                                <div
                                    className="hidden md:flex flex-col divide-y divide-gray-200 rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                                    {
                                        provider?.phone &&
                                        <a
                                            className="p-4 w-full hover:bg-gray-100"
                                            href={`tel:${provider.phone}`}
                                          >
                                                {t('providerDetail.sidebar.callButton')}
                                          </a>
                                    }
                                    {
                                        provider?.mail &&
                                          <a
                                            className="p-4 w-full hover:bg-gray-100"
                                            href={`mailto:${provider.mail}`}
                                          >
                                                {t('providerDetail.sidebar.sendEmailButton')}
                                          </a>
                                    }
                                    {provider?.website &&
                                      <a
                                        className="p-4 w-full hover:bg-gray-100"
                                        href={
                                          provider.website.includes('//') ?
                                              provider.website :
                                              `https://${provider.website}`
                                        }
                                      >
                                        {t('providerDetail.sidebar.websiteButton')}
                                      </a>
                                    }
                                    {provider?.google_maps_url &&
                                      <a
                                        className="p-4 w-full hover:bg-gray-100"
                                        href={
                                            provider.google_maps_url.includes('//') ?
                                                provider.google_maps_url :
                                                `https://${provider.google_maps_url}`
                                        }
                                      >
                                          {t('providerDetail.sidebar.directionsButton')}
                                      </a>
                                    }
                                    {(provider?.id || provider?.slug) &&
                                      <Link
                                        className="p-4 w-full hover:bg-gray-100"
                                        href={`/${language}/provider/${provider.slug || provider.id}/claim`}
                                      >
                                          {t('providerDetail.sidebar.claim')}
                                      </Link>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-red-500">
                    {t('providerDetail.error.notFound')}
                </div>
            )}
        </div>
    );
};

export default Provider;
