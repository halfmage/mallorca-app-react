import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n'
import Message from './Message'
import Image from '@/components/shared/Image'
import { Message as MessageType, ProviderTab } from '@/app/api/utils/types'

// @ts-expect-error: skip type for now
const ProviderMessagesView = async ({ lng, messages, providerId, providers }) => {
  const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

  // @ts-expect-error: skip type for now
  const tabs = providers.map(provider => ({
    key: provider.id,
    label: provider.name,
    mainImage: provider.mainImage?.publicUrl,
    provider_images: provider.provider_images,
    maincategory: provider.maincategory?.name
  }))

  return (
    <div className="py-8">
      {/* Provider Navigation */}
      {providers.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-1 mb-8">
          <nav className="flex overflow-x-auto hide-scrollbar">
            <div className="flex space-x-1 min-w-full p-2">
              {tabs.map((tab: ProviderTab) => {
                const mainImage = tab.mainImage || (tab.provider_images && tab.provider_images[0]?.publicUrl)
                return (
                  <Link 
                    href={`/${lng}/messages/${tab.key}`}
                    key={tab.key}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 min-w-[200px] group
                      ${providerId === tab.key 
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
                        providerId === tab.key 
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
                    {providerId === tab.key && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="h2">
          {t('messages.provider.title')}
        </h1>
        <Link
          href={`/${lng}/messages/${providerId}/send`}
          className="button-primary inline-flex items-center justify-center whitespace-nowrap"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t('messages.provider.composeButton')}
        </Link>
      </div>

      {/* Messages List */}
      <div className="space-y-6 max-w-xl mx-auto">
        {messages?.length > 0 ? (
          messages.map((message: MessageType) => (
            <Message message={message} key={message.id}/>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-body text-gray-500 dark:text-gray-400">
              {t('messages.provider.noMessages')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProviderMessagesView
