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
        <div className="bg-gray-200 dark:bg-gray-900 px-4 py-2 rounded" ref={ref}>
            <div className="flex flex-row justify-between">
                <h2 className="text-2xl font-bold mb-4">
                    {message?.message?.title}
                </h2>
            </div>
            {message?.message?.publicUrl &&
              <Image
                src={message?.message?.publicUrl}
                alt={message?.message?.title}
                width={500}
                height={300}
              />
            }
            <Markdown className={`${message?.read ? '' : 'font-bold'}`}>
                {message?.message?.text}
            </Markdown>
            <div>
                {moment(message.created_at).format('LLL')}
            </div>
        </div>
    )
}

export default Message
