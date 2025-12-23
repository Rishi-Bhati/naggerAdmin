
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, Terminal, User } from 'lucide-react'

interface BotError {
    id: number
    user_id: number
    error_type: string
    error_message: string
    stack_trace: string
    timestamp: string
}

export default function ErrorLogsPage() {
    const [errors, setErrors] = useState<BotError[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchErrors()
    }, [])

    const fetchErrors = async () => {
        try {
            const res = await fetch('/api/analytics/errors?limit=50')
            const data = await res.json()
            if (data.success) {
                setErrors(data.errors)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading error logs...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Error Logs</h1>
                <p className="text-gray-500 mt-1">System errors and critical failures.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {errors.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <AlertTriangle className="w-12 h-12 text-green-200 mb-4" />
                        <p>No critical errors recorded. The bot is healthy! 🤖✅</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {errors.map((error) => (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key={error.id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded">
                                                {error.error_type}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center">
                                                <Clock size={12} className="mr-1" />
                                                {new Date(error.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-900">{error.error_message}</h3>
                                    </div>
                                    {error.user_id && (
                                        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            <User size={12} className="mr-1" />
                                            User ID: {error.user_id}
                                        </div>
                                    )}
                                </div>

                                {error.stack_trace && (
                                    <div className="mt-4 bg-gray-900 rounded-lg p-3 overflow-x-auto">
                                        <div className="flex items-center text-gray-400 text-xs mb-2 border-b border-gray-800 pb-2">
                                            <Terminal size={12} className="mr-2" />
                                            Stack Trace
                                        </div>
                                        <pre className="text-xs text-red-300 font-mono">
                                            {error.stack_trace}
                                        </pre>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
