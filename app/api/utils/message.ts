import { SORTING_ORDER_NEW } from './constants'
import { EntityService } from '@/app/api/utils/entity'

export class MessageService extends EntityService {
    public async getProviderMessages(providerId: string) {
        const query = this.supabase
            .from('messages')
            .select(`
                id,
                title,
                text,
                image_url,
                created_at,
                received: sent_messages(count)
            `)
            .eq('provider_id', providerId)
        this.applySortAndLimitToQuery(query, SORTING_ORDER_NEW)
        const { data } = await query
        const { data: readMessages } = await this.supabase
            .from('messages')
            .select(`
                id,
                read: sent_messages(count)
            `)
            .eq('sent_messages.read', true)
            .eq('provider_id', providerId)

        if (!data) {
            return []
        }

        return data.map(
            ({ id, received, ...message }) => ({
                id,
                ...message,
                receivedCount: received?.[0]?.count || 0,
                viewedCount: readMessages
                    .find(
                        ({ id: messageId }) => messageId === id
                    )?.read?.[0]?.count || 0
            })
        )
    }
}