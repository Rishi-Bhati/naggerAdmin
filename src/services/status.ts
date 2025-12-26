type StatusType = 'operational' | 'issues' | 'down' | 'maintenance'
type OverrideType = 'auto' | StatusType

// Use globalThis to persist state across module boundaries in Next.js
// This is necessary because API routes and Server Components can run in different module contexts
declare global {
    // eslint-disable-next-line no-var
    var __manualStatus: OverrideType | undefined
}

// Initialize if not already set
if (typeof globalThis.__manualStatus === 'undefined') {
    globalThis.__manualStatus = 'auto'
}

interface BotStatus {
    status: StatusType
    message: string
    source: 'auto' | 'manual'
    lastChecked: string
}

export async function getBotStatus(): Promise<BotStatus> {
    const manualStatus = globalThis.__manualStatus || 'auto'

    // 1. Check for manual override
    if (manualStatus !== 'auto') {
        return {
            status: manualStatus,
            message: getMessageForStatus(manualStatus),
            source: 'manual',
            lastChecked: new Date().toISOString()
        }
    }

    // 2. Auto check
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

        const res = await fetch('https://thenagger.onrender.com/health', {
            signal: controller.signal,
            cache: 'no-store'
        })
        clearTimeout(timeoutId)

        if (res.ok) {
            return {
                status: 'operational',
                message: 'All systems operational',
                source: 'auto',
                lastChecked: new Date().toISOString()
            }
        } else {
            return {
                status: 'issues',
                message: `Health check returned ${res.status}`,
                source: 'auto',
                lastChecked: new Date().toISOString()
            }
        }
    } catch (error) {
        return {
            status: 'down',
            message: 'Bot is unreachable',
            source: 'auto',
            lastChecked: new Date().toISOString()
        }
    }
}

export function setManualStatus(status: OverrideType) {
    globalThis.__manualStatus = status
}

export function getManualStatus(): OverrideType {
    return globalThis.__manualStatus || 'auto'
}

function getMessageForStatus(status: StatusType): string {
    switch (status) {
        case 'operational': return 'System forcibly marked as operational.'
        case 'issues': return 'Performance issues reported.'
        case 'down': return 'Major outage.'
        case 'maintenance': return 'Scheduled maintenance in progress.'
        default: return 'Unknown status'
    }
}
