import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useTranslation } from 'react-i18next';

const EditProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    maincategory_id: '',
  });
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [reorderMode, setReorderMode] = useState(false);

  // Fetch provider data
  const fetchProvider = useCallback(async () => {
    try {
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select(`
          id,
          name,
          maincategory_id,
          maincategories (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (providerError) throw providerError;

      setProvider(providerData);
      setFormData({
        name: providerData.name,
        maincategory_id: providerData.maincategory_id,
      });

      // Fetch provider images
      const { data: imageData, error: imageError } = await supabase
        .from('provider_images')
        .select('*')
        .eq('provider_id', id)
        .order('created_at', { ascending: true });

      if (imageError) throw imageError;

      const imagesWithUrls = await Promise.all(imageData.map(async (image) => {
        const { data: publicUrlData } = supabase.storage
          .from('provider-images')
          .getPublicUrl(image.image_url);
        return {
          ...image,
          publicUrl: publicUrlData.publicUrl
        };
      }));

      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch main categories
  const fetchMainCategories = async () => {
    const { data, error } = await supabase.from('maincategories').select('*');
    if (error) {
      console.error('Error fetching main categories:', error);
    } else {
      setMainCategories(data);
    }
  };

  useEffect(() => {
    fetchProvider();
    fetchMainCategories();
  }, [fetchProvider]);

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

  const handleImageDelete = async (imageId, imageUrl) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('provider-images')
        .remove([imageUrl]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('provider_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
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
      // Update the order in the database by updating timestamps
      for (let i = 0; i < images.length; i++) {
        const { error } = await supabase
          .from('provider_images')
          .update({ created_at: new Date(Date.now() + i).toISOString() })
          .eq('id', images[i].id);

        if (error) throw error;
      }
      setReorderMode(false);
    } catch (error) {
      console.error('Error saving image order:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update provider data
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          name: formData.name,
          maincategory_id: formData.maincategory_id,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Upload new images if any
      if (newImages.length > 0) {
        for (const file of newImages) {
          const fileName = `${Date.now()}-${file.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('provider-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { error: insertError } = await supabase
            .from('provider_images')
            .insert({
              provider_id: id,
              image_url: uploadData.path
            });

          if (insertError) throw insertError;
        }
      }

      // Refresh provider data
      await fetchProvider();
      setNewImages([]);
    } catch (error) {
      console.error('Error updating provider:', error);
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
          onClick={() => navigate('/admin')}
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
                    onClick={() => handleImageDelete(image.id, image.image_url)}
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
