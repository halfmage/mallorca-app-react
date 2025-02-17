import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {createClient} from '@/utils/supabase/server'
import ClaimBusiness from '@/components/ClaimBusiness'
import ProviderService from '@/app/api/utils/services/ProviderService'
import UserService, {isAdmin} from '@/app/api/utils/services/UserService'

interface Props {
  params: Promise<{ lng: string, slug: string }>
}

export default async function ClaimBusinessPage({ params }: Props) {
  const {slug, lng} = await params
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = await createClient(cookieStore)
  const {data: {user}} = await supabase.auth.getUser();

  if (!isAdmin(user)) {
    redirect('/403')
  }

  const providerService = new ProviderService(supabase)
  const provider = await providerService.get(slug, lng)

  if (!provider?.id) {
    redirect('/404')
  }

  const userService = await UserService.init()
  const users = await (userService as UserService).getAllUsers()
  const userOptions = users.map(
    ({id, email, user_metadata}) => ({
      value: id,
      label: user_metadata?.display_name ? `${user_metadata.display_name} (${email})` : email
    })
  )

  return (
    <ClaimBusiness provider={provider} userOptions={userOptions} />
  );
}
