import React from 'react';

interface CustomerAvatarBadgeProps {
  variant?: 'active' | 'online' | 'offline' | 'latest' | 'expiring' | 'hotspot';
  className?: string;
}

export const CustomerAvatarBadge: React.FC<CustomerAvatarBadgeProps> = ({
  variant = 'active',
  className = 'w-14 h-12'
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 72 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Person 2 (Right / Back) */}
        <g id="person-right">
          {/* Hair */}
          <path
            d="M44 19 C44 13, 50 11, 55 11 C60 11, 66 13, 66 19 C66 21, 64 22, 64 24 C62 23, 48 23, 46 24 C46 22, 44 21, 44 19 Z"
            fill="#B26A39"
          />
          {/* Face */}
          <ellipse cx="55" cy="22" rx="9" ry="9.5" fill="#FFDFC4" />
          {/* Neck */}
          <rect x="52" y="29" width="6" height="4" fill="#F0CCA8" />
          {/* Green Shirt / Body */}
          <path
            d="M41 48 C41 36, 47 32, 55 32 C63 32, 69 36, 69 48 Z"
            fill="#558B2F"
          />
        </g>

        {/* Person 1 (Left / Front) */}
        <g id="person-left">
          {/* Hair */}
          <path
            d="M14 20 C14 13, 22 10, 28 10 C34 10, 42 13, 42 20 C42 23, 40 24, 39 26 C37 25, 19 25, 17 26 C16 24, 14 23, 14 20 Z"
            fill="#A8582B"
          />
          {/* Face */}
          <ellipse cx="28" cy="24" rx="10.5" ry="11" fill="#FFE3CC" />
          {/* Neck */}
          <rect x="24.5" y="32" width="7" height="5" fill="#F2CFAC" />
          {/* Green Shirt / Body */}
          <path
            d="M10 52 C10 37, 18 34, 28 34 C38 34, 46 37, 46 52 Z"
            fill="#689F38"
          />
          {/* Collar / Detail */}
          <path
            d="M25 35 L28 40 L31 35 Z"
            fill="#43721A"
          />
        </g>

        {/* Floating Badges */}
        {variant === 'online' && (
          <g id="badge-online" className="animate-pulse">
            <circle cx="58" cy="11" r="9" fill="#43A047" stroke="#FFFFFF" strokeWidth="1.5" />
            <path
              d="M54 11 L56.5 13.5 L62 8.5"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {variant === 'offline' && (
          <g id="badge-offline">
            <circle cx="58" cy="11" r="9" fill="#757575" stroke="#FFFFFF" strokeWidth="1.5" />
            <path
              d="M54 11 L62 11"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        )}

        {variant === 'latest' && (
          <g id="badge-latest">
            {/* Sun / Rays */}
            <circle cx="58" cy="11" r="8.5" fill="#FFA000" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Sun Rays */}
            <line x1="58" y1="0.5" x2="58" y2="2.5" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="19.5" x2="58" y2="21.5" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
            <line x1="47.5" y1="11" x2="49.5" y2="11" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
            <line x1="66.5" y1="11" x2="68.5" y2="11" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
            <line x1="51" y1="4" x2="52.5" y2="5.5" stroke="#FFB300" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="63.5" y1="16.5" x2="65" y2="18" stroke="#FFB300" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="51" y1="18" x2="52.5" y2="16.5" stroke="#FFB300" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="63.5" y1="5.5" x2="65" y2="4" stroke="#FFB300" strokeWidth="1.8" strokeLinecap="round" />
            {/* Star / Center */}
            <circle cx="58" cy="11" r="5" fill="#FFE082" />
          </g>
        )}

        {variant === 'expiring' && (
          <g id="badge-expiring">
            <circle cx="58" cy="11" r="9" fill="#E65100" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Clock hands */}
            <circle cx="58" cy="11" r="6" fill="#FF9800" />
            <path
              d="M58 8 L58 11 L61 12.5"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>
        )}

        {variant === 'hotspot' && (
          <g id="badge-hotspot">
            <circle cx="58" cy="11" r="9" fill="#0288D1" stroke="#FFFFFF" strokeWidth="1.5" />
            <path
              d="M53 8 C56 5.5, 60 5.5, 63 8 M55 10.5 C57 9, 59 9, 61 10.5 M57.5 13 A 0.8 0.8 0 1 1 58.5 13 A 0.8 0.8 0 1 1 57.5 13"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
