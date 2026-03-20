interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { container: 'w-6 h-6', svg: 'w-4 h-4', text: 'text-lg', sparkle: 'w-1.5 h-1.5' },
    md: { container: 'w-10 h-10', svg: 'w-6 h-6', text: 'text-2xl', sparkle: 'w-2 h-2' },
    lg: { container: 'w-16 h-16', svg: 'w-10 h-10', text: 'text-4xl', sparkle: 'w-3 h-3' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${s.container}`}>
        {/* Orange Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"></div>
        
        {/* Z Shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className={s.svg} fill="none">
            <path 
              d="M6 8h12l-10 8h10" 
              stroke="#1e293b" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        {/* Sparkle */}
        <div className="absolute -top-1 -right-1">
          <div className={`${s.sparkle} bg-yellow-300 rounded-full`}></div>
          <div className={`${s.sparkle} bg-orange-400 rounded-full absolute top-0 left-1`}></div>
        </div>
      </div>
      
      {showText && (
        <span className={`${s.text} font-bold tracking-tight`}>
          Cartizo
        </span>
      )}
    </div>
  );
}
