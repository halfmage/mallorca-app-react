import {
    SORTING_ORDER_NEW, STATUS_PENDING, STATUS_ACTIVE, STATUS_PAYMENT_COMPLETED
} from './constants'
import { isUUID } from './helpers'
import { EntityService } from '@/app/api/utils/entity'

const BASIC_INFO_FRAGMENT = `
    id,
    name,
    slug,
    maincategory_id
`
const IMAGES_FRAGMENT = `
    provider_images (
        id,
        image_url,
        created_at
    )
`

export class ProviderService extends EntityService {
    // Get a single provider by ID or by slug with full details
    public async get(idOrSlug: string, language: string = 'en') {
        const { data } = await this.supabase
            .from('providers')
            .select(`
                ${BASIC_INFO_FRAGMENT},
                status,
                maincategories (
                  id,
                  name
                ),
                subcategories (
                  name
                ),
                address,
                phone,
                mail,
                website,
                provider_translations (
                    description
                ),
                ${IMAGES_FRAGMENT}
            `)
            .eq('provider_translations.language', language)
            .eq(isUUID(idOrSlug) ? 'id' : 'slug', idOrSlug)
            .single()

        // if (error) throw error;
        return {
            ...data,
            'provider_images': await Promise.all((data?.provider_images || []).map(this.getImageWithUrl))
        }
    }

    // Get provider by user ID (for dashboard)
    public async getProviderByUserId(userId) {
        const { data } = await this.supabase
            .from('providers')
            .select(`
                *,
                maincategory:maincategory_id(name),
                subcategory:subcategory_id(name),
                business_claims (
                    id,
                    payment_status
                ),
                saved_providers(count)
            `)
            .eq('user_id', userId)
            .single();
        
        // if (error) throw error;
        return data;
    }

    public async isProviderAdmin(userId: string, providerId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('providers')
            .select('id')
            .eq('user_id', userId)
            .eq('id', providerId)
            .single()

        return !error && !!data
    }

    public async getProviderIdByImage(id: string): Promise<string|null|undefined> {
        const { data, error } = await this.supabase
            .from('provider_images')
            .select('provider_id')
            .eq('id', id)
            .single()

        if (error) {
            return null
        }

        return data?.provider_id
    }

    // Get recent providers for home page
    public async getRecentProviders(limit = 12) {
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
            .in('status', [STATUS_ACTIVE, STATUS_PENDING])
            .order('created_at', { ascending: false })
            .limit(limit)

        // if (error) throw error;
        return Promise.all(data.map(provider => this.processProviderImages(provider)))
    }

