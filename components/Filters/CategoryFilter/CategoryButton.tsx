'use client'

import React, { useCallback } from 'react'

const CategoryButton = ({ category, isSelected, onClick }) => {
    const handleClick = useCallback(
        () => onClick(category.id),
        [ category.id, onClick ]
    )

    return (
        <button
            onClick={handleClick}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm/5 font-medium transition-colors ${
                isSelected 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {category.name}
        </button>
    )
}

export default CategoryButton