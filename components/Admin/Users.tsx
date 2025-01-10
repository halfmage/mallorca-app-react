'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { stringifyParams } from '@/app/api/utils/helpers'
import User from './User'
import SortableHeader from './SortableHeader'
import { SORTING_ORDER_NEW, SORTING_ORDER_OLD } from '@/app/api/utils/constants'

const SORT_MAPPER = {
    [SORTING_ORDER_NEW]: SORTING_ORDER_OLD,
    [SORTING_ORDER_OLD]: SORTING_ORDER_NEW
}

const Users = ({ onRemove }) => {
    const { t } = useTranslation()
    const [ sort, setSort ] = useState(SORTING_ORDER_NEW)
    const [ loading, setLoading ] = useState(false)
    const [ users, setUsers ] = useState([])
    const columns = useMemo(
        () => [
            {
                label: t('admin.users.name')
            },
            {
                label: t('admin.users.savedProviders')
            },
            {
                label: t('admin.users.messages')
            },
            {
                label: t('admin.users.createdAt'),
                value: SORTING_ORDER_OLD
            },
            {
                label: t('admin.users.actions')
            }
            
        ],
        [ t ]
    )
    const fetchProviders = useCallback(
        async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/user${stringifyParams({
                    sort
                })}`)
                const { data } = await response.json()
                setUsers(data)
            } catch (error) {
                console.error('Error fetching users:', error)
            } finally {
                setLoading(false)
            }
        },
        [ sort ]
    )
    const handleSort = useCallback(
        (newSort) => setSort(oldSort => oldSort === newSort ? SORT_MAPPER[oldSort] : newSort),
        [ ]
    )
    const handleRemove = useCallback(
        (userId) => {
            setUsers(items => items.filter(item => item.id !== userId))
            onRemove(userId)
        },
        [ onRemove ]
    )

    useEffect(() => {
        fetchProviders(sort)
    }, [ fetchProviders, sort ])

    return (
        <div>
            <table className="w-full">
                <thead>
                <tr>
                    {columns.map(
                        (column, i) => (
                            <SortableHeader
                                key={i}
                                onSort={handleSort}
                                value={column.value}
                                isActive={column.value === sort || column.value === SORT_MAPPER[sort]}
                            >
                                {column.label}
                            </SortableHeader>)
                        )
                    }
                </tr>
                </thead>
                <tbody>
                {loading ?
                    (
                        <tr>
                            <td colSpan="5">
                                {t('common.loading')}
                            </td>
                        </tr>
                    ) :
                    users.map((user) => (<User user={user} key={user.id} onRemove={handleRemove} />))
                }
                </tbody>
            </table>
        </div>
    );
};

export default Users
