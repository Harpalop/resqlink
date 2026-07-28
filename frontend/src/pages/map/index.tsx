import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Hospital, Loader2, Phone, RefreshCw, Siren, Star } from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapStyleSwitcher, MAP_STYLES } from '@/components/ui/map-style-switcher'
import { MapControls } from '@/components/ui/map-controls'
import { useAuth } from '@/features/auth/auth-context'
import { mapApi, type EmergencyPin, type FacilityPin } from '@/features/map/api'
import { cn } from '@/lib/utils'

const INDIA_CENTER: [number, number] = [22.9, 78.6]

// Leaflet renders marker HTML via innerHTML — the Tailwind classes below are
// literal in this source file, so they're picked up at build time.
const FACILITY_ICONS: Record<string, string> = {
  HOSPITAL: '#3B82F6',
  POLICE_STATION: '#16A34A',
  FIRE_STATION: '#DC2626',
  AMBULANCE_SERVICE: '#F97316',
}
const FACILITY_SVGS: Record<string, string> = {
  HOSPITAL: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" fill="none"/>',
  POLICE_STATION: '<path d="M12 2C7 2 3 5 3 9v1c0 5 4 9 9 12 5-3 9-7 9-12V9c0-4-4-7-9-7z" fill="currentColor"/>',
  FIRE_STATION: '<path d="M8 2h8l-1 6h5l-9 14v-8H8z" fill="currentColor"/>',
  AMBULANCE_SERVICE: '<rect x="4" y="8" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M9 14h6" stroke="currentColor" stroke-width="2"/>',
}
const FACILITY_LABELS: Record<string, string> = {
  HOSPITAL: 'Hospital', POLICE_STATION: 'Police', FIRE_STATION: 'Fire Station', AMBULANCE_SERVICE: 'Ambulance',
}

