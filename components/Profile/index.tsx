'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import countries from 'i18n-iso-countries'
import { useRouter } from 'next/navigation'
import Image from '@/components/shared/Image'

// @ts-expect-error: skip type for now
const Profile = ({ userData }) => {
    const { push, refresh } = useRouter()
    const { register, handleSubmit } = useForm({
        defaultValues: {
            displayName: userData?.display_name || '',
            email: userData?.email || '',
            avatarUrl: userData?.avatar_url || '',
            birthdate: userData?.birthdate || '',
            gender: userData?.gender || '',
            country: (userData?.country || '').toUpperCase(),
        },
    })

    const { t, i18n: { language } } = useTranslation()
    const [isClient, setIsClient] = useState(false)
    const [displayName] = useState(userData?.display_name || '')
    const [avatarUrl, setAvatarUrl] = useState(userData?.avatar_url || '')
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)
    
    // Fix hydration issues by only rendering client-specific content after mount
    useEffect(() => {
        setIsClient(true)
    }, [])
    
    const countryOptions = useMemo(
        () => {
            if (!isClient) return []
            
            const options = countries.getNames(language, { select: 'official' })
            return Object.keys(options).map(
                (countryCode) => ({
                    value: countryCode,
                    label: options[countryCode],
                })
            )
        },
        [language, isClient]
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
        [handleSubmit]
    )

    // @ts-expect-error: skip type for now
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
        [push, refresh, language]
    )

    // If not client-side yet, render a minimal placeholder to avoid hydration issues
    if (!isClient) {
        return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl overflow-hidden">
                    <div className="px-6 py-8 md:px-8 md:py-10">
                        <h1 className="h2 mb-6">{t('profile.title')}</h1>
                    </div>
                </div>
            </div>
        </div>
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Profile Form */}
                <form onSubmit={onSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl overflow-hidden">
                        <div className="px-6 py-8 md:px-8 md:py-10">
                        <h1 className="h2 mb-6">{t('profile.title')}</h1>

                        {/* Avatar Section */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative">
                                    {avatarUrl ? (
                                        <div className="w-24 h-24 rounded-full overflow-hidden shadow-md">
                                            <Image
                                                src={avatarUrl}
                                                alt="Profile"
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-md">
                                            <span className="text-gray-500 dark:text-gray-400 text-3xl font-gloock">
                                                {displayName ? displayName[0].toUpperCase() : '?'}
                                            </span>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                            <div className="text-white text-caption">{t('profile.avatar.uploading')}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <label className="button cursor-pointer text-center sm:text-left">
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
                                            className="button-danger text-center sm:text-left"
                                        >
                                            {t('profile.avatar.remove')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-body-sm font-medium block mb-2">
                                        {t('profile.displayName')}
                                    </label>
                                    <input
                                        type="text"
                                        {...register('displayName', {required: true})}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-body-sm font-medium block mb-2">
                                        {t('profile.email')}
                                    </label>
                                    <input
                                        type="text"
                                        {...register('email', {disabled: true})}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                </div>


                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="button-primary w-full sm:w-auto"
                                >
                                    {updating ? t('common.updating') : t('common.update')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* About You Section */}
                    <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl overflow-hidden">
                        <div className="px-6 py-8 md:px-8 md:py-10">
                            <h2 className="h3 mb-2">{t('profile.aboutYou.title')}</h2>
                            <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-6">
                                {t('profile.aboutYou.description')}
                            </p>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-body-sm font-medium block mb-2">
                                        {t('profile.birthdate')}
                                    </label>
                                    <input
                                        type="date"
                                        {...register('birthdate')}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-body-sm font-medium block mb-2">
                                        {t('profile.country')}
                                    </label>
                                    <select
                                        {...register('country')}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    >
                                        <option value="">{t('common.select.placeholder')}</option>
                                        {countryOptions.map((country) => (
                                            <option key={country.value} value={country.value}>
                                                {country.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-body-sm font-medium block mb-2">
                                        {t('profile.gender')}
                                    </label>
                                    <select
                                        {...register('gender')}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
                                    className="button-primary w-full sm:w-auto"
                                >
                                    {updating ? t('common.updating') : t('common.update')}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Logout Section */}
                <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl overflow-hidden">
                    <div className="px-6 py-8 md:px-8 md:py-10">
                        <button
                            onClick={handleLogout}
                            className="button-danger w-full sm:w-auto"
                        >
                            {t('profile.logout')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile
