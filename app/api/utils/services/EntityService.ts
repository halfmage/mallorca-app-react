import { cookies } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { SORTING_ORDER_NEW, SORTING_ORDER_OLD } from '@/app/api/utils/constants'

class EntityService {
    protected supabase

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase
    }

    static async init(): Promise<EntityService> {
        const cookieStore = await cookies()
        // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
        const supabase = createClient(cookieStore)

        return new this(supabase)
    }

    protected async applySortAndLimitToQuery(
        // @ts-expect-error: skip type for now
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

export default EntityService
