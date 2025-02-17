import React, { useMemo } from 'react'
import { BedDouble, HandPlatter, ShoppingBag, Tickets } from 'lucide-react'
import { CATEGORY_HOTEL_SLUG, CATEGORY_LEISURE_SLUG, CATEGORY_SHOPPING_SLUG } from '@/app/api/utils/constants'

const SubcategoryOption = ({
  // @ts-expect-error: skip type for now
  slug, className = 'text-primary', size = 24, strokeWidth = 1.5
}) => {
    const iconProps = useMemo(() => ({ className, size, strokeWidth }), [className, size, strokeWidth])
    return slug === CATEGORY_HOTEL_SLUG ? <BedDouble {...iconProps} /> :
        slug === CATEGORY_LEISURE_SLUG ? <Tickets {...iconProps} /> :
            slug === CATEGORY_SHOPPING_SLUG ? <ShoppingBag {...iconProps} /> :
                <HandPlatter {...iconProps} />
}

export default SubcategoryOption
