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
import { mapApi, type EmergencyPin, type HospitalPin } from '@/features/map/api'
import { cn } from '@/lib/utils'

const INDIA_CENTER: [number, number] = [22.9, 78.6]

// Leaflet renders marker HTML via innerHTML — the Tailwind classes below are
// literal in this source file, so they're picked up at build time.
const hospitalIcon = L.divIcon({
  className: 'resq-marker',
  html: `<div class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg ring-2 ring-white">
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
})

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

export default function MapPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [mapStyleId, setMapStyleId] = useState('light')
  const [showHospitals, setShowHospitals] = useState(true)
  const [showEmergencies, setShowEmergencies] = useState(true)

  const overviewQuery = useQuery({
    queryKey: ['map', 'overview'],
    queryFn: mapApi.getOverview,
    refetchInterval: 60_000,
  })

  const hospitals = overviewQuery.data?.hospitals ?? []
  const emergencies = overviewQuery.data?.emergencies ?? []

  const visibleHospitals = useMemo(
    () => (showHospitals ? hospitals : []),
    [showHospitals, hospitals],
  )
  const visibleEmergencies = useMemo(
    () => (showEmergencies ? emergencies : []),
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
        <StatPill icon={Hospital} label="Hospitals" value={hospitals.length} tone="bg-blue-500" />
        <StatPill
          icon={Siren}
          label={isAdmin ? 'Active SOS' : 'Your active SOS'}
          value={emergencies.length}
          tone="bg-rose-600"
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <FilterChip
            active={showHospitals}
            onClick={() => setShowHospitals((v) => !v)}
            dot="bg-blue-500"
            label="Hospitals"
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

            {visibleHospitals.map((h) => (
              <Marker key={h.id} position={[h.latitude, h.longitude]} icon={hospitalIcon}>
                <Popup>
                  <HospitalPopup hospital={h} />
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

function HospitalPopup({ hospital }: { hospital: HospitalPin }) {
  return (
    <div className="min-w-[190px] space-y-1.5">
      <p className="text-sm font-semibold text-slate-900">{hospital.name}</p>
      <p className="text-xs text-slate-500">
        {hospital.city} · <Star className="mb-0.5 inline h-3 w-3 fill-amber-400 text-amber-400" />{' '}
        {hospital.rating.toFixed(1)}
      </p>
      <div className="flex flex-wrap gap-1 pt-0.5">
        {hospital.emergencyDept && <Badge variant="emergency">Emergency</Badge>}
        {hospital.bloodBank && <Badge variant="primary">Blood bank</Badge>}
        {hospital.open24x7 && <Badge variant="success">24×7</Badge>}
      </div>
      {hospital.phone && (
        <a
          href={`tel:${hospital.phone}`}
          className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600"
        >
          <Phone className="h-3 w-3" /> {hospital.phone}
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
