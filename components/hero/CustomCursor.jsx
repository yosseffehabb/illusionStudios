// ============================================
// CustomCursor.jsx
// ============================================
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Inject styles
    if (!document.getElementById("custom-cursor-styles")) {
      const style = document.createElement("style");
      style.id = "custom-cursor-styles";
      style.textContent = `
        body { cursor: none; }
        .custom-cursor {
          width: 20px;
          height: 20px;
          border: 1px solid hsl(156 60% 35%);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.1s ease, background 0.2s ease;
          mix-blend-mode: difference;
        }
        .custom-cursor-dot {
          width: 4px;
          height: 4px;
          background: hsl(156 60% 35%);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9999;
        }
      `;
      document.head.appendChild(style);
    }

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setTimeout(() => {
        setDotPosition({ x: e.clientX, y: e.clientY });
      }, 50);
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleHoverStart = (e) => {
      const target = e.target;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a")
      ) {
        setIsHovering(true);
      }
    };

    const handleHoverEnd = () => setIsHovering(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleHoverStart);
    document.addEventListener("mouseout", handleHoverEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleHoverStart);
      document.removeEventListener("mouseout", handleHoverEnd);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div
        className="custom-cursor hidden md:block"
        style={{
          left: position.x - 10,
          top: position.y - 10,
          transform: isHovering ? "scale(2)" : "scale(1)",
          background: isHovering ? "hsl(156 60% 35% / 0.2)" : "transparent",
        }}
      />
      <div
        className="custom-cursor-dot hidden md:block"
        style={{
          left: dotPosition.x - 2,
          top: dotPosition.y - 2,
        }}
      />
    </>
  );
}
