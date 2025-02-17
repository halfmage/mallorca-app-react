import React from 'react'
import { components } from 'react-select'

// @ts-expect-error: skip type for now
const Group = (props) => (
    <div className="border-b-2 border-gray-200">
        <components.Group {...props} />
    </div>
)

export default Group