    // Get provider statistics
    public async getProviderStats(providerId) {
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
    public async toggleSaveProvider(userId: string | null | undefined, providerId: string): Promise<boolean> {
        if (!userId) {
            return false
        }

        const existing = await this.isProviderSaved(providerId, userId)

        if (existing) {
            return !(await this.removeSavedProvider(userId, providerId))
        } else {
            return await this.addSavedProvider(userId, providerId)
        }
    }

    // Get saved providers for a user
    public async getSavedProviders(
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

    public async getSavedProvidersByUserIds(userIds: Array<string>) {
        const { data } = await this.supabase
            .from('saved_providers')
            .select(`
                provider_id,
                user_id
            `)
            .in('user_id', userIds)

        return data
    }

    // Get saved users for a provider
    public async getSavedUsersForProvider(providerId: string) {
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

    public async isProviderSaved(providerId: string, userId: string): Promise<boolean> {
        const { data } = await this.supabase
            .from('saved_providers')
            .select('provider_id')
            .eq('user_id', userId)
            .eq('provider_id', providerId)
            .single()

        return !!data
    }

    public async addSavedProvider(userId: string, providerId: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('saved_providers')
            .insert([
                {
                    user_id: userId,
                    provider_id: providerId
                }
            ])

        return !error
    }

    public async removeSavedProvider(userId: string, providerId: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('saved_providers')
            .delete()
            .eq('user_id', userId)
            .eq('provider_id', providerId)

        return !error
    }

    public async getProvidersByCategory(
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
            .in('status', [STATUS_ACTIVE, STATUS_PENDING])
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

    private processProviderSaved = async (provider) => {
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
    private processProviderImages = async (provider) => {
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

    public async getEditableProviders() {
        const { data } = await this.supabase
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

    public async getProviders() {
        const providers = await this.getRecentProviders()

        return await Promise.all(providers.map(this.processProviderSaved))
    }

    public async claimProvider(
        providerId: string,
        userId: string,
        email: string, // eslint-disable-line @typescript-eslint/no-unused-vars
        phone: string, // eslint-disable-line @typescript-eslint/no-unused-vars
        message: string // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<boolean> {
        const { error } = await this.supabase
            .from('business_claims')
            .insert([
                {
                    claimer_id: userId,
                    provider_id: providerId,
                    status: STATUS_PENDING,
                    payment_status: STATUS_PENDING
                }
            ])

        return !error
    }

    public async addPayment(id: string, paymentId: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('business_claims')
            .update({
                payment_id: paymentId,
                payment_status: STATUS_PAYMENT_COMPLETED
            })
            .eq('id', id)

        return !error
    }

    public add = async (
        name: string, mainCategoryId: string, subCategoryId: string|number|undefined|null, images: Array<File>
    ) => {
        const { data: providerData, error: providerError } = await this.supabase
            .from('providers')
            .insert([{
                name: name,
                maincategory_id: mainCategoryId,
                ...(subCategoryId && { subcategory_id: subCategoryId }),
            }])
            .select()
            .single()

        if (providerError || !providerData?.id) {
            return null
        }

        const uploadedImages = []

        for (let i = 0; i < images.length; i++) {
            const file = images[i]
            const fileName = `${Date.now()}-${file.name}`

            const { data, error: uploadError } = await this.supabase.storage
                .from('provider-images')
                .upload(fileName, file)

            if (uploadError) {
                console.error('Error uploading image:', uploadError.message)
                continue
            }

            uploadedImages.push({
                provider_id: providerData?.id,
                image_url: data.path
            })
        }

        await this.supabase
            .from('provider_images')
            .insert(uploadedImages)

        return providerData
    }

    public update = async (
        id: string, name: string, mainCategoryId: string, subCategoryId: string|number|undefined|null, images: Array<File>
    ): Promise<boolean> => {
        const { error: providerError } = await this.supabase
            .from('providers')
            .update({
                name,
                maincategory_id: mainCategoryId,
                ...(subCategoryId && { subcategory_id: subCategoryId }),
            })
            .eq('id', id)

        if (providerError) {
            return false
        }

        const uploadedImages = []

        for (let i = 0; i < images.length; i++) {
            const file = images[i]
            const fileName = `${Date.now()}-${file.name}`

            const { data, error: uploadError } = await this.supabase.storage
                .from('provider-images')
                .upload(fileName, file)

            if (uploadError) {
                console.error('Error uploading image:', uploadError.message)
                continue
            }

            uploadedImages.push({
                provider_id: id,
                image_url: data.path
            })
        }

        await this.supabase
            .from('provider_images')
            .insert(uploadedImages)

        return true
    }

    public deleteImage = async (id: string): Promise<boolean> => {
        const { data } = await this.supabase
            .from('provider-images')
            .select('image_url')
            .eq('id', id)
            .single()

        const imageUrl = data?.image_url

        const { error: storageError } = await this.supabase.storage
            .from('provider-images')
            .remove([imageUrl])

        if (storageError) {
            return false
        }

        // Delete from database
        const { error: dbError } = await this.supabase
            .from('provider_images')
            .delete()
            .eq('id', id)

        return !dbError
    }

    public reorderImages = async (imageIds: Array<string>): Promise<boolean> => {
        for (let i = 0; i < imageIds.length; i++) {
            const { error } = await this.supabase
                .from('provider_images')
                .update({ created_at: new Date(Date.now() + i).toISOString() })
                .eq('id', imageIds[i])

            if (error) {
                return false
            }
        }

        return true
    }

    public async getProvidersGroupedByCategories(limit: number = 4) {
        const { data } = await this.supabase
            .from('maincategories')
            .select(`
                id,
                name,
                slug,
                providers (
                    ${BASIC_INFO_FRAGMENT},
                    status,
                    maincategories (
                      id,
                      name
                    ),
                    ${IMAGES_FRAGMENT}
                )
            `)
            .in('providers.status', [STATUS_ACTIVE, STATUS_PENDING])
            .order('created_at', { referencedTable: 'providers', ascending: false })
            .limit(limit, { referencedTable: 'providers' })

        return Promise.all(
            data.map(async mainCategory => {
                const providers = await Promise.all(
                    mainCategory.providers.map(async provider => await this.processProviderImages(provider))
                )

                return {
                    ...mainCategory,
                    providers
                }
            })
        )
    }

    private getImageWithUrl = async (image) => {
        const { data: publicUrlData } = await this.supabase.storage
            .from('provider-images')
            .getPublicUrl(image.image_url)

        return {
            ...image,
            publicUrl: publicUrlData.publicUrl
        }
    }

    private async getProviderMainImage(provider) {
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
}