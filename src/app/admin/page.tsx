
import { getDashboardStats, getTaskCreationHistory, getAvgProcessingTime, getResponseTimeHistory } from '@/services/analytics'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const history = await getTaskCreationHistory()
    const avgReplyTime = await getAvgProcessingTime()
    const timingHistory = await getResponseTimeHistory()

    return <DashboardClient
        stats={stats}
        history={history}
        avgReplyTime={avgReplyTime}
        timingHistory={timingHistory}
    />
}
