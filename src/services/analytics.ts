
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

export interface ProcessingTimeData {
    timestamp: string
    duration: number
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

    // FETCH ALL TASK HISTORY TO DERIVE USER STATS
    // Since we can't trust the 'users' table or sync it (missing admin key),
    // we derive stats from the 'tasks' table which is the source of truth for activity.
    const { data: allTasks } = await supabase
        .from('tasks')
        .select('user_id, created_at')

    const tasks = allTasks || []

    const uniqueUserIds = new Set(tasks.map(t => t.user_id))
    const totalUsers = uniqueUserIds.size // True "Total Users" count

    // Active Users (active in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Users who have a task created in the last 7 days
    const activeUserCount = new Set(
        tasks
            .filter(t => new Date(t.created_at) >= sevenDaysAgo)
            .map(t => t.user_id)
    ).size

    // New Users (First seen in last 7 days)
    // Find the earliest task for each user
    const firstSeen = new Map<number, Date>()
    tasks.forEach(t => {
        const date = new Date(t.created_at)
        if (!firstSeen.has(t.user_id) || date < firstSeen.get(t.user_id)!) {
            firstSeen.set(t.user_id, date)
        }
    })

    let newUsersLast7Days = 0
    firstSeen.forEach(date => {
        if (date >= sevenDaysAgo) {
            newUsersLast7Days++
        }
    })

    return {
        totalUsers: totalUsers,
        activeUsers: activeUserCount,
        totalTasks: totalTasks || 0,
        activeTasks: activeTasks || 0,
        newUsersLast7Days: newUsersLast7Days
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

export async function getAvgProcessingTime(): Promise<number> {
    const { data, error } = await supabase
        .from('bot_metrics')
        .select('processing_time_ms')
        .order('timestamp', { ascending: false })
        .limit(1000)

    if (error || !data || data.length === 0) {
        return 0
    }

    const total = data.reduce((acc, curr) => acc + curr.processing_time_ms, 0)
    return Math.round(total / data.length)
}

export async function getResponseTimeHistory(): Promise<ProcessingTimeData[]> {
    const { data, error } = await supabase
        .from('bot_metrics')
        .select('timestamp, processing_time_ms')
        .order('timestamp', { ascending: true }) // Oldest first, so newest appears on the right
        .limit(50) // Last 50 commands for the chart

    if (error || !data) return []

    // No need to reverse - ascending order means oldest on left, newest on right
    return data.map(d => ({
        timestamp: new Date(d.timestamp).toLocaleTimeString(),
        duration: d.processing_time_ms
    }))
}
