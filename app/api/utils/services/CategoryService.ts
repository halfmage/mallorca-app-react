import EntityService from '@/app/api/utils/services/EntityService'

class CategoryService extends EntityService {
    public async getMainCategories(language: string) {
        const query = this.supabase
            .from('maincategories')
            .select(`
                id,
                name,
                slug,
                maincategory_translations (
                    name
                )
            `)
            .eq('maincategory_translations.language', language)

        const { data } = await query

        if (!data) {
            return []
        }

        return data.map(this.mapCategory)
    }

    public async get(slug: string|number|undefined|null, language: string) {
        const { data } = await this.supabase
            .from('maincategories')
            .select(`
                id,
                name,
                slug,
                maincategory_translations (
                    name
                )
            `)
            .eq(
                typeof slug === 'number' || (!isNaN(slug) && typeof slug === 'string') ?
                    'id' : 'slug',
                slug
            )
            .eq('maincategory_translations.language', language)
            .single()

        return this.mapCategory(data)
    }

    public async getSubCategories(categoryId: number, language: string) {
        const query = this.supabase
            .from('subcategories')
            .select(`
                id,
                name,
                slug,
                subcategory_translations (
                    name
                )
            `)
            .eq('subcategory_translations.language', language)
            .eq('maincategory_id', categoryId)

        const { data } = await query

        if (!data) {
            return []
        }

        return data.map(this.mapCategory)
    }

    public mapCategory(category) {
        return category ?
            {
                id: category.id,
                name: category.maincategory_translations?.[0]?.name || category.subcategory_translations?.[0]?.name || category.name,
                slug: category.slug
            } :
            null
    }
}

export default CategoryService
