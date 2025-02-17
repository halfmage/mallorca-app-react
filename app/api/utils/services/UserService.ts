import moment from 'moment'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import EntityService from '@/app/api/utils/services/EntityService'
import MessageService from '@/app/api/utils/services/MessageService'
import ProviderService from '@/app/api/utils/services/ProviderService'
import { createClient } from '@/utils/supabase/server'
import {
  ROLE_ADMIN,
  ROLE_USER,
  SORTING_ORDER_NEW,
  SORTING_ORDER_OLD
} from '@/app/api/utils/constants'

const DEFAULT_PAGE_SIZE = 1000
const STATS_INCLUDES_EMPTY_VALUES = true

// @ts-expect-error: skip type for now
export const isAdmin = user => ROLE_ADMIN === user?.app_metadata?.role

class UserService extends EntityService {
  static async init(): Promise<EntityService> {
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = createClient(cookieStore, process.env.SUPABASE_SECRET_ROLE_KEY)

    return new this(supabase)
  }

  public async getUsers(perPage: number | null | undefined = 10000, sort: string | null = SORTING_ORDER_NEW): Promise<Array<{
    id: string;
    name: string;
    createdAt: Date;
    savedProviders: number;
    receiveMessages: number
  }>> {
    const { data: { users }, error } = await this.supabase.auth.admin.listUsers({
      page: 1,
      // @ts-expect-error: skip type for now
      perPage
    })

    if (error) {
      return []
    }

    // @ts-expect-error: skip type for now
    users.sort(this.sortBy(sort))

    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = createClient(cookieStore)
    const providerService = new ProviderService(supabase)

    const savedProviders = await providerService.getSavedProvidersByUserIds(
      users.map(({ id }: { id: string }) => id)
    )

    const messageService = new MessageService(supabase)

    const messages = await messageService.getMessagesByUserIds(
      users.map(({ id }: { id: string }) => id)
    )

    // @ts-expect-error: skip type for now
    return users.map(({ id, created_at: createdAt, ...user }) => ({
      id,
      name: user?.user_metadata?.display_name,
      createdAt,
      // @ts-expect-error: skip type for now
      savedProviders: savedProviders.filter(
        ({ user_id }) => user_id === id
      ).length,
      // @ts-expect-error: skip type for now
      receiveMessages: messages.filter(
        ({ receiver_id }) => receiver_id === id
      ).length
    }))
  }

  public async getUsersCount() {
    // @ts-expect-error: skip type for now
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

  public async getRole(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId)

    // @ts-expect-error: skip type for now
    return error ? null : (data?.app_metadata?.role || ROLE_USER)
  }

  public async deleteUser(userId: string) {
    const { error } = await this.supabase.auth.admin.deleteUser(userId)

    return !error
  }

  public async postSignUp(userId: string, displayName: string) {
    const pendingId = uuidv4()
    const { error } = await this.supabase.auth.admin.updateUserById(
      userId,
      {
        app_metadata: { role: ROLE_USER },
        user_metadata: { display_name: displayName, pending_id: pendingId }
      }
    )

    return !error ? pendingId : null
  }

  public async getAllUsers() {
    let page = 1
    const perPage = DEFAULT_PAGE_SIZE
    // @ts-expect-error: skip type for now
    let allUsers = []
    let hasMore = true

    while (hasMore) {
      const { data, error } = await this.supabase.auth.admin.listUsers({ page, perPage })
      if (error) {
        console.error('Error fetching users= ', error);
        break
      }

      if (data?.users.length === 0) {
        hasMore = false
      } else {
        // @ts-expect-error: skip type for now
        allUsers = [ ...allUsers, ...data.users ]
        if (data?.nextPage) {
          page++
        } else {
          hasMore = false
        }
      }
    }

    // @ts-expect-error: skip type for now
    return allUsers
  }

  public async getUserByPendingId(pendingId: string) {
    const users = await this.getAllUsers()

    return users.find(user => user?.user_metadata?.pending_id === pendingId)
  }

