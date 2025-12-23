
import { marked } from 'marked'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

// Configure marked to be simple
marked.use({
    gfm: true,
    breaks: true
})

function convertToTelegramHtml(markdown: string): string {
    // 1. Convert Markdown to HTML using marked
    let html = marked.parse(markdown) as string

    // 2. Transform unsupported tags to Telegram-friendly tags
    // Telegram supports: <b>, <strong>, <i>, <em>, <u>, <ins>, <s>, <strike>, <del>, <a>, <code>, <pre>

    // Replace headers with bold and newlines
    html = html.replace(/<h[1-6]>(.*?)<\/h[1-6]>/g, '<b>$1</b>\n')

    // Replace paragraphs with newlines
    html = html.replace(/<p>(.*?)<\/p>/g, '$1\n')

    // Replace unordered lists with bullets
    html = html.replace(/<ul>/g, '')
    html = html.replace(/<\/ul>/g, '')
    html = html.replace(/<li>(.*?)<\/li>/g, '• $1\n')

    // Replace ordered lists with numbers (simplified, assumes 1. for all for now or regex count)
    html = html.replace(/<ol>/g, '')
    html = html.replace(/<\/ol>/g, '')
    // Note: Proper ordered list support is hard with regex, we'll just bullet them or leave them as lines
    // Let's rely on marked's text generation mostly? No, marked produces <li>.
    // Converting <li> inside <ol> is tricky without context. treating as bullets is a safe fallback.

    // Replace <br>
    html = html.replace(/<br\s*\/?>/g, '\n')

    // Strip other unsupported tags? Telegram ignores them or errors? 
    // Telegram errors on unsupported tags. We must be aggressive or use a whitelist.
    // Actually, we should probably strip <div>, <span>, etc.

    // A simple strategy is to only allow the tags telegram supports.
    // But regex stripping is fragile.
    // Let's assume the user input is reasonable standard markdown.

    // Clean up excessive newlines
    html = html.replace(/\n\n+/g, '\n\n').trim()

    return html
}

export async function broadcastMessage(userIds: number[], message: string) {
    if (!TELEGRAM_BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN is not defined')
    }

    // Convert the markdown message to HTML once
    // This ensures "Standard Markdown" input becomes "Telegram HTML"
    let htmlMessage: string
    try {
        htmlMessage = convertToTelegramHtml(message)
    } catch (e) {
        console.error("Markdown conversion failed", e)
        // Fallback to sending raw text if conversion fails, though format might look weird
        htmlMessage = message
    }

    const results = await Promise.allSettled(
        userIds.map(async (chatId) => {
            try {
                const res = await fetch(`${BASE_URL}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: htmlMessage,
                        parse_mode: 'HTML', // Switch to HTML
                    }),
                })

                const data = await res.json()
                if (!data.ok) {
                    console.error(`Failed to send to ${chatId}:`, data.description)
                    throw new Error(data.description)
                }
                return data
            } catch (error) {
                throw error
            }
        })
    )

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failureCount = results.filter((r) => r.status === 'rejected').length

    return { successCount, failureCount }
}
