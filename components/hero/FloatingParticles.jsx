// ============================================
// FloatingParticles.jsx
// ============================================
//

export function FloatingParticles() {
  const getShape = (shape) => {
    switch (shape) {
      case "square":
        return { borderRadius: "0", transform: "none" };
      case "diamond":
        return { borderRadius: "0", transform: "rotate(45deg)" };
      default:
        return { borderRadius: "50%", transform: "none" };
    }
  };

  // Static particles - generated at module level to avoid random during render
  const particles = (() => {
    const shapes = ["circle", "square", "diamond"];
    const staticParticles = [];

    for (let i = 0; i < 50; i++) {
      staticParticles.push({
        id: i,
        x: (i * 37.5) % 100, // Deterministic positioning
        size: 1.5 + (i % 3),
        delay: (i * 0.24) % 12,
        duration: 8 + (i % 8),
        opacity: 0.2 + (i % 5) * 0.08,
        shape: shapes[i % 3],
      });
    }

    return staticParticles;
  })();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes float-particle {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg);
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            95% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100vh) translateX(30px) rotate(360deg);
              opacity: 0;
            }
          }
        `,
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => {
          const shapeStyles = getShape(particle.shape);

          return (
            <div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                bottom: "-20px",
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `hsl(156 60% 45% / ${particle.opacity})`,
                boxShadow: `0 0 ${particle.size * 3}px hsl(156 60% 45% / ${
                  particle.opacity * 0.5
                })`,
                animation: `float-particle ${particle.duration}s linear infinite`,
                animationDelay: `${particle.delay}s`,
                ...shapeStyles,
              }}
            />
          );
        })}

        {/* Larger accent particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`accent-${i}`}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              bottom: "-30px",
              width: "2px",
              height: "20px",
              background:
                "linear-gradient(to top, hsl(156 70% 45% / 0.6), transparent)",
              animation: `float-particle ${15 + i * 2}s linear infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
