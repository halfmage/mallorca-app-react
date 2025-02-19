import React from 'react'
import {components, OptionProps} from 'react-select'
import ProviderOption from './ProviderOption'
import SubcategoryOption from './SubcategoryOption'
import {SEARCH_TYPE_PROVIDER} from '@/app/api/utils/constants'

interface OptionData {
  label: string
  value: string
  data: {
    type: string
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

const Option: React.FC<OptionProps<OptionData>> = (props) => {
  const {data: {label, data: {type: optionType, ...item}}} = props

  return (
    <components.Option {...props} className="!p-0">
      <div
        className="p-1 rounded-lg transition-colors duration-200">
        {optionType === SEARCH_TYPE_PROVIDER ?
          <ProviderOption provider={item} label={label}/> :
          <SubcategoryOption subcategory={item} label={label}/>
        }
      </div>
    </components.Option>
  )
}

export default Option
