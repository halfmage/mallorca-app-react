import {
  SORTING_ORDER_NEW,
  STATUS_PENDING,
  STATUS_ACTIVE,
  DEFAULT_IMAGE_SOURCE,
  SEARCH_TYPE_SUBCATEGORY,
  SEARCH_TYPE_PROVIDER,
  STATUS_VERIFIED,
  STATUS_REJECTED,
  STATUS_PAYMENT_COMPLETED
} from '@/app/api/utils/constants'
import {isUUID} from '@/app/api/utils/helpers'
import EntityService from '@/app/api/utils/services/EntityService'
import UserService from '@/app/api/utils/services/UserService'
import CategoryService from '@/app/api/utils/services/CategoryService'
import FileUploadService from '@/app/api/utils/services/FileUploadService'

const BASIC_INFO_FRAGMENT = `
    id,
    name,
    slug,
    address,
    maincategory_id
`
const IMAGES_FRAGMENT = `
    provider_images (
        id,
        image_url,
        created_at
    ),
    provider_videos (
        id,
        url,
        thumbnail_url,
        created_at,
        external
    )
`

const SUBCATEGORIES_FRAGMENT = `
    provider_subcategories (
        subcategories (
            id,
            slug,
            name,
            subcategory_translations (
                name
            )
        )
    )
`

