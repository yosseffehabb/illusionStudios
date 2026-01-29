// ============================================
// HeroSection.jsx
// ============================================
"use client";

import { useEffect } from "react";
import { CustomCursor } from "./CustomCursor";
import { FogLayer } from "./FogLayer";
import { FloatingParticles } from "./FloatingParticles";
import { LightBeams } from "./LightBeams";
import { WetAsphaltReflection } from "./WetAsphaltReflection";
import { GeometricElements } from "./GeometricElements";
import { GlitchText } from "./GlitchText";

export function HeroSection() {
  useEffect(() => {
    // Inject overlay effects styles
    if (!document.getElementById("hero-overlay-styles")) {
      const style = document.createElement("style");
      style.id = "hero-overlay-styles";
      style.textContent = `
        /* Scanlines */
        .scanlines {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 99;
          background: repeating-linear-gradient(  
            0deg,
            transparent,
            transparent 2px,
            hsl(0 0% 0% / 0.03) 2px,
            hsl(0 0% 0% / 0.03) 4px
          );
        }

        /* Film grain overlay */
        .grain-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.06;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          animation: grain-shift 0.5s steps(10) infinite;
        }

        @keyframes grain-shift {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -2%); }
          20% { transform: translate(2%, 2%); }
          30% { transform: translate(-1%, 1%); }
          40% { transform: translate(1%, -1%); }
          50% { transform: translate(-2%, 2%); }
          60% { transform: translate(2%, -2%); }
          70% { transform: translate(0, 2%); }
          80% { transform: translate(-2%, 0); }
          90% { transform: translate(2%, 1%); }
        }

        /* Vignette effect */
        .vignette {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 20%, hsl(0 0% 3% / 0.4) 60%, hsl(0 0% 3%) 100%);
          z-index: 10;
        }

        @keyframes text-reveal {
          0% {
            opacity: 0;
            transform: translateY(60px) skewY(5deg);
            filter: blur(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) skewY(0);
            filter: blur(0);
          }
        }

        @keyframes button-reveal {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px hsl(156 45% 25% / 0.3), inset 0 0 20px hsl(156 45% 25% / 0.1);
          }
          50% {
            box-shadow: 0 0 40px hsl(156 45% 25% / 0.5), inset 0 0 30px hsl(156 45% 25% / 0.2);
          }
        }

        .animate-text-reveal {
          animation: text-reveal 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-button-reveal {
          animation: button-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#080808] flex items-center justify-center">
      {/* Custom cursor */}
      <CustomCursor />

      {/* Scanlines overlay */}
      <div className="scanlines" />

      {/* Film grain overlay */}
      <div className="grain-overlay" />

      {/* Vignette effect */}
      <div className="vignette" />

      {/* Geometric background elements */}
      <GeometricElements />

      {/* Light beams */}
      <LightBeams />

      {/* Fog layers */}
      <FogLayer />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Wet asphalt reflection */}
      <WetAsphaltReflection />

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6">
        {/* Pre-title accent line */}
        <div
          className="w-16 h-px opacity-0 animate-line-expand"
          style={{
            transformOrigin: "center",
            background:
              "linear-gradient(to right, transparent, hsl(156 45% 25%), transparent)",
          }}
        />

        {/* Brand name with glitch effect */}
        <h1
          className="font-bold text-[clamp(3rem,15vw,16rem)] leading-[0.8] tracking-[0.12em] text-white mt-8 whitespace-nowrap"
          style={{
            textShadow: `
      0 0 80px hsl(156 50% 30% / 0.5),
      0 0 150px hsl(156 40% 25% / 0.3)
    `,
          }}
        >
          <GlitchText text="ILLUSION" />
        </h1>
        {/* Slogan with stagger */}
        <div className="overflow-hidden mt-8 md:mt-10">
          <p className="text-gray-400 text-xs md:text-sm tracking-[0.4em] uppercase opacity-0 animate-text-reveal animation-delay-1000">
            None of this is real, it’s all an illusion.
          </p>
        </div>

        {/* Accent line below slogan */}
        <div
          className="w-24 h-px mt-6 opacity-0 animate-line-expand animation-delay-1200"
          style={{
            transformOrigin: "center",
            background:
              "linear-gradient(to right, transparent, hsl(156 45% 25% / 0.5), transparent)",
          }}
        />

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mt-14 md:mt-20 w-full max-w-xs">
          <button className="px-8 py-4 text-sm font-medium tracking-wider uppercase border border-[hsl(156_45%_25%)] bg-[hsl(156_45%_25%/0.1)] text-white hover:bg-[hsl(156_45%_25%/0.2)] transition-all opacity-0 animate-button-reveal animation-delay-1200 group relative overflow-hidden">
            <span className="relative z-10">Shop Now</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[hsl(156_45%_25%/0.2)] to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          <button className="px-8 py-4 text-sm font-medium tracking-wider uppercase border border-[hsl(156_45%_25%)] bg-[hsl(156_45%_25%/0.1)] text-white hover:bg-[hsl(156_45%_25%/0.2)] transition-all opacity-0 animate-button-reveal animation-delay-1400 group relative overflow-hidden">
            <span className="relative z-10">contact us</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[hsl(156_45%_25%/0.2)] to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
          <button className="px-8 py-4 text-sm font-medium tracking-wider uppercase border border-[hsl(156_45%_25%)] bg-[hsl(156_45%_25%/0.1)] text-white hover:bg-[hsl(156_45%_25%/0.2)] transition-all opacity-0 animate-button-reveal animation-delay-1400 group relative overflow-hidden">
            <span className="relative z-10">Size Charts</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[hsl(156_45%_25%/0.2)] to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </div>

      {/* Bottom fade for depth */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to top, hsl(0 0% 3%) 0%, transparent 100%)",
        }}
      />
    </section>
  );
}
