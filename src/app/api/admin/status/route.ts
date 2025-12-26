
import { NextResponse } from 'next/server'
import { setManualStatus, getManualStatus } from '@/services/status'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { status } = body

        if (!['auto', 'operational', 'issues', 'down', 'maintenance'].includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 })
        }

        setManualStatus(status)
        return NextResponse.json({ success: true, status: getManualStatus() })
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
    }
}

export async function GET() {
    return NextResponse.json({ status: getManualStatus() })
}
