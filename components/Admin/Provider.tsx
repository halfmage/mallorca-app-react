'use client'

import React, { useMemo } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { translateStatus } from '@/app/api/utils/helpers'
import { STATUS_VERIFIED, STATUS_PAYMENT_COMPLETED } from '@/app/api/utils/constants'

const Provider = ({ provider }) => {
    const { t, i18n: { language } } = useTranslation()
    const claim = useMemo(
        // todo: check the actual latest claim
        () => provider?.claims?.[0],
        [ provider ]
    )
    const updatedAt = useMemo(
        () => {
            const timestamp = [
                provider?.updated_at,
                ...(provider?.claims || []).map(claim => claim?.updated_at)
            ].filter(Boolean).sort().reverse()?.[0]

            return timestamp ? moment(timestamp) : null
        },
        [ provider ]
    )

    return (
        <tr>
            <td>
                <Link href={`/${language}/provider/${provider.slug || provider.id}`} className="font-bold underline">
                    {provider.name}
                </Link>
            </td>
            <td className={provider.status === STATUS_VERIFIED ? 'font-bold' : ''}>
                {translateStatus(t, provider.status)}
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
            <td>
                <Link
                    href={`/${language}/admin/edit-provider/${provider.id}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {t('admin.edit')}
                </Link>
            </td>
        </tr>
    );
};

export default Provider
