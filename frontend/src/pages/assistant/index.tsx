import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Loader2, Send, ShieldAlert, Sparkles, User as UserIcon } from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

interface ChatResponse {
  reply: string
  suggestions: string[]
  disclaimer: string
}

const INITIAL_SUGGESTIONS = [
  'Someone is unconscious',
  'How do I do CPR?',
  'Someone is choking',
  'Severe bleeding',
  'What to do in a flood?',
]

/** Renders **bold** and line breaks from the assistant's markdown-ish replies. */
function FormattedText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, lineIndex) => (
        <p key={lineIndex} className={cn(lineIndex > 0 && 'mt-1.5', line === '' && 'h-1')}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={partIndex} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={partIndex}>{part}</span>
            ),
          )}
        </p>
      ))}
    </>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS)
  const scrollRef = useRef<HTMLDivElement>(null)

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post<ChatResponse>('/assistant/chat', { message })
      return data
    },
    onSuccess: (data) => {
      setMessages((current) => [...current, { role: 'assistant', text: data.reply }])
      setSuggestions(data.suggestions)
    },
    onError: () => {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: 'I could not reach the assistant service. If this is a real emergency, call 112 immediately.',
        },
      ])
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, chatMutation.isPending])

  const send = (text: string) => {
    const message = text.trim()
    if (!message || chatMutation.isPending) return
    setMessages((current) => [...current, { role: 'user', text: message }])
    setInput('')
    chatMutation.mutate(message)
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col space-y-4 lg:h-[calc(100vh-5.5rem)]">
      <div>
        <h1 className="font-display flex items-center gap-2.5 text-3xl font-bold tracking-tight">
          AI Emergency Assistant
          <Sparkles className="h-6 w-6 text-primary" />
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Describe the emergency and get instant step-by-step guidance.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        AI assistance does not replace professional medical advice. In a life-threatening emergency
        always call 112 first.
      </div>

      <GlassCard className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
                <Bot className="h-7 w-7 text-white" />
              </span>
              <p className="font-medium">How can I help?</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Tell me what's happening — CPR, choking, bleeding, burns, disasters — and I'll walk
                you through it.
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-white'
                      : 'bg-muted text-foreground',
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </span>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%]',
                    message.role === 'assistant'
                      ? 'glass-panel text-foreground/90'
                      : 'bg-primary text-primary-foreground',
                  )}
                >
                  <FormattedText text={message.text} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {chatMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                <Bot className="h-4 w-4" />
              </span>
              <span className="glass-panel flex items-center gap-1.5 rounded-2xl px-4 py-3">
                {[0, 0.15, 0.3].map((delay) => (
                  <motion.span
                    key={delay}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay }}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                  />
                ))}
              </span>
            </motion.div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                disabled={chatMutation.isPending}
                className="glass-panel rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              send(input)
            }}
            className="flex gap-2.5"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Describe the emergency…"
              className="flex-1"
              maxLength={1000}
            />
            <Button
              type="submit"
              variant="gradient"
              size="icon"
              className="h-11 w-11 shrink-0"
              disabled={chatMutation.isPending || !input.trim()}
              aria-label="Send message"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </GlassCard>
    </div>
  )
}
