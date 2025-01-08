'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Message from './Message'
import Provider from './Provider'
import ProviderImage from './ProviderImage'

const UserMessagesView = ({ providers }) => {
    const { t } = useTranslation()
    const [ selectedProvider, setSelectedProvider ] = useState(providers?.[0])

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('messages.user.title')}</h1>
            <div className="grid md:grid-cols-12 gap-12 max-w-screen-lg mx-auto">
                <div className="md:col-span-5 border-2 border-gray-300 p-4">
                    {providers?.length > 0 &&
                        providers.map(
                            (provider) => (
                                <Provider
                                    provider={provider}
                                    isActive={provider.id === selectedProvider?.id}
                                    onClick={setSelectedProvider}
                                    key={provider.id}
                                />
                            )
                        )
                    }
                </div>
                <div className="md:col-span-7 border-2 border-gray-300 p-4">
                    <div className="border-2 border-gray-300 p-4 flex flex-row">
                        <div>
                            <div className="flex-shrink-0 h-16 w-16 mr-4">
                                <ProviderImage provider={selectedProvider} />
                            </div>
                        </div>
                        <div>
                            <b>{selectedProvider?.name}</b>
                            {selectedProvider?.maincategories && (
                                <p className="text-gray-600 mb-4">{selectedProvider?.maincategories?.name}</p>
                            )}
                        </div>
                    </div>
                    {selectedProvider?.messages?.length > 0 &&
                        selectedProvider.messages.map(
                            (message) => (<Message message={message} key={message.id}/>)
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default UserMessagesView
