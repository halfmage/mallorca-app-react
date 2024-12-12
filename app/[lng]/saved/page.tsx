import React from 'react';
import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import SavedProviders from "@/components/SavedProviders";
// import { useAuth } from '../hooks/useAuth';
// import { useTranslation } from 'react-i18next';

export default async function SavedPage() {
  // const { user } = useAuth();
  // const { t } = useTranslation();
  // const cookieStore = await cookies()
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
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
      .eq('user_id', user?.id);

  const providers = await Promise.all(
      (data || []).map(
          async ({ providers: provider }) => {
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

  return (
    <SavedProviders providers={providers} userId={user?.id} />
  );
};
