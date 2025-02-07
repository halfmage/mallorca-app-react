'use client'

import React, { useCallback } from 'react'
import CategoryButton from './CategoryButton'

type Props = {
    value: Array<number|string>,
    options: Array<{ id: number|string, slug: string, name: string }>,
    onChange: (categoryId: string|number) => void
}

const CategoryFilter = ({ value, options, onChange }: Props) => {
    const handleCategorySelect = useCallback(
        (categoryId: string|number) => onChange(categoryId),
        [ onChange ]
    )

    return (
        <div className="overflow-x-auto pb-2 md:pb-0 w-full">
            <ul className="flex flex-row gap-x-1 flex-nowrap md:flex-wrap md:gap-y-2 min-w-fit">
                {options.map((category: { id: number|string, slug: string, name: string }) => (
                    <li key={category.id}>
                        <CategoryButton
                            category={category}
                            isSelected={value.includes(category.slug) || value.includes(category.id)}
                            onClick={handleCategorySelect}
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default CategoryFilter
