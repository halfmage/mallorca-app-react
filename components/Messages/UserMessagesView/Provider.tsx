'use client'

import React, { useCallback, useMemo } from 'react'
import ProviderImage from './ProviderImage'

const Provider = ({ provider, isActive, onClick }) => {
    const textHtml = useMemo(
        () => ({ __html: provider?.messages?.[0]?.message?.text }),
        [ provider ]
    )
    const hasNewMessages = useMemo(
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
                    <div dangerouslySetInnerHTML={textHtml}/>
                </div>
            </div>
        </div>
    )
}

export default Provider
