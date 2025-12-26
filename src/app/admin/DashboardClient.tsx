'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
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
import { Users, Clock, Activity, MessageSquare, User, AlertTriangle, Settings, RefreshCw } from 'lucide-react'
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
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    const [statusOverride, setStatusOverride] = useState<string>('auto')
    const [loadingStatus, setLoadingStatus] = useState(false)

    useEffect(() => {
        fetch('/api/admin/status').then(r => r.json()).then(d => setStatusOverride(d.status))
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of your bot's performance</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm text-gray-600">
                    Last updated: <ClientTime />
                </div>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatsCard
                    title="Total Registered"
                    value={stats.totalUsers}
                    icon={Users}
                    color="blue"
                    variants={item}
                />
                <StatsCard
                    title="Active Users (7d)"
                    value={stats.activeUsers}
                    icon={Activity}
                    color="green"
                    variants={item}
                />
                <StatsCard
                    title="Avg Reply Time"
                    value={`${avgReplyTime}ms`}
                    icon={Clock}
                    color="orange"
                    variants={item}
                />
                <StatsCard
                    title="New Users (7d)"
                    value={stats.newUsersLast7Days}
                    icon={User}
                    color="purple"
                    variants={item}
                />
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Task Creation Activity</h3>
                        <p className="text-sm text-gray-500">New tasks created over the last 7 days</p>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#3B82F6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Response Time Chart & Bot Health */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Response Time Trends</h3>
                            <p className="text-sm text-gray-500">Processing time (ms) for last 50 commands</p>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timingHistory}>
                                    <defs>
                                        <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FB923C" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="timestamp"
                                        hide
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 10 }}
                                        width={30}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#FB923C', strokeWidth: 1 }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="duration"
                                        stroke="#FB923C"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorTime)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Bot Health Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900">System Status</h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg flex items-start space-x-4">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Status</h4>
                                    <p className="text-sm text-green-600 font-medium">Operational</p>
                                </div>
                            </div>

                            <Link href="/admin/errors" className="block">
                                <div className="p-4 bg-red-50 hover:bg-red-100 transition-colors rounded-lg flex items-start space-x-4 cursor-pointer">
                                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-red-900">Error Logs</h4>
                                        <p className="text-xs text-red-700">View system failures & exceptions</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Status Override Control */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Status Override</h3>
                            <Settings size={18} className="text-gray-400" />
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-500">Manually control the public status page.</p>

                            <div className="grid grid-cols-1 gap-2">
                                <StatusButton
                                    label="Auto (Health Check)"
                                    active={statusOverride === 'auto'}
                                    onClick={() => updateStatus('auto')}
                                    icon={RefreshCw}
                                    color="blue"
                                    loading={loadingStatus}
                                />
                                <StatusButton
                                    label="Force Operational"
                                    active={statusOverride === 'operational'}
                                    onClick={() => updateStatus('operational')}
                                    icon={Activity}
                                    color="green"
                                    loading={loadingStatus}
                                />
                                <StatusButton
                                    label="Force Issues"
                                    active={statusOverride === 'issues'}
                                    onClick={() => updateStatus('issues')}
                                    icon={AlertTriangle}
                                    color="yellow"
                                    loading={loadingStatus}
                                />
                                <StatusButton
                                    label="Force Down"
                                    active={statusOverride === 'down'}
                                    onClick={() => updateStatus('down')}
                                    icon={AlertTriangle}
                                    color="red"
                                    loading={loadingStatus}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
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

    // Explicit type safety for colors
    const colorClass = colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';

    return (
        <motion.div
            variants={variants}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between"
        >
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon size={24} />
            </div>
        </motion.div>
    )
}

function ClientTime() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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
            className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${activeClass}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} />
                {label}
            </div>
            {active && <div className="w-2 h-2 rounded-full bg-current" />}
        </button>
    )
}
