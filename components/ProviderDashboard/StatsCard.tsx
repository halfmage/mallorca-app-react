'use client'

import React from 'react'

interface StatsCardProps {
    label: string;
    children?: React.ReactNode;
    hidden?: boolean;
    value?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, children, hidden, value }) => {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{label}</h3>
            {hidden ? (
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse w-3/4"></div>
                </div>
            ) : (
                <div className="space-y-1">
                    {typeof value === 'number' ? (
                        <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                            {value.toLocaleString()}
                        </p>
                    ) : (children && children)}
                </div>
            )}
        </div>
    )
}

export default StatsCard
