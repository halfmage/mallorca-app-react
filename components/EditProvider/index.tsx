'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from '@/app/i18n/client'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'
import { languages } from '@/app/i18n/settings'
import Link from 'next/link'
import Alert from '@/components/shared/Alert'
import Descriptions from '@/components/EditProvider/Descriptions'
import Image from '@/components/EditProvider/Image'

const EditProvider = ({
  // @ts-expect-error: skip type for now
  provider: initialProvider, mainCategories, subCategories, isProviderAdmin
}) => {
  const {id} = useParams()
  const {t, i18n: {language}} = useTranslation()
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState(initialProvider)
  const [saving, setSaving] = useState(false)
  const [alertText, setAlertText] = useState(null)
  const [previews, setPreviews] = useState([])
  const subCategoryOptions = useMemo(
    () => subCategories.map(
      (subcategory: { id: number, name: string }) => ({ value: subcategory.id, label: subcategory.name })
    ),
    [ subCategories ]
  )
  const { register, handleSubmit, control, formState: { errors } } = useForm({
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

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }
    const files = Array.from(e.target.files)
    // @ts-expect-error: skip type for now
    setNewImages(files)
    const previewUrls = files.map((file: File) => URL.createObjectURL(file))
    // @ts-expect-error: skip type for now
    setPreviews(previewUrls)
  }

  const handleImageDeleteById = async (imageId: number) => {
    setImages((prev: Array<{ id: number }>) => prev.filter((img: { id: number }) => img.id !== imageId))
  }
  const handleImageDeleteByIndex = async (imageId: number) => {
    setPreviews(previews => previews.filter((_preview, index) => index !== imageId))
    setNewImages(newImages => newImages.filter((_image, index) => index !== imageId))
  }

  // @ts-expect-error: skip type for now
  const handleImageReorder = (dragIndex, dropIndex) => {
    const reorderedImages = [...images];
    const [draggedImage] = reorderedImages.splice(dragIndex, 1);
    reorderedImages.splice(dropIndex, 0, draggedImage)
    setImages(reorderedImages)
  }

  const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
    handleSubmit(
      async ({
        name, mainCategory, subCategories, mail, phone, address, website, googleMapsUrl, description
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
          preparedFormData.append('description', JSON.stringify(description || {}))
          preparedFormData.append('images', (images || []).map(({ id }: { id: number }) => id))
          for (let i = 0; i < newImages.length; i++) {
            preparedFormData.append('newImages', newImages[i])
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
            setPreviews([])
          }
        } catch (error) {
          console.error(t('admin.error.updateProvider'), error)
        } finally {
          setSaving(false)
        }
      }
    ),
    [id, t, fetchProvider, newImages, images]
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
            <Link href={`/${language}/${isProviderAdmin ? 'dashboard' : 'admin'}`} className="text-white px-4 py-2">
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
                  {...register('name', {required: true, disabled: isProviderAdmin})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.category')}
                </label>
                <select
                  {...register('mainCategory', {required: true, disabled: isProviderAdmin})}
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
                <Controller
                  name="subCategories"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={subCategoryOptions}
                      isMulti
                      className="w-full"
                      classNamePrefix="react-select"
                      placeholder={t('admin.selectCategory')}
                      onChange={(selectedOptions) => field.onChange(selectedOptions.map((opt: { value: number }) => opt.value))}
                      value={subCategoryOptions.filter((opt: { value: number }) => field.value?.includes(opt.value))}
                      isDisabled={isProviderAdmin}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">{t('admin.image.title')}</h2>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-4 border-dashed border-gray-300 border-2 rounded p-3">
            {/* @ts-expect-error: skip type for now */}
            {images.map((image, index) => (
              <Image
                src={image.publicUrl}
                alt={`${provider.name} ${index + 1}`}
                index={index}
                onDelete={handleImageDeleteById}
                onOrderChange={handleImageReorder}
                isCover={!index}
                imageId={image.id}
                key={image.id}
              />
            ))}
            {previews.map((image, index) => (
              <Image
                src={image}
                alt={`${provider.name} ${images.length + index + 1}`}
                index={index}
                onDelete={handleImageDeleteByIndex}
                onOrderChange={handleImageReorder}
                isNew
                imageId={index}
                key={index}
              />
            ))}
          </div>

          <label className="button cursor-pointer text-center sm:text-left">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewImageChange}
              className="hidden"
            />
            {t('admin.image.upload')}
          </label>
          <div>
            {t('admin.image.description')}
          </div>
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
                  {...register('phone', {
                    pattern: {
                      value: /^\+?[0-9\s-]{6,}$/,
                      message: t('common.error.phoneFormat'),
                    },
                  })}
                />
                {errors.phone && <p className="text-red-500 text-sm">
                  {errors.phone.message as string}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.contact.mail')}
                </label>
                <input
                  type="email"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  placeholder={t('admin.contact.mail')}
                  {...register('mail', {
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: t('common.error.emailFormat'),
                    },
                  })}
                />
                {errors.mail && <p className="text-red-500 text-sm">
                  {errors.mail.message as string}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.contact.website')}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  placeholder={t('admin.contact.website')}
                  {...register('website', {
                    pattern: {
                      value: /^(https?:\/\/)?(www\.)?[\w-]+\.[\w-]{2,4}.*$/,
                      message: t('common.error.websiteFormat'),
                    },
                  })}
                />
                {errors.website && <p className="text-red-500 text-sm">
                  {errors.website.message as string}
                </p>}
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
                  {...register('googleMapsUrl', {
                    pattern: {
                      value: /^(https:\/\/www\.google\.com\/maps\/|https:\/\/maps\.app\.goo\.gl\/).*$/,
                      message: t('common.error.googleMapsUrlFormat'),
                    },
                  })}
                />
                {errors.googleMapsUrl && <p className="text-red-500 text-sm">
                  {errors.googleMapsUrl.message as string}
                </p>}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProvider;
