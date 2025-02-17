import React from "react";
import { useTranslation } from '@/app/i18n'

interface Props {
  params: Promise<{ lng: string }>
}

export default async function NotFoundPage({ params }: Props) {
    const { lng } = await params
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks

    return (
        <div>
            {t('common.error.notFound')}
        </div>
    )
}
