import { useState, useRef } from 'react'
import { HiCamera, HiX, HiPhotograph } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotoUploadProps {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Check total count
    if (photos.length + files.length > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`)
      return
    }

    // Validate each file
    const validFiles: File[] = []
    const newPreviews: string[] = []

    files.forEach((file) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image`)
        return
      }

      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 5MB`)
        return
      }

      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    })

    onPhotosChange([...photos, ...validFiles])
    setPreviews([...previews, ...newPreviews])
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(previews[index])
    
    onPhotosChange(newPhotos)
    setPreviews(newPreviews)
  }

  return (
    <div>
      <label className="block mb-3 text-sm font-medium text-champagne">
        Add Photos (Optional) - Max {maxPhotos}
      </label>

      <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
        {/* Photo Previews */}
        <AnimatePresence>
          {previews.map((preview, index) => (
            <motion.div
              key={preview}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative overflow-hidden rounded-lg aspect-square bg-charcoal-light group"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute flex items-center justify-center w-6 h-6 transition-opacity rounded-full opacity-0 top-2 right-2 bg-rose-900/90 backdrop-blur-sm group-hover:opacity-100"
              >
                <HiX className="text-sm text-white" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload Button */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed rounded-lg aspect-square border-taupe/30 hover:border-primary/50 bg-charcoal-light hover:bg-primary/5 group"
          >
            <HiCamera className="text-2xl transition-colors text-champagne/50 group-hover:text-primary" />
            <span className="text-xs transition-colors text-champagne/50 group-hover:text-primary">
              Add Photo
            </span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Info Text */}
      <p className="mt-2 text-xs text-champagne/50">
        <HiPhotograph className="inline mr-1" />
        JPEG, PNG, or WebP. Max 5MB per photo. {photos.length}/{maxPhotos} photos
      </p>
    </div>
  )
}
