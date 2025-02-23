"use client"

import React, { useCallback, useMemo, useState } from 'react'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'
import { ImagePlus, Clock, Send as SendIcon, ArrowLeft } from 'lucide-react'

interface SendProps {
  savedCount: number
  limit: number
  latestEmailDate?: string
  isBlocked: boolean
  providerId: string
}

const Send: React.FC<SendProps> = ({ savedCount, limit, latestEmailDate, isBlocked, providerId }) => {
  const [savingStatus, setSavingStatus] = useState<'idle' | 'loading'>('idle')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { push } = useRouter()
  const { register, handleSubmit } = useForm()
  const { t, i18n: { language } } = useTranslation()
  
  const timeLeft = useMemo(
    () => {
      if (!isBlocked || !latestEmailDate) return null
      
      const date = moment(latestEmailDate)
      const unblockDate = date.add(limit, 'hours')
      const diff = moment.duration(unblockDate.diff(moment()))
      
      return t('messages.form.blockedUntil', { 
        hours: diff.hours(), 
        minutes: diff.minutes() 
      })
    },
    [latestEmailDate, limit, isBlocked, t]
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(URL.createObjectURL(file))
    }
  }

  const onSubmit = useCallback(
    handleSubmit(
      async ({ title, text, image }) => {
        try {
          setSavingStatus('loading')
          const formData = new FormData()
          formData.append('title', title)
          formData.append('text', text)
          formData.append('providerId', providerId)
          if (image?.[0]) {
            formData.append('image', image[0])
          }

          const response = await fetch('/api/message', {
            method: 'POST',
            body: formData
          })
          const { data } = await response.json()

          if (data) {
            push(`/${language}/messages/${providerId}`)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : t('messages.form.error.generic')
          console.error(t('messages.form.error.send'), errorMessage)
        } finally {
          setSavingStatus('idle')
        }
      }
    ),
    [handleSubmit, language, t, push, providerId]
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
        <form onSubmit={onSubmit} className="divide-y divide-gray-200 dark:divide-gray-800">
          {/* Header */}
          <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <h1 className="h3">
                {t('messages.form.title', 'Send Message')}
              </h1>
              <Link
                href={`/${language}/messages/${providerId}`}
                className="button-outline inline-flex items-center text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </div>
          </div>

          {/* Time Block Warning */}
          {timeLeft && (
            <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/10 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
              <div className="text-amber-800 dark:text-amber-200">
                <p className="font-medium">
                  {t('messages.form.blockedMessage', 'Message sending is temporarily blocked')}
                </p>
                <p className="text-sm">{timeLeft}</p>
              </div>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Image Upload */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                {...register('image', { required: false })}
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer
                  transition-colors duration-200 group
                  ${selectedImage 
                    ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/10' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
              >
                {selectedImage ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={selectedImage} 
                      alt={t('messages.form.imagePreview', 'Message image preview')}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <p className="text-white text-sm font-medium">
                        {t('messages.form.changeImage', 'Click to change image')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImagePlus className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('messages.form.addImageButton', 'Add an image')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('messages.form.imageHint', 'Click or drag and drop')}
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Message Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('messages.form.messageTitle.label', 'Message Title')}
                </label>
                <input
                  {...register('title', { required: true })}
                  id="title"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                    transition-colors duration-200"
                  type="text"
                  placeholder={t('messages.form.messageTitle.placeholder', 'Enter message title')}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('messages.form.messageText.label', 'Message Content')}
                </label>
                <textarea
                  {...register('text', { required: true })}
                  id="message"
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                    transition-colors duration-200 resize-none"
                  placeholder={t('messages.form.messageText.placeholder', 'Enter your message')}
                />
              </div>

              <p 
                className="text-sm text-gray-500 dark:text-gray-400"
                dangerouslySetInnerHTML={{
                  __html: t('messages.form.infoText', {
                    count: savedCount,
                    limit
                  })
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
            <button
              type="submit"
              disabled={savingStatus === 'loading' || !savedCount}
              className={`button-primary w-full flex items-center justify-center
                ${(savingStatus === 'loading' || !savedCount) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <SendIcon className="w-4 h-4 mr-2" />
              {savingStatus === 'loading' 
                ? t('common.sending', 'Sending...') 
                : t('messages.form.sendButton', 'Send Message')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Send
