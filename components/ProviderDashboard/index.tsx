'use client'

import React, { useMemo, useState, useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'
import Image from '@/components/shared/Image'
import Tab from '@/components/shared/Tabs/Tab'
import StatsCard from './StatsCard'
import countries from 'i18n-iso-countries'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'

const ProviderDashboard = ({
  // @ts-expect-error: skip type for now
  provider, providers, stats, userStats, subscriptionLink, paymentInfo
}) => {
  const { t, i18n: { language } } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading state for demo purposes
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const tabs = useMemo(
    // @ts-expect-error: skip type for now
    () => providers.map(provider => ({
      key: provider?.id,
      label: provider?.name,
      slug: provider?.slug,
      mainImage: provider?.mainImage?.publicUrl,
      maincategory: provider?.maincategory?.name,
      provider_images: provider?.provider_images
    })),
    [ providers ]
  )

  const showAnalyticsAlert = !paymentInfo
  const showCancellationAlert = paymentInfo?.cancelAt
  const showSuccessAlert = paymentInfo && !paymentInfo.cancelAt

  const timeLeft = useMemo(() => {
    if (!paymentInfo?.cancelAt) return null
    
    const now = moment()
    const endDate = moment(paymentInfo.cancelAt)
    const duration = moment.duration(endDate.diff(now))
    
    return {
      days: Math.floor(duration.asDays()),
      hours: Math.floor(duration.asHours() % 24),
      formattedDate: endDate.format('DD.MM.YYYY')
    }
  }, [paymentInfo?.cancelAt])

  const renderEmptyState = (title, description) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600">
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Provider Navigation */}
      {providers.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-1 mb-8">
          <nav className="flex overflow-x-auto hide-scrollbar">
            <div className="flex space-x-1 min-w-full p-2">
              {tabs.map((tab) => {
                const mainImage = tab.mainImage || (tab.provider_images && tab.provider_images[0]?.publicUrl)
                return (
                  <Link 
                    href={`/${language}/dashboard/${tab.key}`}
                    key={tab.key}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 min-w-[200px] group
                      ${provider.id === tab.key 
                        ? 'bg-primary-50 dark:bg-primary-900/10 ring-1 ring-primary-500/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt={tab.label}
                          className="w-full h-full object-cover"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {t('common.noImage')}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium truncate ${
                        provider.id === tab.key 
                          ? 'text-primary-900 dark:text-primary-100' 
                          : 'text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}>
                        {tab.label}
                      </div>
                      {tab.maincategory && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {tab.maincategory}
                        </div>
                      )}
                    </div>
                    {provider.id === tab.key && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Provider Header */}
      <div className="flex items-center space-x-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm">
          {provider?.mainImage?.publicUrl ? (
            <Image
              src={provider.mainImage.publicUrl}
              alt={provider.name}
              className="w-full h-full object-cover"
              width={80}
              height={80}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {t('common.noImage')}
            </div>
          )}
        </div>
        <div>
          <h1 className="h2 mb-2">{provider.name}</h1>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <span>{provider.maincategory?.name}</span>
            {provider?.subcategories?.length > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  {provider?.subcategories.map(
                    // @ts-expect-error: skip type for now
                    (subcategory) => (
                      <span key={subcategory.id} className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {subcategory.name}
                      </span>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                {t('providerDashboard.alerts.subscriptionActive.title', 'Premium Features Active')}
              </h3>
              <p className="text-emerald-700 dark:text-emerald-300">
                {t('providerDashboard.alerts.subscriptionActive.description', 'Your subscription is active. You have full access to all premium features including analytics and messaging.')}
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-2">
                {t('providerDashboard.subscription.nextPayment')}: {moment(paymentInfo.nextPayment).format('DD.MM.YYYY')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Cancellation Alert */}
      {showCancellationAlert && timeLeft && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-700 rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Clock className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-2">
                {t('providerDashboard.alerts.subscriptionCancelled.title')}
              </h3>
              <p className="text-rose-700 dark:text-rose-300 mb-2">
                {t('providerDashboard.alerts.subscriptionCancelled.description', {
                  date: timeLeft.formattedDate
                })}
              </p>
              <p className="text-rose-600 dark:text-rose-400 font-medium">
                {t('providerDashboard.alerts.subscriptionCancelled.timeLeft', {
                  days: timeLeft.days,
                  hours: timeLeft.hours
                })}
              </p>
              <div className="mt-4">
                <Link href={subscriptionLink}>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-200">
                    {t('providerDashboard.alerts.subscriptionCancelled.action')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Alert */}
      {showAnalyticsAlert && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                {t('providerDashboard.alerts.verificationPending.title')}
              </h3>
              <p className="text-amber-700 dark:text-amber-300">
                {t('providerDashboard.alerts.verificationPending.description')}
              </p>
              <div className="mt-4">
                <Link href={subscriptionLink}>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-amber-700 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/20 hover:bg-amber-200 dark:hover:bg-amber-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200">
                    {t('providerDashboard.alerts.verificationPending.action')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className={`space-y-6 ${showAnalyticsAlert ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <div className="flex items-center justify-between">
          <h2 className="h3">{t('providerDashboard.stats.title')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton for stats
            Array(5).fill(null).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            ))
          ) : !stats ? (
            <div className="col-span-full">
              {renderEmptyState(
                t('providerDashboard.stats.noDataTitle', 'No Analytics Data Available'),
                t('providerDashboard.stats.noDataDescription', 'Start engaging with your audience to see analytics data here.')
              )}
            </div>
          ) : (
            <>
              <StatsCard 
                label={t('providerDashboard.stats.uniqueViews')} 
                value={stats?.uniqueViews || 0}
                hidden={false}
              />
              <StatsCard 
                label={t('providerDashboard.stats.totalViews')} 
                value={stats?.totalViews || 0}
                hidden={false}
              />
              <StatsCard 
                label={t('providerDashboard.stats.totalSaves')} 
                value={stats?.totalSaves || 0}
                hidden={false}
              />
              <StatsCard 
                label={t('providerDashboard.stats.messagesSent')} 
                value={stats?.messagesSent || 0}
                hidden={false}
              />
              <StatsCard 
                label={t('providerDashboard.stats.reachedUsers')} 
                value={stats?.reachedUsers || 0}
                hidden={false}
              />
            </>
          )}
        </div>
      </div>

      {/* User Demographics Section */}
      <div className={`space-y-6 ${showAnalyticsAlert ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <div className="flex items-center justify-between">
          <h2 className="h3">{t('providerDashboard.savedUsers.title')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton for demographics
            Array(3).fill(null).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
                {Array(4).fill(null).map((_, i) => (
                  <div key={i} className="space-y-3 mt-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ))
          ) : !userStats ? (
            <div className="col-span-full">
              {renderEmptyState(
                t('providerDashboard.savedUsers.noDataTitle', 'No Demographics Data Available'),
                t('providerDashboard.savedUsers.noDataDescription', 'User demographics will appear here once users start interacting with your profile.')
              )}
            </div>
          ) : (
            <>
              <StatsCard label={t('providerDashboard.savedUsers.country')} hidden={!userStats}>
                {userStats?.country && userStats.country.map(
                  // @ts-expect-error: skip type for now
                  (country) => (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0" key={country.label}>
                      <span className="text-gray-700 dark:text-gray-300">
                        {country.label === 'undefined' ?
                          t('providerDashboard.savedUsers.undefined') :
                          countries.getName(country.label, language)
                        }
                      </span>
                      <span className="font-semibold">{(country.value || 0).toFixed(1)}%</span>
                    </div>
                  )
                )}
              </StatsCard>
              <StatsCard label={t('providerDashboard.savedUsers.age')} hidden={!userStats}>
                {userStats?.age && userStats.age.map(
                  // @ts-expect-error: skip type for now
                  (group) => (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0" key={group.label}>
                      <span className="text-gray-700 dark:text-gray-300">
                        {group.label === 'undefined' ?
                          t('providerDashboard.savedUsers.undefined') :
                          group.label
                        }
                      </span>
                      <span className="font-semibold">{(group.value || 0).toFixed(1)}%</span>
                    </div>
                  )
                )}
              </StatsCard>
              <StatsCard label={t('providerDashboard.savedUsers.gender')} hidden={!userStats}>
                {userStats?.gender && userStats.gender.map(
                  // @ts-expect-error: skip type for now
                  (gender) => (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0" key={gender.label}>
                      <span className="text-gray-700 dark:text-gray-300">{t(`providerDashboard.savedUsers.${gender.label}`)}</span>
                      <span className="font-semibold">{(gender.value || 0).toFixed(1)}%</span>
                    </div>
                  )
                )}
              </StatsCard>
            </>
          )}
        </div>
      </div>

      {/* Subscription Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="h3">{t('providerDashboard.subscription.title')}</h2>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="space-y-2">
              {paymentInfo ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {paymentInfo.name}
                  </h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    {paymentInfo.amount}{paymentInfo.currency}/{t(`providerDashboard.subscription.perMonth`)}
                  </p>
                  {paymentInfo.cancelAt ? (
                    <p className="text-rose-600 dark:text-rose-400 font-medium">
                      {t(`providerDashboard.subscription.cancelAt`)}: {moment(paymentInfo.cancelAt).format('DD.MM.YYYY')}
                    </p>
                  ) : (
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      {t(`providerDashboard.subscription.nextPayment`)}: {moment(paymentInfo.nextPayment).format('DD.MM.YYYY')}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t(`providerDashboard.subscription.proposal`)}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400">
                    {t(`providerDashboard.subscription.notPayed`)}
                  </p>
                </>
              )}
            </div>
            <Link href={subscriptionLink}>
              <button className={`button-primary w-full md:w-auto ${
                paymentInfo ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-600 hover:bg-primary-700'
              }`}>
                {t(`providerDashboard.subscription.${paymentInfo ? 'manage' : 'subscribe'}`)}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4">
        <Link href={`/${language}/provider/${provider.slug || provider.id}`}>
          <button className="button-outline">
            {t('providerDashboard.viewPublicProfile')}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProviderDashboard
