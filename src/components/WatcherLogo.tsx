import React from 'react'
import logoWhite from '../assets/logo-white.png'
import logoBlack from '../assets/logo-black.png'

interface WatcherLogoProps {
  width?: number
  height?: number
  size?: number
  variant?: 'white' | 'black'
  className?: string
  style?: React.CSSProperties
}

export const WatcherLogo: React.FC<WatcherLogoProps> = ({
  width,
  height,
  size,
  variant = 'white',
  className,
  style
}) => {
  const src = variant === 'white' ? logoWhite : logoBlack

  // Aspect ratio of the cropped logo is 1.668:1
  const finalHeight = height || size || 38
  const finalWidth = width || Math.round(finalHeight * 1.668)

  return (
    <img
      src={src}
      alt="The Watcher Logo"
      width={finalWidth}
      height={finalHeight}
      className={className}
      style={{
        width: `${finalWidth}px`,
        height: `${finalHeight}px`,
        objectFit: 'contain',
        display: 'inline-block',
        flexShrink: 0,
        userSelect: 'none',
        ...style
      }}
    />
  )
}
