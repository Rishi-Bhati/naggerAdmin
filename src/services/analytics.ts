
import { supabase } from '@/utils/supabase'

export interface DashboardStats {
    totalUsers: number
    activeUsers: number
    totalTasks: number
    activeTasks: number
    newUsersLast7Days: number
}

export interface ChartData {
    date: string
    count: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date().toISOString()

    // Total Tasks
    const { count: totalTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })

    // Active Tasks (not completed and deadline > now)
    const { count: activeTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('completed', false)
        .gt('deadline', now)

    // Total Registered Users (from users table)
    const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

    // Active Users (last_active_at in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const isoSevenDaysAgo = sevenDaysAgo.toISOString()

    const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', isoSevenDaysAgo)

    // New Users (created_at in last 7 days)
    const { count: newUsersLast7Days } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', isoSevenDaysAgo)

    return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalTasks: totalTasks || 0,
        activeTasks: activeTasks || 0,
        newUsersLast7Days: newUsersLast7Days || 0
    }
}

export async function getTaskCreationHistory(): Promise<ChartData[]> {
    // Get tasks created in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data } = await supabase
        .from('tasks')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

    if (!data) return []

    // Group by date
    const grouped = data.reduce((acc, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString()
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([date, count]) => ({
        date,
        count
    }))
}
