'use client'

import React, {useState, useCallback} from 'react'
import {useParams} from 'next/navigation'
import {useTranslation} from '@/app/i18n/client'
import {useForm} from 'react-hook-form'
import { languages } from '@/app/i18n/settings'
import Link from 'next/link'
import Alert from '@/components/shared/Alert'
import Descriptions from '@/components/EditProvider/Descriptions'

const EditProvider = ({
  // @ts-expect-error: skip type for now
  provider: initialProvider, mainCategories, subCategories
}) => {
  const {id} = useParams()
  const {t, i18n: {language}} = useTranslation()
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState(initialProvider)
  const [saving, setSaving] = useState(false)
  const [alertText, setAlertText] = useState(null)
  const {register, handleSubmit} = useForm({
    defaultValues: {
      name: provider?.name,
      mainCategory: provider?.maincategory_id,
      // @ts-expect-error: skip type for now
      subCategories: (provider?.provider_subcategories || []).map(sc => sc?.subcategories?.id).join(','),
      description: languages.reduce(
        (descriptions: Record<string, string>, lang: string) => (
          descriptions[lang] = (provider?.provider_translations || []).find(
            (pt: { language: string }) => pt.language === lang
          )?.description,
          descriptions
        ),
        {}
      ),
      mail: provider?.mail,
      phone: provider?.phone,
      address: provider?.address,
      website: provider?.website,
      googleMapsUrl: provider?.google_maps_url
    },
  })
  const [images, setImages] = useState(provider?.provider_images || [])
  const [newImages, setNewImages] = useState([])
  const [reorderMode, setReorderMode] = useState(false)
  const fetchProvider = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/edit-provider/${id}`)
      const {data} = await response.json()
      setProvider(data)
      setImages(data.provider_images);
    } catch (error) {
      console.error(t('admin.error.fetchProvider'), error)
    } finally {
      setLoading(false)
    }
  }, [id, t])
  const clearAlertText = useCallback(
    () => setAlertText(null),
    []
  )

  // @ts-expect-error: skip type for now
  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files)
    // @ts-expect-error: skip type for now
    setNewImages(files)
  }

  // @ts-expect-error: skip type for now
  const handleImageDelete = async (imageId) => {
    try {
      const response = await fetch(
        `/api/provider-images/${imageId}`,
        {method: 'DELETE'}
      )
      const {data: success} = await response.json()
      if (success) {
        // Update local state
        // @ts-expect-error: skip type for now
        setImages(prev => prev.filter(img => img.id !== imageId))
        // @ts-expect-error: skip type for now
        setAlertText(t('common.success.imageDeleted'))
      }
    } catch (error) {
      console.error(t('admin.error.deleteImage'), error)
    }
  }

  // @ts-expect-error: skip type for now
  const handleImageReorder = (dragIndex, dropIndex) => {
    const reorderedImages = [...images];
    const [draggedImage] = reorderedImages.splice(dragIndex, 1);
    reorderedImages.splice(dropIndex, 0, draggedImage)
    setImages(reorderedImages)
  }

  const handleSaveReorder = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `/api/provider-images`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            // @ts-expect-error: skip type for now
            images: images.map(image => image?.id)
          })
        }
      )
      const {data: success} = await response.json()
      setReorderMode(false)
      if (success) {
        // @ts-expect-error: skip type for now
        setAlertText(t('common.success.orderSaved'))
      }
    } catch (error) {
      console.error(t('admin.error.saveOrder'), error);
    } finally {
      setSaving(false)
    }
  }

  const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
    handleSubmit(
      async ({
        name, mainCategory, subCategories, mail, phone, address, website, googleMapsUrl
      }) => {
        try {
          setSaving(true)

          const preparedFormData = new FormData()
          preparedFormData.append('name', name)
          preparedFormData.append('mainCategoryId', mainCategory)
          preparedFormData.append('subCategoryIds', subCategories)
          preparedFormData.append('mail', mail)
          preparedFormData.append('phone', phone)
          preparedFormData.append('address', address)
          preparedFormData.append('website', website)
          preparedFormData.append('googleMapsUrl', googleMapsUrl)
          for (let i = 0; i < newImages.length; i++) {
            preparedFormData.append('images', newImages[i])
          }

          const response = await fetch(
            `/api/provider/${id}`,
            {
              method: 'PATCH',
              body: preparedFormData
            }
          )
          const {data: success} = await response.json()
          if (success) {
            // @ts-expect-error: skip type for now
            setAlertText(t('common.success.saved'))
            fetchProvider()
            setNewImages([])
          }
        } catch (error) {
          console.error(t('admin.error.updateProvider'), error)
        } finally {
          setSaving(false)
        }
      }
    ),
    [id, t, fetchProvider, newImages]
  )

  if (loading) {
    return <div className="text-center p-4">{t('common.loading')}</div>;
  }

  if (!provider) {
    return <div className="text-center p-4 text-red-500">{t('admin.providerNotFound')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-row justify-center items-center">
            <Link href={`/${language}/admin`} className="text-white px-4 py-2">
              &lt;-
            </Link>
            <h1 className="text-2xl font-bold">{t('admin.editProvider', { name: provider?.name || '' })}</h1>
          </div>
          <div className="flex gap-5">
            <Link
              href={`/${language}/provider/${provider?.slug || provider?.id}`}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              {t('admin.detailsPage')}
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
        {alertText && <Alert delay={3000} onClose={clearAlertText} className="fixed right-4 top-20 w-64" show>{alertText}</Alert>}
        <div className="max-w-7xl mx-auto p-4">
          <div className="border-2 border-gray-300 p-4">
            <div className="max-w-4xl mx-auto p-4">
              <h2 className="text-2xl font-bold mb-4">{t('admin.basicInfo.title')}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.providerName')}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  {...register('name', {required: true})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.category')}
                </label>
                <select
                  {...register('mainCategory', {required: true})}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                >
                  <option value="">{t('admin.selectCategory')}</option>
                  {/* @ts-expect-error: skip type for now */}
                  {mainCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.subcategories')}
                </label>
                <select
                  {...register('subCategories')}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  multiple
                >
                  <option value="">{t('admin.selectCategory')}</option>
                  {/* @ts-expect-error: skip type for now */}
                  {subCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('admin.images')}
            </label>
            <button
              type="button"
              onClick={() => setReorderMode(!reorderMode)}
              className="text-blue-500 hover:text-blue-600"
            >
              {reorderMode ? t('admin.saveOrder') : t('admin.reorderImages')}
            </button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {/* @ts-expect-error: skip type for now */}
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group"
                draggable={reorderMode}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  handleImageReorder(dragIndex, index);
                }}
              >
                <img
                  src={image.publicUrl}
                  alt={`${provider.name} ${index + 1}`}
                  className="w-full h-40 object-cover rounded"
                />
                {!reorderMode && (
                  <button
                    type="button"
                    onClick={() => handleImageDelete(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {t('admin.deleteImage')}
                  </button>
                )}
              </div>
            ))}
          </div>

          {reorderMode && (
            <button
              type="button"
              onClick={handleSaveReorder}
              disabled={saving}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {saving ? t('common.saving') : t('admin.saveOrder')}
            </button>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleNewImageChange}
            className="w-full"
          />
        </div>

        <Descriptions register={register} />

        <div className="max-w-7xl mx-auto p-4">
          <div className="border-2 border-gray-300 p-4">
            <div className="max-w-4xl mx-auto p-4">
              <h2 className="text-2xl font-bold mb-4">{t('admin.contact.title')}</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.contact.phone')}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  placeholder={t('admin.contact.phone')}
                  {...register('phone')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.contact.mail')}
                </label>
                <input
                  type="email"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  placeholder={t('admin.contact.mail')}
                  {...register('mail')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.contact.website')}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  placeholder={t('admin.contact.website')}
                  {...register('website')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.contact.address')}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  placeholder={t('admin.contact.address')}
                  {...register('address')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.contact.googleMapsUrl')}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  placeholder={t('admin.contact.googleMapsUrlPlaceholder')}
                  {...register('googleMapsUrl')}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProvider;
