'use client';

import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AddProvider from './AddProvider'
import Providers from './Providers'
import Tab from '@/components/shared/Tabs/Tab'
import Users from './Users'

const Admin = ({
    providers: initialProviders, mainCategories, usersCount: initialUsersCount
}) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab ] = useState('providers')
  const [ providers, setProviders ] = useState(initialProviders)
  const [ loading, setLoading ] = useState(false)
  const [ usersCount, setUsersCount ] = useState(initialUsersCount)
  const tabs = useMemo(
      () => [
          { key: 'providers', label: t('admin.providerList', { count: providers.length }) },
          { key: 'add', label: t('admin.addProvider') },
          { key: 'users', label: t('admin.userList', { count: usersCount }) },
      ],
      [ t, providers, usersCount ]
  )
  const fetchProviders = useCallback(
      async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/edit-provider`)
          const { data } = await response.json()
          setProviders(data)
        } catch (error) {
          console.error('Error fetching providers:', error)
        } finally {
          setLoading(false)
        }
      },
      [ ]
  )
  const handleRemove = useCallback(
    () => setUsersCount(count => count - 1),
    [  ]
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
              {tabs.map(
                  (tab) => (
                      <Tab isActive={activeTab === tab.key} tabKey={tab.key} onClick={setActiveTab} key={tab.key}>
                          {tab.label}
                      </Tab>
                  )
              )}
          </nav>
      </div>

        {/* Tab Content */}
        {activeTab === 'providers' ? (
            <Providers providers={providers} loading={loading} />
        ) : activeTab === 'add' ? (
            <AddProvider onSuccess={fetchProviders} mainCategories={mainCategories} />
        ) : (
            <Users onRemove={handleRemove} />
        )}
    </div>
  );
};

export default Admin
