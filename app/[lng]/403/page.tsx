import React from "react";
import { useTranslation } from '@/app/i18n'

export default async function ForbiddenPage({ params }) {
    const { lng } = await params
    const { t } = await useTranslation(lng)

    return (
        <div>
            {t('admin.error.notAdmin')}
        </div>
    )
}
