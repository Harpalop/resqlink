import { useEffect, useState, type ComponentPropsWithoutRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'
import {
  Ambulance,
  Building2,
  Cross,
  ExternalLink,
  Flame,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Search,
  Shield,
  Siren,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapStyleSwitcher, MAP_STYLES } from '@/components/ui/map-style-switcher'
import { MapControls } from '@/components/ui/map-controls'
import { facilityApi, FACILITY_META, FACILITY_TYPES, type EmergencyFacility, type FacilityType } from '@/features/facility/api'
import { haversineKm } from '@/lib/geo'
import { cn } from '@/lib/utils'

const INDIA_CENTER: [number, number] = [22.9, 78.6]

// ─── Leaflet markers ─────────────────────────────────────
const TYPE_SVGS: Record<string, string> = {
  HOSPITAL: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" fill="none"/>',
  POLICE_STATION: '<path d="M12 2C7 2 3 5 3 9v1c0 5 4 9 9 12 5-3 9-7 9-12V9c0-4-4-7-9-7z" fill="currentColor"/>',
  FIRE_STATION: '<path d="M8 2h8l-1 6h5l-9 14v-8H8z" fill="currentColor"/>',
  AMBULANCE_SERVICE: '<rect x="4" y="8" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M9 14h6" stroke="currentColor" stroke-width="2"/>',
}

const TYPE_COLORS: Record<string, string> = {
  HOSPITAL: '#3B82F6',
  POLICE_STATION: '#16A34A',
  FIRE_STATION: '#DC2626',
  AMBULANCE_SERVICE: '#F97316',
}

function facilityIcon(type: string) {
  const color = TYPE_COLORS[type] ?? '#3B82F6'
  const svg = TYPE_SVGS[type] ?? TYPE_SVGS.HOSPITAL
  return L.divIcon({
    className: 'resq-marker bg-transparent',
    html: `
      <div class="relative flex h-8 w-8 items-center justify-center">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-20" style="background:${color}"></span>
        <span class="relative flex h-6 w-6 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white" style="background:${color}">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">${svg}</svg>
        </span>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

function MapResizer() {
  const map = useMap()
  useEffect(() => { const t = setTimeout(() => map.invalidateSize(), 150); return () => clearTimeout(t) }, [map])
  return null
}

// ─── Haversine distance formatting ───────────────────────
function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

// ─── Page ────────────────────────────────────────────────
export default function FacilitiesPage() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [activeType, setActiveType] = useState<string>('ALL')
  const [mapStyleId, setMapStyleId] = useState('light')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 350)
    return () => clearTimeout(t)
  }, [query])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 8000 },
      )
    }
  }, [])

  const facilitiesQuery = useQuery({
    queryKey: ['facilities', debounced, activeType],
    queryFn: () => facilityApi.search({
      q: debounced || undefined,
      types: activeType === 'ALL' ? undefined : activeType,
    }),
  })

  const facilities = facilitiesQuery.data ?? []

  // ── Pin click handler ──────────────────────────────────
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Emergency Services</h1>
        <p className="mt-1.5 text-muted-foreground">
          Find hospitals, police stations, fire departments and ambulance services across India.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip label="All" active={activeType === 'ALL'} dot="bg-foreground" onClick={() => setActiveType('ALL')} />
        {FACILITY_TYPES.map((type) => (
          <FilterChip
            key={type}
            label={FACILITY_META[type].label}
            active={activeType === type}
            dot={FACILITY_META[type].dotColor}
            onClick={() => setActiveType(type)}
          />
        ))}
      </div>

      {/* Map */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <GlassCard className="relative overflow-hidden p-0">
          {facilitiesQuery.isPending && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <div className="absolute right-3 top-3 z-[1000]">
            <MapStyleSwitcher current={mapStyleId} onChange={setMapStyleId} />
          </div>
          <MapContainer
            center={INDIA_CENTER}
            zoom={5}
            scrollWheelZoom
            zoomControl={false}
            className="h-[500px] w-full lg:h-[560px]"
          >
            <TileLayer
              key={mapStyleId}
              url={MAP_STYLES.find((s) => s.id === mapStyleId)!.url}
              attribution={MAP_STYLES.find((s) => s.id === mapStyleId)!.attribution}
            />
            <MapResizer />
            <div className="absolute right-2 bottom-2 z-[1000]">
              <MapControls />
            </div>
            <FlyToMarker position={selectedPos} />

            {facilities.map((f) => (
              <Marker
                key={f.id}
                position={[f.latitude, f.longitude]}
                icon={facilityIcon(f.type)}
                eventHandlers={{ click: () => setSelectedPos([f.latitude, f.longitude]) }}
              >
                <Popup>
                  <FacilityPopup
                    facility={f}
                    userLocation={userLocation}
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </GlassCard>
      </motion.div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing <strong>{facilities.length}</strong> {facilities.length === 1 ? 'facility' : 'facilities'}
        {activeType !== 'ALL' && ` in ${FACILITY_META[activeType as FacilityType]?.label ?? ''}s`}
      </p>

      {/* Card list */}
      {facilitiesQuery.isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-32"><GlassCard className="h-full"><div className="flex h-full items-center justify-center text-muted-foreground text-sm"><Loader2 className="h-5 w-5 animate-spin" /></div></GlassCard></div>)}
        </div>
      ) : facilities.length === 0 ? (
        <GlassCard className="p-8 text-center text-sm text-muted-foreground">
          {debounced ? `No facilities match "${debounced}".` : 'No facilities found.'}
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {facilities.map((facility, index) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.4) }}
            >
              <GlassCard className="flex h-full flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md', FACILITY_META[facility.type]?.iconBg ?? 'bg-gradient-to-br from-blue-500 to-cyan-500')}>
                    <FacilityIcon type={facility.type} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{facility.name}</h3>
                      <Badge className="px-2 py-0 text-[10px]">{FACILITY_META[facility.type]?.label ?? facility.type}</Badge>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{facility.address}, {facility.city}</span>
                    </p>
                    {facility.type === 'HOSPITAL' && (
                      <span className="mt-0.5 flex items-center gap-1 text-sm font-medium text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" /> {facility.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {facility.emergencyDept && <Badge variant="emergency" className="px-2.5 py-0.5 text-[10px]"><Siren className="h-3 w-3" /> EMERGENCY</Badge>}
                  {facility.bloodBank && <Badge variant="primary" className="px-2.5 py-0.5 text-[10px]"><DropletsIcon className="h-3 w-3" /> BLOOD BANK</Badge>}
                  {facility.open24x7 && <Badge variant="success" className="px-2.5 py-0.5 text-[10px]"><ClockIcon className="h-3 w-3" /> 24×7</Badge>}
                </div>

                {/* Distance */}
                {userLocation && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <MapPin className="mr-1 inline h-3 w-3" />
                    {formatDistance(haversineKm(userLocation.lat, userLocation.lng, facility.latitude, facility.longitude))} from your location
                  </p>
                )}

                {/* Actions */}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {facility.phone && (
                    <a href={`tel:${facility.phone}`} className="inline-flex items-center gap-1.5 rounded-xl bg-success px-4 py-2 text-sm font-medium text-white shadow-md shadow-success/25 transition-transform hover:scale-[1.02]">
                      <Phone className="h-4 w-4" /> Call
                    </a>
                  )}
                  <a
                    href={`https://maps.google.com/maps?daddr=${facility.latitude},${facility.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/50 px-4 py-2 text-sm font-medium text-foreground transition-transform hover:scale-[1.02]"
                  >
                    <Navigation className="h-4 w-4" /> Navigate
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────

/** Icon for facility type — uses Lucide icons mapped by type. */
function FacilityIcon({ type, className }: { type: string; className?: string }) {
  const icons: Record<string, LucideIcon> = {
    HOSPITAL: Cross,
    POLICE_STATION: Shield,
    FIRE_STATION: Flame,
    AMBULANCE_SERVICE: Ambulance,
  }
  const Icon = icons[type] ?? Building2
  return <Icon className={className} />
}

function DropletsIcon(props: ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  )
}

function ClockIcon(props: ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function FilterChip({ label, active, dot, onClick }: { label: string; active: boolean; dot: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active ? 'border-border bg-background/60 text-foreground' : 'border-transparent bg-muted/40 text-muted-foreground/60',
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', dot, !active && 'opacity-40')} />
      {label}
    </button>
  )
}

function FlyToMarker({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 0.8 })
  }, [position, map])
  return null
}

function FacilityPopup({ facility, userLocation }: { facility: EmergencyFacility; userLocation: { lat: number; lng: number } | null }) {
  return (
    <div className="min-w-[200px] space-y-2">
      <div className="flex items-center gap-2">
        <span className={cn('flex h-6 w-6 items-center justify-center rounded-md text-white', FACILITY_META[facility.type]?.color ?? 'bg-blue-500')}>
          <FacilityIcon type={facility.type} className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-semibold text-slate-900">{facility.name}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge className="text-[10px]">{FACILITY_META[facility.type]?.label ?? facility.type}</Badge>
        {facility.emergencyDept && <Badge variant="emergency" className="text-[10px]">Emergency</Badge>}
        {facility.bloodBank && <Badge variant="primary" className="text-[10px]">Blood bank</Badge>}
      </div>
      <p className="text-xs text-slate-600">{facility.address}, {facility.city}</p>
      {facility.type === 'HOSPITAL' && (
        <p className="text-xs text-slate-500"><Star className="mb-0.5 inline h-3 w-3 fill-amber-400 text-amber-400" /> {facility.rating.toFixed(1)}</p>
      )}
      {userLocation && (
        <p className="text-xs text-slate-500">
          📍 {formatDistance(haversineKm(userLocation.lat, userLocation.lng, facility.latitude, facility.longitude))}
        </p>
      )}
      <div className="flex gap-2 pt-1">
        {facility.phone && (
          <a href={`tel:${facility.phone}`} className="inline-flex items-center gap-1 rounded bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
            <Phone className="h-3 w-3" /> Call
          </a>
        )}
        <a href={`https://maps.google.com/maps?daddr=${facility.latitude},${facility.longitude}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300">
          <ExternalLink className="h-3 w-3" /> Navigate
        </a>
      </div>
    </div>
  )
}
