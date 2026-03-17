import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import type { ChatMessage, Dish, BusinessUnit } from '../types'
import { generateResponse } from '../utils/chatEngine'

interface CarnecitaDrawerProps {
  dishes: Dish[]
  units: BusinessUnit[]
  onOpenChange?: (open: boolean) => void
}

const SUGGESTED_QUESTIONS = [
  '¿Qué platos me dejan menos margen?',
  '¿Cuál es mi mejor producto?',
  '¿Qué unidad está rindiendo peor?',
  '¿Qué debería eliminar del menú?',
]

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hola, soy Carnecita. Dime qué quieres revisar y te digo qué hacer.',
  timestamp: new Date(),
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

function renderContent(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-white font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export default function CarnecitaDrawer({ dishes, units, onOpenChange }: CarnecitaDrawerProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  function setOpenWithCallback(value: boolean) {
    setOpen(value)
    onOpenChange?.(value)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Notify parent when open state changes
  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  function sendMessage(text: string) {
    if (!text.trim() || typing) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const response = generateResponse(text, dishes, units)
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setTyping(false)
    }, 900)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Backdrop for mobile/tablet */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 xl:hidden"
          onClick={() => setOpenWithCallback(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col
          w-full sm:w-[380px]
          bg-[#1a1a1a] border-l border-[#2a2a2a]
          transition-transform duration-200
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2a] flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-xs">BH</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight">Carnecita</p>
            <p className="text-gray-500 text-xs">Tu asistente de Beef House</p>
          </div>
          <button
            onClick={() => setOpenWithCallback(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* Suggested questions */}
        <div className="px-4 pt-3 pb-2 border-b border-[#2a2a2a] flex gap-2 flex-wrap flex-shrink-0">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={typing}
              className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user'
                    ? 'bg-amber-500/20 border border-amber-500/30'
                    : 'bg-[#2a2a2a] border border-[#3a3a3a]'
                }`}
              >
                {msg.role === 'user' ? (
                  <User size={13} className="text-amber-400" />
                ) : (
                  <Bot size={13} className="text-gray-400" />
                )}
              </div>

              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-black font-medium rounded-tr-sm'
                      : 'bg-[#252525] text-gray-300 border border-[#2a2a2a] rounded-tl-sm'
                  }`}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>
                      {renderContent(line)}
                    </p>
                  ))}
                </div>
                <span className="text-gray-600 text-xs mt-1 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-[#2a2a2a] border border-[#3a3a3a]">
                <Bot size={13} className="text-gray-400" />
              </div>
              <div className="bg-[#252525] border border-[#2a2a2a] rounded-xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#2a2a2a] flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntame qué decisiones tomar hoy"
              disabled={typing}
              className="flex-1 bg-[#252525] border border-[#3a3a3a] text-white text-sm rounded-lg px-4 py-2.5 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all duration-150 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              className="w-10 h-10 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150 flex-shrink-0"
            >
              <Send size={15} className="text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating button — only visible when drawer is closed */}
      {!open && (
        <button
          onClick={() => setOpenWithCallback(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-amber-500 hover:bg-amber-400 text-white transition-all duration-200"
        >
          <MessageCircle size={22} />
          <span className="text-sm font-semibold">Carnecita</span>
        </button>
      )}
    </>
  )
}

