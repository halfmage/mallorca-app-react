'use client'

import React, { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from '@/app/i18n/client'

const EditProvider = ({ provider: initialProvider, mainCategories }) => {
  const { id } = useParams();
  const { push } = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(initialProvider);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: provider?.name,
    maincategory_id: provider?.maincategory_id,
  });
  const [images, setImages] = useState(provider?.provider_images || []);
  const [newImages, setNewImages] = useState([]);
  const [reorderMode, setReorderMode] = useState(false);
  const fetchProvider = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/edit-provider/${id}`)
      const { data } = await response.json()
      setProvider(data);
      setFormData({
        name: data.name,
        maincategory_id: data.maincategory_id,
      });
      setImages(data.provider_images);
    } catch (error) {
      console.error(t('admin.error.fetchProvider'), error);
    } finally {
      setLoading(false);
    }
  }, [id, t])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const handleImageDelete = async (imageId) => {
    try {
      const response = await fetch(
          `/api/provider-images/${imageId}`,
          { method: 'DELETE' }
      )
      const { data: success } = await response.json()
      if (success) {
        // Update local state
        setImages(prev => prev.filter(img => img.id !== imageId))
        alert(t('common.success.imageDeleted'))
      }
    } catch (error) {
      console.error(t('admin.error.deleteImage'), error);
    }
  };

  const handleImageReorder = (dragIndex, dropIndex) => {
    const reorderedImages = [...images];
    const [draggedImage] = reorderedImages.splice(dragIndex, 1);
    reorderedImages.splice(dropIndex, 0, draggedImage);
    setImages(reorderedImages);
  };

  const handleSaveReorder = async () => {
    try {
      setSaving(true);
      const response = await fetch(
          `/api/provider-images`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              images: images.map(image => image?.id)
            })
          }
      )
      const { data: success } = await response.json()
      setReorderMode(false)
      if (success) {
        alert(t('common.success.orderSaved'))
      }
    } catch (error) {
      console.error(t('admin.error.saveOrder'), error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const preparedFormData = new FormData()
      preparedFormData.append('name', formData.name)
      preparedFormData.append('mainCategoryId', formData.maincategory_id)
      for (let i = 0; i < newImages.length; i++) {
        preparedFormData.append('images', newImages[i])
      }

      await fetch(
          `/api/provider/${id}`,
          {
            method: 'PATCH',
            body: preparedFormData
          }
      )

      // Refresh provider data
      await fetchProvider()
      setNewImages([])
      alert(t('common.success.saved'))
    } catch (error) {
      console.error(t('admin.error.updateProvider'), error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">{t('common.loading')}</div>;
  }

  if (!provider) {
    return <div className="text-center p-4 text-red-500">{t('admin.providerNotFound')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin.editProvider')}</h1>
        <button
          onClick={() => push('/admin')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          {t('common.back')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.providerName')}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.category')}
          </label>
          <select
            name="maincategory_id"
            value={formData.maincategory_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">{t('admin.selectCategory')}</option>
            {mainCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProvider;
