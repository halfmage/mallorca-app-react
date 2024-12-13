export const ProviderService = {
    // Get a single provider by ID with full details
    async getProviderById(supabase, id) {
        const { data } = await supabase
            .from('providers')
            .select(`
        id,
        name,
        status,
        maincategory_id,
        maincategories (
          id,
          name
        ),
        provider_images (
          id,
          image_url
        )
      `)
            .eq('id', id)
            .single();

        // if (error) throw error;
        return this.processProviderImages(supabase, data);
    },

    // Get provider by user ID (for dashboard)
    async getProviderByUserId(supabase, userId) {
        const { data } = await supabase
            .from('providers')
            .select(`
        *,
        maincategory:maincategory_id(name),
        subcategory:subcategory_id(name)
      `)
            .eq('user_id', userId)
            .single();
        
        // if (error) throw error;
        return data;
    },

    // Get recent providers for home page
    async getRecentProviders(supabase, limit = 12) {
        const { data } = await supabase
            .from('providers')
            .select(`
        id,
        name,
        status,
        maincategory_id,
        maincategories (
          id,
          name
        ),
        provider_images (
          id,
          image_url
        )
      `)
            .in('status', ['active', 'pending'])
            .order('created_at', { ascending: false })
            .limit(limit);

        // if (error) throw error;
        return Promise.all(data.map(provider => this.processProviderImages(supabase, provider)));
    },

    // Get provider statistics
    async getProviderStats(supabase, providerId) {
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [savesData, recentViewsData, totalViewsData] = await Promise.all([
            supabase
                .from('saved_providers')
                .select('*', { count: 'exact' })
                .eq('provider_id', providerId),

            supabase
                .from('provider_views')
                .select('*', { count: 'exact' })
                .eq('provider_id', providerId)
                .gte('viewed_at', thirtyDaysAgo.toISOString()),

            supabase
                .from('provider_views')
                .select('*', { count: 'exact' })
                .eq('provider_id', providerId)
        ]);

        return {
            totalSaves: savesData.count || 0,
            recentViews: recentViewsData.count || 0,
            totalViews: totalViewsData.count || 0
        };
    },

    // Save/unsave provider
    async toggleSaveProvider(supabase, userId, providerId) {
        
        const { data: existing } = await supabase
            .from('saved_providers')
            .select('id')
            .eq('user_id', userId)
            .eq('provider_id', providerId)
            .single();

        if (existing) {
            const { error } = await supabase
                .from('saved_providers')
                .delete()
                .eq('user_id', userId)
                .eq('provider_id', providerId);

            if (error) throw error;
            return false; // Provider is now unsaved
        } else {
            const { error } = await supabase
                .from('saved_providers')
                .insert([{ user_id: userId, provider_id: providerId }]);

            if (error) throw error;
            return true; // Provider is now saved
        }
    },

    // Get saved providers for a user
    async getSavedProviders(supabase, userId) {
        
        const { data } = await supabase
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
            .eq('user_id', userId);

        // if (error) throw error;
        return Promise.all(data.map(item => this.processProviderImages(supabase, item.providers)));
    },

    // Get saved users for a provider
    async getSavedUsersForProvider(supabase, providerId) {
        
        const { data } = await supabase
            .from('saved_providers')
            .select(`
                created_at,
                user:user_id (
                  id,
                  email,
                  raw_user_meta_data->full_name as full_name
                )
              `)
            .eq('provider_id', providerId)
            .order('created_at', { ascending: false });
        // if (error) throw error;
        return data || [];
    },

    // Helper method to process provider images
    async processProviderImages(supabase, provider) {
        
        if (!provider) return null;

        const firstImage = provider.provider_images?.[0];
        if (firstImage) {
            const { data: publicUrlData } = supabase.storage
                .from('provider-images')
                .getPublicUrl(firstImage.image_url);

            return {
                ...provider,
                firstImage: publicUrlData.publicUrl
            };
        }
        return provider;
    },
    async getEditableProviders(supabase) {
        const {data} = await supabase
            .from('providers')
            .select(`
                id,
                name,
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
            .order('created_at', {ascending: false})

        return await Promise.all(
            data.map(
                async (provider) => {
                    let publicUrl = null
                    const mainImage = (provider?.provider_images || [])
                        .reduce(
                            (mainImage, image) =>
                                mainImage && mainImage?.created_at < image?.created_at ?
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
    },
    async getEditableProvider(supabase, id: string) {
        const {data} = await supabase
            .from('providers')
            .select(`
                id,
                name,
                status,
                maincategory_id,
                maincategories (
                  name
                ),
                provider_images(
                  id,
                  image_url,
                  created_at
                )
            `)
            .eq('id', id)
            .single();
        // if (error) throw error;

        return {
            ...data,
            'provider_images': await Promise.all((data?.provider_images || []).map(async (image) => {
                const {data: publicUrlData} = supabase.storage
                    .from('provider-images')
                    .getPublicUrl(image.image_url);
                return {
                    ...image,
                    publicUrl: publicUrlData.publicUrl
                };
            }))
        }
    }
};