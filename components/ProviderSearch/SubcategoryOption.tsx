import React from 'react'
import CategoryIcon from '@/components/shared/CategoryIcon'

interface Subcategory {
    maincategories?: {
        slug?: string
    }
}

interface SubcategoryOptionProps {
    subcategory: Subcategory
    label: string
}

const SubcategoryOption: React.FC<SubcategoryOptionProps> = ({ subcategory, label }) => {
    return (
        <div className="flex gap-3 items-center group">
            <div className="text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                <CategoryIcon slug={subcategory?.maincategories?.slug} />
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{label}</span>
        </div>
    )
}

export default SubcategoryOption