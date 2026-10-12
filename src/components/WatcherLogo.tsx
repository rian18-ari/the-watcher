import React from 'react'
import logoWhite from '../assets/logo-white.png'
import logoBlack from '../assets/logo-black.png'

interface WatcherLogoProps {
  size?: number
  variant?: 'white' | 'black'
  className?: string
  style?: React.CSSProperties
}

export const WatcherLogo: React.FC<WatcherLogoProps> = ({
  size = 24,
  variant = 'white',
  className,
  style
}) => {
  const src = variant === 'white' ? logoWhite : logoBlack

  return (
    <img
      src={src}
      alt="The Watcher Logo"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'inline-block',
        flexShrink: 0,
        userSelect: 'none',
        ...style
      }}
    />
  )
}
