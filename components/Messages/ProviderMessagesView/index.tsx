import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n'
import Message from './Message'
import Tab from "@/components/shared/Tabs/Tab";

// @ts-expect-error: skip type for now
const ProviderMessagesView = async ({ lng, messages, providerId, providers }) => {
  const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

  // @ts-expect-error: skip type for now
  const tabs = providers.map(provider => ({
    key: provider.id,
    label: provider.name
  }))
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(
            // @ts-expect-error: skip type for now
            (tab) => (
              <Tab isActive={providerId === tab.key} tabKey={tab.key} key={tab.key}>
                <Link href={`/${lng}/messages/${tab.key}`}>
                  {tab.label}
                </Link>
              </Tab>
            )
          )}
        </nav>
      </div>
      <div className="flex flex-row justify-between">
        <h1 className="text-3xl font-bold mb-6">
          {t('messages.provider.title')}
        </h1>
        <Link
          href={`/${lng}/messages/${providerId}/send`}
          className="text-center bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors"
        >
          {t('messages.provider.composeButton')}
        </Link>
      </div>
      <div>
        {messages?.length > 0 &&
          messages.map(
            // @ts-expect-error: skip type for now
            (message) => (<Message message={message} key={message.id}/>)
          )
        }
      </div>
    </div>
  )
}

export default ProviderMessagesView
