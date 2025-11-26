import React from 'react';
import { AlchemyElement } from '../types';

interface ElementCardProps {
  element: AlchemyElement;
  onClick: (element: AlchemyElement) => void;
  isSelected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ElementCard: React.FC<ElementCardProps> = ({ 
  element, 
  onClick, 
  isSelected = false, 
  disabled = false,
  size = 'md'
}) => {
  
  const sizeClasses = {
    sm: 'w-20 h-20 text-2xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl'
  };

  return (
    <button
      onClick={() => !disabled && onClick(element)}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center rounded-xl 
        border-2 transition-all duration-200 select-none
        ${sizeClasses[size]}
        ${isSelected 
          ? 'bg-indigo-600 border-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.6)] scale-105' 
          : 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-slate-400 hover:scale-105'}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${element.isNew ? 'animate-pop ring-2 ring-yellow-400' : ''}
      `}
    >
      <div className="mb-1 transform transition-transform group-hover:scale-110">
        {element.emoji}
      </div>
      <div className={`text-xs font-medium truncate w-full px-2 text-center ${isSelected ? 'text-white' : 'text-slate-200'}`}>
        {element.name}
      </div>
      
      {element.isNew && (
        <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
          NEW
        </span>
      )}
    </button>
  );
};

export default ElementCard;