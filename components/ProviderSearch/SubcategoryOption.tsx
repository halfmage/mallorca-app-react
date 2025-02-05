import React from 'react'
import CategoryIcon from '@/components/shared/CategoryIcon'

const SubcategoryOption = ({ subcategory, label }) => {
    return (
        <div className="flex gap-3">
            <CategoryIcon slug={subcategory?.maincategories?.slug} />
            <span>{label}</span>
        </div>
    )
}

export default SubcategoryOption