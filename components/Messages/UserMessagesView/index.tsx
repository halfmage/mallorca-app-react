'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'
import Message from './Message'
import Provider from './Provider'
import ProviderImage from './ProviderImage'

// @ts-expect-error: skip type for now
const UserMessagesView = ({ providers }) => {
    const { t, i18n: { language } } = useTranslation()
    const [ selectedProvider, setSelectedProvider ] = useState(providers?.[0])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="h-screen flex flex-col">
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="h3">{t('messages.user.title')}</h1>
                </div>
                <div className="flex-1 flex flex-col md:grid md:grid-cols-12 bg-white dark:bg-gray-900">
                    <div className={`${
                        selectedProvider ? 'hidden md:block' : ''
                    } md:col-span-4 md:border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto`}>
                        {providers?.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {providers.map((provider) => (
                                    <Provider
                                        provider={provider}
                                        isActive={provider.id === selectedProvider?.id}
                                        onClick={setSelectedProvider}
                                        key={provider.id}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full p-4 text-center">
                                <p className="text-body text-gray-600 dark:text-gray-400">{t('messages.user.noProviders')}</p>
                            </div>
                        )}
                    </div>
                    {selectedProvider ? (
                        <div className="md:col-span-8 flex flex-col h-full">
                            <div className="sticky top-0 z-10 flex items-center gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-900/80">
                                <button 
                                    onClick={() => setSelectedProvider(null)}
                                    className="md:hidden -ml-1 p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-md overflow-hidden">
                                    <ProviderImage provider={selectedProvider} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/${language}/provider/${selectedProvider?.slug || selectedProvider?.id}`}
                                          className="text-link font-semibold hover:text-primary-500 dark:hover:text-primary-400">
                                        {selectedProvider?.name}
                                    </Link>
                                    {selectedProvider?.isOwnProvider && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-900/10 text-primary-500 dark:bg-primary-400/10 dark:text-primary-400">
                                            {t('messages.user.ownProvider')}
                                        </span>
                                    )}
                                    {selectedProvider?.maincategories && (
                                        <p className="text-caption mt-0.5 text-gray-600 dark:text-gray-400">{selectedProvider?.maincategories?.name}</p>
                                    )}
                                    {selectedProvider?.subcategories?.length > 0 && (
                                        <div className="hidden sm:flex flex-wrap gap-1.5 mt-2">
                                            {selectedProvider.subcategories.map((subcategory) => (
                                                <span key={subcategory.id} 
                                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                    {subcategory.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 hide-scrollbar bg-gray-50 dark:bg-gray-950">
                                {selectedProvider?.messages?.length > 0 ? (
                                    selectedProvider.messages.map((message) => (
                                        <Message message={message} key={message.id}/>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full text-center">
                                        <div className="max-w-sm space-y-2">
                                            <p className="text-body text-gray-600 dark:text-gray-400">{t('messages.user.noMessages')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:flex md:col-span-8 items-center justify-center h-full text-center bg-gray-50 dark:bg-gray-950">
                            <div className="max-w-sm space-y-2">
                                <p className="text-body text-gray-600 dark:text-gray-400">{t('messages.user.selectProvider')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserMessagesView
