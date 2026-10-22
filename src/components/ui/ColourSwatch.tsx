import React from 'react';
import { getColourInfo } from '../../config/cableSpecs';

interface ColourSwatchProps {
  colour?: string | null;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ColourSwatch: React.FC<ColourSwatchProps> = ({
  colour,
  showLabel = true,
  size = 'sm',
  className = '',
}) => {
  if (!colour || typeof colour !== 'string' || !colour.trim()) return null;

  const colourInfo = getColourInfo(colour);
  const isGreenYellow = colour.toLowerCase().includes('green') && colour.toLowerCase().includes('yellow');

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const badgeSizeClasses = {
    xs: 'text-[9px] px-1 py-0.2',
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  }[size];

  // If Green/Yellow Earth bi-colour
  const swatchStyle: React.CSSProperties = isGreenYellow
    ? {
        background: 'linear-gradient(135deg, #16A34A 50%, #EAB308 50%)',
        border: '1px solid #15803D',
      }
    : colourInfo?.gradient
    ? {
        background: colourInfo.gradient,
        border: colourInfo.border ? `1px solid ${colourInfo.border}` : '1px solid rgba(0,0,0,0.15)',
      }
    : {
        backgroundColor: colourInfo?.hex || '#94A3B8',
        border: colourInfo?.border ? `1px solid ${colourInfo.border}` : '1px solid rgba(0,0,0,0.15)',
      };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs ${badgeSizeClasses} ${className}`}
      title={`Cable Colour: ${colour}`}
    >
      <span
        className={`rounded-full shrink-0 shadow-xs ${sizeClasses}`}
        style={swatchStyle}
        aria-hidden="true"
      />
      {showLabel && <span className="capitalize">{colour}</span>}
    </span>
  );
};
