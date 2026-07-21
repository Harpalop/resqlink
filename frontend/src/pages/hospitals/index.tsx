import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Clock, Droplets, Hospital as HospitalIcon, MapPin, Phone, Search, Siren, Star } from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'

interface Hospital {
  id: string
  name: string
  city: string
  address: string
  phone: string | null
  emergencyDept: boolean
  bloodBank: boolean
  open24x7: boolean
  rating: number
}

export default function HospitalsPage() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  // Simple debounce via timeout on change
  const handleChange = (value: string) => {
    setQuery(value)
    window.clearTimeout((handleChange as { timer?: number }).timer)
    ;(handleChange as { timer?: number }).timer = window.setTimeout(
      () => setDebounced(value),
      350,
    )
  }

  const hospitalsQuery = useQuery({
    queryKey: ['hospitals', debounced],
    queryFn: async () => {
      const { data } = await api.get<Hospital[]>('/hospitals', {
        params: { q: debounced || undefined },
      })
      return data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Hospitals</h1>
        <p className="mt-1.5 text-muted-foreground">
          Find hospitals with emergency departments and blood banks near you.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by hospital or city…"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          className="pl-10"
        />
      </div>

      {hospitalsQuery.isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-40" />
          ))}
        </div>
      ) : !hospitalsQuery.data || hospitalsQuery.data.length === 0 ? (
        <GlassCard className="p-8 text-center text-sm text-muted-foreground">
          No hospitals match "{debounced}".
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hospitalsQuery.data.map((hospital, index) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.4) }}
            >
              <GlassCard className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
                      <HospitalIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{hospital.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {hospital.address}, {hospital.city}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/15 px-2 py-1 text-sm font-semibold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" /> {hospital.rating.toFixed(1)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {hospital.emergencyDept && (
                    <Badge variant="emergency" className="gap-1 px-2.5 py-0.5 text-[10px]">
                      <Siren className="h-3 w-3" /> EMERGENCY DEPT
                    </Badge>
                  )}
                  {hospital.bloodBank && (
                    <Badge variant="primary" className="gap-1 px-2.5 py-0.5 text-[10px]">
                      <Droplets className="h-3 w-3" /> BLOOD BANK
                    </Badge>
                  )}
                  {hospital.open24x7 && (
                    <Badge variant="success" className="gap-1 px-2.5 py-0.5 text-[10px]">
                      <Clock className="h-3 w-3" /> 24×7
                    </Badge>
                  )}
                </div>

                {hospital.phone && (
                  <a
                    href={`tel:${hospital.phone}`}
                    className="mt-4 flex w-fit items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-medium text-white shadow-md shadow-success/25 transition-transform hover:scale-[1.03]"
                  >
                    <Phone className="h-4 w-4" /> {hospital.phone}
                  </a>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
