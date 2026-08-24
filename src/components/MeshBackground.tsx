import { Plus, Ring, Sparkle, Star } from './Doodles'

/** Full-bleed animated mesh-gradient backdrop with a scatter of floating doodles. */
export default function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-cream" aria-hidden="true">
      <div
        className="absolute -top-1/4 -left-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-pink) 0%, transparent 70%)', animation: 'blob-drift-1 22s ease-in-out infinite' }}
      />
      <div
        className="absolute top-0 -right-1/4 h-[65vmax] w-[65vmax] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-blue) 0%, transparent 70%)', animation: 'blob-drift-2 26s ease-in-out infinite' }}
      />
      <div
        className="absolute -bottom-1/3 left-1/4 h-[75vmax] w-[75vmax] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-yellow) 0%, transparent 70%)', animation: 'blob-drift-3 30s ease-in-out infinite' }}
      />
      <div
        className="absolute right-0 bottom-0 h-[60vmax] w-[60vmax] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-purple) 0%, transparent 70%)', animation: 'blob-drift-1 24s ease-in-out infinite reverse' }}
      />

      <Star className="animate-float absolute top-[8%] left-[6%] h-8 w-8 text-purple/50 sm:h-10 sm:w-10" style={{ animationDelay: '0.2s' }} />
      <Sparkle className="animate-float absolute top-[16%] right-[10%] h-6 w-6 text-coral/60 sm:h-8 sm:w-8" style={{ animationDelay: '1.4s' }} />
      <Ring className="animate-float absolute bottom-[14%] left-[9%] h-9 w-9 text-blue/50 sm:h-12 sm:w-12" style={{ animationDelay: '0.8s' }} />
      <Plus className="animate-float absolute right-[7%] bottom-[20%] h-7 w-7 text-pink/50 sm:h-9 sm:w-9" style={{ animationDelay: '2s' }} />
      <Sparkle className="animate-float absolute top-[45%] left-[3%] hidden h-6 w-6 text-yellow/70 sm:block" style={{ animationDelay: '1s' }} />
      <Star className="animate-float absolute top-[42%] right-[4%] hidden h-6 w-6 text-mint/60 sm:block" style={{ animationDelay: '2.4s' }} />
    </div>
  )
}
