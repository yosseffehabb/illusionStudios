// ============================================
// WetAsphaltReflection.jsx
// ============================================
export function WetAsphaltReflection() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-2/5 overflow-hidden pointer-events-none">
      {/* Deep wet surface */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
              to top,
              hsl(0 0% 2% / 0.98) 0%,
              hsl(0 0% 3% / 0.9) 20%,
              hsl(0 0% 4% / 0.7) 50%,
              transparent 100%
            )`,
        }}
      />

      {/* Subtle color reflection from fog */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
              to top,
              hsl(156 40% 15% / 0.15) 0%,
              hsl(156 30% 12% / 0.08) 30%,
              transparent 60%
            )`,
        }}
      />

      {/* Vertical reflection streaks */}
      <div
        className="absolute inset-0"
        style={{
          background: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                hsl(156 50% 30% / 0.04) 1px,
                transparent 3px,
                transparent 60px
              )
            `,
          filter: "blur(1px)",
        }}
      />

      {/* Central puddle reflection glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-32">
        <div
          className="absolute inset-0"
          style={{
            background: `
                radial-gradient(
                  ellipse 100% 100% at 50% 100%,
                  hsl(156 50% 30% / 0.18) 0%,
                  hsl(156 40% 25% / 0.1) 40%,
                  transparent 70%
                )
              `,
            filter: "blur(30px)",
          }}
        />
      </div>

      {/* Horizontal water ripple lines */}
      <div
        className="absolute bottom-10 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(156 45% 25% / 0.1), transparent)",
        }}
      />
      <div
        className="absolute bottom-20 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(156 45% 25% / 0.05), transparent)",
        }}
      />
      <div
        className="absolute bottom-32 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(156 45% 25% / 0.03), transparent)",
        }}
      />
    </div>
  );
}
