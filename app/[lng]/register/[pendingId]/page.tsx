import React from 'react'
import AdditionalStep from '@/components/SignUp/AdditionalStep'
import UserService from '@/app/api/utils/services/UserService'
import { redirect } from 'next/navigation'

export default async function AdditionalStepPage({ params }) {
    const { pendingId, lng } = await params
    const userService = await UserService.init()
    const user = await userService.getUserByPendingId(pendingId)
    if (!user) {
        redirect(`/${lng}`)
    }

    return (
        <AdditionalStep pendingId={pendingId} />
    )
}
