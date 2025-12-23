
import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    try {
        const { data: errors, count, error } = await supabase
            .from('bot_errors')
            .select('*', { count: 'exact' })
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({ success: true, errors, count })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch errors', error: error.message },
            { status: 500 }
        )
    }
}
