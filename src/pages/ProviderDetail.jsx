import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useTranslation } from 'react-i18next';

const ProviderDetail = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [providerImages, setProviderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingStatus, setSavingStatus] = useState('idle');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { t } = useTranslation();

  const fetchProviderImages = useCallback(async (providerId) => {
    try {
      const { data, error } = await supabase
        .from('provider_images')
        .select('*')
        .eq('provider_id', providerId);

      if (error) {
        console.error('Error fetching provider images:', error.message);
        return;
      }

      // Get public URLs for all images
      const imagesWithUrls = await Promise.all(data.map(async (image) => {
        const { data: publicUrlData } = supabase.storage
          .from('provider-images')
          .getPublicUrl(image.image_url);
        return {
          ...image,
          publicUrl: publicUrlData.publicUrl
        };
      }));

      setProviderImages(imagesWithUrls);
    } catch (error) {
      console.error('Error processing provider images:', error.message);
    }
  }, []);

  const fetchProvider = useCallback(async () => {
    try {
      const { data, error } = await supabase
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

      if (error) {
        console.error(t('providerDetail.error.fetchProvider'), error.message);
        setLoading(false);
        return;
      }

      setProvider(data);
      await fetchProviderImages(data.id);
      setLoading(false);
    } catch (error) {
      console.error(t('providerDetail.error.fetchProvider'), error.message);
      setLoading(false);
    }
  }, [id, t, fetchProviderImages]);

  const checkIfSaved = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_providers')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider_id', id);

      if (error) {
        console.error(t('providerDetail.error.saveProvider'), error.message);
        return;
      }

      setIsSaved(data && data.length > 0);
    } catch (error) {
      console.error(t('providerDetail.error.saveProvider'), error.message);
    }
  }, [id, t]);

  const handleSaveToggle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert(t('providerDetail.saveButton.loginRequired'));
        return;
      }

      setSavingStatus('loading');

      if (isSaved) {
        const { error } = await supabase
          .from('saved_providers')
          .delete()
          .eq('user_id', user.id)
          .eq('provider_id', id);

        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await supabase
          .from('saved_providers')
          .insert([
            {
              user_id: user.id,
              provider_id: id
            }
          ]);

        if (error) throw error;
        setIsSaved(true);
      }
    } catch (error) {
      console.error(t('providerDetail.error.saveProvider'), error.message);
    } finally {
      setSavingStatus('idle');
    }
  };

  useEffect(() => {
    fetchProvider();
    checkIfSaved();
  }, [fetchProvider, checkIfSaved]);

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6">{t('providerDetail.loading')}</div>;
  }

  if (!provider) {
    return <div className="max-w-6xl mx-auto p-6">{t('providerDetail.error.fetchProvider')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {loading ? (
        <div className="text-center">{t('common.loading')}</div>
      ) : provider ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">{provider.name}</h1>
          
          {/* Image Gallery */}
          <div className="mb-6">
            {providerImages.length > 0 ? (
              <div>
                {/* Main Image Display */}
                <div className="relative aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={providerImages[activeImageIndex].publicUrl}
                    alt={`${provider.name} - ${activeImageIndex + 1}`}
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
                
                {/* Thumbnail Navigation */}
                {providerImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {providerImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 
                          ${index === activeImageIndex ? 'border-blue-500' : 'border-transparent'}`}
                      >
                        <img
                          src={image.publicUrl}
                          alt={`${provider.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 aspect-w-16 aspect-h-9 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">{t('providerDetail.noImages')}</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">{t('providerDetail.category')}</h2>
            <p>{provider.maincategories?.name}</p>
          </div>

          <button
            onClick={handleSaveToggle}
            disabled={savingStatus === 'loading'}
            className={`${
              isSaved
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-4 py-2 rounded transition-colors`}
          >
            {savingStatus === 'loading'
              ? t('common.loading')
              : isSaved
              ? t('providerDetail.saveButton.remove')
              : t('providerDetail.saveButton.save')}
          </button>
        </div>
      ) : (
        <div className="text-center text-red-500">
          {t('providerDetail.error.notFound')}
        </div>
      )}
    </div>
  );
};

export default ProviderDetail;
