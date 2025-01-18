import {
    SORTING_ORDER_NEW, STATUS_PENDING, STATUS_ACTIVE, STATUS_PAYMENT_COMPLETED
} from '@/app/api/utils/constants'
import { isUUID } from '@/app/api/utils/helpers'
import EntityService from '@/app/api/utils/services/EntityService'
import UserService from '@/app/api/utils/services/UserService'
import CategoryService from '@/app/api/utils/services/CategoryService'

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

class ProviderService extends EntityService {
    // Get a single provider by ID or by slug with full details
    public async get(idOrSlug: string, language: string = 'en') {
        const { data } = await this.supabase
            .from('providers')
            .select(`
                ${BASIC_INFO_FRAGMENT},
                status,
                maincategories (
                  id,
                  name,
                  maincategory_translations (
                    name
                  )
                ),
                subcategories (
                  name,
                  subcategory_translations (
                    name
                  )
                ),
                address,
                phone,
                mail,
                website,
                latitude,
                longitude,
                google_maps_url,
                provider_translations (
                    description,
                    advantages_list,
                    tips_list
                ),
                ${IMAGES_FRAGMENT}
            `)
            .eq('provider_translations.language', language)
            .eq('maincategories.maincategory_translations.language', language)
            .eq('subcategories.subcategory_translations.language', language)
            .eq(isUUID(idOrSlug) ? 'id' : 'slug', idOrSlug)
            .single()

        // if (error) throw error;
        const categoryService = new CategoryService(this.supabase)

        return {
            ...data,
            maincategories: categoryService.mapCategory(data?.maincategories),
            subcategories: categoryService.mapCategory(data?.subcategories),
            'provider_images': await Promise.all((data?.provider_images || []).map(this.getImageWithUrl))
        }
    }

    // Get provider by user ID (for dashboard)
    public async getProviderByUserId(userId: string) {
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
        return data
    }

    // todo: rely on a role inside user.app_metadata
    public async hasProviders(userId: string): Promise<boolean> {
        const { data } = await this.supabase
            .from('providers')
            .select(`*`)
            .eq('user_id', userId)
            .single()

        return !!data
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
        language: string|null = 'en',
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
                    name,
                    maincategory_translations (
                        name
                    )
                  ),
                  user_id,
                  ${IMAGES_FRAGMENT}
                )
            `)
            .eq('user_id', userId)
            .eq('providers.maincategories.maincategory_translations.language', language)
        if (categories.length) {
            query.in('providers.maincategory_id', categories)
        }
        if (keyword) {
            query.ilike('providers.name', `%${keyword}%`)
        }
        this.applySortAndLimitToQuery(query, sort, limit)
        const { data } = await query

        const categoryService = new CategoryService(this.supabase)

        const providers = data
            .map((item) => item?.providers)
            .filter(Boolean)
            .map(
                ({ maincategories, ...item }) => ({
                    ...item,
                    maincategories: categoryService.mapCategory(maincategories)
                })
            )

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
        language: string|null = 'en',
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
                  name,
                  maincategory_translations (
                    id,
                    name
                  )
                ),
                ${IMAGES_FRAGMENT}
            `)
            .in('status', [STATUS_ACTIVE, STATUS_PENDING])
            .eq('maincategory_id', categoryId)
            .eq('maincategories.maincategory_translations.language', language)

        if (subCategories.length) {
            query.in('providers.subcategory_id', subCategories)
        }

        this.applySortAndLimitToQuery(query, sort, limit)

        const { data } = await query

        if (!data) {
            return []
        }

        const providers = await Promise.all(
            data.map(provider => this.processProviderImages(provider))
        )
        const categoryService = new CategoryService(this.supabase)
        const providersWithCategories = providers.map(
            ({ maincategories, ...item }) => ({
                ...item,
                maincategories: categoryService.mapCategory(maincategories)
            })
        )

        return await Promise.all(
            providersWithCategories.map(this.processProviderSaved)
        )
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
                saved_providers (count),
                updated_at,
                business_claims (
                    status,
                    payment_status,
                    claimer_id,
                    updated_at
                )
            `)
            .order('created_at', {ascending: false})
        const userService = await UserService.init()
        const userIds = new Set(
            data.reduce((result, provider) => [
                ...result,
                ...((provider?.business_claims || []).map(claim => claim?.claimer_id).filter(Boolean))
            ], [])
        )
        const users = await userService.getUsersByIds([...userIds])

        return data.map(
            ({ business_claims: claims, saved_providers: savedProviders, ...provider } ) => ({
                ...provider,
                saved: savedProviders?.[0]?.count || 0,
                ...(claims?.length > 0 ? {
                    claims: claims.map(claim => ({
                        ...claim,
                        claimer: users.find(user => user.id === claim.claimer_id)
                    }))
                } : {})
            })
        )
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

    public async getProvidersGroupedByCategories(language: string, limit: number = 4) {
        const { data } = await this.supabase
            .from('maincategories')
            .select(`
                id,
                name,
                slug,
                maincategory_translations (
                    name
                ),
                providers (
                    ${BASIC_INFO_FRAGMENT},
                    status,
                    maincategories (
                      id
                    ),
                    subcategories (
                      name,
                      subcategory_translations (
                        name
                      )
                    ),
                    saved_providers(count),
                    ${IMAGES_FRAGMENT}
                )
            `)
            .eq('maincategory_translations.language', language)
            .in('providers.status', [STATUS_ACTIVE, STATUS_PENDING])
            .order('created_at', { referencedTable: 'providers', ascending: false })
            .limit(limit, { referencedTable: 'providers' })

        const categoryService = new CategoryService(this.supabase)

        return Promise.all(
            data.map(async mainCategory => {
                const category = categoryService.mapCategory(mainCategory)
                const providers = await Promise.all(
                    mainCategory.providers.map(
                        async ({ saved_providers: savedCount, ...provider }) => {
                            const { subcategories, ...providerWithImages } = await this.processProviderImages(provider)

                            return {
                                ...providerWithImages,
                                savedCount: savedCount?.[0]?.count,
                                maincategories: category,
                                subcategories: categoryService.mapCategory(subcategories)
                            }
                        }
                    )
                )

                return {
                    ...category,
                    providers
                }
            })
        )
    }

    public async addProviderView(providerId: string, userId: string | null | undefined): Promise<boolean> {
        const { error } = await this.supabase
            .from('provider_views')
            .insert([
                {
                    provider_id: providerId,
                    user_id: userId
                }
            ])

        return !error
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

export default ProviderService
