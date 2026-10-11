import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const dimensionClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  }[size];

  return (
    <div
      className={`${dimensionClasses} bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center shadow-lg border-2 border-amber-400/80 overflow-hidden relative shrink-0 select-none group ${className}`}
      title="Study Bull"
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background Radial Gradient */}
          <radialGradient id="badgeGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#050811" />
          </radialGradient>

          {/* Gold Trim Gradient */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Bull Skin Gradient */}
          <linearGradient id="bullSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="30%" stopColor="#92400E" />
            <stop offset="70%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Horn Gradient */}
          <linearGradient id="hornLeft" x1="0%" y1="100%" x2="80%" y2="0%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <linearGradient id="hornRight" x1="100%" y1="100%" x2="20%" y2="0%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Cap Shading */}
          <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#090D16" />
          </linearGradient>
        </defs>

        {/* Badge Base Circle */}
        <circle cx="60" cy="60" r="58" fill="url(#badgeGlow)" />
        <circle cx="60" cy="60" r="56" stroke="url(#goldGradient)" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="52" stroke="#F59E0B" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.6" />

        {/* Outer Horns */}
        {/* Left Horn */}
        <path
          d="M 36 50 C 26 40 18 24 24 14 C 28 8 36 10 38 18 C 40 28 42 38 46 46 Z"
          fill="url(#hornLeft)"
          filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.5))"
        />
        {/* Right Horn */}
        <path
          d="M 84 50 C 94 40 102 24 96 14 C 92 8 84 10 82 18 C 80 28 78 38 74 46 Z"
          fill="url(#hornRight)"
          filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.5))"
        />

        {/* Bull Head & Muscular Neck */}
        <path
          d="M 40 48 C 40 38 80 38 80 48 C 86 56 84 76 60 84 C 36 76 34 56 40 48 Z"
          fill="url(#bullSkin)"
        />

        {/* Bull Cheek & Brow Highlights */}
        <path
          d="M 44 48 C 46 44 54 42 60 42 C 66 42 74 44 76 48 C 70 52 50 52 44 48 Z"
          fill="#D97706"
          opacity="0.5"
        />

        {/* Muzzle / Snout */}
        <ellipse cx="60" cy="71" rx="15" ry="10" fill="#B45309" />
        <ellipse cx="60" cy="72" rx="13" ry="8" fill="#FDE68A" opacity="0.3" />

        {/* Nostrils */}
        <ellipse cx="54" cy="72" rx="2.5" ry="2" fill="#260C02" />
        <ellipse cx="66" cy="72" rx="2.5" ry="2" fill="#260C02" />

        {/* Bull Ring in Nose (Classic Mascot Emblem) */}
        <path
          d="M 55 74 C 55 79 65 79 65 74"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Piercing Determined Eyes */}
        <path d="M 46 54 Q 52 52 55 56 Q 50 59 46 54 Z" fill="#FFFFFF" />
        <circle cx="51" cy="55" r="2" fill="#0F172A" />
        <circle cx="50" cy="54" r="0.75" fill="#FFFFFF" />

        <path d="M 74 54 Q 68 52 65 56 Q 70 59 74 54 Z" fill="#FFFFFF" />
        <circle cx="69" cy="55" r="2" fill="#0F172A" />
        <circle cx="70" cy="54" r="0.75" fill="#FFFFFF" />

        {/* Scholar Mortarboard (Graduation Cap) */}
        <polygon
          points="60,20 90,30 60,40 30,30"
          fill="url(#capGradient)"
          stroke="#F59E0B"
          strokeWidth="1.2"
          filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.6))"
        />
        {/* Cap Skull Under-cap */}
        <path d="M 44 35 Q 60 42 76 35 L 73 42 Q 60 46 47 42 Z" fill="#0F172A" />

        {/* Gold Cap Center Button & Tassel */}
        <circle cx="60" cy="30" r="2.5" fill="#FDE68A" stroke="#B45309" strokeWidth="0.5" />
        {/* Tassel String draped to left horn */}
        <path
          d="M 60 30 Q 42 32 38 43"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Tassel Fringe */}
        <polygon points="36,43 40,43 41,51 35,51" fill="#FDE68A" stroke="#B45309" strokeWidth="0.5" />

        {/* Open Book Emblem at Base */}
        <path
          d="M 32 94 Q 46 88 58 91 L 58 103 Q 46 100 32 105 Z"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="0.75"
        />
        <path
          d="M 88 94 Q 74 88 62 91 L 62 103 Q 74 100 88 105 Z"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="0.75"
        />
        {/* Book Spine Center */}
        <polygon points="58,91 62,91 62,103 58,103" fill="#D97706" />

        {/* Mini Book Lines */}
        <line x1="36" y1="94" x2="54" y2="93" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="36" y1="97" x2="52" y2="96" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="36" y1="100" x2="54" y2="99" stroke="#94A3B8" strokeWidth="0.75" />

        <line x1="66" y1="93" x2="84" y2="94" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="68" y1="96" x2="84" y2="97" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="66" y1="99" x2="84" y2="100" stroke="#94A3B8" strokeWidth="0.75" />

        {/* Golden Stars flanking the mascot */}
        <polygon points="18,58 20,62 25,62 21,65 23,69 18,66 14,69 16,65 12,62 17,62" fill="#F59E0B" opacity="0.8" />
        <polygon points="102,58 104,62 109,62 105,65 107,69 102,66 98,69 100,65 96,62 101,62" fill="#F59E0B" opacity="0.8" />
      </svg>
    </div>
  );
};

