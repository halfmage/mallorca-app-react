import React from 'react'
import { components } from 'react-select'

// @ts-expect-error: skip type for now
const Group = (props) => (
    <div className="border-b border-gray-200 dark:border-gray-700">
        <components.Group {...props} />
    </div>
)

export default Group
