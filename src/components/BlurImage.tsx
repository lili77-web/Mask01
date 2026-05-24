import { useState } from 'react'

interface Props {
  src: string
  blurSrc?: string
  alt: string
  className?: string
}

export default function BlurImage({ src, blurSrc, alt, className = '' }: Props) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative overflow-hidden">
      {blurSrc && !loaded && (
        <img
          src={blurSrc}
          alt=""
          className={`absolute inset-0 ${className}`}
          style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}