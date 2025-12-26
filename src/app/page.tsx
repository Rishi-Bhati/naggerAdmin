import { getBotStatus } from '@/services/status'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, XCircle, Wrench, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StatusPage() {
    const statusData = await getBotStatus()
    const { status, message, lastChecked } = statusData

    const bgColors = {
        operational: 'bg-green-50',
        issues: 'bg-yellow-50',
        down: 'bg-red-50',
        maintenance: 'bg-blue-50'
    }

    const textColors = {
        operational: 'text-green-700',
        issues: 'text-yellow-700',
        down: 'text-red-700',
        maintenance: 'text-blue-700'
    }

    const ringColors = {
        operational: 'ring-green-600/20',
        issues: 'ring-yellow-600/20',
        down: 'ring-red-600/20',
        maintenance: 'ring-blue-600/20'
    }

    const StatusIcon = {
        operational: CheckCircle,
        issues: AlertTriangle,
        down: XCircle,
        maintenance: Wrench
    }[status]

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                        Nagger Bot Status
                    </h1>
                    <p className="text-gray-500">Live system operational capability</p>
                </div>

                {/* Status Card */}
                <div className={`
                    rounded-3xl p-10 flex flex-col items-center 
                    ${bgColors[status]} 
                    ring-1 ring-inset ${ringColors[status]}
                    shadow-xl
                `}>
                    <div className={`p-4 rounded-full bg-white shadow-sm mb-6 ${textColors[status]}`}>
                        <StatusIcon size={64} strokeWidth={1.5} />
                    </div>

                    <h2 className={`text-3xl font-bold mb-2 capitalize ${textColors[status]}`}>
                        {status.replace('-', ' ')}
                    </h2>

                    <p className={`text-lg opacity-90 font-medium ${textColors[status]}`}>
                        {message}
                    </p>

                    <div className="mt-8 pt-6 border-t border-black/5 w-full">
                        <p className={`text-xs uppercase tracking-widest opacity-60 font-semibold mb-1 ${textColors[status]}`}>Last Checked</p>
                        <p className={`font-mono text-sm opacity-80 ${textColors[status]}`}>
                            {new Date(lastChecked).toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                {/* Footer / Login Link */}
                <div className="pt-8">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Admin Login <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
