
import { getDashboardStats, getTaskCreationHistory } from '@/services/analytics'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

async function getAvgReplyTime() {
    try {
        const res = await fetch('http://localhost:3000/api/analytics/metrics', { cache: 'no-store' })
        const data = await res.json()
        return data.avgReplyTimeMs || 0
    } catch {
        return 0
    }
}

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const history = await getTaskCreationHistory()
    const avgReplyTime = await getAvgReplyTime()

    return <DashboardClient stats={stats} history={history} avgReplyTime={avgReplyTime} />
}
