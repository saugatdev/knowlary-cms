import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'link',
      type: 'text',
      label: 'Hyperlink',
      admin: { placeholder: 'https://example.com' },
    },
    { name: 'clickable', type: 'checkbox', label: 'Make image clickable?', defaultValue: true },
    { name: 'openInNewTab', type: 'checkbox', label: 'Open link in new tab?', defaultValue: true },
  ],
}
