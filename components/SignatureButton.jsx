// ============================================
// CTAButton.jsx
// ============================================
"use client";

import { useEffect } from "react";

/**
 * Standalone CTA Button Component
 *
 * @param {string} text - Button text to display
 * @param {string} path - URL path for navigation (optional)
 * @param {number} delay - Animation delay in milliseconds (default: 0)
 * @param {function} onClick - Custom click handler (optional)
 */
export default function SignatureButton({ text, path, delay = 0, onClick }) {
  useEffect(() => {
    // Inject button-specific styles if not already present
    if (!document.getElementById("cta-button-styles")) {
      const style = document.createElement("style");
      style.id = "cta-button-styles";
      style.textContent = `
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

        .cta-button-reveal {
          animation: button-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .cta-button-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            transparent,
            hsl(156 45% 25% / 0.2),
            transparent
          );
          transform: translateX(-100%);
          transition: transform 0.7s ease;
        }

        .cta-button:hover .cta-button-shimmer {
          transform: translateX(100%);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (path) {
      window.location.href = path;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="cta-button px-8 py-4 text-sm font-medium tracking-wider uppercase border border-[hsl(156_45%_25%)] bg-[hsl(156_45%_25%/0.1)] text-white hover:bg-[hsl(156_45%_25%/0.2)] transition-all opacity-0 cta-button-reveal group relative overflow-hidden"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <span className="relative z-10">{text}</span>
      <div className="cta-button-shimmer" />
    </button>
  );
}