  public async updateUserByPendingId(pendingId: string, birthdate = null, gender = null, country = null): Promise<boolean> {
    const user = await this.getUserByPendingId(pendingId)
    if (!user?.id) {
      return false
    }
    const { error } = await this.supabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: { pending_id: null, birthdate, gender, country } }
    )

    return !error
  }

  public async getUsersByIds(ids: string[]): Promise<Array<{
    id: string;
    name: string;
    createdAt: Date;
    savedProviders: number;
    receiveMessages: number
  }>> {
    const users = await this.getAllUsers()

    // @ts-expect-error: skip type for now
    return users
      .filter(user => ids.includes(user.id))
      .map(({ id, email, user_metadata, app_metadata }) => ({
        id,
        email,
        name: user_metadata?.display_name,
        role: app_metadata?.role,
        gender: user_metadata?.gender,
        birthdate: user_metadata?.birthdate,
        country: user_metadata?.country
      }))
  }

  public async getUserStats(ids: string[]) {
    const users = await this.getUsersByIds(ids)

    let countryItemsCount = 0
    let genderItemsCount = 0
    let ageItemsCount = 0
    const countryStats = users.reduce((acc, user) => {
      // @ts-expect-error: skip type for now
      if (!STATS_INCLUDES_EMPTY_VALUES && !user?.country) {
        return acc
      }
      // @ts-expect-error: skip type for now
      acc[user.country] = (acc[user.country] || 0) + 1
      countryItemsCount++
      return acc
    }, {})
    const genderStats = users.reduce((acc, user) => {
      // @ts-expect-error: skip type for now
      if (!STATS_INCLUDES_EMPTY_VALUES && !user?.gender) {
        return acc
      }
      // @ts-expect-error: skip type for now
      acc[user.gender] = (acc[user.gender] || 0) + 1
      genderItemsCount++
      return acc;
    }, {})

    const genderPercentages = Object.keys(genderStats).map((gender) => ({
      label: gender,
      // @ts-expect-error: skip type for now
      value: (genderStats[gender] / (genderItemsCount || 1)) * 100,
    }))

    const countryPercentages = Object.keys(countryStats).map((country) => ({
      label: country,
      // @ts-expect-error: skip type for now
      value: (countryStats[country] / (countryItemsCount || 1)) * 100,
    }))

    const ageGroups = {
      '18-25': 0,
      '25-50': 0,
      '50+': 0,
    }

    users.forEach((user) => {
      // @ts-expect-error: skip type for now
      if (!STATS_INCLUDES_EMPTY_VALUES && !user?.birthdate) {
        return
      }
      ageItemsCount++
      // @ts-expect-error: skip type for now
      const age = moment().diff(moment(user.birthdate), 'years')
      if (age >= 18 && age <= 25) {
        ageGroups['18-25']++
      } else if (age > 25 && age <= 50) {
        ageGroups['25-50']++
      } else if (age > 50) {
        ageGroups['50+']++
      } else {
        // @ts-expect-error: skip type for now
        ageGroups.undefined = (ageGroups?.undefined || 0) + 1
      }
    })

    const agePercentages = Object.keys(ageGroups).map((group) => ({
      label: group,
      // @ts-expect-error: skip type for now
      value: (ageGroups[group] / (ageItemsCount || 1)) * 100,
    }))

    return {
      gender: genderPercentages,
      age: agePercentages,
      country: countryPercentages
    }
  }

  private sortBy(sort: string) {
    switch (sort) {
      case SORTING_ORDER_NEW:
        // @ts-expect-error: skip type for now
        return (a, b) => a.created_at < b.created_at ? 1 : -1
      case SORTING_ORDER_OLD:
        // @ts-expect-error: skip type for now
        return (a, b) => a.created_at > b.created_at ? 1 : -1
      default:
        // @ts-expect-error: skip type for now
        return (a, b) => a.created_at < b.created_at ? 1 : -1
    }
  }
}

export default UserService
