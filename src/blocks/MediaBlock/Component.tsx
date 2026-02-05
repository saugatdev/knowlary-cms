import type { StaticImageData } from 'next/image'
import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import type { MediaBlock as MediaBlockProps } from '@/payload-types'
import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = ({
  captionClassName,
  className,
  enableGutter = true,
  imgClassName,
  media,
  staticImage,
  link,
  clickable = true,
  openInNewTab = true,
  disableInnerContainer,
}) => {
  // --- Type-safe caption access ---
  const caption = typeof media === 'object' && media !== null ? media.caption : undefined

  const img = (
    <Media
      imgClassName={cn('border border-border rounded-[0.8rem]', imgClassName)}
      resource={media}
      src={staticImage}
    />
  )

  return (
    <div className={cn('', { container: enableGutter }, className)}>
      {(media || staticImage) &&
        (clickable && link ? (
          <a
            href={link}
            target={openInNewTab ? '_blank' : '_self'}
            rel={openInNewTab ? 'noopener noreferrer' : undefined}
          >
            {img}
          </a>
        ) : (
          img
        ))}

      {caption && (
        <div className={cn('mt-6', { container: !disableInnerContainer }, captionClassName)}>
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </div>
  )
}
