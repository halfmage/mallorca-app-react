'use client'

import React, { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AUTH_STATUS_SIGNED_IN } from '@/app/api/utils/constants'

export default function PasswordlessCallback() {
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === AUTH_STATUS_SIGNED_IN && session?.user?.id) {
        window.location.reload()
      }
    })
  }, [])

  return (<></>)
}
