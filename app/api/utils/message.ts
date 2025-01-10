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

    public async getLatestEmailDate(providerId: string): Promise<Date | null | undefined> {
        const query = this.supabase
            .from('messages')
            .select('created_at')
            .eq('provider_id', providerId)
            .single()
        this.applySortAndLimitToQuery(query, SORTING_ORDER_NEW, 1)
        const { data } = await query

        if (!data) {
            return null
        }

        return data?.created_at
    }

    public async send(
        providerId: string,
        userId: string,
        title: string,
        text: string,
        imageUrl: string|null|undefined = null
    ): Promise<boolean> {
        const { data, error: messageError } = await this.supabase
            .from('messages')
            .insert({
                provider_id: providerId,
                sender_id: userId,
                title,
                text,
                image_url: imageUrl,
            })
            .select('id')
            .single()

        if (messageError) {
            return false
        }

        const { data: users } = await this.supabase
            .from('saved_providers')
            .select('user_id')
            .eq('provider_id', providerId)

        if (!users?.length) {
            return false
        }

        try {
            Promise.all(users.map(async ({ user_id }) => {
                await this.supabase
                    .from('sent_messages')
                    .insert({
                        receiver_id: user_id,
                        message_id: data?.id
                    })
            }))
        } catch {
            return false
        }

        return true
    }

    public async getNewMessagesCount(userId: string): Promise<number> {
        if (!userId) {
            return 0
        }
        try {
            const { count } = await this.supabase
                .from('sent_messages')
                .select('*', { count: 'exact' })
                .eq('receiver_id', userId)
                .eq('read', false)

            return count
        } catch {
            //
        }

        return 0
    }

    public async getUserMessages(userId: string) {
        const query = this.supabase
            .from('sent_messages')
            .select(`
                id,
                created_at,
                read,
                message: messages (
                    title,
                    text,
                    image_url,
                    provider_id
                )
            `)
            .eq('receiver_id', userId)
        this.applySortAndLimitToQuery(query, SORTING_ORDER_NEW)
        const { data } = await query

        return data
    }

    public async getMessagesByUserIds(userIds: Array<string>) {
        const { data } = await this.supabase
            .from('sent_messages')
            .select(`
                id,
                receiver_id
            `)
            .in('receiver_id', userIds)

        return data
    }
}
