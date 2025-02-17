'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { stringifyParams } from '@/app/api/utils/helpers'
import User from './User'
import SortableHeader from './SortableHeader'
import { SORTING_ORDER_NEW, SORTING_ORDER_OLD } from '@/app/api/utils/constants'
import { SortingOrder } from '@/app/api/utils/types'

interface Props {
  onRemove: (userId: string) => void
}

const SORT_MAPPER: Record<SortingOrder, SortingOrder> = {
  [SORTING_ORDER_NEW]: SORTING_ORDER_OLD,
  [SORTING_ORDER_OLD]: SORTING_ORDER_NEW
}

const ORDER_MAPPER: Record<SortingOrder, boolean> = {
  [SORTING_ORDER_NEW]: false,
  [SORTING_ORDER_OLD]: true
}

const Users = ({ onRemove }: Props) => {
  const { t } = useTranslation()
  const [ sort, setSort ] = useState<SortingOrder>(SORTING_ORDER_NEW)
  const [ loading, setLoading ] = useState(false)
  const [ users, setUsers ] = useState([])
  const columns: Array<{label: string, value?: SortingOrder}> = useMemo(
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
    (newSort: SortingOrder) => setSort(
      (oldSort: SortingOrder) => oldSort === newSort ? SORT_MAPPER[oldSort] : newSort
    ),
    []
  )
  const handleRemove = useCallback(
    (userId: string) => {
      // @ts-expect-error: skip type for now
      setUsers(items => items.filter(item => item.id !== userId))
      onRemove(userId)
    },
    [ onRemove ]
  )

  useEffect(() => {
    // @ts-expect-error: skip type for now
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
                asc={ORDER_MAPPER[sort]}
              >
                {column.label}
              </SortableHeader>)
          )}
        </tr>
        </thead>
        <tbody>
        {loading ?
          (
            <tr>
              {/* @ts-expect-error: skip type for now */}
              <td colSpan="5">
                {t('common.loading')}
              </td>
            </tr>
          ) :
          // @ts-expect-error: skip type for now
          users.map((user) => (<User user={user} key={user.id} onRemove={handleRemove}/>))
        }
        </tbody>
      </table>
    </div>
  );
};

export default Users
