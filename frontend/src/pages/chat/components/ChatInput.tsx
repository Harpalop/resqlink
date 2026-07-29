import { useState, useRef } from 'react'
import { Send, Loader2, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { chatApi } from '@/features/chat/api'
import type { UseMutationResult } from '@tanstack/react-query'
import type { ChatMessage, ChatRoom } from '@/features/chat/api'

interface ChatInputProps {
  selectedRoom: ChatRoom
  sendMutation: UseMutationResult<ChatMessage, Error, { roomId: string; payload: any }, unknown>
}

export function ChatInput({ selectedRoom, sendMutation }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return
    sendMutation.mutate({ roomId: selectedRoom.id, payload: { content: input.trim() } })
    setInput('')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    try {
      const { fileUrl, fileName, fileType } = await chatApi.uploadFile(file)
      sendMutation.mutate({
        roomId: selectedRoom.id,
        payload: {
          content: '',
          fileUrl,
          fileName,
          fileType,
          messageType: 'FILE'
        }
      })
    } catch (error) {
      console.error('Failed to upload file', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    
    if (!typingTimeoutRef.current) {
      chatApi.sendTyping(selectedRoom.id).catch(() => {})
    } else {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null
    }, 2000)
  }

  const roomDisplayName = selectedRoom.type === 'DIRECT' 
    ? selectedRoom.name.replace('Direct: ', '').split(' & ')[0] 
    : selectedRoom.name

  return (
    <div className="absolute bottom-6 left-6 right-6 z-30">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className={cn(
          "flex items-end gap-3 rounded-[28px] bg-[#111827]/80 backdrop-blur-xl border border-white/[0.12] p-2 shadow-2xl transition-all duration-300",
          isFocused && "border-[#2563EB]/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-10 w-10 shrink-0 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </Button>

        <div className="relative flex-1">
          <input
            value={input}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`Message ${roomDisplayName}...`}
            className="w-full bg-transparent px-2 py-3 text-[14px] text-white placeholder:text-[#94A3B8]/60 focus:outline-none"
            autoFocus
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={!input.trim() || sendMutation.isPending}
          className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {sendMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 translate-x-[-1px] translate-y-[1px]" />
          )}
        </Button>
      </form>
    </div>
  )
}
