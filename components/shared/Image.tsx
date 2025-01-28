'use client'

import React from 'react'
import { CldImage } from 'next-cloudinary'
import { DEFAULT_IMAGE_SOURCE } from '@/app/api/utils/constants'

const Image = ({ src, alt, ...rest }) => {
    return src && src.startsWith(DEFAULT_IMAGE_SOURCE) ?
        <CldImage
            src={src}
            width={rest.width}
            height={rest.height}
            crop="fill"
            alt={alt}
        /> :
        <img src={src} alt={alt} {...rest} />
}

export default Image
