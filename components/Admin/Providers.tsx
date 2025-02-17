'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import Provider from './Provider'
import SortableHeader from '@/components/Admin/SortableHeader'
import { Provider as ProviderType } from '@/app/api/utils/types'

interface Props {
  providers: Array<ProviderType>
  loading: boolean
}

const Providers = ({ providers, loading }: Props) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <p className="p-4">{t('common.loading')}</p>
        ) : providers.length === 0 ? (
          <p className="p-4">{t('admin.noProviders')}</p>
        ) : (
          <table className="divide-y divide-gray-200 dark:divide-gray-800 w-full text-left">
            <thead>
            <tr>
              <SortableHeader>{t('admin.providers.name')}</SortableHeader>
              <SortableHeader>{t('admin.providers.status')}</SortableHeader>
              <SortableHeader>{t('admin.providers.paymentStatus')}</SortableHeader>
              <SortableHeader>{t('admin.providers.updatedAt')}</SortableHeader>
              <SortableHeader>{t('admin.providers.saved')}</SortableHeader>
              <SortableHeader>{t('admin.providers.user')}</SortableHeader>
              <SortableHeader>{t('admin.providers.userEmail')}</SortableHeader>
              <SortableHeader>{t('admin.providers.actions')}</SortableHeader>
            </tr>
            </thead>
            <tbody>
            {providers.map((provider: ProviderType) => (
              <Provider provider={provider} key={provider.id}/>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Providers
