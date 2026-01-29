// ============================================
// LightBeams.jsx
// ============================================
import { useEffect } from "react";

export function LightBeams() {
  useEffect(() => {
    // Inject styles
    if (!document.getElementById("light-beams-styles")) {
      const style = document.createElement("style");
      style.id = "light-beams-styles";
      style.textContent = `
        @keyframes light-flicker {
          0%, 100% { opacity: 0.12; }
          25% { opacity: 0.2; }
          50% { opacity: 0.08; }
          75% { opacity: 0.25; }
        }
        @keyframes subtle-pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.05); }
        }
        .animate-flicker {
          animation: light-flicker 3s ease-in-out infinite;
        }
        .animate-pulse-subtle {
          animation: subtle-pulse 4s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main dramatic light beam */}
      <div
        className="absolute animate-flicker"
        style={{
          top: "-30%",
          left: "15%",
          width: "300px",
          height: "180%",
          background: `linear-gradient(
            180deg,
            transparent 0%,
            hsl(156 50% 30% / 0.1) 15%,
            hsl(156 50% 30% / 0.18) 50%,
            hsl(156 50% 30% / 0.1) 85%,
            transparent 100%
          )`,
          transform: "rotate(20deg)",
          filter: "blur(40px)",
        }}
      />

      {/* Secondary crossing beam */}
      <div
        className="absolute animate-flicker"
        style={{
          top: "-20%",
          right: "20%",
          width: "200px",
          height: "150%",
          background: `linear-gradient(
            180deg,
            transparent 0%,
            hsl(156 40% 25% / 0.08) 25%,
            hsl(156 40% 25% / 0.14) 50%,
            hsl(156 40% 25% / 0.08) 75%,
            transparent 100%
          )`,
          transform: "rotate(-15deg)",
          filter: "blur(50px)",
          animationDelay: "1.5s",
        }}
      />

      {/* Thin accent beam */}
      <div
        className="absolute animate-flicker"
        style={{
          top: "-10%",
          left: "45%",
          width: "80px",
          height: "130%",
          background: `linear-gradient(
            180deg,
            transparent 0%,
            hsl(156 60% 40% / 0.12) 40%,
            hsl(156 60% 40% / 0.18) 50%,
            hsl(156 60% 40% / 0.12) 60%,
            transparent 100%
          )`,
          transform: "rotate(3deg)",
          filter: "blur(25px)",
          animationDelay: "0.8s",
        }}
      />

      {/* Central dramatic glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-pulse-subtle"
        style={{
          background: `radial-gradient(circle, hsl(156 50% 30% / 0.15) 0%, hsl(156 40% 20% / 0.08) 40%, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Hot spot glow behind text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px]"
        style={{
          background: `radial-gradient(ellipse, hsl(156 60% 35% / 0.2) 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
