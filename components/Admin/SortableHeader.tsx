'use client';

import React, { useCallback } from 'react'

const SortableHeader = ({ onSort, children, value, isActive }) => {

    const handleSort = useCallback(
        () => value && onSort(value),
        [ value, onSort ]
    )

    return (
        <th>
            {value ? (
                <a className="flex flex-row justify-items-center cursor-pointer gap-2" onClick={handleSort}>
                    {children}
                    {isActive && <span className="border-b-4 border-r-4 w-4 h-4 rotate-45" />}
                </a>
            ) : children}
        </th>
    );
};

export default SortableHeader
