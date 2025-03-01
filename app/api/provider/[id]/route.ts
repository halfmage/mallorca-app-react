import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import { isAdmin } from '@/app/api/utils/services/UserService'
import { languages } from '@/app/i18n/settings'
import {
  EMAIL_PATTERN,
  GOOGLE_MAPS_LINK_PATTERN,
  PHONE_PATTERN,
  WEBSITE_PATTERN
} from '@/app/api/utils/helpers';

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params
  const formData = await request.formData()
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) {
    return Response.json(null, { status: 403 })
  }
  const providerService = new ProviderService(supabase)
  const isProviderAdmin = await providerService.isProviderAdmin(user.id, id, true)
  if (!isAdmin(user) && !isProviderAdmin) {
    return Response.json(null, { status: 403 })
  }

  const description = JSON.parse(formData.get('description') as string)
  const mail = (formData.get('mail') || '') as string
  const phone = (formData.get('phone') || '') as string
  const website = (formData.get('website') || '') as string
  const googleMapsUrl = (formData.get('googleMapsUrl') || '') as string

  const data = await providerService.update(
    id,
    {
      ...(isAdmin(user) ? {
        name: formData.get('name') as string,
        mainCategoryId: formData.get('mainCategoryId') as string,
        subCategoryIds: ((formData.get('subCategoryIds') || '') as string).split(',').map(Number),
      } : {}),
      images: ((formData.get('images') || '') as string).split(',').map(Number),
      newImages: formData.getAll('newImages') as File[],
      mail: mail.match(EMAIL_PATTERN) ? mail : '',
      phone: phone.match(PHONE_PATTERN) ? phone : '',
      address: formData.get('address') as string,
      website: website.match(WEBSITE_PATTERN) ? website : '',
      googleMapsUrl: googleMapsUrl.match(GOOGLE_MAPS_LINK_PATTERN) ? googleMapsUrl : '',
      description: Object.keys(description)
        .filter((lang: string) => languages.includes(lang))
        .reduce(
          (descriptions: Record<string, string>, lang: string) => (
            descriptions[lang] = description[lang],
            descriptions
          ),
          {}
        )
    }
  )

  return Response.json({ data })
}
