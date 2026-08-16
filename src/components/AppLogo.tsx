import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLiveDot?: boolean;
}

export function AppLogo({ size = 'md', className = '', showLiveDot = true }: AppLogoProps) {
  // Dimension mapping
  const sizeStyles = {
    xs: {
      container: 'w-6 h-6 rounded-lg text-[10px]',
      text: 'text-[11px] font-black',
      dot: 'w-2 h-2 -bottom-0.5 -right-0.5 border',
    },
    sm: {
      container: 'w-8 h-8 rounded-xl text-xs shadow-xs',
      text: 'text-sm font-black tracking-tight',
      dot: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5 border-[1.5px]',
    },
    md: {
      container: 'w-11 h-11 rounded-2xl text-base shadow-md shadow-blue-900/25 ring-1 ring-blue-400/40',
      text: 'text-lg font-black tracking-normal',
      dot: 'w-3.5 h-3.5 -bottom-1 -right-1 border-2',
    },
    lg: {
      container: 'w-14 h-14 rounded-2xl text-xl shadow-lg shadow-blue-900/30 ring-2 ring-blue-400/50',
      text: 'text-2xl font-black tracking-tight',
      dot: 'w-4 h-4 -bottom-1 -right-1 border-2',
    },
    xl: {
      container: 'w-20 h-20 rounded-3xl text-3xl shadow-xl shadow-blue-900/40 ring-2 ring-blue-400/60',
      text: 'text-4xl font-black tracking-tight',
      dot: 'w-5 h-5 -bottom-1.5 -right-1.5 border-[3px]',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      {/* 
        Solid Vibrant Royal Blue Badge Container 
        Using direct CSS background and gradients (no fragile SVG defs) 
      */}
      <div
        className={`${currentSize.container} flex items-center justify-center relative overflow-hidden transition-transform duration-200 hover:scale-105`}
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 35%, #1e40af 70%, #0f172a 100%)',
          border: '1.5px solid rgba(147, 197, 253, 0.4)',
        }}
      >
        {/* Subtle decorative background light ray */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 25% 25%, #60a5fa 0%, transparent 60%)',
          }}
        />

        {/* Dynamic Curved Line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,80 Q 50,60 100,75"
            stroke="#ffffff"
            strokeWidth="4"
            fill="none"
          />
        </svg>

        {/* Crisp, Bold White "SA" Monogram */}
        <span
          className={`${currentSize.text} text-white font-extrabold relative z-10 select-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]`}
          style={{
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          SA
        </span>

        {/* Top-Right Glowing Sparkle Accent */}
        <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_4px_#38bdf8] pointer-events-none" />
      </div>

      {/* Online / Active Status Beacon */}
      {showLiveDot && (
        <span
          className={`absolute rounded-full bg-emerald-500 border-white dark:border-slate-900 ${currentSize.dot}`}
          title="Sistem Aktif & Terhubung"
        />
      )}
    </div>
  );
}
