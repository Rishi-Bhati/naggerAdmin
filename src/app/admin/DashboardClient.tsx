'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import GridLayout from 'react-grid-layout/legacy'
import 'react-grid-layout/css/styles.css'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts'
import { Users, Clock, Activity, User, AlertTriangle, Settings, RefreshCw, GripVertical, Maximize2 } from 'lucide-react'
import type { DashboardStats, ChartData, ProcessingTimeData } from '@/services/analytics'

export default function DashboardClient({
    stats,
    history,
    avgReplyTime,
    timingHistory
}: {
    stats: DashboardStats,
    history: ChartData[],
    avgReplyTime: number,
    timingHistory: ProcessingTimeData[]
}) {
    const [statusOverride, setStatusOverride] = useState<string>('auto')
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [containerWidth, setContainerWidth] = useState(1200)

    useEffect(() => {
        fetch('/api/admin/status').then(r => r.json()).then(d => setStatusOverride(d.status))
    }, [])

    useEffect(() => {
        const updateWidth = () => {
            const container = document.getElementById('grid-container')
            if (container) setContainerWidth(container.offsetWidth)
        }
        updateWidth()
        window.addEventListener('resize', updateWidth)
        return () => window.removeEventListener('resize', updateWidth)
    }, [])

    const updateStatus = async (newStatus: string) => {
        setLoadingStatus(true)
        try {
            const res = await fetch('/api/admin/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            const data = await res.json()
            if (data.success) setStatusOverride(data.status)
        } finally {
            setLoadingStatus(false)
        }
    }

    // Compute chart statistics
    const taskStats = useMemo(() => {
        if (!history.length) return { min: 0, max: 0, avg: 0, total: 0, trend: 'stable' }
        const counts = history.map(h => h.count)
        const total = counts.reduce((a, b) => a + b, 0)
        const avg = Math.round(total / counts.length)
        const min = Math.min(...counts)
        const max = Math.max(...counts)
        const firstHalf = counts.slice(0, Math.floor(counts.length / 2))
        const secondHalf = counts.slice(Math.floor(counts.length / 2))
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
        const trend = secondAvg > firstAvg * 1.1 ? 'up' : secondAvg < firstAvg * 0.9 ? 'down' : 'stable'
        return { min, max, avg, total, trend }
    }, [history])

    const responseStats = useMemo(() => {
        if (!timingHistory.length) return { min: 0, max: 0, avg: 0, peakTime: '' }
        const durations = timingHistory.map(t => t.duration)
        const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        const min = Math.min(...durations)
        const max = Math.max(...durations)
        const peakEntry = timingHistory.find(t => t.duration === max)
        return { min, max, avg, peakTime: peakEntry?.timestamp || '' }
    }, [timingHistory])

    const defaultLayout = [
        { i: 'stats', x: 0, y: 0, w: 12, h: 2, static: true },
        { i: 'taskChart', x: 0, y: 2, w: 8, h: 5, minW: 4, minH: 3 },
        { i: 'responseChart', x: 8, y: 2, w: 4, h: 5, minW: 3, minH: 3 },
        { i: 'systemStatus', x: 8, y: 7, w: 4, h: 4, minW: 3, minH: 3 },
        { i: 'statusOverride', x: 0, y: 7, w: 4, h: 4, minW: 3, minH: 3 },
    ]

    const [layout, setLayout] = useState(defaultLayout)

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }
    const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Drag widgets to rearrange • Resize from corners</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm text-gray-600">
                    Last updated: <ClientTime />
                </div>
            </div>

            <div id="grid-container">
                <GridLayout
                    className="layout"
                    layout={layout}
                    cols={12}
                    rowHeight={60}
                    width={containerWidth}
                    onLayoutChange={(newLayout) => setLayout(newLayout)}
                    draggableHandle=".drag-handle"
                    isResizable={true}
                    resizeHandles={['se']}
                >
                    {/* Stats Row */}
                    <div key="stats" className="bg-transparent">
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full"
                        >
                            <StatsCard title="Total Registered" value={stats.totalUsers} icon={Users} color="blue" variants={item} />
                            <StatsCard title="Active Users (7d)" value={stats.activeUsers} icon={Activity} color="green" variants={item} />
                            <StatsCard title="Avg Reply Time" value={`${avgReplyTime}ms`} icon={Clock} color="orange" variants={item} />
                            <StatsCard title="New Users (7d)" value={stats.newUsersLast7Days} icon={User} color="purple" variants={item} />
                        </motion.div>
                    </div>

                    {/* Task Creation Chart */}
                    <div key="taskChart">
                        <WidgetContainer title="Task Creation Activity" subtitle="New tasks created over the last 7 days">
                            <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                                <div className="bg-blue-50 rounded-lg p-2 text-center">
                                    <div className="text-blue-600 font-bold">{taskStats.total}</div>
                                    <div className="text-blue-500">Total</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-2 text-center">
                                    <div className="text-green-600 font-bold">{taskStats.avg}</div>
                                    <div className="text-green-500">Avg/Day</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-2 text-center">
                                    <div className="text-orange-600 font-bold">{taskStats.max}</div>
                                    <div className="text-orange-500">Peak</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-2 text-center">
                                    <div className="text-purple-600 font-bold capitalize">{taskStats.trend}</div>
                                    <div className="text-purple-500">Trend</div>
                                </div>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} width={25} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </WidgetContainer>
                    </div>

                    {/* Response Time Chart */}
                    <div key="responseChart">
                        <WidgetContainer title="Response Time Trends" subtitle="Processing time (ms) for commands">
                            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                                <div className="bg-green-50 rounded-lg p-2 text-center">
                                    <div className="text-green-600 font-bold">{responseStats.min}ms</div>
                                    <div className="text-green-500">Min</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-2 text-center">
                                    <div className="text-orange-600 font-bold">{responseStats.avg}ms</div>
                                    <div className="text-orange-500">Avg</div>
                                </div>
                                <div className="bg-red-50 rounded-lg p-2 text-center">
                                    <div className="text-red-600 font-bold">{responseStats.max}ms</div>
                                    <div className="text-red-500">Max</div>
                                </div>
                            </div>
                            {responseStats.peakTime && (
                                <p className="text-xs text-gray-500 mb-2">Peak at: {responseStats.peakTime}</p>
                            )}
                            <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timingHistory}>
                                        <defs>
                                            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FB923C" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="timestamp" hide />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} width={30} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="duration" stroke="#FB923C" strokeWidth={2} fillOpacity={1} fill="url(#colorTime)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </WidgetContainer>
                    </div>

                    {/* System Status */}
                    <div key="systemStatus">
                        <WidgetContainer title="System Status" subtitle="Current operational state">
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 text-sm">Bot Status</h4>
                                        <p className="text-xs text-green-600 font-medium capitalize">{statusOverride === 'auto' ? 'Auto (Operational)' : statusOverride}</p>
                                    </div>
                                </div>
                                <Link href="/admin/errors" className="block">
                                    <div className="p-3 bg-red-50 hover:bg-red-100 transition-colors rounded-lg flex items-center space-x-3 cursor-pointer">
                                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-red-900 text-sm">Error Logs</h4>
                                            <p className="text-xs text-red-700">View system failures</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </WidgetContainer>
                    </div>

                    {/* Status Override */}
                    <div key="statusOverride">
                        <WidgetContainer title="Status Override" subtitle="Manually control public status">
                            <div className="space-y-2">
                                <StatusButton label="Auto" active={statusOverride === 'auto'} onClick={() => updateStatus('auto')} icon={RefreshCw} color="blue" loading={loadingStatus} />
                                <StatusButton label="Operational" active={statusOverride === 'operational'} onClick={() => updateStatus('operational')} icon={Activity} color="green" loading={loadingStatus} />
                                <StatusButton label="Issues" active={statusOverride === 'issues'} onClick={() => updateStatus('issues')} icon={AlertTriangle} color="yellow" loading={loadingStatus} />
                                <StatusButton label="Down" active={statusOverride === 'down'} onClick={() => updateStatus('down')} icon={AlertTriangle} color="red" loading={loadingStatus} />
                            </div>
                        </WidgetContainer>
                    </div>
                </GridLayout>
            </div>
        </div>
    )
}

function WidgetContainer({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
                <div className="drag-handle cursor-move p-1 hover:bg-gray-100 rounded transition-colors">
                    <GripVertical size={16} className="text-gray-400" />
                </div>
            </div>
            <div className="flex-1 overflow-hidden">{children}</div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, color, variants }: any) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        purple: 'bg-purple-50 text-purple-600',
    }
    const colorClass = colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600'

    return (
        <motion.div variants={variants} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-gray-500">{title}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
            <div className={`p-2 rounded-xl ${colorClass}`}>
                <Icon size={20} />
            </div>
        </motion.div>
    )
}

function ClientTime() {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    if (!mounted) return null
    return <>{new Date().toLocaleTimeString()}</>
}

function StatusButton({ label, active, onClick, icon: Icon, color, loading }: any) {
    const bgColors = {
        blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        green: 'bg-green-50 text-green-700 ring-green-600/20',
        yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
        red: 'bg-red-50 text-red-700 ring-red-600/20',
    }
    const activeClass = active
        ? `${bgColors[color as keyof typeof bgColors]} ring-1 ring-inset shadow-sm`
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="flex items-center gap-2">
                <Icon size={14} />
                {label}
            </div>
            {active && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
        </button>
    )
}
