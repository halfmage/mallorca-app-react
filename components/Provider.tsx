"use client"

import React, { useMemo, useState } from 'react'
import { useTranslation } from '@/app/i18n/client'


const Provider = ({ provider, userId, isSaved: isSavedInitially }) => {
    const [isSaved, setIsSaved] = useState(isSavedInitially);
    const [savingStatus, setSavingStatus] = useState('idle');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const providerImages = provider.provider_images || []
    const { t, i18n: { language } } = useTranslation()
    const descriptionHtml = useMemo(
        () => provider?.provider_translations?.[0]?.description ?
            {
                __html: provider?.provider_translations?.[0]?.description
            } :
            null,
        [ provider ]
    )

    const handleSaveToggle = async () => {
        try {
            if (!userId) {
                alert(t('providerDetail.saveButton.loginRequired'))
                return
            }

            setSavingStatus('loading')

            const response = await fetch(
                `/api/saved/${provider.id}`,
                { method: 'PUT' }
            )
            const { data: isSaved } = await response.json()

            setIsSaved(isSaved)
        } catch (error) {
            console.error(t('providerDetail.error.saveProvider'), error.message);
        } finally {
            setSavingStatus('idle')
        }
    }

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
                                className="bg-gray-100 aspect-w-16 aspect-h-9 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">{t('providerDetail.noImages')}</span>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-6">
                            <span>
                                {provider?.maincategories?.name}
                            </span>
                            <span>
                                {provider?.subcategories?.name}
                            </span>
                        </h2>
                    </div>

                    <button
                        onClick={handleSaveToggle}
                        disabled={savingStatus === 'loading'}
                        className={`${
                            isSaved
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-blue-500 hover:bg-blue-600'
                        } text-white px-4 py-2 rounded transition-colors`}
                    >
                        {savingStatus === 'loading'
                            ? t('common.loading')
                            : isSaved
                                ? t('providerDetail.saveButton.remove')
                                : t('providerDetail.saveButton.save')}
                    </button>
                    <div>
                        <div className="grid md:grid-cols-12 gap-12 max-w-screen-lg mx-auto">
                            <div className="md:col-span-8">
                                <p className="text-gray-700 text-sm">
                                    { provider?.address || '' }
                                </p>
                                {descriptionHtml &&
                                  <div
                                    className="prose prose-sm md:prose-base max-w-none"
                                    dangerouslySetInnerHTML={descriptionHtml}
                                  />
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
                                    {provider?.id &&
                                      <a
                                        className="p-4 w-full hover:bg-gray-100"
                                        href={`/${language}/provider/${provider.id}/claim`}
                                      >
                                          {t('providerDetail.sidebar.claim')}
                                      </a>
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
