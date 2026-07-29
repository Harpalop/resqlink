import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCroppedImg } from '@/lib/cropImage'

interface ImageCropperModalProps {
  isOpen: boolean
  imageSrc: string
  onClose: () => void
  onCropComplete: (file: File) => void
}

export function ImageCropperModal({ isOpen, imageSrc, onClose, onCropComplete }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropCompleteHandler = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedFile)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712]/90 backdrop-blur-md p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <Maximize2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold tracking-wide text-white">Adjust Profile Picture</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Cropper Area */}
            <div className="relative h-[350px] w-full bg-black/60 overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropCompleteHandler}
                onZoomChange={setZoom}
              />
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            </div>

            {/* Controls */}
            <div className="p-6 bg-[#0B1220]/80 border-t border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setZoom(Math.max(1, zoom - 0.1))} className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 bg-blue-500/20 rounded-full blur-md group-hover:bg-blue-500/30 transition-colors" style={{ width: `${((zoom - 1) / 2) * 100}%` }} />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.05}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="relative w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                  />
                </div>
                <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <Button variant="ghost" onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }) }} className="text-white/50 hover:text-white hover:bg-white/5 gap-2 px-3">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
                
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-5">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 rounded-xl px-6 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isProcessing ? 'Processing...' : (
                      <>
                        <Check className="h-4 w-4 mr-2" /> Apply Picture
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
