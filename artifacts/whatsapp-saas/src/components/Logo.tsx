import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-5xl",
    xl: "text-8xl",
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {showText && (
        <div className="relative group flex flex-col items-start">
          <span 
            className={`font-black tracking-tighter italic ${sizes[size]} leading-none pr-2`}
            style={{
              fontFamily: "'Inter', sans-serif",
              background: "linear-gradient(95deg, #004d4d 0%, #00b8a9 45%, #00ffcc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 12px rgba(0, 184, 169, 0.4))",
              letterSpacing: "-0.07em",
              transform: "skewX(-5deg)",
            }}
          >
            FLOWSOFTWARE
          </span>
          <div 
            className="w-[90%] h-1.5 rounded-full mt-1 opacity-90"
            style={{
              background: "linear-gradient(to right, #004d4d, #00b8a9, #00ffcc)",
              transform: "skewX(-30deg)",
              boxShadow: "0 0 10px rgba(0, 184, 169, 0.5)",
            }}
          />
        </div>
      )}
    </div>
  );
}
