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
            className={`block w-full text-center px-1 py-2 rounded transition-colors ${
                isSelected ? 'text-white bg-blue-500 hover:bg-blue-600' : ''
            }`}
        >
            {category.name}
        </button>
    )
}

export default CategoryButton