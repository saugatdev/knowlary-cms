// payload.config.ts

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { resendAdapter } from '@payloadcms/email-resend'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { Horoscopes } from './collections/Horoscope'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical,  } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { cloudinaryAdapter } from './cloudinary'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      // beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },

  editor: defaultLexical,

  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),

  email: resendAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'Payload CMS',
    apiKey: process.env.RESEND_API_KEY || '',
  }),

  collections: [Pages, Posts, Media, Categories, Horoscopes, Users],

  cors: [getServerSideURL()].filter(Boolean),

  globals: [Header, Footer],

  plugins: [
    ...plugins,

    // Cloudinary Storage Configuration
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter({
            folder: 'sudipacharya',
            config: {
              cloud_name: process.env.CLOUDINARY_NAME!,
              api_key: process.env.CLOUDINARY_API_KEY!,
              api_secret: process.env.CLOUDINARY_API_SECRET!,
            },
          }),
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
        },
      },
    }),
  ],

  secret: process.env.PAYLOAD_SECRET,

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
