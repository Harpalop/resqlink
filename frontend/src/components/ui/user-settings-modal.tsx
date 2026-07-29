import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Shield, Mail, User as UserIcon, LogOut, Phone, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageCropperModal } from './image-cropper-modal'
import { chatApi } from '@/features/chat/api'
import { getInitials } from '@/lib/utils'
import { format } from 'date-fns'

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  updateUser: (data: any) => void
  onLogout: () => void
}

export function UserSettingsModal({ isOpen, onClose, user, updateUser, onLogout }: UserSettingsModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result?.toString() || null)
      setCropModalOpen(true)
    })
    reader.readAsDataURL(file)
    
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCropComplete = async (croppedFile: File) => {
    setCropModalOpen(false)
    setImageToCrop(null)
    setIsUploading(true)
    try {
      const uploadRes = await chatApi.uploadFile(croppedFile)
      const updateRes = await chatApi.updateProfilePicture(uploadRes.fileUrl)
      updateUser(updateRes as any)
    } catch (error) {
      console.error('Failed to upload profile picture', error)
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl bg-[#0B1220] border border-white/10 shadow-2xl relative"
            >
              {/* Header background */}
              <div className="h-32 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="absolute top-4 right-4 h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 rounded-full z-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Avatar Editor */}
              <div className="px-8 pb-8 relative">
                <div className="flex justify-center -mt-16 relative z-20">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.1 }}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className="relative group cursor-pointer h-32 w-32 rounded-full p-1 bg-gradient-to-tr from-blue-500 via-yellow-400 to-red-500 shadow-2xl transition-transform hover:scale-105 duration-300"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0B1220] border-4 border-[#0B1220] relative">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden"
                      />
                      {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt={user.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white shadow-inner bg-[#111827]">
                          {getInitials(user.fullName)}
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                        {isUploading ? (
                          <span className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Camera className="h-6 w-6 text-white" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Change</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* User Info */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 flex flex-col items-center text-center"
                >
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">{user.fullName}</h2>
                  <div className="flex items-center gap-2 mt-3 text-sm text-blue-400 font-bold bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <Shield className="h-4 w-4" />
                    <span className="uppercase tracking-wider">{user.role}</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="group relative bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 z-10">
                      <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                      <p className="text-sm text-white font-semibold truncate group-hover:text-blue-200 transition-colors">{user.fullName}</p>
                    </div>
                  </div>

                  <div className="group relative bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 z-10">
                      <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                      <p className="text-sm text-white font-semibold truncate group-hover:text-indigo-200 transition-colors">{user.email}</p>
                    </div>
                  </div>

                  <div className="group relative bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 z-10">
                      <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                      <p className="text-sm text-white font-semibold truncate group-hover:text-emerald-200 transition-colors">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="group relative bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    <div className="h-10 w-10 shrink-0 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-300">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 z-10">
                      <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-0.5">Member Since</p>
                      <p className="text-sm text-white font-semibold truncate group-hover:text-orange-200 transition-colors">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center"
                >
                  <Button variant="ghost" onClick={onLogout} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-2">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                  <Button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white border border-white/5 px-6">
                    Done
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {imageToCrop && (
        <ImageCropperModal
          isOpen={cropModalOpen}
          imageSrc={imageToCrop}
          onClose={() => {
            setCropModalOpen(false)
            setImageToCrop(null)
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  )
}
