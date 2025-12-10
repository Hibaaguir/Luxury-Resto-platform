import { supabase } from '@/config/supabase'

export const photoUpload = {
  // Upload single photo
  async uploadPhoto(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('review-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('review-photos')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  },

  // Upload multiple photos
  async uploadPhotos(files: File[], userId: string): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadPhoto(file, userId))
    return Promise.all(uploadPromises)
  },

  // Delete photo
  async deletePhoto(photoUrl: string): Promise<void> {
    // Extract path from URL
    const path = photoUrl.split('/review-photos/')[1]
    if (!path) return

    const { error } = await supabase.storage
      .from('review-photos')
      .remove([path])

    if (error) throw error
  },

  // Validate file
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' }
    }

    return { valid: true }
  },
}
