'use client'

import React, { useCallback, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Markdown from 'react-markdown'
import moment from 'moment'
import Image from '@/components/shared/Image'

// @ts-expect-error: skip type for now
const Message = ({ message }) => {
    const [ isRead, setIsRead ] = useState(false)
    const markAsRead = useCallback(
        // @ts-expect-error: skip type for now
        async (value) => {
            if (value) {
                setIsRead(value)
            }
            try {
                const response = await fetch(
                    `/api/message/${message.id}`, { method: 'POST' }
                )
                await response.json()
            } catch {
            //
            }
        },
        [ message ]
    )
    const { ref } = useInView({
        threshold: 0.8,
        skip: !!message?.read || isRead,
        onChange: markAsRead
    })

    return (
        <div 
            className={`group bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200
                ${!message?.read && !isRead 
                    ? 'ring-2 ring-primary-500 dark:ring-primary-400 shadow-primary-500/10' 
                    : 'border border-gray-200/80 dark:border-gray-800/80 active:border-gray-300 dark:active:border-gray-700'
                }`
            } 
            ref={ref}
        >
            <div className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold break-words ${
                        !message?.read && !isRead 
                            ? 'text-primary-600 dark:text-primary-400' 
                            : 'text-gray-900 dark:text-white'
                    }`}>
                        {message?.message?.title}
                    </h2>
                    <time className="text-xs sm:text-sm whitespace-nowrap text-gray-500 dark:text-gray-400" dateTime={message.created_at}>
                        {moment(message.created_at).format('LLL')}
                    </time>
                </div>
                {message?.message?.publicUrl && (
                    <div className="relative -mx-3 sm:mx-0 mb-4 sm:mb-6 sm:rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <Image
                            src={message?.message?.publicUrl}
                            alt={message?.message?.title}
                            width={800}
                            height={400}
                            className="w-full h-auto object-cover active:scale-[1.02] sm:hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}
                <div className={`prose dark:prose-invert prose-sm sm:prose-base max-w-none 
                    ${!message?.read && !isRead ? 'prose-primary' : ''}
                    prose-p:text-gray-600 dark:prose-p:text-gray-300
                    prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline prose-a:font-medium
                    prose-code:text-gray-800 dark:prose-code:text-gray-200
                    prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800
                    prose-img:-mx-3 sm:prose-img:mx-0 prose-img:rounded-none sm:prose-img:rounded-lg
                `}>
                    <Markdown>
                        {message?.message?.text}
                    </Markdown>
                </div>
            </div>
        </div>
    )
}

export default Message
