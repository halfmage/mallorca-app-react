'use client'

import React, { useCallback, useMemo } from 'react'
import { useTranslation } from '@/app/i18n/client'
import ProviderImage from './ProviderImage'
import moment from 'moment'

// @ts-expect-error: skip type for now
const Provider = ({ provider, isActive, onClick }) => {
    const { t } = useTranslation()
    const hasNewMessages = useMemo(
        // @ts-expect-error: skip type for now
        () => provider?.messages?.length > 0 && provider?.messages?.some((message) => !message.read),
        [ provider ]
    )

    const handleClick = useCallback(
        () => onClick(provider),
        [ onClick, provider ]
    )

    return (
        <button
            onClick={handleClick}
            className={`w-full text-left p-3 sm:p-4 md:p-6 transition-all duration-200 
                hover:bg-gray-50 dark:hover:bg-gray-800/50 
                focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800/50
                active:bg-gray-100 dark:active:bg-gray-800
                ${isActive 
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-l-4 border-primary-500 dark:border-primary-400' 
                    : 'border-l-4 border-transparent'
                }
                touch-manipulation
            `}
        >
            <div className="flex space-x-3 sm:space-x-4">
                <div className="relative flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-md overflow-hidden">
                    <ProviderImage provider={provider} />
                    {hasNewMessages && (
                        <span className="absolute top-0 right-0 h-2.5 w-2.5 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary-500 dark:bg-primary-400 ring-2 ring-white dark:ring-gray-900 animate-pulse"/>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base sm:text-lg truncate ${
                            hasNewMessages 
                                ? 'font-semibold text-primary-600 dark:text-primary-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                            {provider.name}
                        </h3>
                        {provider?.isOwnProvider && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-900/10 text-primary-500 dark:bg-primary-400/10 dark:text-primary-400">
                                {t('messages.user.ownProvider')}
                            </span>
                        )}
                    </div>
                    {provider?.messages?.[0]?.message?.text && (
                        <p className={`mt-0.5 text-sm line-clamp-2 ${
                            hasNewMessages 
                                ? 'text-gray-700 dark:text-gray-200 font-medium' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            {provider.messages[0].message.text}
                        </p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                        <time className="text-xs text-gray-500 dark:text-gray-500">
                            {moment(provider.messages?.[0]?.created_at).fromNow()}
                        </time>
                        {hasNewMessages && (
                            <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                {t('messages.user.newMessages')}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    )
}

export default Provider
