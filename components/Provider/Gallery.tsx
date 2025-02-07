'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Image from "@/components/shared/Image"
import { Icon } from '@mdi/react'
import { mdiClose as IconClose } from '@mdi/js'
import { mdiChevronLeft as IconPrev } from '@mdi/js'
import { mdiChevronRight as IconNext } from '@mdi/js'

const Gallery = ({ images, providerName }) => {
    const [showModal, setShowModal] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const { t } = useTranslation()

    if (!providerName || !images?.length) {
        return <div className="">{t('providerDetail.error.fetchProvider')}</div>
    }

    const handleNext = () => {
        setActiveImageIndex((prev) => (prev + 1) % images.length)
    }

    const handlePrev = () => {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') handleNext()
        if (e.key === 'ArrowLeft') handlePrev()
        if (e.key === 'Escape') setShowModal(false)
    }

    return (
        <>
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1 md:gap-2 h-[30vh] md:h-[50vh] cursor-pointer relative">
                {/* Main Large Image */}
                <div 
                    className="md:col-span-2 md:row-span-2 relative md:rounded-l-xl overflow-hidden" 
                    onClick={() => {
                        setActiveImageIndex(0)
                        setShowModal(true)
                    }}
                >
                    <Image
                        src={images[0].publicUrl}
                        alt={`${providerName} - 1`}
                        className="object-cover !w-full !h-full hover:scale-105 transition-transform duration-300"
                        width={1200}
                        height={1200}
                    />
                </div>

                {/* Right Side Grid */}
                {images.slice(1, 5).map((image, index) => (
                    <div 
                        key={image.id || index}
                        className={`relative overflow-hidden hidden md:block ${
                            index === 1 ? 'md:rounded-tr-xl' : index === 3 ? 'md:rounded-br-xl' : ''
                        }`}
                        onClick={() => {
                            setActiveImageIndex(index + 1)
                            setShowModal(true)
                        }}
                    >
                        <Image
                            src={image.publicUrl}
                            alt={`${providerName} - ${index + 2}`}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                            width={400}
                            height={300}
                        />
                    </div>
                ))}

                {/* Show All Photos Button */}
                {images.length > 5 && (
                    <button
                        className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg 
                                 text-sm md:text-base font-medium shadow-lg hover:bg-gray-100 transition-colors"
                        onClick={() => {
                            setActiveImageIndex(0)
                            setShowModal(true)
                        }}
                    >
                        Show all photos ({images.length})
                    </button>
                )}
            </div>

            {/* Mobile Additional Images Preview */}
            <div className="flex gap-1 mt-1 md:hidden overflow-x-auto">
                {images.slice(1, 5).map((image, index) => (
                    <div 
                        key={image.id || index}
                        className="relative flex-shrink-0 w-24 h-24 overflow-hidden"
                        onClick={() => {
                            setActiveImageIndex(index + 1)
                            setShowModal(true)
                        }}
                    >
                        <Image
                            src={image.publicUrl}
                            alt={`${providerName} - ${index + 2}`}
                            className="object-cover w-full h-full"
                            width={200}
                            height={200}
                        />
                    </div>
                ))}
            </div>

            {/* Fullscreen Modal */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black z-50 overflow-y-auto"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* Modal Header */}
                    <div className="fixed top-0 left-0 right-0 bg-black bg-opacity-50 p-4 flex justify-between items-center">
                        <span className="text-white">
                            {activeImageIndex + 1} / {images.length}
                        </span>
                        <button
                            className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                            onClick={() => setShowModal(false)}
                        >
                            <Icon path={IconClose} size={1.5} />
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        className="fixed left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 
                                 rounded-full transition-colors"
                        onClick={handlePrev}
                    >
                        <Icon path={IconPrev} size={2} />
                    </button>
                    <button
                        className="fixed right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 
                                 rounded-full transition-colors"
                        onClick={handleNext}
                    >
                        <Icon path={IconNext} size={2} />
                    </button>

                    {/* Modal Content - Masonry Layout */}
                    <div className="pt-20 pb-10 px-4 md:px-8 lg:px-16">
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 mx-auto max-w-7xl">
                            {images.map((image, index) => (
                                <div 
                                    key={image.id || index}
                                    className="break-inside-avoid mb-4"
                                >
                                    <Image
                                        src={image.publicUrl}
                                        alt={`${providerName} - ${index + 1}`}
                                        className="w-full rounded-lg"
                                        width={800}
                                        height={600}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Gallery
