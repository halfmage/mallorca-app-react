'use client'

import React from 'react'
import { CldImage } from 'next-cloudinary'
import { DEFAULT_IMAGE_SOURCE } from '@/app/api/utils/constants'

const Image = ({ src, alt, className, ...rest }) => {
    return src && src.startsWith(DEFAULT_IMAGE_SOURCE) ?
        <CldImage
            src={src}
            width={rest.width}
            height={rest.height}
            crop="fill"
            alt={alt}
            className={className}
        /> :
        <img src={src} alt={alt} className={className} {...rest} />
}

export default Image
