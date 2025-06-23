import React from 'react'

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

/**
 * Componente Logo do DataZap
 * 
 * Renderiza o logo do DataZap como um componente SVG
 */
export const Logo: React.FC<LogoProps> = ({ 
  width = 40, 
  height = 40, 
  className = "" 
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fundo circular */}
      <circle cx="256" cy="256" r="248" fill="#25D366" />
      
      {/* Balão de mensagem */}
      <path
        d="M256 120C179.3 120 117 182.3 117 259C117 284.7 124.3 308.3 137 328L121 392L187 376.7C206 388 230 395 256 395C332.7 395 395 332.7 395 256C395 179.3 332.7 120 256 120Z"
        fill="white"
      />
      
      {/* Ícone de bolo de aniversário */}
      <path
        d="M220 190V170H240V190H220ZM270 190V170H290V190H270ZM220 240H290V220H220V240ZM220 290H290V270H220V290ZM180 340H330V320H180V340Z"
        fill="#25D366"
      />
      
      {/* Velas de aniversário */}
      <rect x="230" y="150" width="10" height="30" rx="5" fill="#FF5252" />
      <rect x="270" y="150" width="10" height="30" rx="5" fill="#FF5252" />
      
      {/* Chamas das velas */}
      <circle cx="235" cy="145" r="8" fill="#FFC107" />
      <circle cx="275" cy="145" r="8" fill="#FFC107" />
      
      {/* Número de aniversário */}
      <path
        d="M255 310C268.8 310 280 298.8 280 285C280 271.2 268.8 260 255 260C241.2 260 230 271.2 230 285C230 298.8 241.2 310 255 310Z"
        fill="#FF5252"
      />
      <path
        d="M255 300C263.3 300 270 293.3 270 285C270 276.7 263.3 270 255 270C246.7 270 240 276.7 240 285C240 293.3 246.7 300 255 300Z"
        fill="white"
      />
      <path
        d="M255 290C257.8 290 260 287.8 260 285C260 282.2 257.8 280 255 280C252.2 280 250 282.2 250 285C250 287.8 252.2 290 255 290Z"
        fill="#FF5252"
      />
    </svg>
  )
}

export default Logo
