'use client'

import React, { useCallback, useState } from 'react'
import { CheckIcon, XIcon } from 'lucide-react'

type Props = {
    category: { id: number|string, slug: string, name: string },
    isSelected: boolean,
    onClick: (id: number|string) => void
}

const CategoryButton = ({ category, isSelected, onClick }: Props) => {
    const [isHovered, setIsHovered] = useState(false)
    
    const handleClick = useCallback(
        () => onClick(category.slug || category.id),
        [ category.id, category.slug, onClick ]
    )

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm/5 font-medium transition-colors whitespace-nowrap ${
                isSelected 
                ? 'bg-primary-600 text-white hover:bg-primary-600/90' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {category.name}
            {isSelected && (
                <span className="w-4 h-4">
                    {isHovered ? (
                        <XIcon className="w-4 h-4" />
                    ) : (
                        <CheckIcon className="w-4 h-4" />
                    )}
                </span>
            )}
        </button>
    )
}

export default CategoryButton