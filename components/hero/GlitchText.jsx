// ============================================
// GlitchText.jsx
// ============================================
import { useEffect } from "react";

export function GlitchText({ text, className = "" }) {
  useEffect(() => {
    // Inject styles
    if (!document.getElementById("glitch-text-styles")) {
      const style = document.createElement("style");
      style.id = "glitch-text-styles";
      style.textContent = `
        .glitch-text {
          position: relative;
          display: inline-block;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch-text::before {
          animation: glitch-1 2.5s infinite linear alternate-reverse;
          // clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
          // color: hsl(156 60% 35%);
        }
        .glitch-text::after {
          animation: glitch-2 2.5s infinite linear alternate-reverse;
          // clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
          // color: hsl(0 0% 95% / 0.8);
        }
        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(-3px, -3px); }
          60% { transform: translate(3px, 3px); }
          80% { transform: translate(3px, -3px); }
        }
        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(3px, -3px); }
          40% { transform: translate(3px, 3px); }
          60% { transform: translate(-3px, -3px); }
          80% { transform: translate(-3px, 3px); }
        }
        @keyframes letter-reveal {
          0% {
            opacity: 0;
            transform: translateY(100%) rotateX(-90deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0);
          }
        }
        .animate-letter-reveal {
          animation: letter-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <span className={`glitch-text ${className}`} data-text={text}>
      {text.split("").map((letter, index) => (
        <span
          key={index}
          className="inline-block opacity-0 animate-letter-reveal"
          style={{
            animationDelay: `${400 + index * 80}ms`,
          }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}
