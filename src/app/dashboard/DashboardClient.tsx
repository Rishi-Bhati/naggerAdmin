
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
} from 'recharts'
import { Users, CheckCircle, Clock, Activity, MessageSquare, User, AlertTriangle } from 'lucide-react'
import type { DashboardStats, ChartData } from '@/services/analytics'

export default function DashboardClient({
    stats,
    history,
    avgReplyTime
}: {
    stats: DashboardStats,
    history: ChartData[],
    avgReplyTime: number
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

                {/* Info / Secondary Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900">Bot Health</h3>

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

                        <div className="p-4 bg-gray-50 rounded-lg flex items-start space-x-4">
                            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Avg Reply Time</h4>
                                <p className="text-sm text-gray-500">{avgReplyTime}ms</p>
                            </div>
                        </div>

                        <Link href="/dashboard/errors" className="block">
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
