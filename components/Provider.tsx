"use client"

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useTranslation } from '@/app/i18n/client';


const Provider = ({ provider, userId, isSaved: isSavedInitially }) => {
    const supabase = createClient()
    const [isSaved, setIsSaved] = useState(isSavedInitially);
    const [savingStatus, setSavingStatus] = useState('idle');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const providerImages = provider.provider_images || []
    const { t } = useTranslation()

    const handleSaveToggle = async () => {
        try {
            if (!userId) {
                alert(t('providerDetail.saveButton.loginRequired'));
                return;
            }

            setSavingStatus('loading');

            if (isSaved) {
                const { error } = await supabase
                    .from('saved_providers')
                    .delete()
                    .eq('user_id', userId)
                    .eq('provider_id', provider.id);

                if (error) throw error;
                setIsSaved(false);
            } else {
                const { error } = await supabase
                    .from('saved_providers')
                    .insert([
                        {
                            user_id: userId,
                            provider_id: provider.id
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

    if (!provider) {
        return <div className="max-w-6xl mx-auto p-6">{t('providerDetail.error.fetchProvider')}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            {provider ? (
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
                                    <div className="flex space-x-2 overflow-x-auto" key="thumbnails">
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

export default Provider;
