import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import { isAdmin } from '@/app/api/utils/services/UserService'
import { languages } from '@/app/i18n/settings'

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
  const isProviderAdmin = await providerService.isProviderAdmin(user.id, id)
  if (!isAdmin(user) && !isProviderAdmin) {
    return Response.json(null, { status: 403 })
  }

  const description = JSON.parse(formData.get('description') as string)

  const data = await providerService.update(
    id,
    {
      ...(isAdmin(user) ? {
        name: formData.get('name') as string,
        mainCategoryId: formData.get('mainCategoryId') as string,
        subCategoryIds: ((formData.get('subCategoryIds') || '') as string).split(',').map(Number),
      } : {}),
      images: formData.getAll('images') as File[],
      mail: formData.get('mail') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      website: formData.get('website') as string,
      googleMapsUrl: formData.get('googleMapsUrl') as string,
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
