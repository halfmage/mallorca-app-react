'use client';

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddProvider from './AddProvider'
import { useRouter } from 'next/navigation'

const Admin = ({ providers: initialProviders, mainCategories }) => {
  const { t, i18n: { language } } = useTranslation();
  const { push } = useRouter()
  const [activeTab, setActiveTab] = useState('providers');
  const [providers, setProviders] = useState(initialProviders);
  const [loading, setLoading] = useState(false);
  const fetchProviders = useCallback(
      async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/edit-provider`)
          const { data } = await response.json()
          setProviders(data);
        } catch (error) {
          console.error('Error fetching providers:', error);
        } finally {
          setLoading(false);
        }
      },
      [ ]
  )
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('providers')}
            className={`${
              activeTab === 'providers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
          >
            {t('admin.providerList')}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
          >
            {t('admin.addProvider')}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'providers' ? (
        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <p className="p-4">{t('common.loading')}</p>
            ) : providers.length === 0 ? (
              <p className="p-4">{t('admin.noProviders')}</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {providers.map((provider) => (
                  <li key={provider.id}>
                    <div className="flex items-center p-4 hover:bg-gray-50">
                      {/* Provider Image */}
                      <div className="flex-shrink-0 h-16 w-16 mr-4">
                        {provider?.mainImage?.publicUrl ? (
                          <img
                            src={provider.mainImage.publicUrl}
                            alt={provider.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
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
                        <button
                          onClick={() => push(`/${language}/provider/${provider.slug || provider.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t('admin.viewDetails')}
                        </button>
                        <button
                          onClick={() => push(`/${language}/admin/edit-provider/${provider.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t('admin.edit')}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <AddProvider onSuccess={fetchProviders} mainCategories={mainCategories} />
      )}
    </div>
  );
};

export default Admin;
