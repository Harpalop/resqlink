import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Crosshair,
  ExternalLink,
  Flame,
  Loader2,
  MapPin,
  Plus,
  ShieldAlert,
  Siren,
  TreePine,
  TriangleAlert,
  Truck,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { MapStyleSwitcher, MAP_STYLES } from '@/components/ui/map-style-switcher'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/input'
import { TextareaField } from '@/components/ui/textarea'
import { SelectField } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/auth-context'
import { hazardApi, HAZARD_SEVERITIES, HAZARD_TYPES, type HazardReport } from '@/features/hazard/api'
import { getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

const INDIA_CENTER: [number, number] = [22.9, 78.6]

const TYPE_META: Record<HazardReport['type'], { icon: LucideIcon; label: string; color: string }> = {
  BLOCKED_ROAD: { icon: Truck, label: 'Blocked Road', color: 'bg-amber-500' },
  FIRE: { icon: Flame, label: 'Fire', color: 'bg-red-600' },
  FLOODED: { icon: CloudRain, label: 'Flooded', color: 'bg-blue-500' },
  STRUCTURAL_DAMAGE: { icon: TriangleAlert, label: 'Structural Damage', color: 'bg-orange-600' },
  DOWNED_TREE: { icon: TreePine, label: 'Downed Tree', color: 'bg-emerald-700' },
  POWER_LINE: { icon: AlertTriangle, label: 'Power Line Down', color: 'bg-yellow-600' },
  GAS_LEAK: { icon: Wind, label: 'Gas Leak', color: 'bg-cyan-700' },
  STRANDED_PERSON: { icon: Siren, label: 'Stranded Person', color: 'bg-rose-600' },
  VEHICLE_ACCIDENT: { icon: Truck, label: 'Vehicle Accident', color: 'bg-orange-500' },
  HAZARDOUS_MATERIAL: { icon: ShieldAlert, label: 'Hazardous Material', color: 'bg-purple-700' },
  OTHER: { icon: AlertCircle, label: 'Other', color: 'bg-slate-500' },
}

const SEVERITY_STYLES = {
  LOW: { badge: 'default' as const, ring: 'border-slate-400/30' },
  MEDIUM: { badge: 'primary' as const, ring: 'border-amber-400/40' },
  HIGH: { badge: 'default' as const, ring: 'border-orange-500/50' },
  CRITICAL: { badge: 'emergency' as const, ring: 'border-emergency/60' },
}

const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase()

// ─── Leaflet hazard marker ──────────────────────────────────
function hazardIcon(type: HazardReport['type'], severity: HazardReport['severity']) {
  const color = TYPE_META[type]?.color ?? 'bg-slate-500'
  const dot = severity === 'CRITICAL' ? 'bg-rose-600 animate-ping' : 'bg-rose-600'
  return L.divIcon({
    className: 'resq-marker bg-transparent',
    html: `
      <div class="relative flex h-7 w-7 items-center justify-center">
        <span class="absolute inline-flex h-full w-full rounded-full ${dot} opacity-40"></span>
        <span class="relative flex h-5 w-5 items-center justify-center rounded-full ${color} text-white shadow-lg ring-2 ring-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>
        </span>
      </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function MapResizer() {
  const map = useMap()
  useEffect(() => { const t = setTimeout(() => map.invalidateSize(), 150); return () => clearTimeout(t) }, [map])
  return null
}

function ClickMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [pos, setPos] = useState<[number, number] | null>(null)
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      setPos([lat, lng])
      onLocationSelect(lat, lng)
    },
  })
  return pos ? (
    <Marker position={pos}>
      <Popup>📍 Report location</Popup>
    </Marker>
  ) : null
}

// ─── Report form schema ─────────────────────────────────────
const reportSchema = z.object({
  type: z.enum(HAZARD_TYPES),
  severity: z.enum(HAZARD_SEVERITIES),
  title: z.string().min(5, 'Describe the hazard briefly').max(120),
  description: z.string().max(500).optional(),
})

type ReportForm = z.infer<typeof reportSchema>

const EMPTY_FORM: ReportForm = { type: 'OTHER', severity: 'MEDIUM', title: '', description: '' }

// ─── Page ───────────────────────────────────────────────────
export default function HazardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [mapStyleId, setMapStyleId] = useState('light')

  const hazardsQuery = useQuery({
    queryKey: ['hazards', isAdmin ? 'all' : 'active'],
    queryFn: isAdmin ? hazardApi.getAll : hazardApi.getActive,
    refetchInterval: 60_000,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReportForm>({ resolver: zodResolver(reportSchema), defaultValues: EMPTY_FORM })

  const closeForm = () => {
    setFormOpen(false); setSelectedLocation(null); reset(EMPTY_FORM)
  }

  const reportMutation = useMutation({
    mutationFn: (values: ReportForm) =>
      hazardApi.report({
        ...values,
        description: values.description || null,
        latitude: selectedLocation!.lat,
        longitude: selectedLocation!.lng,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hazards'] })
      closeForm()
    },
  })

  const resolveMutation = useMutation({
    mutationFn: hazardApi.resolve,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['hazards'] }),
  })
  const dismissMutation = useMutation({
    mutationFn: hazardApi.dismiss,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['hazards'] }),
  })

  const openForm = () => {
    setValue('type', 'OTHER')
    setValue('severity', 'MEDIUM')
    reset({ ...EMPTY_FORM })
    setSelectedLocation(null)
    setFormOpen(true)
    // Get user's approximate location for the map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setSelectedLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000 },
      )
    }
  }

  const locateMe = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 },
    )
  }

  const hazards = hazardsQuery.data ?? []
  const filtered = useMemo(
    () => (filterType === 'ALL' ? hazards : hazards.filter((h) => h.type === filterType)),
    [hazards, filterType],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Hazard Reports</h1>
          <p className="mt-1.5 text-muted-foreground">
            {isAdmin
              ? 'Community-reported hazards — review, coordinate and resolve.'
              : 'Report hazards you see so others and responders know.'}
          </p>
        </div>
        {!formOpen && (
          <Button variant="gradient" onClick={openForm}>
            <Plus className="h-4 w-4" /> Report hazard
          </Button>
        )}
      </div>

      {reportMutation.isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(reportMutation.error, 'Could not submit hazard report.')}
        </div>
      )}

      {/* Report form */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold">Report a hazard</h2>
                <Button variant="ghost" size="icon" onClick={closeForm}><X className="h-4 w-4" /></Button>
              </div>
              <form
                onSubmit={handleSubmit((v) => {
                  if (!selectedLocation) return alert('Click on the map to set location')
                  reportMutation.mutate(v)
                })}
                className="grid gap-4 sm:grid-cols-2"
              >
                <SelectField
                  label="Hazard type"
                  options={HAZARD_TYPES.map((t) => ({ value: t, label: (TYPE_META[t]?.label ?? titleCase(t)) }))}
                  error={errors.type?.message}
                  {...register('type')}
                />
                <SelectField
                  label="Severity"
                  options={HAZARD_SEVERITIES.map((s) => ({ value: s, label: titleCase(s) }))}
                  error={errors.severity?.message}
                  {...register('severity')}
                />
                <FormField
                  label="Title"
                  placeholder="e.g. Tree fallen across MG Road"
                  error={errors.title?.message}
                  {...register('title')}
                />
                <div className="flex items-end">
                  <Button type="button" variant="glass" size="md" onClick={locateMe} disabled={locating} className="w-full">
                    {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                    {selectedLocation ? '📍 Location set' : 'Use my location'}
                  </Button>
                </div>
                <div className="sm:col-span-2">
                  <TextareaField
                    label="Description"
                    hint="What exactly is happening? Add details for responders."
                    placeholder="A large tree has fallen across the road near the signal, blocking traffic in both directions..."
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedLocation
                      ? `📍 ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)} — click map to adjust`
                      : 'Click on the map to place the hazard location'}
                  </p>
                  <div className="h-56 overflow-hidden rounded-xl border border-border">
                    <MapContainer center={selectedLocation ?? INDIA_CENTER} zoom={selectedLocation ? 14 : 5} className="h-full w-full" scrollWheelZoom>
                      <TileLayer key={mapStyleId} url={MAP_STYLES.find((s) => s.id === mapStyleId)!.url} attribution={MAP_STYLES.find((s) => s.id === mapStyleId)!.attribution} />
                      <ClickMarker onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })} />
                    </MapContainer>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="gradient" disabled={reportMutation.isPending || !selectedLocation}>
                    {reportMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit report
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters + map */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip label="All" active={filterType === 'ALL'} onClick={() => setFilterType('ALL')} />
        {HAZARD_TYPES.map((t) => (
          <FilterChip key={t} label={TYPE_META[t]?.label ?? titleCase(t)} active={filterType === t} onClick={() => setFilterType(t)} />
        ))}
      </div>

      {/* Map */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <GlassCard className="relative overflow-hidden p-0">
          {hazardsQuery.isPending && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <div className="absolute right-3 top-3 z-[1000]">
            <MapStyleSwitcher current={mapStyleId} onChange={setMapStyleId} />
          </div>
          <MapContainer center={INDIA_CENTER} zoom={5} className="h-[500px] w-full lg:h-[500px]" scrollWheelZoom>
            <TileLayer key={mapStyleId} url={MAP_STYLES.find((s) => s.id === mapStyleId)!.url} attribution={MAP_STYLES.find((s) => s.id === mapStyleId)!.attribution} />
            <MapResizer />
            {filtered
              .filter((h) => h.status === 'ACTIVE')
              .map((h) => (
                <Marker key={h.id} position={[h.latitude, h.longitude]} icon={hazardIcon(h.type, h.severity)}>
                  <Popup>
                    <HazardPopup report={h} isAdmin={isAdmin} onResolve={() => resolveMutation.mutate(h.id)} onDismiss={() => dismissMutation.mutate(h.id)} />
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </GlassCard>
      </motion.div>

      {/* Report list */}
      <div className="space-y-3">
        <h2 className="font-semibold">
          {filterType === 'ALL' ? 'All reports' : TYPE_META[filterType as HazardReport['type']]?.label ?? 'Reports'}{' '}
          <span className="text-muted-foreground">({filtered.length})</span>
        </h2>
        {hazardsQuery.isPending ? (
          <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
        ) : filtered.length === 0 ? (
          <GlassCard className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </span>
            <div>
              <h3 className="font-semibold">All clear here</h3>
              <p className="mt-1 text-sm text-muted-foreground">No hazards reported{filterType !== 'ALL' ? ` of this type` : ''}.</p>
            </div>
          </GlassCard>
        ) : (
          <AnimatePresence>
            {filtered.map((report) => {
              const meta = TYPE_META[report.type]
              const sev = SEVERITY_STYLES[report.severity]
              const Icon = meta.icon
              return (
                <motion.div key={report.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
                  <GlassCard className={cn('p-5', sev.ring, report.status !== 'ACTIVE' && 'opacity-60')}>
                    <div className="flex items-start gap-4">
                      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white', meta.color)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{report.title}</h3>
                          <Badge variant={sev.badge}>{report.severity}</Badge>
                          {report.status !== 'ACTIVE' && (
                            <Badge variant="default">{report.status}</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{meta.label}</span>
                          <span>·</span>
                          <span>{report.reporterName}</span>
                          <span>·</span>
                          <span>{new Date(report.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                        {report.description && (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{report.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={`https://maps.google.com/maps?q=${report.latitude},${report.longitude}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> View on map
                          </a>
                        </div>
                      </div>
                      {(isAdmin || report.reporterName === user?.fullName) && report.status === 'ACTIVE' && (
                        <div className="flex shrink-0 gap-1">
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => resolveMutation.mutate(report.id)} disabled={resolveMutation.isPending}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => dismissMutation.mutate(report.id)}>
                              <X className="h-3.5 w-3.5" /> Dismiss
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

function HazardPopup({ report, isAdmin, onResolve, onDismiss }: { report: HazardReport; isAdmin: boolean; onResolve: () => void; onDismiss: () => void }) {
  const meta = TYPE_META[report.type]
  const Icon = meta.icon
  return (
    <div className="min-w-[200px] space-y-2">
      <div className="flex items-center gap-2">
        <span className={cn('flex h-6 w-6 items-center justify-center rounded-md text-white', meta.color)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-semibold text-slate-900">{report.title}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge variant={SEVERITY_STYLES[report.severity].badge}>{report.severity}</Badge>
        <Badge>{meta.label}</Badge>
      </div>
      {report.description && <p className="text-xs text-slate-600">{report.description}</p>}
      <p className="text-xs text-slate-500">Reported by {report.reporterName}</p>
      {report.status === 'ACTIVE' && (isAdmin || report.reporterName === 'You') && (
        <div className="flex gap-1 pt-1">
          <button type="button" onClick={onResolve} className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-600">Resolve</button>
          {isAdmin && <button type="button" onClick={onDismiss} className="rounded bg-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-400">Dismiss</button>}
        </div>
      )}
    </div>
  )
}
