import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Particle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  baseAlpha: number
  phase: number
}

interface ParticlesProps {
  className?: string
  quantity?: number
}

export function Particles({ className, quantity = 70 }: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let particles: Particle[] = []
    let frame = 0
    let time = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { clientWidth, clientHeight } = canvas
      canvas.width = clientWidth * dpr
      canvas.height = clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: quantity }, () => ({
        x: Math.random() * clientWidth,
        y: Math.random() * clientHeight,
        radius: 0.6 + Math.random() * 1.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        baseAlpha: 0.12 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = () => {
      const { clientWidth, clientHeight } = canvas
      ctx.clearRect(0, 0, clientWidth, clientHeight)
      const isDark = document.documentElement.classList.contains('dark')
      const color = isDark ? '165, 180, 252' : '79, 70, 229'

      for (const particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy
        if (particle.x < -10) particle.x = clientWidth + 10
        if (particle.x > clientWidth + 10) particle.x = -10
        if (particle.y < -10) particle.y = clientHeight + 10
        if (particle.y > clientHeight + 10) particle.y = -10

        const twinkle = 0.65 + 0.35 * Math.sin(time * 1.6 + particle.phase)
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${particle.baseAlpha * twinkle})`
        ctx.fill()
      }
    }

    const loop = () => {
      time += 0.016
      draw()
      frame = requestAnimationFrame(loop)
    }

    resize()
    if (reduceMotion) {
      draw()
    } else {
      frame = requestAnimationFrame(loop)
    }

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [quantity])

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      aria-hidden
    />
  )
}
