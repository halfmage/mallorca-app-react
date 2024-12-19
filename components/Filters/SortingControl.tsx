'use client'

import React, { useCallback, useMemo } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { SORTING_ORDER_NEW, SORTING_ORDER_OLD } from '@/app/api/utils/constants'

type Props = {
    options?: Array<{ value: string, label: string }>,
    onChange: (value: string) => string,
    value: string
}

const SortingControl = ({ value, options: passedOptions, onChange }: Props) => {
    const { t } = useTranslation()
    const options = useMemo(
        () => passedOptions || [
            { value: SORTING_ORDER_NEW, label: t('common.sorting.new') },
            { value: SORTING_ORDER_OLD, label: t('common.sorting.old') },
        ],
        [ passedOptions, t ]
    )
    const handleCallback = useCallback(
        event => onChange(event.target.value),
        [ onChange ]
    )

    return (
        <select
            onChange={handleCallback}
            value={value}
            className="bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
        >
            {options.map(
                (option) => (
                    <option value={option.value} key={option.value}>
                        {option.label}
                    </option>
                )
            )}
        </select>
    );
};

export default SortingControl