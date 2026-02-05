// src/utilities/cloudinaryHelper.ts
// Helper to generate Cloudinary URLs with transformations

export type ImageSize = 'thumbnail' | 'square' | 'small' | 'medium' | 'large' | 'xlarge' | 'og'

interface CloudinaryTransformOptions {
  size?: ImageSize
  width?: number
  height?: number
  crop?: 'limit' | 'fill' | 'fit' | 'scale' | 'pad'
  gravity?: 'auto' | 'center' | 'face' | 'faces'
  quality?: 'auto' | 'auto:good' | 'auto:best' | number
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif'
}

const sizePresets: Record<ImageSize, CloudinaryTransformOptions> = {
  thumbnail: { width: 300, crop: 'limit', quality: 'auto' },
  square: { width: 500, height: 500, crop: 'fill', gravity: 'auto', quality: 'auto' },
  small: { width: 600, crop: 'limit', quality: 'auto' },
  medium: { width: 900, crop: 'limit', quality: 'auto' },
  large: { width: 1400, crop: 'limit', quality: 'auto:good' },
  xlarge: { width: 1920, crop: 'limit', quality: 'auto:good' },
  og: { width: 1200, height: 630, crop: 'fill', gravity: 'center', quality: 'auto:good' },
}

/**
 * Transform a Cloudinary URL with specified options
 * Works with any folder structure in Cloudinary
 *
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Transformed Cloudinary URL
 */
export function getCloudinaryUrl(
  url: string | undefined | null,
  options: CloudinaryTransformOptions = {},
): string {
  if (!url || typeof url !== 'string') return ''

  // If not a Cloudinary URL, return as is
  if (!url.includes('cloudinary.com')) return url

  // If a size preset is specified, merge with custom options
  const finalOptions = options.size ? { ...sizePresets[options.size], ...options } : options

  // Build transformation string
  const transformations: string[] = []

  if (finalOptions.width) transformations.push(`w_${finalOptions.width}`)
  if (finalOptions.height) transformations.push(`h_${finalOptions.height}`)
  if (finalOptions.crop) transformations.push(`c_${finalOptions.crop}`)
  if (finalOptions.gravity) transformations.push(`g_${finalOptions.gravity}`)
  if (finalOptions.quality) transformations.push(`q_${finalOptions.quality}`)
  if (finalOptions.format) transformations.push(`f_${finalOptions.format}`)

  // If no transformations, return original URL
  if (transformations.length === 0) return url

  // Add transformations to URL
  const transformString = transformations.join(',')

  // Replace /upload/ with /upload/[transformations]/
  return url.replace('/upload/', `/upload/${transformString}/`)
}

/**
 * Get image srcset for responsive images
 *
 * @param url - Original Cloudinary URL
 * @param widths - Array of widths for srcset
 * @returns srcset string
 */
export function getCloudinaryUrlSrcSet(
  url: string | undefined | null,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
): string {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('cloudinary.com')) return ''

  return widths
    .map((width) => {
      const transformedUrl = getCloudinaryUrl(url, {
        width,
        crop: 'limit',
        quality: 'auto',
        format: 'auto',
      })
      return `${transformedUrl} ${width}w`
    })
    .join(', ')
}

/**
 * Get the base Cloudinary URL without transformations
 * Useful for debugging or checking the original file
 */
export function getOriginalCloudinaryUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('cloudinary.com')) return url

  // Remove any existing transformations
  return url.replace(/\/upload\/[^/]+\//, '/upload/')
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false
  return url.includes('cloudinary.com')
}

/**
 * Example usage in a Next.js component:
 *
 * import Image from 'next/image'
 * import { getCloudinaryUrl, getCloudinaryUrlSrcSet } from '@/utilities/cloudinaryHelper'
 *
 * export function BlogThumbnail({ media }) {
 *   if (!media?.url) return null
 *
 *   return (
 *     <Image
 *       src={getCloudinaryUrl(media.url, { size: 'medium', format: 'webp' })}
 *       srcSet={getCloudinaryUrlSrcSet(media.url)}
 *       alt={media.alt || ''}
 *       width={900}
 *       height={600}
 *     />
 *   )
 * }
 */
