
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, AlertCircle, CheckCircle } from 'lucide-react'
import MarkdownEditor from '@/components/MarkdownEditor'

export default function BroadcastPage() {
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [result, setResult] = useState<{ successCount: number; failureCount: number } | null>(null)
    const [errorMessage, setErrorMessage] = useState('')

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        if (!confirm('Are you sure you want to send this message to ALL users?')) {
            return
        }

        setLoading(true)
        setStatus('idle')
        setErrorMessage('')

        try {
            const res = await fetch('/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            })

            const data = await res.json()

            if (data.success) {
                setStatus('success')
                setResult(data.result)
                setMessage('')
            } else {
                setStatus('error')
                setErrorMessage(data.message || data.error || 'Unknown error from server')
            }
        } catch (error: any) {
            setStatus('error')
            setErrorMessage(error.message || 'Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Broadcast Message</h1>
                <p className="text-gray-500 mt-1">Send a notification to all bot users.</p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message Content (Markdown supported)</label>
                        <MarkdownEditor
                            value={message}
                            onChange={(val) => setMessage(val)}
                            placeholder="Hello everyone! We have a new update..."
                        />
                        <p className="text-xs text-gray-400 mt-2 text-right">
                            {message.length} characters
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Target: All Users
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${loading || !message.trim()
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span>Send Broadcast</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            {status === 'success' && result && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start space-x-4"
                >
                    <CheckCircle className="text-green-600 shrink-0" />
                    <div>
                        <h4 className="font-medium text-green-900">Broadcast Sent Successfully</h4>
                        <p className="text-sm text-green-700 mt-1">
                            Sent to {result.successCount} users. Failed for {result.failureCount} users.
                        </p>
                    </div>
                </motion.div>
            )}

            {status === 'error' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-4"
                >
                    <AlertCircle className="text-red-600 shrink-0" />
                    <div>
                        <h4 className="font-medium text-red-900">Failed to Send Broadcast</h4>
                        <p className="text-sm text-red-700 mt-1">
                            {errorMessage || 'Something went wrong. Please check the logs and try again.'}
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
