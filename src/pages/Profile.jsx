import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { updateUserType, getUserType } from '../utils/userTypeUtils';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('user');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedProviders, setSavedProviders] = useState([]);

  const loadUserType = useCallback(async () => {
    if (!user) return;
    const type = await getUserType();
    setUserType(type);
    setLoading(false);
  }, [user]);

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
      const { display_name = '', avatar_url = '' } = user.user_metadata || {};
      setDisplayName(display_name || '');
      setAvatarUrl(avatar_url || '');
      loadUserType();
      fetchSavedProviders();
    } else {
      // Reset all states when user is not logged in
      setDisplayName('');
      setAvatarUrl('');
      setUserType('user');
      setSavedProviders([]);
      setLoading(false);
    }
  }, [user, loadUserType, fetchSavedProviders]);

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

      // Update public profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update local state
      // Note: user state is managed by AuthProvider
    } catch (error) {
      console.error('Error updating profile:', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleBecomeProvider = async () => {
    if (!user) return;

    try {
      setUpdating(true);
      const { success, error } = await updateUserType(user.id, 'provider');
      
      if (!success) throw error;
      
      // Create provider record in providers table
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .insert([
          { 
            user_id: user.id,
            name: displayName || user.email,
            status: 'pending',
            maincategory_id: 1,
            subcategory_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (providerError) throw providerError;

      setUserType('provider');
      navigate('/subscription');
    } catch (error) {
      console.error('Error becoming provider:', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout(navigate, t);
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];

      if (!file) {
        throw new Error(t('profile.avatar.error.noFile'));
      }

      const fileName = `${user.id}-${Date.now()}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error(t('profile.avatar.error.upload'), uploadError.message);
        throw uploadError;
      }

      const { data: fileData, error: urlError } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (urlError) {
        console.error(t('profile.avatar.error.upload'), urlError.message);
        throw urlError;
      }

      const publicURL = fileData.publicUrl;

      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicURL },
      });

      if (updateError) {
        console.error(t('profile.error.update'), updateError.message);
        throw updateError;
      }

      setAvatarUrl(publicURL);

      alert(t('profile.avatar.success'));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // If not logged in, redirect to home
  if (!user) {
    navigate('/');
    return null;
  }

  // Render loading state if still checking user
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
      
      <form onSubmit={handleUpdateProfile} className="max-w-md">
        {/* Avatar Upload Section */}
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-gray-500">{t('profile.avatar.noAvatar')}</span>
              )}
            </div>
            <div>
              <label className="block">
                <span className="sr-only">{t('profile.avatar.upload')}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </label>
              {uploading && <p className="mt-2 text-sm text-gray-500">{t('profile.avatar.uploading')}</p>}
            </div>
          </div>
        </div>

        {/* Display Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            {t('profile.displayName')}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {userType === 'user' && (
          <button
            type="button"
            onClick={handleBecomeProvider}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-4"
          >
            {t('profile.becomeProvider.button')}
          </button>
        )}

        <button
          type="submit"
          disabled={updating}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-4 mr-2"
        >
          {t('profile.save')}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mt-4"
        >
          {t('profile.logout')}
        </button>
      </form>

      {/* Saved Providers Section */}
      {savedProviders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">{t('profile.savedProviders')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProviders.map((saved) => (
              <div 
                key={saved.id} 
                className="border rounded-lg overflow-hidden shadow-md"
              >
                {saved.provider.image_url && (
                  <img 
                    src={saved.provider.image_url} 
                    alt={saved.provider.name} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold">{saved.provider.name}</h3>
                  <p className="text-sm text-gray-600">
                    {saved.provider.maincategories?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(saved.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
