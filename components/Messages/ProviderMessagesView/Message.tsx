'use client'

import React from 'react'
import moment from 'moment'
import Markdown from 'react-markdown'
import { useTranslation } from '@/app/i18n/client'
import Image from '@/components/shared/Image'


// @ts-expect-error: skip type for now
const Message = ({ message }) => {
    const { t } = useTranslation()
    const readPercent = Math.round(100/(message.receivedCount || 1) * (message.viewedCount || 0))

    return (
        <div className="bg-gray-200 dark:bg-gray-900 mb-4 px-4 py-2 rounded">
            <div className="flex flex-row justify-between">
                <h2 className="text-2xl font-bold mb-4">
                    {message.title}
                </h2>
                <span>
                    {moment(message.created_at).format('LLL')}
                </span>
            </div>
            {message.publicUrl &&
              <Image
                src={message.publicUrl}
                alt={message.title}
                width={200}
                height={120}
              />
            }
            <Markdown>
                {message.text}
            </Markdown>
            <div className="flex flex-row gap-3">
                <div className="flex flex-row gap-1">
                    <span>
                        {t('messages.provider.receivedCount')}:
                    </span>
                    <b>{message.receivedCount || 0}</b>
                </div>
                <div className="flex flex-row gap-1">
                    <span>
                        {t('messages.provider.viewedCount')}:
                    </span>
                    <b>{message.viewedCount || 0} ({readPercent}%)</b>
                </div>
            </div>
        </div>
    )
}

export default Message
