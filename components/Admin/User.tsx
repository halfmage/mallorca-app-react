'use client'

import React, { useCallback } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

// @ts-expect-error: skip type for now
const User = ({ user, onRemove }) => {
    const { t } = useTranslation()
    const handleClick = useCallback(
        async () => {
            if (!user?.id) {
                return null
            }
            const response = await fetch(
                `/api/user/${user.id}`,
                { method: 'DELETE' }
            )
            const { data } = await response.json()

            if (data) {
                onRemove(user.id)
            }
        },
        [ user?.id, onRemove ]
    )

    return (
        <tr>
            <td>{user?.name}</td>
            <td>{user.savedProviders}</td>
            <td>{user.receiveMessages}</td>
            <td>{moment(user.createdAt).format('LLL')}</td>
            <td>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    onClick={handleClick}
                >
                    {t('admin.users.remove')}
                </button>
            </td>
        </tr>
    )
}

export default User
