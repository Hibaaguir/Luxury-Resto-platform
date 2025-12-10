import { useState } from 'react'
import { HiEye } from 'react-icons/hi'
import { ImageLightbox } from './ImageLightbox'
import { AnimatePresence } from 'framer-motion'

interface PhotoGridProps {
  photos: string[]
  columns?: 2 | 3 | 4 | 5
  aspectRatio?: 'square' | 'video' | 'portrait'
}

export function PhotoGrid({ photos, columns = 4, aspectRatio = 'square' }: PhotoGridProps) {
  const [showLightbox, setShowLightbox] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
  }

  if (photos.length === 0) return null

  return (
    <>
      <div className={`grid ${columnClasses[columns]} gap-3`}>
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedIndex(index)
              setShowLightbox(true)
            }}
            className={`relative ${aspectClasses[aspectRatio]} rounded-lg overflow-hidden group cursor-pointer`}
          >
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="object-cover w-full h-full transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-colors bg-charcoal/0 group-hover:bg-charcoal/30">
              <HiEye className="text-2xl text-white transition-opacity opacity-0 group-hover:opacity-100" />
            </div>
            
            {/* Show count on first image if more than displayed */}
            {index === photos.length - 1 && photos.length > columns && (
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/60">
                <span className="text-2xl font-bold text-white">
                  +{photos.length - columns}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showLightbox && (
          <ImageLightbox
            images={photos}
            initialIndex={selectedIndex}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
