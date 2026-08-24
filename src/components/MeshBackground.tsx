import { tagGradient } from "../lib/palette";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface MeshBackgroundProps {
  /** Tag whose mood colors the gradient; falls back to a neutral mix when absent. */
  tag?: string;
}

/** Full-bleed soft radial-gradient backdrop, keyed to the current fact's tag, with a faint grain overlay. */
export default function MeshBackground({ tag }: MeshBackgroundProps) {
  const [a, b, c] = tagGradient(tag).stops;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-cream" aria-hidden="true">
      <div
        className="absolute inset-0 transition-[background] duration-700 ease-out"
        style={{
          background: `radial-gradient(60% 55% at 78% 12%, ${a} 0%, transparent 62%), radial-gradient(50% 50% at 12% 78%, ${b} 0%, transparent 60%), radial-gradient(45% 45% at 62% 92%, ${c} 0%, transparent 58%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
