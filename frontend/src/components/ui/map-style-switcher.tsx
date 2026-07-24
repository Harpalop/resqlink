import { Globe, Mountain, Moon, Sun, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MapStyle {
  id: string
  name: string
  icon: LucideIcon
  url: string
  attribution: string
  /** Text color class for labels shown on this tile set */
  labelClass?: string
}

export const MAP_STYLES: MapStyle[] = [
  {
    id: 'light',
    name: 'Light',
    icon: Sun,
    url: 'https://{s}.basemap.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: Moon,
    url: 'https://{s}.basemap.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    icon: Globe,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; Esri, Maxar, Earthstar Geographics',
  },
  {
    id: 'terrain',
    name: 'Terrain',
    icon: Mountain,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
]

interface MapStyleSwitcherProps {
  current: string
  onChange: (styleId: string) => void
}

export function MapStyleSwitcher({ current, onChange }: MapStyleSwitcherProps) {
  return (
    <div className="glass-panel flex items-center gap-1 rounded-xl p-1">
      {MAP_STYLES.map((style) => {
        const Icon = style.icon
        const active = style.id === current
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200',
              active
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            title={style.name}
            aria-label={`Map style: ${style.name}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
