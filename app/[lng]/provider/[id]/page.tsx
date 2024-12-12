import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import Provider from "@/components/Provider"

export default async function ProviderPage({ params }) {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data, error } = await supabase
        .from('providers')
        .select(`
          id,
          name,
          maincategory_id,
          maincategories (
            id,
            name
          ),
          provider_images(
            image_url,
            created_at
          )
        `)
        .eq('id', id)
        .single()
    const { data: { user } } = await supabase.auth.getUser();

    const provider = {
        ...data,
        'provider_images': await Promise.all((data?.provider_images || []).map(async (image) => {
            const { data: publicUrlData } = supabase.storage
                .from('provider-images')
                .getPublicUrl(image.image_url);
            return {
                ...image,
                publicUrl: publicUrlData.publicUrl
            };
        }))
    }

    const { data: saved } = await supabase
        .from('saved_providers')
        .select(`
          provider_id,
          providers (
            id,
            name,
            maincategory_id,
            maincategories (
              name
            ),
            provider_images (
              id,
              image_url
            )
          )
        `)
        .eq('user_id', user?.id)
        .eq('provider_id', id)
        .single();

    return (
        <Provider provider={provider} userId={user?.id} isSaved={!!saved} />
    );
}
