import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

interface ImageLightboxProps {
  images: string[]
  initialIndex: number
  onClose: () => void
}

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-charcoal/95 backdrop-blur-lg"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute z-10 flex items-center justify-center w-12 h-12 transition-colors rounded-full top-6 right-6 bg-charcoal/80 backdrop-blur-sm text-champagne hover:text-primary"
      >
        <HiX className="text-2xl" />
      </button>

      {/* Image Counter */}
      <div className="absolute z-10 px-4 py-2 text-sm font-semibold rounded-full top-6 left-6 bg-charcoal/80 backdrop-blur-sm text-champagne">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
          className="absolute z-10 flex items-center justify-center w-12 h-12 transition-colors -translate-y-1/2 rounded-full left-6 top-1/2 bg-charcoal/80 backdrop-blur-sm text-champagne hover:text-primary"
        >
          <HiChevronLeft className="text-2xl" />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
          className="absolute z-10 flex items-center justify-center w-12 h-12 transition-colors -translate-y-1/2 rounded-full right-6 top-1/2 bg-charcoal/80 backdrop-blur-sm text-champagne hover:text-primary"
        >
          <HiChevronRight className="text-2xl" />
        </button>
      )}

      {/* Main Image */}
      <div
        className="flex items-center justify-center h-full p-20"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute z-10 flex gap-2 p-3 -translate-x-1/2 rounded-full bottom-6 left-1/2 bg-charcoal/80 backdrop-blur-sm">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? 'ring-2 ring-primary scale-110'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
