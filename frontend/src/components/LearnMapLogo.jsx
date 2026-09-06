import React from 'react';

export default function LearnMapLogo({ size = 'md', showText = true, className = '' }) {
  // Dimension presets
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', subtext: 'text-[9px]' },
    md: { icon: 36, text: 'text-lg', subtext: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', subtext: 'text-xs' },
    xl: { icon: 64, text: 'text-3xl', subtext: 'text-sm' },
  };

  const config = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Crisp Vector Emblem */}
      <svg
        width={config.icon}
        height={config.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform hover:scale-105"
      >
        <defs>
          <linearGradient id="learnMapGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#7847EB" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="learnMapRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9061F9" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="learnMapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B388FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7847EB" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="50" cy="50" r="46" fill="url(#learnMapGlow)" />

        {/* Outer Orbit Ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#learnMapRing)"
          strokeWidth="2.5"
          strokeDasharray="280"
          strokeDashoffset="10"
        />

        {/* Middle Radar Ring */}
        <circle
          cx="50"
          cy="50"
          r="37"
          stroke="url(#learnMapRing)"
          strokeWidth="2"
          strokeOpacity="0.75"
        />

        {/* Inner Tracking Ring */}
        <circle
          cx="50"
          cy="50"
          r="29"
          stroke="url(#learnMapRing)"
          strokeWidth="1.75"
          strokeOpacity="0.6"
        />

        {/* Constellation Network Nodes on Orbit */}
        <g stroke="url(#learnMapRing)" strokeWidth="1.2" opacity="0.9">
          <line x1="72" y1="28" x2="84" y2="40" />
          <line x1="84" y1="40" x2="80" y2="58" />
          <line x1="80" y1="58" x2="70" y2="72" />
          <line x1="70" y1="72" x2="55" y2="79" />
          <line x1="72" y1="28" x2="68" y2="42" />
          <line x1="80" y1="58" x2="68" y2="55" />
        </g>

        {/* Small Node Dots */}
        <circle cx="72" cy="28" r="2.8" fill="#D946EF" />
        <circle cx="84" cy="40" r="3.2" fill="#EC4899" />
        <circle cx="80" cy="58" r="3.5" fill="#F472B6" />
        <circle cx="70" cy="72" r="3" fill="#C084FC" />
        <circle cx="55" cy="79" r="2.5" fill="#A855F7" />
        <circle cx="28" cy="74" r="2.2" fill="#818CF8" />
        <circle cx="20" cy="45" r="2.5" fill="#9333EA" />

        {/* Center Cap Base Ring */}
        <ellipse cx="50" cy="56" rx="14" ry="7" fill="url(#learnMapGrad1)" opacity="0.3" />

        {/* Graduation Cap Mortarboard */}
        <path
          d="M50 32 L78 44 L50 56 L22 44 Z"
          fill="url(#learnMapGrad1)"
          stroke="#FAF7FD"
          strokeWidth="1"
        />
        {/* Cap skull base */}
        <path
          d="M34 50 Q34 62 50 63 Q66 62 66 50 L66 48 L34 48 Z"
          fill="#581C87"
          opacity="0.95"
        />

        {/* Compass / Radar Pointer Needle */}
        <polygon
          points="50,22 57,48 50,54 43,48"
          fill="#FAF7FD"
        />
        <polygon
          points="50,54 55,50 50,78 45,50"
          fill="#EC4899"
        />
        {/* Compass Center Pivot */}
        <circle cx="50" cy="50" r="3.5" fill="#3B0764" stroke="#FAF7FD" strokeWidth="1.2" />

        {/* Cap Tassel */}
        <path
          d="M30 46 L27 58"
          stroke="#F472B6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="27" cy="59" r="1.8" fill="#F472B6" />
      </svg>

      {/* Brand Typography matching the image: "Learn" in violet, "Map" in rose/pink */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-display font-extrabold tracking-tight leading-none ${config.text}`}>
            <span className="text-[#6D28D9] dark:text-[#A78BFA]">Learn</span>
            <span className="text-[#DB2777] dark:text-[#F472B6]">Map</span>
          </div>
          <span className={`text-[#6C5B82] dark:text-[#CAB7E4] font-medium leading-tight mt-0.5 ${config.subtext}`}>
            Misconception Radar
          </span>
        </div>
      )}
    </div>
  );
}
