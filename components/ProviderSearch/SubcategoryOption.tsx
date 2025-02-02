import React from 'react'
import { HandPlatter } from 'lucide-react'

const SubcategoryOption = ({ subcategory, label }) => {
    return (
        <div className="flex gap-3">
            <HandPlatter className='text-primary' size={32} strokeWidth={1.5} />
            <span>{label}</span>
        </div>
    )
}

export default SubcategoryOption