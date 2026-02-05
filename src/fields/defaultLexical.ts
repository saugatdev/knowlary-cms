// src/fields/richtext/index.ts

import type { TextFieldSingleValidation } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  InlineCodeFeature,
  ParagraphFeature,
  HeadingFeature,
  AlignFeature,
  IndentFeature,
  UnorderedListFeature,
  OrderedListFeature,
  ChecklistFeature,
  LinkFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  UploadFeature,
  FixedToolbarFeature, // ✅ ADD THIS - This is the toolbar!
  InlineToolbarFeature, // ✅ ADD THIS - This is the floating toolbar!
  lexicalEditor,
  type LinkFields,
} from '@payloadcms/richtext-lexical'

export const defaultLexical = lexicalEditor({
  features: [
    // ✅ TOOLBARS - ADD THESE FIRST!
    FixedToolbarFeature(), // Shows toolbar at top of editor
    InlineToolbarFeature(), // Shows floating toolbar when text is selected

    // Paragraphs and Headings
    ParagraphFeature(),
    HeadingFeature({
      enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    }),

    // Text Formatting
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    InlineCodeFeature(),

    // Lists - Now these will show in the toolbar!
    UnorderedListFeature(),
    OrderedListFeature(),
    ChecklistFeature(),

    // Alignment and Indentation
    AlignFeature(),
    IndentFeature(),

    // Block Elements
    BlockquoteFeature(),
    HorizontalRuleFeature(),

    // Links
    LinkFeature({
      enabledCollections: ['pages', 'posts'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false
          return true
        })
        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true
              }
              return value ? true : 'URL is required'
            }) as TextFieldSingleValidation,
          },
        ]
      },
    }),

    // Media Upload
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'alt',
              type: 'text',
              required: true,
              label: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'richText',
              label: 'Caption',
              editor: lexicalEditor({
                features: [
                  ParagraphFeature(),
                  BoldFeature(),
                  ItalicFeature(),
                  UnderlineFeature(),
                  InlineToolbarFeature(), // ✅ Add toolbar to caption too
                  LinkFeature({
                    enabledCollections: ['pages', 'posts'],
                  }),
                ],
              }),
            },
          ],
        },
      },
    }),
  ],
})
