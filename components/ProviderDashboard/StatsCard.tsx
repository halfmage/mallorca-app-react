'use client'

import React from 'react'

// @ts-expect-error: skip type for now
const StatsCard = ({ label, children, hidden }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
            {hidden ?
                <p className="text-3xl font-bold text-blue-600 blur">
                    Some random text
                </p> :
                <p className="text-3xl font-bold text-blue-600">{children}</p>
            }
        </div>
    )
}

export default StatsCard
