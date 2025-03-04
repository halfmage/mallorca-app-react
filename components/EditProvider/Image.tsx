import React, { useCallback } from 'react'
import { useTranslation } from '@/app/i18n/client'

interface Props {
  src: string
  index: number
  alt: string
  imageId: number
  isCover?: boolean
  isNew?: boolean
  onDelete: (id: number) => void
  onOrderChange: (dragIndex: number, hoverIndex: number) => void
}

const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => e.preventDefault()

const Image = ({
  src, onOrderChange, onDelete, index, alt, imageId, isCover = false, isNew = false
}: Props) => {
  const { t } = useTranslation()
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLInputElement>) => e.dataTransfer.setData('text/plain', String(index)),
    [ index ]
  )
  const handleOrderChange = useCallback(
    (e: React.DragEvent<HTMLInputElement>) => {
      e.preventDefault()
      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
      onOrderChange(dragIndex, index)
    },
    [ index, onOrderChange ]
  )
  const handleDelete = useCallback(
    () => onDelete(imageId),
    [ onDelete, imageId ]
  )

  return (
    <div
      className="relative group"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleOrderChange}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full aspect-[4/3] object-cover rounded ${isCover ? 'outline outline-4 outline-blue-500' : ''}${isNew ? 'opacity-50' : ''}`}
      />
      <button
        type="button"
        onClick={handleDelete}
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {t('admin.deleteImage')}
      </button>
    </div>
  )
}

export default Image
