import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import React from "react";
import Home from '@/components/Home'

export default async function Homepage({ params }) {
    const { lng } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // const { data: todos } = await supabase.from('todos').select()
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
                const { count } = await supabase
                    .from('saved_providers')
                    .select('*', { count: 'exact', head: true })
                    .eq('provider_id', provider.id)
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
                    savedCount: count,
                    mainImage: mainImage ? {
                        ...mainImage,
                        publicUrl
                    } : null
                }
            }
        )
    )

    return (
        <Home providers={providers} lng={lng}/>
    )
}
