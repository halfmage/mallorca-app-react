import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import React from "react";
import { redirect } from 'next/navigation'
import EditProvider from "@/components/EditProvider";

export default async function EditProviderPage({ params }) {
    const { id, lng } = await params
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
        .eq('id', id)
        .single();

    let publicUrl = null


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

    const { data: mainCategories } = await supabase.from('maincategories').select('*');

    return (
        <EditProvider provider={provider} mainCategories={mainCategories} />
    )
}
