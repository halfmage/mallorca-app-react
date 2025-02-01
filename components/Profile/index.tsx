'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import countries from 'i18n-iso-countries'
import { useRouter } from 'next/navigation'
import { ROLE_USER } from '@/app/api/utils/constants'
import Image from '@/components/shared/Image'

const Profile = ({ userData, role }) => {
    const { push, refresh } = useRouter()
    const { register, handleSubmit } = useForm({
        defaultValues: {
            displayName: userData?.display_name || '',
            avatarUrl: userData?.avatar_url || '',
            birthdate: userData?.birthdate || '',
            gender: userData?.gender || '',
            country: (userData?.country || '').toUpperCase(),
        },
    })

    const { t, i18n: { language } } = useTranslation()
    const [displayName] = useState(userData?.display_name || '')
    const [avatarUrl, setAvatarUrl] = useState(userData?.avatar_url || '')
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const countryOptions = useMemo(
        () => {
            const options = countries.getNames(language, { select: 'official' })
            return Object.keys(options).map(
                (countryCode) => ({
                    value: countryCode,
                    label: options[countryCode],
                })
            )
        },
        [ language ]
    )

    const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
        handleSubmit(async ({ displayName, avatarUrl, country, birthdate, gender }) => {
            try {
                setUpdating(true)

                // Update auth user metadata
                const response = await fetch(
                    '/api/profile',
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            displayName,
                            avatarUrl,
                            country,
                            birthdate,
                            gender
                        })
                    }
                )
                await response.json()
            } catch (error) {
                console.error('Error updating profile:', error)
            } finally {
                setUpdating(false)
            }
        }),
        [ handleSubmit ]
    )

    const handleAvatarUpload = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const formData = new FormData()
            formData.append('image', event.target.files[0])

            const response = await fetch(
                '/api/profile/avatar',
                {
                    method: 'POST',
                    body: formData
                }
            )
            const { data: publicUrl } = await response.json()

            // Update the avatar URL
            setAvatarUrl(publicUrl)
        } catch (error) {
            console.error('Error uploading avatar:', error)
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveAvatar = async () => {
        try {
            setUploading(true)
            await fetch(
                '/api/profile/avatar',
                { method: 'DELETE' }
            )
            setAvatarUrl('')
        } catch (error) {
            console.error('Error removing avatar:', error)
        } finally {
            setUploading(false)
        }
    }

    const handleLogout = useCallback(
        async () => {
            const response = await fetch(
                '/api/profile/logout',
                { method: 'POST' }
            )
            const { data: success } = await response.json()
            if (success) {
                push(`/${language}`)
                refresh()
            }
        },
        [ push, refresh, language ]
    )

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{t('profile.title')}</h1>

            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    {t('profile.userType')}: <span className="font-semibold capitalize">{role || ROLE_USER}</span>
                </p>
            </div>

            {/* Avatar Section */}
            <div className="mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        {avatarUrl ? (
                            <div className="w-24 h-24 rounded-full object-cover overflow-hidden">
                                <Image
                                    src={avatarUrl}
                                    alt="Profile"
                                    width={96}
                                    height={96}
                                />
                            </div>
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

            <form onSubmit={onSubmit} className="mb-8">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        {t('profile.displayName')}
                    </label>
                    <input
                        type="text"
                        {...register('displayName', {required: true})}
                        className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        {t('profile.birthdate')}
                    </label>
                    <input
                        type="date"
                        {...register('birthdate')}
                        className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        {t('profile.country')}
                    </label>
                    <select
                        {...register('country')}
                        className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                    >
                        <option value="">{t('common.select.placeholder')}</option>
                        {countryOptions.map((country) => (
                            <option key={country.value} value={country.value}>
                                {country.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        {t('profile.gender')}
                    </label>
                    <select
                        {...register('gender')}
                        className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                    >
                        <option value="">{t('common.select.placeholder')}</option>
                        <option value="male">{t('common.gender.male')}</option>
                        <option value="female">{t('common.gender.female')}</option>
                        <option value="other">{t('common.gender.other')}</option>
                    </select>
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

export default Profile
