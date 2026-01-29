// ============================================
// GeometricElements.jsx
// ============================================
import { useEffect } from "react";

export function GeometricElements() {
  useEffect(() => {
    // Inject styles
    if (!document.getElementById("geometric-elements-styles")) {
      const style = document.createElement("style");
      style.id = "geometric-elements-styles";
      style.textContent = `
        @keyframes geometric-rotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes geometric-pulse {
          0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes line-expand {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        .animate-geometric-rotate {
          animation: geometric-rotate 60s linear infinite;
        }
        .animate-geometric-pulse {
          animation: geometric-pulse 4s ease-in-out infinite;
        }
        .animate-line-expand {
          animation: line-expand 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-900 { animation-delay: 900ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1200 { animation-delay: 1200ms; }
        .animation-delay-1400 { animation-delay: 1400ms; }
        .animation-delay-1600 { animation-delay: 1600ms; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large rotating hexagon */}
      <div
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] animate-geometric-rotate"
        style={{
          border: "1px solid hsl(156 45% 25% / 0.1)",
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      />

      {/* Second counter-rotating hexagon */}
      <div
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px]"
        style={{
          border: "1px solid hsl(156 50% 30% / 0.08)",
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          animation: "geometric-rotate 45s linear infinite reverse",
        }}
      />

      {/* Pulsing circle */}
      <div
        className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full animate-geometric-pulse"
        style={{
          border: "1px solid hsl(156 45% 25% / 0.06)",
        }}
      />

      {/* Corner accents - top left */}
      <div className="absolute top-20 left-20">
        <div
          className="w-32 h-px opacity-0 animate-line-expand animation-delay-1000"
          style={{
            transformOrigin: "left",
            background:
              "linear-gradient(to right, transparent, hsl(156 45% 25% / 0.3), transparent)",
          }}
        />
        <div
          className="w-px h-32 opacity-0 animate-line-expand animation-delay-1200"
          style={{
            transformOrigin: "top",
            background:
              "linear-gradient(to bottom, transparent, hsl(156 45% 25% / 0.3), transparent)",
          }}
        />
      </div>

      {/* Corner accents - top right */}
      <div className="absolute top-20 right-20 flex flex-col items-end">
        <div
          className="w-32 h-px opacity-0 animate-line-expand animation-delay-1000"
          style={{
            transformOrigin: "right",
            background:
              "linear-gradient(to right, transparent, hsl(156 45% 25% / 0.3), transparent)",
          }}
        />
        <div
          className="w-px h-32 opacity-0 animate-line-expand animation-delay-1200"
          style={{
            transformOrigin: "top",
            background:
              "linear-gradient(to bottom, transparent, hsl(156 45% 25% / 0.3), transparent)",
          }}
        />
      </div>

      {/* Corner accents - bottom left */}
      <div className="absolute bottom-20 left-20 flex flex-col">
        <div
          className="w-px h-32 opacity-0 animate-line-expand animation-delay-1400"
          style={{
            transformOrigin: "bottom",
            background:
              "linear-gradient(to bottom, transparent, hsl(156 45% 25% / 0.3), transparent)",
          }}
        />
        <div
          className="w-32 h-px opacity-0 animate-line-expand animation-delay-1600"
          style={{
            transformOrigin: "left",
            background:
              "linear-gradient(to right, transparent, hsl(156 45% 25% / 0.3), transparent)",
          }}
        />
      </div>

      {/* Corner accents - bottom right */}
      <div className="absolute bottom-20 right-20 flex flex-col items-end">
        <div
          className="w-px h-32 opacity-0 animate-line-expand animation-delay-1400"
          style={{
            transformOrigin: "bottom",
            background:
              "linear-gradient(to bottom, transparent, hsl(156 45% 25% / 0.3), transparent)",
          }}
        />
        <div
          className="w-32 h-px opacity-0 animate-line-expand animation-delay-1600"
          style={{
            transformOrigin: "right",
            background:
              "linear-gradient(to right, transparent, hsl(156 45% 25% / 0.3), transparent)",
          }}
        />
      </div>

      {/* Diagonal accent lines */}
      <div
        className="absolute top-0 left-1/4 w-px h-40 opacity-0 animate-line-expand animation-delay-800"
        style={{
          transform: "rotate(30deg)",
          transformOrigin: "top",
          background:
            "linear-gradient(to bottom, hsl(156 45% 25% / 0.2), transparent)",
        }}
      />
      <div
        className="absolute top-0 right-1/4 w-px h-40 opacity-0 animate-line-expand animation-delay-900"
        style={{
          transform: "rotate(-30deg)",
          transformOrigin: "top",
          background:
            "linear-gradient(to bottom, hsl(156 45% 25% / 0.2), transparent)",
        }}
      />
    </div>
  );
}
