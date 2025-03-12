'use client'

import React from 'react'
import { useTranslation } from '@/app/i18n/client'
import Item from '@/components/EditProvider/Gallery/Item'

const MEDIA_TYPE_IMAGE = 'image'
const MEDIA_TYPE_VIDEO = 'video'

const EditProvider = ({
  // @ts-expect-error: skip type for now
  images, setImages, previews, setPreviews, setNewImages, providerName
}) => {
  const {t} = useTranslation()

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }
    const files = Array.from(e.target.files)
    // @ts-expect-error: skip type for now
    setNewImages(items => [...items, ...files])
    const previewUrls = files.map((file: File) => ({
      url: URL.createObjectURL(file),
      type: file.type.match('image/') ? MEDIA_TYPE_IMAGE : MEDIA_TYPE_VIDEO
    }))
    console.log('files = ', files)
    // @ts-expect-error: skip type for now
    setPreviews(items => [...items, ...previewUrls])
  }

  const handleImageDeleteById = async (imageId: number) => {
    setImages((prev: Array<{ id: number }>) => prev.filter((img: { id: number }) => img.id !== imageId))
  }
  const handleImageDeleteByIndex = async (imageId: number) => {
    // @ts-expect-error: skip type for now
    setPreviews(previews => previews.filter((_preview, index) => index !== imageId))
    // @ts-expect-error: skip type for now
    setNewImages(newImages => newImages.filter((_image, index) => index !== imageId))
  }

  // @ts-expect-error: skip type for now
  const handleImageReorder = (dragIndex, dropIndex) => {
    const reorderedImages = [...images];
    const [draggedImage] = reorderedImages.splice(dragIndex, 1);
    reorderedImages.splice(dropIndex, 0, draggedImage)
    setImages(reorderedImages)
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="h4 mb-6">{t('admin.image.title')}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {/* @ts-expect-error: skip type for now */}
        {images.map((image, index) => {
          console.log('image = ', image)
          return (
            <Item
              src={image.publicUrl || image.thumbnail_url || image.url}
              fileType={image.publicUrl ? MEDIA_TYPE_IMAGE : MEDIA_TYPE_VIDEO}
              alt={`${providerName} ${index + 1}`}
              index={index}
              onDelete={handleImageDeleteById}
              onOrderChange={handleImageReorder}
              isCover={!index}
              imageId={image.id}
              key={image.id}
            />
          )
        })}
        {previews.map((file: { url: string, type: string }, index: number) => (
          <Item
            src={file.url}
            fileType={file.type}
            alt={`${providerName} ${images.length + index + 1}`}
            index={index}
            onDelete={handleImageDeleteByIndex}
            onOrderChange={handleImageReorder}
            isNew
            imageId={index}
            key={index}
          />
        ))}
      </div>

      <div className="space-y-3">
        <label className="button inline-block cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleNewImageChange}
            className="hidden"
          />
          {t('admin.image.upload')}
        </label>
        <p className="text-caption text-gray-600 dark:text-gray-400">
          {t('admin.image.description')}
        </p>
      </div>
    </section>
  );
};

export default EditProvider;
