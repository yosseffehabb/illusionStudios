// ============================================
// FogLayer.jsx
// ============================================
import { useEffect, useState } from "react";

export function FogLayer() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    // Inject styles
    if (!document.getElementById("fog-layer-styles")) {
      const style = document.createElement("style");
      style.id = "fog-layer-styles";
      style.textContent = `
        @keyframes fog-drift-1 {
          0%, 100% {
            transform: translateX(-15%) translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateX(15%) translateY(-8%) scale(1.1);
            opacity: 0.65;
          }
        }
        @keyframes fog-drift-2 {
          0%, 100% {
            transform: translateX(10%) translateY(-5%) scale(1.05);
            opacity: 0.35;
          }
          50% {
            transform: translateX(-20%) translateY(5%) scale(0.95);
            opacity: 0.55;
          }
        }
        @keyframes fog-drift-3 {
          0%, 100% {
            transform: translateX(0) translateY(8%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(-10%) translateY(-12%) scale(1.15);
            opacity: 0.5;
          }
        }
        .animate-fog-1 {
          animation: fog-drift-1 20s ease-in-out infinite;
        }
        .animate-fog-2 {
          animation: fog-drift-2 25s ease-in-out infinite;
        }
        .animate-fog-3 {
          animation: fog-drift-3 18s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }

    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const parallaxX1 = (mousePosition.x - 0.5) * 30;
  const parallaxY1 = (mousePosition.y - 0.5) * 20;
  const parallaxX2 = (mousePosition.x - 0.5) * -40;
  const parallaxY2 = (mousePosition.y - 0.5) * -25;
  const parallaxX3 = (mousePosition.x - 0.5) * 50;
  const parallaxY3 = (mousePosition.y - 0.5) * 30;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep base layer */}
      <div
        className="absolute inset-0 animate-fog-1 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${parallaxX1}px, ${parallaxY1}px)`,
          background: `
            radial-gradient(ellipse 150% 100% at 30% 70%, hsl(156 45% 25% / 0.35) 0%, transparent 55%),
            radial-gradient(ellipse 120% 80% at 75% 30%, hsl(156 30% 18% / 0.28) 0%, transparent 50%)
          `,
        }}
      />

      {/* Mid fog layer with stronger presence */}
      <div
        className="absolute inset-0 animate-fog-2 transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${parallaxX2}px, ${parallaxY2}px)`,
          background: `
            radial-gradient(ellipse 100% 60% at 15% 60%, hsl(156 50% 28% / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 85% 40%, hsl(156 35% 20% / 0.35) 0%, transparent 45%)
          `,
        }}
      />

      {/* Top fog layer - most reactive */}
      <div
        className="absolute inset-0 animate-fog-3 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${parallaxX3}px, ${parallaxY3}px)`,
          background: `
            radial-gradient(ellipse 70% 50% at 50% 50%, hsl(156 45% 25% / 0.22) 0%, transparent 45%),
            radial-gradient(ellipse 120% 80% at 35% 75%, hsl(156 40% 22% / 0.3) 0%, transparent 50%)
          `,
        }}
      />

      {/* Intense ground fog */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/3 animate-fog-2"
        style={{
          transform: `translateX(${parallaxX1 * 0.5}px)`,
          background: `linear-gradient(to top, 
            hsl(156 45% 25% / 0.5) 0%, 
            hsl(156 35% 20% / 0.3) 30%, 
            hsl(156 25% 15% / 0.15) 60%, 
            transparent 100%
          )`,
        }}
      />

      {/* Dramatic fog wisps */}
      <div
        className="absolute top-1/4 left-0 w-full h-1/2 animate-fog-3"
        style={{
          transform: `translate(${parallaxX2 * 0.7}px, ${parallaxY2 * 0.5}px)`,
          background: `
            radial-gradient(ellipse 200% 30% at 0% 50%, hsl(156 50% 30% / 0.25) 0%, transparent 50%),
            radial-gradient(ellipse 200% 30% at 100% 50%, hsl(156 50% 30% / 0.25) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
}
