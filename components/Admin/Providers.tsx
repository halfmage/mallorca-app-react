'use client';

import React from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'

const Providers = ({ providers, loading }) => {
    const { t, i18n: { language } } = useTranslation()

    return (
        <div>
            <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <p className="p-4">{t('common.loading')}</p>
                ) : providers.length === 0 ? (
                    <p className="p-4">{t('admin.noProviders')}</p>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                        {providers.map((provider) => (
                            <li key={provider.id}>
                                <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {/* Provider Image */}
                                    <div className="flex-shrink-0 h-16 w-16 mr-4">
                                        {provider?.mainImage?.publicUrl ? (
                                            <img
                                                src={provider.mainImage.publicUrl}
                                                alt={provider.name}
                                                className="h-16 w-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div
                                                className="h-16 w-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded">
                            <span className="text-gray-400 text-sm">
                              {t('common.noImage')}
                            </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Provider Info */}
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-medium">{provider.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {provider.maincategories?.name}
                                        </p>
                                        <p className="text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              provider.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {provider.status}
                          </span>
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex-shrink-0 space-x-2">
                                        <Link
                                            href={`/${language}/provider/${provider.slug || provider.id}`}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            {t('admin.viewDetails')}
                                        </Link>
                                        <Link
                                            href={`/${language}/admin/edit-provider/${provider.id}`}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            {t('admin.edit')}
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Providers
