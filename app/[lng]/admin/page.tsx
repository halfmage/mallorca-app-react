import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import React from "react";
import Admin from '@/components/Admin'
import { redirect } from 'next/navigation'

export default async function AdminPage({ params }) {
    const { lng } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();
    if ('halfmage@gmail.com' !== user?.email) {
        return redirect(`/${lng}/403`)
    }

    const {data, error} = await supabase
        .from('providers')
        .select(`
            id,
            name,
            image_url,
            status,
            maincategory_id,
            maincategories (
              name
            ),
            provider_images(
              image_url,
              created_at
            )
        `)
        .in('status', ['active', 'pending']) // Broaden status filter
        .order('created_at', {ascending: false})
        .limit(12);

    const providers = await Promise.all(
        data.map(
            async (provider) => {
                let publicUrl = null
                const mainImage = (provider?.provider_images || [])
                    .reduce(
                        (mainImage, image) => mainImage && mainImage?.created_at < image?.created_at ?
                            mainImage :
                            image,
                        null
                    )
                if (mainImage) {
                    const { data: publicUrlData } = supabase.storage
                        .from('provider-images')
                        .getPublicUrl(mainImage.image_url);
                    publicUrl = publicUrlData.publicUrl
                }

                return {
                    ...provider,
                    mainImage: mainImage ? {
                        ...mainImage,
                        publicUrl
                    } : null
                }
            }
        )
    )

    const { data: mainCategories } = await supabase.from('maincategories').select('*');

    return (
        <Admin providers={providers} mainCategories={mainCategories} />
    )
}
