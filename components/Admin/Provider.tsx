'use client'

import React, {useCallback, useMemo, useState, useEffect} from 'react'
import moment from 'moment'
import {useTranslation} from 'react-i18next'
import Link from 'next/link'
import {translateStatus} from '@/app/api/utils/helpers'
import {STATUS_VERIFIED, STATUS_PAYMENT_COMPLETED, STATUS_REJECTED} from '@/app/api/utils/constants'

// @ts-expect-error: skip type for now
const Provider = ({provider}) => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(provider?.status)
  const [claim, setClaim] = useState(provider?.claims?.[0])
  const {t, i18n: {language}} = useTranslation()

  const updatedAt = useMemo(
    () => {
      const timestamp = [
        provider?.updated_at,
        // @ts-expect-error: skip type for now
        ...(provider?.claims || []).map(claim => claim?.updated_at)
      ].filter(Boolean).sort().reverse()?.[0]

      return timestamp ? moment(timestamp) : null
    },
    [provider]
  )

  const revokeAccess = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
    async () => {
      try {
        setLoading(true)

        const response = await fetch(
          `/api/provider/${provider.id}/claim`,
          {
            method: 'DELETE'
          }
        )
        const { data } = await response.json()

        if (data) {
          setStatus(STATUS_REJECTED)
          setClaim(null)
        }
      } catch (error) {
        // @ts-expect-error: skip type for now
        console.error(error.message)
      } finally {
        setLoading(false)
      }
    },
    [provider.id]
  )

  useEffect(() => {
    if (provider?.claims?.length) {
      setClaim(
        provider.claims.sort(
          // @ts-expect-error: skip type for now
          (itemA, itemB) => itemA.updated_at > itemB.updated_at ?
            1 :
            (itemA.updated_at < itemB.updated_at ? -1 : 0)
        )[0]
      )
    }
  }, [provider?.claims])

  return (
    <tr>
      <td>
        <Link href={`/${language}/provider/${provider.slug || provider.id}`}
              className="font-bold underline">
          {provider.name}
        </Link>
      </td>
      <td className={status === STATUS_VERIFIED ? 'font-bold' : ''}>
        {translateStatus(t, status)}
      </td>
      <td className={claim?.payment_status === STATUS_PAYMENT_COMPLETED ? 'font-bold' : ''}>
        {claim?.payment_status && translateStatus(t, claim.payment_status)}
      </td>
      <td>
        {updatedAt && updatedAt.format('DD.MM.YYYY')}
      </td>
      <td>
        {provider.saved}
      </td>
      <td>
        {claim?.claimer?.name}
      </td>
      <td>
        {claim?.claimer?.email}
      </td>
      <td className="min-w-40">
        <div className="flex justify-around">
          <Link
            href={`/${language}/admin/edit-provider/${provider.slug || provider.id}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
          >
            {t('admin.edit')}
          </Link>
          {status === STATUS_VERIFIED ?
            <button
              onClick={revokeAccess}
              disabled={loading || claim?.payment_status === STATUS_PAYMENT_COMPLETED}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
            >
              {loading ? t('common.loading') : t('admin.revoke')}
            </button> :
            <Link
              href={`/${language}/provider/${provider.slug || provider.id}/claim`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {t('admin.access')}
            </Link>
          }
        </div>
      </td>
    </tr>
  );
};

export default Provider
