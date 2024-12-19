import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { SORTING_ORDER_NEW, SORTING_ORDER_OLD } from './constants'

const BASIC_INFO_FRAGMENT = `
    id,
    name,
    maincategory_id
`
const IMAGES_FRAGMENT = `
    provider_images (
        id,
        image_url,
        created_at
    )
`

export class ProviderService {
    private supabase

    constructor(supabase) {
        this.supabase = supabase
    }

    static async init(): Promise<ProviderService> {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        return new ProviderService(supabase)
    }

    // Get a single provider by ID with full details
    async get(id) {
        const { data } = await this.supabase
            .from('providers')
            .select(`
                ${BASIC_INFO_FRAGMENT},
                status,
                maincategories (
                  id,
                  name
                ),
                ${IMAGES_FRAGMENT}
            `)
            .eq('id', id)
            .single();

        // if (error) throw error;
        return {
            ...data,
            'provider_images': await Promise.all((data?.provider_images || []).map(this.getImageWithUrl))
        }
    }

    // Get provider by user ID (for dashboard)
    async getProviderByUserId(userId) {
        const { data } = await this.supabase
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
    }

    // Get recent providers for home page
    async getRecentProviders(limit = 12) {
        const { data } = await this.supabase
            .from('providers')
            .select(`
                ${BASIC_INFO_FRAGMENT},
                status,
                maincategories (
                  id,
                  name
                ),
                ${IMAGES_FRAGMENT}
            `)
            .in('status', ['active', 'pending'])
            .order('created_at', { ascending: false })
            .limit(limit)

        // if (error) throw error;
        return Promise.all(data.map(provider => this.processProviderImages(provider)))
    }

    // Get provider statistics
    async getProviderStats(providerId) {
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [savesData, recentViewsData, totalViewsData] = await Promise.all([
            this.supabase
                .from('saved_providers')
                .select('*', { count: 'exact' })
                .eq('provider_id', providerId),

            this.supabase
                .from('provider_views')
                .select('*', { count: 'exact' })
                .eq('provider_id', providerId)
                .gte('viewed_at', thirtyDaysAgo.toISOString()),

            this.supabase
                .from('provider_views')
                .select('*', { count: 'exact' })
                .eq('provider_id', providerId)
        ]);

        return {
            totalSaves: savesData.count || 0,
            recentViews: recentViewsData.count || 0,
            totalViews: totalViewsData.count || 0
        };
    }

    // Save/unsave provider
    async toggleSaveProvider(userId, providerId) {
        
        const { data: existing } = await this.supabase
            .from('saved_providers')
            .select('id')
            .eq('user_id', userId)
            .eq('provider_id', providerId)
            .single();

        if (existing) {
            const { error } = await this.supabase
                .from('saved_providers')
                .delete()
                .eq('user_id', userId)
                .eq('provider_id', providerId);

            if (error) throw error;
            return false; // Provider is now unsaved
        } else {
            const { error } = await this.supabase
                .from('saved_providers')
                .insert([{ user_id: userId, provider_id: providerId }]);

            if (error) throw error;
            return true; // Provider is now saved
        }
    }

    // Get saved providers for a user
    async getSavedProviders(
        userId: string,
        categories: Array<number|string> = [],
        keyword: string | null | undefined = null,
        sort: string = SORTING_ORDER_NEW,
        limit: number | null | undefined = null
    ) {
        const query = this.supabase
            .from('saved_providers')
            .select(`
                provider_id,
                providers (
                  ${BASIC_INFO_FRAGMENT},
                  maincategories (
                    name
                  ),
                  ${IMAGES_FRAGMENT}
                )
            `)
            .eq('user_id', userId)
        if (categories.length) {
            query.in('providers.maincategory_id', categories)
        }
        if (keyword) {
            query.ilike('providers.name', `%${keyword}%`)
        }
        this.applySortAndLimitToQuery(query, sort, limit)
        const { data } = await query

        const providers = data.map((item) => item?.providers).filter(Boolean)

        // if (error) throw error;
        return Promise.all(providers.map(this.processProviderImages));
    }

