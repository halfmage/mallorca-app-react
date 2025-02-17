'use client'

import React, { useCallback } from 'react'
import { mdiMenuUp as IconUp, mdiMenuDown as IconDown } from '@mdi/js'
import { Icon } from '@mdi/react'
import { SortingOrder } from '@/app/api/utils/types';

interface Props {
  onSort?: (value: SortingOrder) => void
  children: React.ReactNode
  value?: SortingOrder|null|undefined
  isActive?: boolean,
  asc?: boolean
}

const SortableHeader = ({ onSort, children, value, isActive, asc = false }: Props) => {
  const handleSort = useCallback(
    () => value && onSort && onSort(value),
    [ value, onSort ]
  )

  return (
    <th>
      {value ? (
        <a className="flex flex-row justify-items-center cursor-pointer gap-2" onClick={handleSort}>
          {children}
          {isActive && (
            asc ?
              <Icon
                path={IconUp}
                size={.75}
                className='text-gray-400 ml-1 relative top-px shrink-0'
              /> :
              <Icon
                path={IconDown}
                size={.75}
                className='text-gray-400 ml-1 relative top-px shrink-0'
              />
          )}
        </a>
      ) : children}
    </th>
  )
}

export default SortableHeader
