// ========================================
// CONFIG FILE: ./src/blocks/YouTubeVideoBlock/config.ts
// ========================================
import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const YouTubeVideoBlock: Block = {
  slug: 'youtubeVideoBlock',
  interfaceName: 'YouTubeVideoBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'YouTube URL',
      required: true,
      admin: { placeholder: 'https://www.youtube.com/watch?v=VIDEO_ID' },
      validate: (val: any) => {
        if (
          val &&
          !/^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(val) &&
          !/^https?:\/\/youtu\.be\//.test(val)
        ) {
          return 'Must be a valid YouTube URL'
        }
        return true
      },
    },
    // CHANGE: Changed from 'textarea' to 'richText' type
    // This allows RichText component to properly render the caption
    {
      name: 'caption',
      type: 'richText',
      label: 'Caption',
      admin: { description: 'Optional caption for the video' },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          // Use minimal features for simple captions
          return rootFeatures
        },
      }),
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: 'Autoplay video?',
      defaultValue: false,
    },
    {
      name: 'mute',
      type: 'checkbox',
      label: 'Mute video?',
      defaultValue: false,
    },
  ],
}
