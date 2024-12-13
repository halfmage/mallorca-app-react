'use client'

import React, { useCallback, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useTranslation } from 'react-i18next';
import { useRouter } from "next/navigation";


const Profile = ({ user }) => {
    const { push } = useRouter()

    const { t, i18n: { language } } = useTranslation();
    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const userType = useMemo(
        () => user?.user_metadata?.user_type || '',
        [ user ]
    )
    const supabase = useMemo(
        () => createClient(),
        []
    )

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            setUpdating(true);

            // Update auth user metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    display_name: displayName,
                    avatar_url: avatarUrl
                }
            });

            if (authError) throw authError;

        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleAvatarUpload = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}-${Math.random()}.${fileExt}`;

            // Upload the file to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update the avatar URL
            setAvatarUrl(publicUrlData.publicUrl);

            // Update the user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrlData.publicUrl }
            });

            if (updateError) throw updateError;

        } catch (error) {
            console.error('Error uploading avatar:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setUploading(true);

            // Extract the file path from the URL
            const filePath = avatarUrl.split('/').pop();

            // Remove the file from storage if it exists
            if (filePath) {
                const { error: removeError } = await supabase.storage
                    .from('avatars')
                    .remove([filePath]);

                if (removeError) throw removeError;
            }

            // Update user metadata to remove avatar_url
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: '' }
            });

            if (updateError) throw updateError;

            setAvatarUrl('');

        } catch (error) {
            console.error('Error removing avatar:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = useCallback(
        async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) {
                push(`/${language}`);
            }
        },
        [ push, language, supabase.auth ]
    )

    if (!user) {
        push(`/${language}/login`);
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

            {/* Avatar Section */}
            <div className="mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xl">
                                  {displayName ? displayName[0].toUpperCase() : '?'}
                                </span>
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                <div className="text-white">{t('profile.avatar.uploading')}</div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                            {t('profile.avatar.change')}
                        </label>
                        {avatarUrl && (
                            <button
                                onClick={handleRemoveAvatar}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                {t('profile.avatar.remove')}
                            </button>
                        )}
                    </div>
                </div>
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
