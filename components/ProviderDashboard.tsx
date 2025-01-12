'use client'

import React from 'react'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'

const ProviderDashboard = ({ provider, savedUsers, stats, subscriptionLink }) => {
    const { t, i18n: { language } } = useTranslation()

    if (!provider) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <p className="text-red-500">{t('providerDashboard.error.notFound')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Provider Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
                <p className="text-gray-600">
                    {provider.maincategory?.name} {provider.subcategory?.name && `• ${provider.subcategory.name}`}
                </p>
            </div>

            <Link href={subscriptionLink}>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    {t('providerDashboard.subscription.subscribe')}
                </button>
            </Link>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('providerDashboard.stats.totalSaves')}</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalSaves}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('providerDashboard.stats.totalViews')}</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalViews}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('providerDashboard.stats.recentViews')}</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.recentViews}</p>
                </div>
            </div>

            {/* Saved Users */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('providerDashboard.savedUsers.title')}</h2>
                </div>

                {savedUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('providerDashboard.savedUsers.table.user')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('providerDashboard.savedUsers.table.savedDate')}
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                            {savedUsers.map((saved) => (
                                <tr key={saved.user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {saved.user.full_name || saved.user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(saved.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">{t('providerDashboard.savedUsers.noUsers')}</p>
                )}
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
                <Link href={`/${language}/admin/edit-provider/${provider.id}`}>
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                        {t('providerDashboard.editProfile')}
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default ProviderDashboard;
