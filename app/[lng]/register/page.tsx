import React from 'react'
import { signup } from './actions'
import SignUp from '@/components/SignUp'

export default async function RegisterPage() {
    return (
        <SignUp onSubmit={signup} />
    )
}
