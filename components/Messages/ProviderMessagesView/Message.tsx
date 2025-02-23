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
        <div className="bg-white dark:bg-gray-800 mb-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-6">
                <div className="flex flex-row justify-between items-start mb-4">
                    <h2 className="h3 text-gray-900 dark:text-white">
                        {message.title}
                    </h2>
                    <span className="text-caption whitespace-nowrap ml-4">
                        {moment(message.created_at).format('LLL')}
                    </span>
                </div>
                
                {message.publicUrl && (
                    <div className="mb-6">
                        <Image
                            src={message.publicUrl}
                            alt={message.title}
                            width={800}
                            height={400}
                            className="w-full h-auto rounded-lg object-cover"
                        />
                    </div>
                )}
                
                <div className="text-body mb-6 prose dark:prose-invert max-w-none">
                    <Markdown>
                        {message.text}
                    </Markdown>
                </div>
                
                <div className="flex flex-row gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-row items-center gap-2">
                        <span className="text-caption">
                            {t('messages.provider.receivedCount')}
                        </span>
                        <b className="text-body-sm text-gray-900 dark:text-white">
                            {message.receivedCount || 0}
                        </b>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <span className="text-caption">
                            {t('messages.provider.viewedCount')}
                        </span>
                        <b className="text-body-sm text-gray-900 dark:text-white">
                            {message.viewedCount || 0}
                        </b>
                        <span className="text-caption text-primary-600 dark:text-primary-400">
                            ({readPercent}%)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Message