class ProviderService extends EntityService {
  // Get a single provider by ID or by slug with full details
  public async get(idOrSlug: string, language?: string) {
    const query = this.supabase
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
        ${SUBCATEGORIES_FRAGMENT},
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
          tips_list,
          language
        ),
        opening_hours (
          day,
          from,
          to,
          closed,
          season
        ),
        ${IMAGES_FRAGMENT}
      `)
      .eq(isUUID(idOrSlug) ? 'id' : 'slug', idOrSlug)
      .order('created_at', {referencedTable: 'provider_images', ascending: true})

    if (language) {
      query
        .eq('provider_translations.language', language)
        .eq('maincategories.maincategory_translations.language', language)
        .eq('provider_subcategories.subcategories.subcategory_translations.language', language)
    }
    const { data } = await query.single()

    // if (error) throw error;
    const categoryService = new CategoryService(this.supabase)

    return {
      ...data,
      // @ts-expect-error: skip type for now
      maincategories: categoryService.mapCategory(data?.maincategories),
      subcategories: (data?.provider_subcategories || []).map(
        // @ts-expect-error: skip type for now
        item => categoryService.mapCategory(item?.subcategories)
      ),
      'provider_images': await Promise.all((data?.provider_images || []).map(this.getImageWithUrl))
    }
  }

  // Get provider by user ID (for dashboard)
  public async getDetailedProviderByUserId(userId: string, providerId: string, language: string = 'en') {
    const {data} = await this.supabase
      .from('providers')
      .select(`
                *,
                maincategories (
                    name,
                    maincategory_translations (
                        name
                    )
                ),
                ${SUBCATEGORIES_FRAGMENT},
                business_claims (
                    id,
                    payment_status
                ),
                saved_providers(count),
                ${IMAGES_FRAGMENT}
            `)
      .eq('user_id', userId)
      .eq('id', providerId)
      .eq('maincategories.maincategory_translations.language', language)
      .eq('provider_subcategories.subcategories.subcategory_translations.language', language)
      .limit(1)
      .single()

    if (!data) {
      return null
    }
    const categoryService = new CategoryService(this.supabase)

    // if (error) throw error;
    return {
      ...data,
      maincategory: categoryService.mapCategory(data.maincategories),
      subcategories: (data.provider_subcategories || []).map(
        // @ts-expect-error: skip type for now
        item => categoryService.mapCategory(item?.subcategories)
      ),
      mainImage: await this.getProviderMainImage(data)
    }
  }

  public async getProviderByUserId(userId: string, providerId: string) {
    const {data} = await this.supabase
      .from('providers')
      .select(`
                id,
                name,
                saved_providers(count)
            `)
      .eq('user_id', userId)
      .eq('id', providerId)
      .limit(1)
      .single()

    return data
  }

  // Get providers by user ID (for dashboard)
  public async getProvidersByUserId(userId: string) {
    const {data} = await this.supabase
      .from('providers')
      .select(`
        id,
        name,
        ${IMAGES_FRAGMENT}
      `)
      .eq('user_id', userId)

    if (!data) {
      return []
    }

    return await Promise.all(
      data.map(async provider => ({
        ...provider,
        mainImage: await this.getProviderMainImage(provider)
      }))
    )
  }

  public async hasProviders(userId: string): Promise<boolean> {
    const {data} = await this.supabase
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single()

    return !!data
  }

  public async isProviderAdmin(userId: string, idOrSlug: string, isPaid: boolean = false): Promise<boolean> {
    const query = this.supabase
      .from('providers')
      .select('id, business_claims(payment_status)')
      .eq('user_id', userId)
      .eq(isUUID(idOrSlug) ? 'id' : 'slug', idOrSlug)

    if (isPaid) {
      query.eq('business_claims.payment_status', STATUS_PAYMENT_COMPLETED)
    }

    const {data, error} = await query
      .limit(1)
      .single()

    return !error && !!data
  }

  public async getProviderIdByImage(id: string): Promise<string | null | undefined> {
    const {data, error} = await this.supabase
      .from('provider_images')
      .select('provider_id')
      .eq('id', id)
      .limit(1)
      .single()

    if (error) {
      return null
    }

    return data?.provider_id
  }

  // Get provider statistics
  public async getProviderStats(providerId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      savesData, /* recentViewsData, */ totalViewsData, uniqueViewsData, messagesSentData, reachedUsersData
    ] = await Promise.all([
      // saved count
      this.supabase
        .from('saved_providers')
        .select('*', {count: 'exact'})
        .eq('provider_id', providerId),

      // this.supabase
      //     .from('provider_views')
      //     .select('*', { count: 'exact' })
      //     .eq('provider_id', providerId)
      //     .gte('viewed_at', thirtyDaysAgo.toISOString()),

      // views count
      this.supabase
        .from('provider_views')
        .select('*', {count: 'exact'})
        .eq('provider_id', providerId),

      // unique views count
      // todo: check possibility to enable aggregate functions https://github.com/orgs/supabase/discussions/19517
      this.supabase
        .from('provider_views')
        .select('user_id')
        .eq('provider_id', providerId),

      // messages sent
      this.supabase
        .from('messages')
        .select('*', {count: 'exact'})
        .eq('provider_id', providerId),

      // reached users
      this.supabase
        .from('sent_messages')
        .select('message_id(id)', {count: 'exact'})
        .not('message_id', 'is', null)
        .eq('message_id.provider_id', providerId),
    ])

    return {
      totalSaves: savesData.count || 0,
      // recentViews: recentViewsData.count || 0,
      totalViews: totalViewsData.count || 0,
      uniqueViews: (new Set((uniqueViewsData?.data || []).map(({user_id}) => user_id))).size || 0,
      messagesSent: messagesSentData.count || 0,
      reachedUsers: reachedUsersData.count || 0
    }
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
    language: string | null = 'en',
    categories: Array<number | string> = [],
    keyword: string | null | undefined = null,
    sort: string | null | undefined = SORTING_ORDER_NEW,
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
                  ${SUBCATEGORIES_FRAGMENT},
                  user_id,
                  saved_providers(count),
                  ${IMAGES_FRAGMENT}
                )
            `)
      .eq('user_id', userId)
      .eq('providers.maincategories.maincategory_translations.language', language)
      .eq('providers.provider_subcategories.subcategories.subcategory_translations.language', language)
    if (categories.length) {
      query.in('providers.maincategory_id', categories)
    }
    if (keyword) {
      query.ilike('providers.name', `%${keyword}%`)
    }
    // @ts-expect-error: skip type for now
    this.applySortAndLimitToQuery(query, sort, limit)
    const {data} = await query

    const categoryService = new CategoryService(this.supabase)

    // @ts-expect-error: skip type for now
    const providers = data
      .map((item) => item?.providers)
      .filter(Boolean)
      .map(
        // @ts-expect-error: skip type for now
        ({maincategories, saved_providers: savedCount, provider_subcategories, ...item}) => ({
          ...item,
          savedCount: savedCount?.[0]?.count || 0,
          maincategories: categoryService.mapCategory(maincategories),
          subcategories: (provider_subcategories || []).map(
            // @ts-expect-error: skip type for now
            item => categoryService.mapCategory(item?.subcategories)
          ),
        })
      )

    // if (error) throw error;
    return Promise.all(providers.map(this.processProviderImages));
  }

  public async getSavedProvidersByUserIds(userIds: Array<string>) {
    const {data} = await this.supabase
      .from('saved_providers')
      .select(`
                provider_id,
                user_id
            `)
      .in('user_id', userIds)

    return data
  }

  public async getUserIdsByProvider(providerId: string) {
    const {data} = await this.supabase
      .from('saved_providers')
      .select('user_id')
      .eq('provider_id', providerId)

    return (data || []).map(({user_id}) => user_id)
  }

  public async isProviderSaved(providerId: string, userId: string|undefined): Promise<boolean> {
    if (!userId) {
      return false
    }
    const {data} = await this.supabase
      .from('saved_providers')
      .select('provider_id')
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .limit(1)
      .single()

    return !!data
  }

  public async addSavedProvider(userId: string, providerId: string): Promise<boolean> {
    const {error} = await this.supabase
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
    const {error} = await this.supabase
      .from('saved_providers')
      .delete()
      .eq('user_id', userId)
      .eq('provider_id', providerId)

    return !error
  }

  public async getProvidersByCategory(
    categoryId: number | string,
    language: string | null = 'en',
    userId: string | null | undefined = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    subCategories: Array<number | string> = [],
    sort: string | null | undefined = SORTING_ORDER_NEW,
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
                ${SUBCATEGORIES_FRAGMENT},
                saved_providers (count),
                ${IMAGES_FRAGMENT}
            `)
      .in('status', [STATUS_ACTIVE, STATUS_PENDING, STATUS_VERIFIED])
      .eq('maincategory_id', categoryId)
      .eq('maincategories.maincategory_translations.language', language)
      .eq('provider_subcategories.subcategories.subcategory_translations.language', language)

    if (userId) {
      query.eq('saved_providers.user_id', userId)
    }

    // @ts-expect-error: skip type for now
    this.applySortAndLimitToQuery(query, sort, limit)

    const {data} = await query

    if (!data) {
      return []
    }
    let items = data

    // As we still need to show all subcategories for provider and not only the selected ones we are filtering them here
    if (subCategories.length) {
      items = items.filter(provider => provider?.provider_subcategories?.some(
        // @ts-expect-error: skip type for now
        providerSubcategory => subCategories.includes(providerSubcategory?.subcategories?.id) ||
          // @ts-expect-error: skip type for now
          subCategories.includes(providerSubcategory?.subcategories?.slug)
      ))
    }

    const providers = await Promise.all(
      items.map(provider => this.processProviderImages(provider))
    )
    const categoryService = new CategoryService(this.supabase)
    const providersWithCategories = providers.map(
      ({maincategories, provider_subcategories, ...item}) => ({
        ...item,
        maincategories: categoryService.mapCategory(maincategories),
        subcategories: (provider_subcategories || []).map(
          // @ts-expect-error: skip type for now
          item => categoryService.mapCategory(item?.subcategories)
        ),
      })
    )

    return await Promise.all(
      providersWithCategories.map(this.processProviderSaved)
    )
  }

  // @ts-expect-error: skip type for now
  private processProviderSaved = async (provider) => {
    if (!provider) {
      return null
    }

    const {count} = await this.supabase
      .from('saved_providers')
      .select('*', {count: 'exact', head: true})
      .eq('provider_id', provider.id)

    return {
      ...provider,
      savedCount: count
    }
  }

  // Helper method to process provider images
  // @ts-expect-error: skip type for now
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
    const {data} = await this.supabase
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
      // @ts-expect-error: skip type for now
      data.reduce((result, provider) => [
        ...result,
        ...((provider?.business_claims || []).map(claim => claim?.claimer_id).filter(Boolean))
      ], [])
    )
    // @ts-expect-error: skip type for now
    const users = await (userService as UserService).getUsersByIds([ ...userIds ])

    // @ts-expect-error: skip type for now
    return data.map(
      ({business_claims: claims, saved_providers: savedProviders, ...provider}) => ({
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
  ): Promise<boolean> {
    // Later might be selected directly on claim page
    // or user might have access to choose subscription on his own
    const {data} = await this.supabase
      .from('subscription_plans')
      .select('id')
      .limit(1)
      .single()

    const {error: claimError} = await this.supabase
      .from('business_claims')
      .insert([
        {
          claimer_id: userId,
          provider_id: providerId,
          status: STATUS_VERIFIED,
          payment_status: STATUS_PENDING,
          subscription_plan_id: data?.id || null
        }
      ])
    if (claimError) {
      return false
    }

    const {error: providerError} = await this.supabase
      .from('providers')
      .update({status: STATUS_VERIFIED, user_id: userId})
      .eq('id', providerId)

    return !providerError
  }

  public async revokeProviderAccess(providerId: string): Promise<boolean> {
    const {error: claimError, data} = await this.supabase
      .from('business_claims')
      .delete()
      .eq('provider_id', providerId)
      .select('claimer_id')

    if (claimError) {
      return false
    }

    const {error: providerError} = await this.supabase
      .from('providers')
      .update({status: STATUS_REJECTED, user_id: null})
      .eq('id', providerId)

    if (providerError) {
      return false
    }

    const usersInfo = await Promise.all(
      data.map(async (claim) => ({
        id: claim?.claimer_id,
        hasProviders: await this.hasProviders(claim?.claimer_id)
      }))
    )
    const usersExpectsRoleChange = usersInfo
      .filter(({hasProviders}) => !hasProviders)
      .map(({id}) => id)

    if (usersExpectsRoleChange.length) {
      const userService = await UserService.init()
      await Promise.all(
        usersExpectsRoleChange.map(async (userId) => await (userService as UserService).setRole(userId))
      )
    }

    return !providerError
  }

  public add = async (
    name: string, mainCategoryId: string, subCategoryId: string | number | undefined | null, images: Array<File>
  ) => {
    const {data: providerData, error: providerError} = await this.supabase
      .from('providers')
      .insert([{
        name: name,
        maincategory_id: mainCategoryId,
        ...(subCategoryId && {subcategory_id: subCategoryId}),
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

      const {data, error: uploadError} = await this.supabase.storage
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
    idOrSlug: string,
    {
      name, mainCategoryId, subCategoryIds, media, newImages, address, phone, mail, website,
      googleMapsUrl, description
    }: {
      name?: string,
      mainCategoryId?: string,
      subCategoryIds?: Array<number>,
      media: Array<string>,
      newImages: Array<File>,
      address: string,
      phone: string,
      mail: string,
      website: string,
      googleMapsUrl: string,
      description: Record<string, string>
    }
  ): Promise<boolean> => {
    const {data, error: providerError} = await this.supabase
      .from('providers')
      .update({
        address,
        phone,
        mail,
        website,
        google_maps_url: googleMapsUrl,
        ...(name ? { name } : {}),
        ...(mainCategoryId ? { maincategory_id: mainCategoryId } : {})
      })
      .eq(isUUID(idOrSlug) ? 'id' : 'slug', idOrSlug)
      .select('id, slug, provider_subcategories(subcategory_id), provider_translations(id, language)')

    const provider = data?.[0]

    if (!provider) {
      return false
    }

    if (Object.keys(description).length) {
      await this.updateProviderDescription(provider, description)
    }

    if (subCategoryIds) {
      await this.updateProviderSubcategories(provider, subCategoryIds)
    }

    if (providerError) {
      console.error('providerError = ', providerError)
      return false
    }

    const uploadedImages = []
    const uploadedVideos = []

    if (newImages.length) {
      const fileUploadService = new FileUploadService()
      for (let i = 0; i < newImages.length; i++) {
        try {
          const file = newImages[i]
          if (file.type.includes('video/')) {
            const url = await fileUploadService.upload(file, { resource_type: 'video', tags: provider?.slug })

            uploadedVideos.push({
              provider_id: provider.id,
              url
            })
          } else {
            const url = await fileUploadService.upload(file, { tags: provider?.slug })

            uploadedImages.push({
              provider_id: provider.id,
              image_url: url
            })
          }
        } catch (uploadError) {
          // @ts-expect-error: skip type for now
          console.error('Error uploading image:', uploadError.message)
          continue
        }
      }
    }

    const { data: newImagesData } = await this.supabase
      .from('provider_images')
      .insert(uploadedImages)
      .select('id')

    const images = media.filter((imageId: string) => !isUUID(imageId))

    const actualImageIds = [ ...images, ...(newImagesData || []).map(({ id }) => id) ]

    if (actualImageIds.length) {
      await this.supabase
        .from('provider_images')
        .delete()
        .not('id', 'in', `(${actualImageIds.join(',')})`)
        .eq('provider_id', provider.id)
    } else {
      await this.supabase
        .from('provider_images')
        .delete()
        .eq('provider_id', provider.id)
    }

    const { data: newVideosData } = await this.supabase
      .from('provider_videos')
      .insert(uploadedVideos)
      .select('id')

    const actualVideoIds = [
      ...media.filter((imageId: string) => isUUID(imageId)),
      ...(newVideosData || []).map(({ id }) => id)
    ]

    if (actualVideoIds.length) {
      await this.supabase
        .from('provider_videos')
        .delete()
        .not('id', 'in', `(${actualVideoIds.join(',')})`)
        .eq('provider_id', provider.id)
    } else {
      await this.supabase
        .from('provider_videos')
        .delete()
        .eq('provider_id', provider.id)
    }

    if (media?.length) {
      return await this.reorderImages(media)
    }

    return true
  }

  private updateProviderDescription = async (
    provider: { id: string; provider_translations: Array<{ id: string; language: string; }> },
    description: Record<string, string>
  ): Promise<void> => {
    const itemsToUpdate = (provider.provider_translations || [])
      .filter((item: { id: string; language: string; }) => Object.keys(description).includes(item.language))

    if (itemsToUpdate.length) {
      await Promise.all(
        itemsToUpdate.map(async (item: { id: string; language: string; }) => {
          await this.supabase
            .from('provider_translations')
            .update({
              description: description[item.language],
            })
            .eq('provider_id', provider.id)
            .eq('language', item.language)
        })
      )
    }

    const itemsToAdd = Object.keys(description)
      .filter(lang => !itemsToUpdate.some((item: { id: string; language: string; }) => item.language === lang))

    if (itemsToAdd.length) {
      await this.supabase
        .from('provider_translations')
        .insert(
          itemsToAdd.map(
            (lang: string) => ({
              language: lang,
              description: description[lang],
              provider_id: provider.id
            })
          )
        )
    }
  }

  private updateProviderSubcategories = async (
    provider: { id: string; provider_subcategories: Array<{ subcategory_id: number; }> },
    subCategoryIds: Array<number>
  ): Promise<void> => {
    const currentSubcategoryIds = (provider.provider_subcategories || []).map(
      (item: { subcategory_id: number; }) => item?.subcategory_id
    )
    const itemsToRemove = currentSubcategoryIds.filter((id: number) => !subCategoryIds.includes(id));
    const itemsToAdd = subCategoryIds.filter(id => !currentSubcategoryIds.includes(id));

    if (itemsToRemove.length) {
      await this.supabase
        .from('provider_subcategories')
        .delete()
        .in('subcategory_id', itemsToRemove)
    }

    if (itemsToAdd.length) {
      await this.supabase
        .from('provider_subcategories')
        .insert(
          itemsToAdd.map(
            subCategoryId => ({
              provider_id: provider.id,
              subcategory_id: subCategoryId
            })
          )
        )
    }
  }

  public deleteImage = async (id: string): Promise<boolean> => {
    const {data} = await this.supabase
      .from('provider-images')
      .select('image_url')
      .eq('id', id)
      .single()

    const imageUrl = data?.image_url

    const {error: storageError} = await this.supabase.storage
      .from('provider-images')
      .remove([imageUrl])

    if (storageError) {
      return false
    }

    // Delete from database
    const {error: dbError} = await this.supabase
      .from('provider_images')
      .delete()
      .eq('id', id)

    return !dbError
  }

  public reorderImages = async (mediaIds: Array<string>): Promise<boolean> => {
    for (let i = 0; i < mediaIds.length; i++) {
      if (isUUID(mediaIds[i])) {
        const {error} = await this.supabase
          .from('provider_videos')
          .update({created_at: new Date(Date.now() + i).toISOString()})
          .eq('id', mediaIds[i])

        if (error) {
          return false
        }
      } else {
        const {error} = await this.supabase
          .from('provider_images')
          .update({created_at: new Date(Date.now() + i).toISOString()})
          .eq('id', Number(mediaIds[i]))

        if (error) {
          return false
        }
      }
    }

    return true
  }

  // @ts-expect-error: skip type for now
  public async moveProviderImagesToCloudinary(providers) {
    const images = this.getExternalProvidersImages(providers)

    const fileUploadService = new FileUploadService()
    await Promise.all(
      images.map(
        // @ts-expect-error: skip type for now
        async (image) => {
          const imageUrl = await fileUploadService.uploadByUrl(image.url, { tags: [image.provider] })

          if (imageUrl) {
            return this.updateImageUrl(image.id, imageUrl)
          }
        }
      )
    )
  }

  // @ts-expect-error: skip type for now
  protected getExternalProvidersImages(providers) {
    return providers
      // @ts-expect-error: skip type for now
      .flatMap(provider => (provider?.provider_images || [])
        .filter(
          // @ts-expect-error: skip type for now
          image => image?.image_url && image.image_url.startsWith('http') &&
            !image.image_url.startsWith(DEFAULT_IMAGE_SOURCE)
        )
        .map(
          // @ts-expect-error: skip type for now
          image => ({
            id: image?.id,
            url: image?.image_url,
            provider: provider.slug
          })
        )
      )
  }

  public updateImageUrl = async (imageId: number, imageUrl: string): Promise<boolean> => {
    const {error} = await this.supabase
      .from('provider_images')
      .update({image_url: imageUrl})
      .eq('id', imageId)

    return !error
  }

  public async getProvidersGroupedByCategories(language: string, limit: number = 4) {
    const {data} = await this.supabase
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
                    ${SUBCATEGORIES_FRAGMENT},
                    saved_providers(count),
                    ${IMAGES_FRAGMENT}
                )
            `)
      .eq('maincategory_translations.language', language)
      .eq('providers.provider_subcategories.subcategories.subcategory_translations.language', language)
      .in('providers.status', [STATUS_ACTIVE, STATUS_PENDING])
      .order('created_at', {referencedTable: 'providers', ascending: false})
      .limit(limit, {referencedTable: 'providers'})

    const categoryService = new CategoryService(this.supabase)

    return Promise.all(
      // @ts-expect-error: skip type for now
      data.map(async mainCategory => {
        // @ts-expect-error: skip type for now
        const category = categoryService.mapCategory(mainCategory)
        const providers = await Promise.all(
          mainCategory.providers.map(
            async ({saved_providers: savedCount, ...provider}) => {
              const {
                provider_subcategories,
                ...providerWithImages
              } = await this.processProviderImages(provider)

              return {
                ...providerWithImages,
                savedCount: savedCount?.[0]?.count,
                maincategories: category,
                subcategories: (provider_subcategories || []).map(
                  // @ts-expect-error: skip type for now
                  item => categoryService.mapCategory(item?.subcategories)
                ),
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
    const {error} = await this.supabase
      .from('provider_views')
      .insert([
        {
          provider_id: providerId,
          user_id: userId
        }
      ])

    return !error
  }

  public async search(keyword: string, language: string) {
    const subcategories = await this.searchSubcategoriesByName(keyword, language)
    // @ts-expect-error: skip type for now
    const providerIds = subcategories.reduce(
      (acc, subcategory) => (
        acc.push(
          // @ts-expect-error: skip type for now
          ...(subcategory?.provider_subcategories || [])?.map(
            ({provider_id}) => provider_id)
        ),
        acc
      ),
      []
    )

    const providers = await this.searchProvidersByName(keyword, language, [...(new Set(providerIds))])

    return [
      {
        options: subcategories,
        type: SEARCH_TYPE_SUBCATEGORY
      },
      {
        options: providers,
        type: SEARCH_TYPE_PROVIDER
      }
    ]
  }

  private async searchProvidersByName(keyword: string, language: string, providerIds: string[] = []) {
    try {
      const {data} = await this.supabase
        .from('providers')
        .select(`
                    id,
                    slug,
                    name,
                    maincategories (
                        name,
                        maincategory_translations (
                            name
                        )
                    ),
                    ${SUBCATEGORIES_FRAGMENT},
                    ${IMAGES_FRAGMENT}
                `)
        .or(`id.in.(${providerIds.join(',')}),name.ilike.%${keyword}%`)
        .eq('maincategories.maincategory_translations.language', language)
        .eq('provider_subcategories.subcategories.subcategory_translations.language', language)

      return await Promise.all(
        // @ts-expect-error: skip type for now
        data.map(provider => this.processProviderImages(provider))
      )
    } catch {
      return []
    }
  }

  private async searchSubcategoriesByName(keyword: string, language: string) {
    try {
      const {data} = await this.supabase
        .from('subcategories')
        .select(`
                    id,
                    name,
                    slug,
                    subcategory_translations (
                        name
                    ),
                    maincategories (
                        id,
                        slug
                    ),
                    provider_subcategories (
                        provider_id
                    )
                `)
        .eq('subcategory_translations.language', language)
        .ilike('name', `%${keyword}%`)

      return data
    } catch {
      return []
    }
  }

  // @ts-expect-error: skip type for now
  private getImageWithUrl = async (image) => {
    if (image?.image_url && image.image_url.startsWith('http')) {
      return {
        ...image,
        publicUrl: image.image_url
      }
    }

    const {data: publicUrlData} = await this.supabase.storage
      .from('provider-images')
      .getPublicUrl(image.image_url)

    return {
      ...image,
      publicUrl: publicUrlData.publicUrl
    }
  }

  // @ts-expect-error: skip type for now
  private async getProviderMainImage(provider) {
    const mainImage = (provider?.provider_images || [])
      .reduce(
        // @ts-expect-error: skip type for now
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
