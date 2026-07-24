import { Crosshair, Maximize2, Minimize2, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import { cn } from '@/lib/utils'

/** Floating control panel overlaid on the map — zoom, locate, full-screen. */
export function MapControls() {
  const map = useMap()
  const [fullscreen, setFullscreen] = useState(false)
  const [locating, setLocating] = useState(false)

  const toggleFullscreen = () => {
    const el = map.getContainer()
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
      setFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setFullscreen(false)
    }
  }

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const locate = () => {
    setLocating(true)
    map.locate({ setView: true, maxZoom: 15 })
    map.once('locationfound', () => setLocating(false))
    map.once('locationerror', () => setLocating(false))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-background hover:scale-105 active:scale-95"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-background hover:scale-105 active:scale-95"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={locate}
        disabled={locating}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-background hover:scale-105 active:scale-95 disabled:opacity-50"
        aria-label="My location"
      >
        <Crosshair className={cn('h-4 w-4', locating && 'animate-spin')} />
      </button>
      <button
        type="button"
        onClick={toggleFullscreen}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-background hover:scale-105 active:scale-95"
        aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  )
}
