import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useTranslation } from 'react-i18next';

const ProviderDetail = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingStatus, setSavingStatus] = useState('idle');
  const { t } = useTranslation();

  useEffect(() => {
    fetchProvider();
    checkIfSaved();
  }, [id]);

  const fetchProvider = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          id,
          name,
          image_url,
          maincategory_id,
          maincategories (
            id,
            name
          )
        `)
        .eq('id', parseInt(id))
        .single();

      if (error) {
        console.error(t('providerDetail.error.fetchProvider'), error.message);
        setLoading(false);
        return;
      }

      if (data.image_url) {
        const { data: publicUrlData } = supabase.storage
          .from('provider-images')
          .getPublicUrl(data.image_url);
        data.image_url = publicUrlData.publicUrl;
      }

      setProvider(data);
      setLoading(false);
    } catch (error) {
      console.error(t('providerDetail.error.fetchProvider'), error.message);
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_providers')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider_id', parseInt(id));

      if (error) {
        console.error(t('providerDetail.error.saveProvider'), error.message);
        return;
      }

      setIsSaved(data && data.length > 0);
    } catch (error) {
      console.error(t('providerDetail.error.saveProvider'), error.message);
    }
  };

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
          .eq('provider_id', parseInt(id));

        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await supabase
          .from('saved_providers')
          .insert([
            {
              user_id: user.id,
              provider_id: parseInt(id)
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

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6">{t('providerDetail.loading')}</div>;
  }

  if (!provider) {
    return <div className="max-w-6xl mx-auto p-6">{t('providerDetail.error.fetchProvider')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
            {provider.maincategories && (
              <p className="text-gray-600">{provider.maincategories.name}</p>
            )}
          </div>
          <button
            onClick={handleSaveToggle}
            disabled={savingStatus === 'loading'}
            className={`px-4 py-2 rounded ${
              isSaved
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors duration-200`}
          >
            {savingStatus === 'loading' 
              ? t('providerDetail.saveButton.saving')
              : isSaved 
                ? t('providerDetail.saveButton.unsave')
                : t('providerDetail.saveButton.save')
            }
          </button>
        </div>

        {provider.image_url && (
          <img
            src={provider.image_url}
            alt={provider.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
      </div>
    </div>
  );
};

export default ProviderDetail;
