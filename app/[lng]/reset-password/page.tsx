import {resetPassword} from './actions'
import React from 'react'
import ResetPassword from '@/components/ResetPassword'

export default async function ResetPasswordPage() {
  return (
    <ResetPassword onSubmit={resetPassword}/>
  )
}
