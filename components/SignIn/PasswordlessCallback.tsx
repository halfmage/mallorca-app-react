'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/app/i18n/client'
import { createClient } from '@/utils/supabase/client'
import { AUTH_STATUS_SIGNED_IN } from '@/app/api/utils/constants'

export default function PasswordlessCallback() {
  const { i18n: { language } } = useTranslation()
  const { push, refresh } = useRouter()
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === AUTH_STATUS_SIGNED_IN && session?.user?.id) {
        push(`/${language}/profile`)
        refresh()
      }
    })
  }, [ language, push, refresh ])

  return (<></>)
}
