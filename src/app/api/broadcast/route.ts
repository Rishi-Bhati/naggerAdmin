
import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { broadcastMessage } from '@/services/telegram'

export async function POST(request: Request) {
    try {
        const { message } = await request.json()

        if (!message) {
            return NextResponse.json(
                { success: false, message: 'Message content is required' },
                { status: 400 }
            )
        }

        // Get all unique users who have tasks (Active users)
        // In a real app with a Users table, we'd query that.
        const { data: users, error } = await supabase
            .from('tasks')
            .select('user_id')

        if (error) throw error

        // Distinct user IDs
        const userIds = Array.from(new Set(users.map((u) => u.user_id)))

        if (userIds.length === 0) {
            return NextResponse.json({
                success: true,
                result: { successCount: 0, failureCount: 0, message: 'No users found to broadcast to.' }
            })
        }

        const result = await broadcastMessage(userIds, message)

        return NextResponse.json({ success: true, result })
    } catch (error: any) {
        console.error('Broadcast error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to send broadcast', error: error.message },
            { status: 500 }
        )
    }
}
