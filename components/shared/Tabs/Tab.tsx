'use client'

import React, { useCallback } from 'react'

interface Props {
  isActive: boolean
  tabKey: string
  onClick?: (tabKey: string) => void
  children: React.ReactNode
}

const Tab = ({ isActive, tabKey, onClick, children }: Props) => {
    const handleClick = useCallback(
        () => {
            if (onClick) {
                onClick(tabKey)
            }
        },
        [ tabKey, onClick ]
    )

    return (
        <button
            onClick={handleClick}
            className={`${
                isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
        >
            {children}
        </button>
    )
}

export default Tab
