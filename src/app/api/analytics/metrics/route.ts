
import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Calculate average processing time from bot_metrics
        // We'll take the average of the last 1000 commands to ensure it's "current"
        const { data, error } = await supabase
            .from('bot_metrics')
            .select('processing_time_ms')
            .order('timestamp', { ascending: false })
            .limit(1000)

        if (error) throw error

        if (!data || data.length === 0) {
            return NextResponse.json({ success: true, avgReplyTimeMs: 0 })
        }

        const total = data.reduce((acc, curr) => acc + curr.processing_time_ms, 0)
        const avg = total / data.length

        return NextResponse.json({ success: true, avgReplyTimeMs: Math.round(avg) })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch metrics', error: error.message },
            { status: 500 }
        )
    }
}
