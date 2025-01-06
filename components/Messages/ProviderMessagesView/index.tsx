import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n'
import Message from './Message'


const ProviderMessagesView = async ({ lng, messages }) => {
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks
    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1 className="text-3xl font-bold mb-6">
                    {t('messages.provider.title')}
                </h1>
                <Link
                    href={`/${lng}/messages/send`}
                    className="text-center bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors"
                >
                    {t('messages.provider.composeButton')}
                </Link>
            </div>
            <div>
                {messages?.length > 0 &&
                    messages.map(
                        (message) => (<Message message={message} key={message.id} />)
                    )
                }
            </div>
        </div>
    )
}

export default ProviderMessagesView