    // Get saved users for a provider
    async getSavedUsersForProvider(providerId) {
        const { data } = await this.supabase
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
    }

    async isProviderSaved(providerId, userId) {
        const { data } = await this.supabase
            .from('saved_providers')
            .select('provider_id')
            .eq('user_id', userId)
            .eq('provider_id', providerId)
            .single()

        return !!data
    }

    async removeSavedProvider(userId, providerId) {
        return await this.supabase
            .from('saved_providers')
            .delete()
            .eq('user_id', userId)
            .eq('provider_id', providerId);
    }

    async getProvidersByCategory(
        categoryId: number | string,
        userId: string | null | undefined = null, // eslint-disable-line @typescript-eslint/no-unused-vars
        subCategories: Array<number | string> = [],
        sort: string = SORTING_ORDER_NEW,
        limit: number | null | undefined = null
    ) {
        const query = this.supabase
            .from('providers')
            .select(`
                ${BASIC_INFO_FRAGMENT},
                status,
                maincategories (
                  id,
                  name
                ),
                ${IMAGES_FRAGMENT}
            `)
            .in('status', ['active', 'pending'])
            .eq('maincategory_id', categoryId)

        if (subCategories.length) {
            query.in('providers.subcategory_id', subCategories)
        }

        this.applySortAndLimitToQuery(query, sort, limit)

        const { data } = await query

        if (!data) {
            return []
        }

        const providers = await Promise.all(data.map(provider => this.processProviderImages(provider)))
        return await Promise.all(providers.map(this.processProviderSaved))
    }

    processProviderSaved = async (provider) => {
        if (!provider) {
            return null
        }

        const { count } = await this.supabase
            .from('saved_providers')
            .select('*', { count: 'exact', head: true })
            .eq('provider_id', provider.id)

        return {
            ...provider,
            savedCount: count
        }
    }

    // Helper method to process provider images
    processProviderImages = async (provider) => {
        if (!provider) {
            return null
        }

        const mainImage = await this.getProviderMainImage(provider)
        if (mainImage) {
            return {
                ...provider,
                mainImage
            }
        }
        return provider
    }
    async getEditableProviders() {
        const {data} = await this.supabase
            .from('providers')
            .select(`
                ${BASIC_INFO_FRAGMENT},
                status,
                maincategories (
                  name
                ),
                ${IMAGES_FRAGMENT}
            `)
            .order('created_at', {ascending: false})

        return Promise.all(data.map(this.processProviderImages))
    }

    async getProviders() {
        const providers = await this.getRecentProviders()

        return await Promise.all(providers.map(this.processProviderSaved))
    }

    getImageWithUrl = async (image) => {
        const { data: publicUrlData } = this.supabase.storage
        .from('provider-images')
        .getPublicUrl(image.image_url)

        return {
            ...image,
            publicUrl: publicUrlData.publicUrl
        }
    }

    async getProviderMainImage(provider) {
        const mainImage = (provider?.provider_images || [])
            .reduce(
                (mainImage, image) =>
                    mainImage && mainImage?.created_at < image?.created_at ?
                        mainImage :
                        image,
                null
            )
        if (!mainImage) {
            return null
        }

        return await this.getImageWithUrl(mainImage)
    }

    private async applySortAndLimitToQuery(
        query,
        sort: string = SORTING_ORDER_NEW,
        limit: number | null | undefined = null
    ): Promise<void> {
        if (sort) {
            const sortField = (sort === SORTING_ORDER_NEW || sort === SORTING_ORDER_OLD) && 'created_at'
            const ascending = sort === SORTING_ORDER_OLD
            query.order(sortField, { ascending })
        }
        if (limit) {
            query.limit(limit)
        }
    }
}