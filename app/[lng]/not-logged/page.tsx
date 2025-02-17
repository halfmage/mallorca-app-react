import React from 'react'
import { useTranslation } from '@/app/i18n'

interface Props {
  params: Promise<{ lng: string }>
}

export default async function ForbiddenPage({ params }: Props) {
    const { lng } = await params
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

    return (
        <div className="max-w-6xl mx-auto p-6">
            <p>{t('profile.notLoggedIn')}</p>
        </div>
    )
}
