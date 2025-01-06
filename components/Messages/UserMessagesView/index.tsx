import React from 'react'
import { useTranslation } from '@/app/i18n'
import Message from './Message'

const ProviderMessagesView = async ({ lng, messages }) => {
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('messages.provider.title')}</h1>
            {messages?.length > 0 &&
                messages.map(
                    (message) => (<Message message={message} key={message.id} />)
                )
            }
        </div>
    )
}

export default ProviderMessagesView
