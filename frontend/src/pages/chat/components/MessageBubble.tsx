import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/features/chat/api'

interface MessageBubbleProps {
  message: ChatMessage
  isMe: boolean
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        mass: 0.8
      }}
      className={cn('flex w-full', isMe ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'relative max-w-[75%] px-4 py-3 shadow-md backdrop-blur-md',
          isMe
            ? 'rounded-2xl rounded-br-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-indigo-500/20'
            : 'rounded-2xl rounded-bl-sm border border-border/40 bg-background/60 shadow-black/5',
        )}
      >
        {!isMe && (
          <p className="mb-1 text-[11px] font-bold tracking-wide text-violet-500/90 uppercase">
            {message.senderName}
          </p>
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={cn(
            'mt-1.5 flex justify-end text-[9px] font-medium tracking-wider',
            isMe ? 'text-indigo-100/70' : 'text-muted-foreground/60',
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  )
}
