
import { supabase } from '@/utils/supabase'

export interface DetailedUserStats {
    totalRegistered: number
    activeUsers: number
    newUsersLast7Days: number
}

// NOTE: This now uses the `users` table we updated in database.py
export async function getUserStats(): Promise<DetailedUserStats> {
    const { count: totalRegistered } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

    // Active in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const isoSevenDaysAgo = sevenDaysAgo.toISOString()

    const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', isoSevenDaysAgo)

    const { count: newUsersLast7Days } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', isoSevenDaysAgo)

    return {
        totalRegistered: totalRegistered || 0,
        activeUsers: activeUsers || 0,
        newUsersLast7Days: newUsersLast7Days || 0
    }
}
