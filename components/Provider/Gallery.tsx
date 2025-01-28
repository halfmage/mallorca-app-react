'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Image from "@/components/shared/Image"

const Gallery = ({ images, providerName }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const { t } = useTranslation()

    if (!providerName) {
        return <div className="">{t('providerDetail.error.fetchProvider')}</div>
    }

    return (
        <div>
            {/* Main Image Display */}
            <div className="relative aspect-w-16 aspect-h-9 mb-4">
                <Image
                    src={images[activeImageIndex].publicUrl}
                    alt={`${providerName} - ${activeImageIndex + 1}`}
                    className="object-cover w-full h-full rounded-lg"
                    width={592}
                    height={395}
                />
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
                <div className="flex gap-3 flex-wrap justify-center items-center" key="thumbnails">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setActiveImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden 
                            ${index === activeImageIndex ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
                        >
                            <Image
                                src={image.publicUrl}
                                alt={`${providerName} thumbnail ${index + 1}`}
                                width={80}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Gallery
