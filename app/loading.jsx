"use client";

import { useEffect } from "react";

export default function Loading() {
  useEffect(() => {
    document.body.classList.add("loading-active");

    return () => {
      document.body.classList.remove("loading-active");
    };
  }, []);

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-neutral-900 animate-fade-in">
      <div className="flex flex-col items-center gap-8">
        {/* Creative orbital loader */}
        <div className="relative h-32 w-32">
          {/* Center core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-4 w-4 bg-primarygreen-500 animate-pulse-scale"
              style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
            />
          </div>

          {/* Trace rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border border-primarygreen-500/30 animate-ring-pulse" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-24 w-24 rounded-full border border-primarygreen-300/20 animate-ring-pulse"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-neutral-50 text-lg font-bold tracking-wider uppercase">
            Loading
          </p>

          <div className="flex gap-1.5">
            <div className="h-1 w-1 rounded-full bg-primarygreen-500 animate-bounce" />
            <div
              className="h-1 w-1 rounded-full bg-primarygreen-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="h-1 w-1 rounded-full bg-primarygreen-500 animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>

      {/* Scoped animations */}
      <style jsx>{`
        @keyframes pulse-scale {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }

        @keyframes ring-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .animate-ring-pulse {
          animation: ring-pulse 2s ease-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
