import { cookies } from 'next/headers'
import EntityService from '@/app/api/utils/services/EntityService'
import MessageService from '@/app/api/utils/services/MessageService'
import ProviderService from '@/app/api/utils/services/ProviderService'
import { createClient } from '@/utils/supabase/server'
import { ROLE_ADMIN, ROLE_USER, SORTING_ORDER_NEW, SORTING_ORDER_OLD } from '@/app/api/utils/constants'

export const isAdmin = user => ROLE_ADMIN === user?.app_metadata?.role

class UserService extends EntityService {
    static async init(): Promise<EntityService> {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore, process.env.SUPABASE_SECRET_ROLE_KEY)

        return new this(supabase)
    }

    public async getUsers(perPage: number = 10000, sort: string = SORTING_ORDER_NEW): Promise<Array<{ id: string; name: string; createdAt: Date; savedProviders: number; receiveMessages: number }>> {
        const { data: { users }, error } = await this.supabase.auth.admin.listUsers({
            page: 1,
            perPage
        })

        if (error) {
            return []
        }

        users.sort(this.sortBy(sort))

        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const providerService = new ProviderService(supabase)

        const savedProviders = await providerService.getSavedProvidersByUserIds(
            users.map(({ id }) => id)
        )

        const messageService = new MessageService(supabase)

        const messages = await messageService.getMessagesByUserIds(
            users.map(({ id }) => id)
        )

        return users.map(({ id, created_at: createdAt, ...user }) => ({
            id,
            name: user?.user_metadata?.display_name,
            createdAt,
            savedProviders: savedProviders.filter(
                ({ user_id }) => user_id === id
            ).length,
            receiveMessages: messages.filter(
                ({ receiver_id }) => receiver_id === id
            ).length
        }))
    }

    public async getUsersCount() {
        const { data: { total } } = await this.supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1
        })

        return total || 0
    }

    public async setRole(userId: string, role: string = ROLE_USER) {
        const { data } = await this.supabase.auth.admin.updateUserById(
            userId,
            { app_metadata: { role } }
        )

        return data
    }

    public async deleteUser(userId: string) {
        const { error } = await this.supabase.auth.admin.deleteUser(userId)

        return !error
    }

    public async getUsersByIds(ids: string[]): Promise<Array<{ id: string; name: string; createdAt: Date; savedProviders: number; receiveMessages: number }>> {
        // todo: consider default pagination
        const { data: { users }, error } = await this.supabase.auth.admin.listUsers()

        if (error) {
            return []
        }

        return users
            .filter(user => ids.includes(user.id))
            .map(({ id, email, user_metadata }) => ({
                id,
                email,
                name: user_metadata?.display_name
            }))
    }

    private sortBy(sort: string) {
        switch (sort) {
            case SORTING_ORDER_NEW:
                return (a, b) => a.created_at < b.created_at ? 1 : -1
            case SORTING_ORDER_OLD:
                return (a, b) => a.created_at > b.created_at ? 1 : -1
            default:
                return (a, b) => a.created_at < b.created_at ? 1 : -1
        }
    }
}

export default UserService
