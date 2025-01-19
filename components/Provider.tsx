"use client"

import React, { useMemo, useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'
import Markdown from 'react-markdown'
import SaveButton from '@/components/shared/SaveButton'
import { Icon } from '@mdi/react'
import { mdiPhone as IconCall } from '@mdi/js'
import { mdiEmail as IconEmail } from '@mdi/js' 
import { mdiWeb as IconWebsite } from '@mdi/js'
import { mdiMapMarker as IconMap } from '@mdi/js'
import { mdiHeart as IconSaved } from '@mdi/js'

const Provider = ({ provider, showSaveButton, isSaved: isSavedInitially }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const providerImages = provider.provider_images || []
    const { t, i18n: { language } } = useTranslation()
    const texts = useMemo(
        () => provider?.provider_translations?.[0],
        [provider]
    )

    if (!provider) {
        return <div className="">{t('providerDetail.error.fetchProvider')}</div>
    }

    return (
        <div className="mt-6">
            {provider ? (
                <div className='container'>
                    <div className='grid md:grid-cols-2 gap-12'>
                        <div>
                            <h1 className="text-2xl font-bold mb-4 tracking-tight">{provider.name}</h1>
                            <div className="mb-4">
                                <h2 className="flex items-center gap-2">
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
                                <SaveButton provider={provider} isSaved={isSavedInitially} />
                            }

                            <div className='flex gap-2'>
                            {
                                        provider?.phone &&
                                        <a
                                            className="button-outline"
                                            href={`tel:${provider.phone}`}
                                        >
                                            <Icon path={IconCall} size={.75} className='text-primary relative top-px shrink-0' />
                                            {t('providerDetail.sidebar.callButton')}
                                        </a>
                                    }
                                    {
                                        provider?.mail &&
                                        <a
                                            className="button-outline"
                                            href={`mailto:${provider.mail}`}
                                        >
                                            <Icon path={IconEmail} size={.75} className='text-primary relative top-px shrink-0' />
                                            {t('providerDetail.sidebar.sendEmailButton')}
                                        </a>
                                    }
                                    {provider?.website &&
                                        <a
                                            className="button-outline"
                                            href={
                                                provider.website.includes('//') ?
                                                    provider.website :
                                                    `https://${provider.website}`
                                            }
                                        >
                                            <Icon path={IconWebsite} size={.75} className='text-primary relative top-px shrink-0' />
                                            {t('providerDetail.sidebar.websiteButton')}
                                        </a>
                                    }
                                    {provider?.google_maps_url &&
                                        <a
                                            className="button-outline"
                                            href={
                                                provider.google_maps_url.includes('//') ?
                                                    provider.google_maps_url :
                                                    `https://${provider.google_maps_url}`
                                            }
                                        >
                                            <Icon path={IconMap} size={.75} className='text-primary relative top-px shrink-0' />
                                            {t('providerDetail.sidebar.directionsButton')}
                                        </a>
                                    }
                                    {(provider?.id || provider?.slug) &&
                                        <Link
                                            className="button-outline"
                                            href={`/${language}/provider/${provider.slug || provider.id}/claim`}
                                        >
                                            {t('providerDetail.sidebar.claim')}
                                        </Link>
                                    }
                            </div>

                            <div className="md:col-span-8">
                                <p className="text-gray-700 text-sm">
                                    {provider?.address || ''}
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
                        </div>
                        <div>
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
