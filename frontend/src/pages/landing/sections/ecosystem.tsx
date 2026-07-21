import {
  Ambulance,
  Building2,
  Droplets,
  Flame,
  HandHeart,
  Hospital,
  LifeBuoy,
  Shield,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react'

interface EcosystemRole {
  icon: LucideIcon
  label: string
}

const ROLES: EcosystemRole[] = [
  { icon: Users, label: 'Citizens' },
  { icon: Stethoscope, label: 'Doctors' },
  { icon: Hospital, label: 'Hospitals' },
  { icon: Droplets, label: 'Blood Donors' },
  { icon: Ambulance, label: 'Ambulance Services' },
  { icon: Shield, label: 'Police' },
  { icon: Flame, label: 'Fire Department' },
  { icon: HandHeart, label: 'NGOs' },
  { icon: LifeBuoy, label: 'Rescue Teams' },
  { icon: Building2, label: 'Volunteers' },
]

export function Ecosystem() {
  return (
    <section className="relative border-y border-border py-10">
      <div className="mx-auto max-w-7xl overflow-hidden px-5 md:px-8">
        <p className="mb-7 text-center text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          One network · Every responder that matters
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="animate-marquee flex w-max gap-4 pr-4">
            {[...ROLES, ...ROLES].map(({ icon: Icon, label }, index) => (
              <div
                key={`${label}-${index}`}
                className="glass-panel flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
