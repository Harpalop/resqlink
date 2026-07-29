import { motion } from 'framer-motion'
import { Check, CheckCheck, Clock, Download, FileText, Map as MapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/features/chat/api'

interface MessageBubbleProps {
  message: ChatMessage
  isMe: boolean
  isFirstInGroup: boolean
  isLastInGroup: boolean
  senderRole?: string
}

import { memo } from 'react'

export const MessageBubble = memo(function MessageBubble({ message, isMe, isFirstInGroup, isLastInGroup, senderRole = 'CITIZEN' }: MessageBubbleProps) {
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DOCTOR':
      case 'NURSE': return 'bg-[#10B981]' // Medical Green
      case 'AMBULANCE':
      case 'FIREFIGHTER': return 'bg-[#F97316]' // Emergency Orange
      case 'POLICE': return 'bg-[#1E40AF]' // Police Blue
      case 'ADMIN': return 'bg-[#9333EA]' // Admin Purple
      default: return 'bg-[#3B82F6]' // Citizen Blue
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  // Dynamic border radius for connected messages
  const borderClasses = isMe 
    ? cn(
        'rounded-3xl',
        !isFirstInGroup && 'rounded-tr-md mt-1',
        !isLastInGroup && 'rounded-br-md mb-0'
      )
    : cn(
        'rounded-3xl',
        !isFirstInGroup && 'rounded-tl-md mt-1',
        !isLastInGroup && 'rounded-bl-md mb-0'
      )

  const renderStatus = () => {
    if (!isMe) return null
    const status = message.status || 'SENT'
    
    return (
      <motion.span 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ml-1.5 inline-flex items-center"
      >
        {status === 'SENDING' && <Clock className="h-2.5 w-2.5 text-blue-100/70" />}
        {status === 'SENT' && <Check className="h-3 w-3 text-blue-100/90" />}
        {status === 'DELIVERED' && <CheckCheck className="h-3 w-3 text-blue-100/90" />}
        {status === 'READ' && <CheckCheck className="h-3 w-3 text-cyan-300 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]" />}
      </motion.span>
    )
  }

  const renderFileAttachment = () => {
    if (message.messageType !== 'FILE' || !message.fileUrl) return null

    const isImage = message.fileType?.startsWith('image/')
    const isAudio = message.fileType?.startsWith('audio/')

    if (isImage) {
      return (
        <a href={message.fileUrl} target="_blank" rel="noreferrer" className="block mt-2">
          <img src={message.fileUrl} alt={message.fileName} className="rounded-xl max-w-full sm:max-w-[260px] max-h-[300px] object-cover border border-white/10 shadow-lg hover:opacity-90 transition-opacity" />
        </a>
      )
    }

    if (isAudio) {
      return (
        <div className="mt-2 bg-black/20 rounded-xl p-3 border border-white/10 min-w-[240px]">
          <div className="text-[11px] font-semibold text-white/70 mb-2 truncate">Voice Note</div>
          <audio controls src={message.fileUrl} className="h-8 w-full outline-none [&::-webkit-media-controls-panel]:bg-white/90" />
        </div>
      )
    }

    return (
      <a href={message.fileUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-3 bg-black/20 p-3 rounded-xl hover:bg-black/40 transition-colors border border-white/10 w-full sm:min-w-[240px]">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate text-white">{message.fileName}</p>
          <p className="text-[10px] text-white/50 uppercase tracking-wider">{message.fileType?.split('/')[1] || 'Document'}</p>
        </div>
        <Download className="h-4 w-4 text-white/50" />
      </a>
    )
  }

  const renderLocation = () => {
    if (message.messageType !== 'LOCATION' || !message.latitude || !message.longitude) return null
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${message.latitude},${message.longitude}`

    return (
      <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-2 block bg-black/20 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all w-full sm:min-w-[240px]">
        <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
          <MapIcon className="h-8 w-8 text-blue-400" />
        </div>
        <div className="p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Live Location</p>
            <p className="text-[10px] text-white/50">{message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}</p>
          </div>
          <div className="h-7 px-3 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg flex items-center">Open Maps</div>
        </div>
      </a>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        mass: 0.8
      }}
      className={cn('group flex w-full gap-2 items-end', isMe ? 'justify-end' : 'justify-start')}
    >
      {/* Avatar (Only show for others, and only on the last message of their group to sit at the bottom) */}
      {!isMe && (
        <div className="flex flex-col justify-end pb-0.5 w-8 shrink-0">
          {isLastInGroup && (
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg backdrop-blur-md',
                getRoleColor(senderRole)
              )}
            >
              {getInitials(message.senderName)}
              {/* Online indicator (static for now, could be passed as prop) */}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#050816] bg-[#10B981]" />
            </motion.div>
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div className={cn('flex flex-col', isMe ? 'items-end' : 'items-start', 'max-w-[70%]')}>
        {/* Name Tag (Only first in group for others) */}
        {!isMe && isFirstInGroup && (
          <span className="ml-2 mb-1 text-[11px] font-semibold tracking-wide text-[#94A3B8]">
            {message.senderName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'relative px-4 py-2.5 shadow-md',
            borderClasses,
            isMe
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20'
              : 'bg-[#111827] text-[#F8FAFC] border border-white/[0.12] shadow-black/20 backdrop-blur-[20px]',
            message.messageType === 'EMERGENCY' && 'bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
          )}
        >
          {message.messageType === 'EMERGENCY' && (
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-400">
              <span className="animate-pulse">🚨</span> HIGH PRIORITY
            </div>
          )}
          
          {message.content && (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
              {message.content}
            </p>
          )}

          {renderFileAttachment()}
          {renderLocation()}

          <div
            className={cn(
              'mt-1 flex items-center justify-end text-[9px] font-medium tracking-wider opacity-0 transition-opacity duration-300 group-hover:opacity-100',
              isMe ? 'text-indigo-100/70' : 'text-[#94A3B8]',
            )}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {renderStatus()}
          </div>
        </div>
      </div>
    </motion.div>
  )
})
