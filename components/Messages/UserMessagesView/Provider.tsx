'use client'

import React, { useCallback, useMemo } from 'react'
import { useTranslation } from '@/app/i18n/client'
import ProviderImage from './ProviderImage'

// @ts-expect-error: skip type for now
const Provider = ({ provider, isActive, onClick }) => {
    const { t } = useTranslation()
    const textHtml = useMemo(
        () => ({ __html: provider?.messages?.[0]?.message?.text }),
        [ provider ]
    )
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
        <div className={`border-2 border-gray-300 p-4 rounded ${isActive ? 'bg-gray-200' : ''}`} onClick={handleClick}>
            <div className="flex flex-row">
                <div className="flex-shrink-0 h-16 w-16 mr-4">
                    <ProviderImage provider={provider} />
                </div>
                <div>
                    <h2 className={`text-2xl mb-4 ${hasNewMessages ? 'font-bold' : 'font-light'}`}>
                        {provider.name}
                    </h2>
                    {provider?.isOwnProvider && (
                        <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            {t('messages.user.ownProvider')}
                        </span>
                    )}
                    <div dangerouslySetInnerHTML={textHtml}/>
                </div>
            </div>
        </div>
    )
}

export default Provider
