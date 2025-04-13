'use client'
import { useState } from 'react'

export default function Chatbot() {
  const [message, setMessage] = useState('')
  const [chatLog, setChatLog] = useState<{ sender: string, text: string }[]>([])
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMsg = { sender: 'user', text: message }
    setChatLog(prev => [...prev, userMsg])
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      const aiMsg = { sender: 'ai', text: data.reply || 'Tidak ada respon.' }
      setChatLog(prev => [...prev, aiMsg])
    } catch (err) {
      setChatLog(prev => [...prev, { sender: 'ai', text: 'Terjadi kesalahan saat menghubungi AI.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
        🤖 Gemini Flash Chatbot
      </h1>

      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-6 space-y-4 overflow-y-auto h-[500px]">
        {chatLog.map((chat, idx) => (
          <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-xl max-w-[75%] text-sm whitespace-pre-wrap
              ${chat.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              {chat.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-400">AI sedang mengetik...</div>
        )}
      </div>

      <form onSubmit={handleSend} className="w-full max-w-2xl mt-6 flex gap-4">
        <input
          className="flex-1 p-3 rounded-full bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
          placeholder="Tulis pertanyaanmu di sini..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-white font-semibold shadow-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300"
        >
          Kirim 🚀
        </button>
      </form>
    </div>
  )
}