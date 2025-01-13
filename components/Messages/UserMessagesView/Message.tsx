'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import moment from 'moment'

const Message = ({ message }) => {
    const [ isRead, setIsRead ] = useState(false)
    const textHtml = useMemo(
        () => ({ __html: message?.message?.text }),
        [ message?.message?.text ]
    )
    const markAsRead = useCallback(
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
            {message?.message?.publicUrl && <img src={message?.message?.publicUrl} alt={message?.message?.title}/>}
            <div dangerouslySetInnerHTML={textHtml} className={`${message?.read ? '' : 'font-bold'}`}/>
            <div>
                {moment(message.created_at).format('LLL')}
            </div>
        </div>
    )
}

export default Message
