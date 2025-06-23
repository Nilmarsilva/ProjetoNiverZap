import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  withText?: boolean
}

/**
 * Componente de Logo do DataZAP
 */
export function Logo({ size = 'md', withText = true }: LogoProps) {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
    xl: { icon: 64, text: 'text-4xl' },
  }

  return (
    <div className="flex items-center">
      <div 
        className="flex items-center justify-center bg-primary text-primary-foreground rounded-full"
        style={{ 
          width: sizeMap[size].icon, 
          height: sizeMap[size].icon 
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ 
            width: sizeMap[size].icon * 0.7, 
            height: sizeMap[size].icon * 0.7 
          }}
        >
          {/* Ícone de calendário com verificação */}
          <path 
            d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M16 2V6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M8 2V6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M3 10H21" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Marca de verificação */}
          <path 
            d="M9 16L11 18L15 14" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {withText && (
        <span className={`ml-2 font-bold ${sizeMap[size].text}`}>
          Data<span className="text-primary">ZAP</span>
        </span>
      )}
    </div>
  )
}