function makeFacilityIcon(type: string) {
  const color = FACILITY_ICONS[type] ?? '#3B82F6'
  const svg = FACILITY_SVGS[type] ?? FACILITY_SVGS.HOSPITAL
  return L.divIcon({
    className: 'resq-marker bg-transparent',
    html: `<div class="relative flex h-7 w-7 items-center justify-center">
      <span class="absolute inline-flex h-full w-full rounded-full opacity-20" style="background:${color}"></span>
      <span class="relative flex h-5 w-5 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white" style="background:${color}">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24">${svg}</svg>
      </span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

const sosIcon = L.divIcon({
  className: 'resq-marker',
  html: `<div class="relative flex h-8 w-8 items-center justify-center">
    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500/60"></span>
    <span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg ring-2 ring-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
    </span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

/** Leaflet occasionally renders grey tiles when mounted inside an animated
 *  container; nudging invalidateSize after mount forces a correct redraw. */
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function StatPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Hospital
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-2.5">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-white', tone)}>
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div>
        <p className="font-display text-lg leading-none font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

const EMPTY_FACILITIES: FacilityPin[] = []
const EMPTY_EMERGENCIES: EmergencyPin[] = []

export default function MapPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [mapStyleId, setMapStyleId] = useState('light')
  const [showFacilities, setShowFacilities] = useState(true)
  const [showEmergencies, setShowEmergencies] = useState(true)

  const overviewQuery = useQuery({
    queryKey: ['map', 'overview'],
    queryFn: mapApi.getOverview,
    refetchInterval: 60_000,
  })

  const facilities = overviewQuery.data?.facilities ?? EMPTY_FACILITIES
  const emergencies = overviewQuery.data?.emergencies ?? EMPTY_EMERGENCIES

  const visibleFacilities = useMemo(
    () => (showFacilities ? facilities : EMPTY_FACILITIES),
    [showFacilities, facilities],
  )
  const visibleEmergencies = useMemo(
    () => (showEmergencies ? emergencies : EMPTY_EMERGENCIES),
    [showEmergencies, emergencies],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Live Map</h1>
          <p className="mt-1.5 text-muted-foreground">
            {isAdmin
              ? 'Command centre — every active SOS and hospital across the network, in real time.'
              : 'Hospitals near you and your own active emergencies, live on the map.'}
          </p>
        </div>
        <Button
          variant="glass"
          size="sm"
          onClick={() => overviewQuery.refetch()}
          disabled={overviewQuery.isFetching}
        >
          <RefreshCw className={cn('h-4 w-4', overviewQuery.isFetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatPill icon={Hospital} label="Facilities" value={facilities.length} tone="bg-blue-500" />
        <StatPill
          icon={Siren}
          label={isAdmin ? 'Active SOS' : 'Your active SOS'}
          value={emergencies.length}
          tone="bg-rose-600"
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <FilterChip
            active={showFacilities}
            onClick={() => setShowFacilities((v) => !v)}
            dot="bg-blue-500"
            label="Emergency Services"
          />
          <FilterChip
            active={showEmergencies}
            onClick={() => setShowEmergencies((v) => !v)}
            dot="bg-rose-600"
            label="SOS alerts"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <MapStyleSwitcher current={mapStyleId} onChange={setMapStyleId} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="relative overflow-hidden p-0">
          {overviewQuery.isPending && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <MapContainer
            center={INDIA_CENTER}
            zoom={5}
            scrollWheelZoom
            zoomControl={false}
            className="h-[560px] w-full lg:h-[calc(100vh-15rem)]"
            style={{ background: 'transparent' }}
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

            {visibleFacilities.map((f) => (
              <Marker key={f.id} position={[f.latitude, f.longitude]} icon={makeFacilityIcon(f.type)}>
                <Popup>
                  <FacilityPopup facility={f} />
                </Popup>
              </Marker>
            ))}

            {visibleEmergencies.map((e) => (
              <Marker key={e.id} position={[e.latitude, e.longitude]} icon={sosIcon}>
                <Popup>
                  <EmergencyPopup emergency={e} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </GlassCard>
      </motion.div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  dot,
  label,
}: {
  active: boolean
  onClick: () => void
  dot: string
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-border bg-background/60 text-foreground'
          : 'border-transparent bg-muted/40 text-muted-foreground/60',
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', dot, !active && 'opacity-40')} />
      {label}
    </button>
  )
}

function FacilityPopup({ facility }: { facility: FacilityPin }) {

  return (
    <div className="min-w-[190px] space-y-1.5">
      <p className="text-sm font-semibold text-slate-900">{facility.name}</p>
      <p className="text-xs text-slate-500">
        {facility.city} · {FACILITY_LABELS[facility.type] ?? facility.type}
        {facility.rating > 0 && (
          <> · <Star className="mb-0.5 inline h-3 w-3 fill-amber-400 text-amber-400" /> {facility.rating.toFixed(1)}</>
        )}
      </p>
      <div className="flex flex-wrap gap-1 pt-0.5">
        {facility.emergencyDept && <Badge variant="emergency">Emergency</Badge>}
        {facility.bloodBank && <Badge variant="primary">Blood bank</Badge>}
        {facility.open24x7 && <Badge variant="success">24×7</Badge>}
      </div>
      {facility.phone && (
        <a
          href={`tel:${facility.phone}`}
          className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600"
        >
          <Phone className="h-3 w-3" /> {facility.phone}
        </a>
      )}
    </div>
  )
}

function EmergencyPopup({ emergency }: { emergency: EmergencyPin }) {
  return (
    <div className="min-w-[180px] space-y-1">
      <div className="flex items-center gap-1.5">
        <Siren className="h-3.5 w-3.5 text-rose-600" />
        <p className="text-sm font-semibold text-slate-900">Active SOS</p>
        {emergency.mine && <Badge variant="primary">You</Badge>}
      </div>
      <p className="text-xs text-slate-500">
        {emergency.reference} · {emergency.type.replace('_', ' ').toLowerCase()}
      </p>
      <p className="text-xs text-slate-500">
        {new Date(emergency.createdAt).toLocaleString([], {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  )
}
