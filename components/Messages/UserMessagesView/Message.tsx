'use client'

import React, { useMemo } from 'react'
import moment from 'moment'

const Message = ({ message }) => {
    const textHtml = useMemo(
        () => ({ __html: message?.message?.text }),
        [ message?.message?.text ]
    )

    return (
        <div className="bg-gray-200 dark:bg-gray-900 px-4 py-2 rounded">
            <div className="flex flex-row justify-between">
                <h2 className="text-2xl font-bold mb-4">
                    {message?.message?.title}
                </h2>
            </div>
            <div dangerouslySetInnerHTML={textHtml}/>
            <div>
                {moment(message.created_at).format('LLL')}
            </div>
        </div>
    )
}

export default Message
