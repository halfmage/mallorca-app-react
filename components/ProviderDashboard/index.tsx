'use client'

import React, { useMemo } from 'react'
import moment from 'moment'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'
import Image from '@/components/shared/Image'
import Tab from '@/components/shared/Tabs/Tab'
import StatsCard from './StatsCard'
import countries from 'i18n-iso-countries'

const ProviderDashboard = ({
  // @ts-expect-error: skip type for now
  provider, providers, stats, userStats, subscriptionLink, paymentInfo
}) => {
  const { t, i18n: { language } } = useTranslation()
  const tabs = useMemo(
    // @ts-expect-error: skip type for now
    () => providers.map(provider => ({
      key: provider?.id,
      label: provider?.name
    })),
    [ providers ]
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(
            // @ts-expect-error: skip type for now
            (tab) => (
              <Tab isActive={provider.id === tab.key} tabKey={tab.key} key={tab.key}>
                <Link href={`/${language}/dashboard/${tab.key}`}>
                  {tab.label}
                </Link>
              </Tab>
            )
          )}
        </nav>
      </div>

      {/* Provider Header */}
      <div className="mb-8">
        <div className="flex">
          <div
            className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {provider?.mainImage?.publicUrl ? (
              <Image
                src={provider.mainImage.publicUrl}
                alt={provider.name}
                className="w-full h-full object-cover"
                width={48}
                height={48}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {t('common.noImage')}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
            <p className="text-gray-600">
              {provider.maincategory?.name}
              {provider?.subcategories?.length > 0 && provider?.subcategories.map(
                // @ts-expect-error: skip type for now
                (subcategory) => (
                  <span key={subcategory.id}>
                                {subcategory.name}
                            </span>
                )
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t('providerDashboard.stats.title')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard label={t('providerDashboard.stats.uniqueViews')} hidden={!stats}>
          {stats?.uniqueViews}
        </StatsCard>
        <StatsCard label={t('providerDashboard.stats.totalViews')} hidden={!stats}>
          {stats?.totalViews}
        </StatsCard>
        <StatsCard label={t('providerDashboard.stats.totalSaves')} hidden={!stats}>
          {stats?.totalSaves}
        </StatsCard>
        <StatsCard label={t('providerDashboard.stats.messagesSent')} hidden={!stats}>
          {stats?.messagesSent}
        </StatsCard>
        <StatsCard label={t('providerDashboard.stats.reachedUsers')} hidden={!stats}>
          {stats?.reachedUsers}
        </StatsCard>
      </div>

      {/* Saved Users */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t('providerDashboard.savedUsers.title')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard label={t('providerDashboard.savedUsers.country')} hidden={!userStats}>
          {userStats?.country && userStats.country.map(
            // @ts-expect-error: skip type for now
            (country) => (
              <div className="flex justify-between" key={country.label}>
                                <span>
                                  {country.label === 'undefined' ?
                                    t('providerDashboard.savedUsers.undefined') :
                                    countries.getName(country.label, language)
                                  }
                                </span>
                <span>{(country.value || 0).toFixed(2)}%</span>
              </div>
            )
          )}
        </StatsCard>
        <StatsCard label={t('providerDashboard.savedUsers.age')} hidden={!userStats}>
          {userStats?.age && userStats.age.map(
            // @ts-expect-error: skip type for now
            (group) => (
              <div className="flex justify-between" key={group.label}>
                                <span>
                                  {group.label === 'undefined' ?
                                    t('providerDashboard.savedUsers.undefined') :
                                    group.label
                                  }
                                </span>
                <span>{(group.value || 0).toFixed(2)}%</span>
              </div>
            )
          )}
        </StatsCard>
        <StatsCard label={t('providerDashboard.savedUsers.gender')} hidden={!userStats}>
          {userStats?.gender && userStats.gender.map(
            // @ts-expect-error: skip type for now
            (gender) => (
              <div className="flex justify-between" key={gender.label}>
                <span>{t(`providerDashboard.savedUsers.${gender.label}`)}</span>
                <span>{(gender.value || 0).toFixed(2)}%</span>
              </div>
            )
          )}
        </StatsCard>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t('providerDashboard.subscription.title')}</h2>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="flex justify-between">
          <div>
            {paymentInfo ?
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  {paymentInfo.name}: {paymentInfo.amount}{paymentInfo.currency}/{t(`providerDashboard.subscription.perMonth`)}
                </h3>

                {paymentInfo.cancelAt ?
                  <p className="text-red-600">
                    {t(`providerDashboard.subscription.cancelAt`)}: {moment(paymentInfo.cancelAt).format('DD.MM.YYYY')}
                  </p> :
                  <p className="text-blue-600">
                    {t(`providerDashboard.subscription.nextPayment`)}: {moment(paymentInfo.nextPayment).format('DD.MM.YYYY')}
                  </p>
                }
              </div> :
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  {t(`providerDashboard.subscription.proposal`)}
                </h3>
                <p className="text-blue-600">
                  {t(`providerDashboard.subscription.notPayed`)}
                </p>
              </div>
            }
          </div>
          <Link href={subscriptionLink}>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {t(`providerDashboard.subscription.${paymentInfo ? 'manage' : 'subscribe'}`)}
            </button>
          </Link>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <Link href={`/${language}/provider/${provider.slug || provider.id}`}>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            {t('providerDashboard.viewPublicProfile')}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProviderDashboard
