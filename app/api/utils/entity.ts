import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { SORTING_ORDER_NEW, SORTING_ORDER_OLD } from './constants'

export class EntityService {
    protected supabase

    constructor(supabase) {
        this.supabase = supabase
    }

    static async init(): Promise<EntityService> {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        return new this(supabase)
    }

    protected async applySortAndLimitToQuery(
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