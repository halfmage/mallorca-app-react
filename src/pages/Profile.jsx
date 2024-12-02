import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      const { display_name = '', avatar_url = '' } = user.user_metadata || {};
      setDisplayName(display_name);
      setAvatarUrl(avatar_url);
    }
  }, [user]);

  const updateProfile = async () => {
    try {
      const { data: updatedUser, error } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });

      if (error) {
        console.error(t('profile.error.update'), error.message);
        throw error;
      }

      setUser(updatedUser.user);
      alert(t('profile.success.profile'));
    } catch (error) {
      alert(error.message);
    }
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

      setUser(updatedUser.user);
      setAvatarUrl(publicURL);

      alert(t('profile.avatar.success'));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
    } else {
      console.error(t('profile.error.update'), error.message);
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>{t('profile.notLoggedIn')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div>
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

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('profile.displayName')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('profile.email')}
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-between">
            <button
              onClick={updateProfile}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              {t('profile.save')}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
            >
              {t('profile.logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
