import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userType, setUserType] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedProviders, setSavedProviders] = useState([]);

  const fetchSavedProviders = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_providers')
        .select(`
          id,
          created_at,
          provider:providers (
            id,
            name,
            image_url,
            maincategory_id,
            maincategories (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved providers:', error);
        return;
      }

      // Process image URLs
      const processedData = data.map(item => {
        if (item.provider.image_url) {
          const { data: publicUrlData } = supabase.storage
            .from('provider-images')
            .getPublicUrl(item.provider.image_url);
          item.provider.image_url = publicUrlData.publicUrl;
        }
        return item;
      });

      setSavedProviders(processedData);
    } catch (error) {
      console.error('Error fetching saved providers:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const { display_name = '', avatar_url = '', user_type = 'user' } = user.user_metadata || {};
      setDisplayName(display_name || '');
      setAvatarUrl(avatar_url || '');
      setUserType(user_type);
      fetchSavedProviders();
      setLoading(false);
    } else {
      setDisplayName('');
      setAvatarUrl('');
      setUserType('');
      setSavedProviders([]);
      setLoading(false);
    }
  }, [user, fetchSavedProviders]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setUpdating(true);
      
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (authError) throw authError;

      // Show success message or handle accordingly
    } catch (error) {
      console.error('Error updating profile:', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    const success = await logout(navigate, t);
    if (success) {
      navigate('/');
    }
  };

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('profile.title')}</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {t('profile.userType')}: <span className="font-semibold capitalize">{userType || 'user'}</span>
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {t('profile.displayName')}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={updating}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {updating ? t('common.updating') : t('common.update')}
        </button>
      </form>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('profile.savedProviders')}</h2>
        {savedProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProviders.map((saved) => (
              <div
                key={saved.id}
                className="border rounded p-4 hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/provider/${saved.provider.id}`)}
              >
                {saved.provider.image_url && (
                  <img
                    src={saved.provider.image_url}
                    alt={saved.provider.name}
                    className="w-full h-48 object-cover mb-2 rounded"
                  />
                )}
                <h3 className="font-semibold">{saved.provider.name}</h3>
                <p className="text-sm text-gray-600">
                  {saved.provider.maincategories?.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>{t('profile.noSavedProviders')}</p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        {t('profile.logout')}
      </button>
    </div>
  );
};

export default Profile;
