import { NextResponse } from 'next/server'
import { getAvgProcessingTime } from '@/services/analytics'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const avgReplyTimeMs = await getAvgProcessingTime()
        return NextResponse.json({ success: true, avgReplyTimeMs })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch metrics', error: error.message },
            { status: 500 }
        )
    }
}
