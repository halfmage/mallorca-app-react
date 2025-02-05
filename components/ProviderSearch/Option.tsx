import React from 'react'
import { components } from 'react-select'
import ProviderOption from './ProviderOption'
import SubcategoryOption from './SubcategoryOption'
import { SEARCH_TYPE_PROVIDER }  from '@/app/api/utils/constants'

const Option = (props) => {
    const { data: { label, data: { type: optionType, ...item } } } = props

    return (
        <components.Option {...props}>
            {optionType === SEARCH_TYPE_PROVIDER ?
                <ProviderOption provider={item} label={label} />:
                <SubcategoryOption subcategory={item} label={label} />
            }
        </components.Option>
    )
}

export default Option