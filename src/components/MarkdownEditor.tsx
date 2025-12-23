
'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Eye, PenLine } from 'lucide-react'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Tabs */}
            <div className="flex items-center border-b border-gray-200 bg-gray-50">
                <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'write'
                            ? 'bg-white text-blue-600 border-r border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <PenLine size={16} />
                    <span>Write</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'preview'
                            ? 'bg-white text-blue-600 border-x border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Eye size={16} />
                    <span>Preview</span>
                </button>
            </div>

            {/* Content */}
            <div className="p-4" style={{ minHeight: '200px' }}>
                {activeTab === 'write' ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full min-h-[200px] text-gray-900 bg-white resize-y focus:outline-none" // Explicit text/bg colors
                        placeholder={placeholder}
                    />
                ) : (
                    <div className="prose prose-sm max-w-none text-gray-900">
                        {value.trim() ? (
                            <ReactMarkdown>{value}</ReactMarkdown>
                        ) : (
                            <p className="text-gray-400 italic">Nothing to preview</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
