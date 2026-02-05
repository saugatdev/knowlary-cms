// ========================================
// COMPONENT FILE: ./src/blocks/YouTubeVideoBlock/YouTubeVideoBlock.tsx
// ========================================
import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
// CHANGE: Import proper type for richText field
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

// --- Step 1: Define the block props manually ---
type YouTubeVideoBlockProps = {
  url: string
  caption?: DefaultTypedEditorState // CHANGE: Updated type from string to DefaultTypedEditorState
  autoplay?: boolean
  mute?: boolean
}

// --- Step 2: Define component props ---
type Props = YouTubeVideoBlockProps & {
  captionClassName?: string
  className?: string
}

// --- Step 3: Component implementation ---
export const YouTubeVideoBlock: React.FC<Props> = ({
  url,
  caption,
  autoplay = false,
  mute = false,
  captionClassName,
  className,
}) => {
  // Extract video ID from YouTube URL
  let videoId = ''
  if (url.includes('youtube.com')) {
    const params = new URL(url).searchParams
    videoId = params.get('v') || ''
  } else if (url.includes('youtu.be')) {
    videoId = url.split('/').pop() || ''
  }

  if (!videoId) return null

  const src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${mute ? 1 : 0}`

  return (
    <div className={cn('', className)}>
      <iframe
        width="560"
        height="315"
        src={src}
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {/* CHANGE: No changes needed here - RichText now receives correct type */}
      {caption && (
        <div className={cn('mt-4', captionClassName)}>
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </div>
  )
}
