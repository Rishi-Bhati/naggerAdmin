
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({
                success: false,
                message: 'Service role key missing. Cannot sync users. Ensure SUPABASE_SERVICE_ROLE_KEY is in .env.local',
                envCheck: {
                    hasUrl: !!supabaseUrl,
                    hasServiceKey: !!supabaseServiceKey
                }
            }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // 1. Get all unique user_ids from tasks
        const { data: tasks, error: tasksError } = await supabaseAdmin
            .from('tasks')
            .select('user_id, created_at')
            .order('created_at', { ascending: true })

        if (tasksError) throw tasksError

        if (!tasks || tasks.length === 0) {
            return NextResponse.json({ success: true, message: 'No tasks found', synced: 0 })
        }

        // Group by user_id
        const userActivity = new Map<number, { first: string, last: string }>()

        tasks.forEach(task => {
            const current = userActivity.get(task.user_id)
            if (!current) {
                userActivity.set(task.user_id, { first: task.created_at, last: task.created_at })
            } else {
                userActivity.set(task.user_id, { ...current, last: task.created_at })
            }
        })

        const allTaskUserIds = Array.from(userActivity.keys())

        // 2. Get existing users
        const { data: existingUsers, error: usersError } = await supabaseAdmin
            .from('users')
            .select('*')

        if (usersError) throw usersError

        // Detect Primary Key
        let pk = 'id'
        if (existingUsers && existingUsers.length > 0) {
            const keys = Object.keys(existingUsers[0])
            if (keys.includes('user_id')) pk = 'user_id'
        }

        const existingUserIds = new Set(existingUsers?.map(u => u[pk]) || [])
        const missingIds = allTaskUserIds.filter(id => !existingUserIds.has(id))

        if (missingIds.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No missing users found',
                synced: 0,
                debugSchema: existingUsers?.[0]
            })
        }

        // 3. Insert missing
        const usersToInsert = missingIds.map(id => {
            const activity = userActivity.get(id)!
            const newUser: any = {
                created_at: activity.first,
                last_active_at: activity.last,
                // Add any other required fields with defaults
                // is_active: true ?
            }
            newUser[pk] = id
            return newUser
        })

        const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert(usersToInsert)

        if (insertError) throw insertError

        return NextResponse.json({
            success: true,
            message: `Synced ${missingIds.length} users`,
            synced: missingIds.length,
            details: usersToInsert
        })

    } catch (error: any) {
        console.error('Sync error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
