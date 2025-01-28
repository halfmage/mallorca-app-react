import React from 'react'
// import NextImage from 'next/image'
// import { DEFAULT_IMAGE_SOURCE } from '@/app/api/utils/services/FileUploadService'

const Image = ({ src, alt, ...rest }) => {
    return <img src={src} alt={alt} {...rest} />
}

export default Image
