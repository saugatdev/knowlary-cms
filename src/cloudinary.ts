// src/cloudinaryAdapter.ts
// FIXED - Ensures images are stored in the correct folder in Cloudinary

import type {
  Adapter,
  GeneratedAdapter,
  GenerateURL,
  HandleDelete,
  HandleUpload,
  StaticHandler,
} from '@payloadcms/plugin-cloud-storage/types'
import { ConfigOptions, v2 as cloudinary } from 'cloudinary'
import path from 'path'

export interface CloudinaryAdapterArgs {
  folder?: string
  config: ConfigOptions
}

const videoExtensions = [
  'mp2',
  'mp3',
  'mp4',
  'mov',
  'avi',
  'mkv',
  'flv',
  'wmv',
  'webm',
  'mpg',
  'mpe',
  'mpeg',
]

interface HandlerArgs {
  folderSrc: string
  getStorageClient: () => typeof cloudinary
}

// Generate URL function
const getGenerateURL =
  ({ folderSrc, getStorageClient }: HandlerArgs): GenerateURL =>
  ({ filename, prefix = '' }) => {
    const fileExtension = filename.toLowerCase().split('.').pop() as string
    const isVideo = videoExtensions.includes(fileExtension)

    // Remove file extension for public_id
    const filenameWithoutExtension = filename.replace(/\.[^/.]+$/, '')

    // CRITICAL: Build the correct public_id with folder
    // Format should be: folder/filename (e.g., sudipacharya/myimage)
    const publicId = `${folderSrc}/${filenameWithoutExtension}`

    // Generate Cloudinary URL
    const url = getStorageClient().url(publicId, {
      resource_type: isVideo ? 'video' : 'image',
      secure: true,
      format: fileExtension,
    })

    console.log(`🔗 Generated URL for public_id: ${publicId}`)
    console.log(`   Full URL: ${url}`)
    return url
  }

// Handle Delete function
const getHandleDelete =
  ({ folderSrc, getStorageClient }: HandlerArgs): HandleDelete =>
  async ({ doc: { prefix = '' }, filename }) => {
    const fileExtension = filename.toLowerCase().split('.').pop() as string
    const isVideo = videoExtensions.includes(fileExtension)

    const filenameWithoutExtension = filename.replace(/\.[^/.]+$/, '')
    const publicId = `${folderSrc}/${filenameWithoutExtension}`

    console.log(`🗑️  Attempting to delete public_id: ${publicId}`)

    try {
      const result = await getStorageClient().uploader.destroy(publicId, {
        resource_type: isVideo ? 'video' : 'image',
        invalidate: true,
      })
      console.log(`✅ Deleted from Cloudinary: ${publicId}`, result)
    } catch (error) {
      console.error('❌ Error deleting file from Cloudinary:', error)
      throw error
    }
  }

// Handle Upload function
const getHandleUpload =
  ({ folderSrc, getStorageClient }: HandlerArgs): HandleUpload =>
  async ({ data, file }) => {
    const fileExtension = file.filename.toLowerCase().split('.').pop() as string
    const isVideo = videoExtensions.includes(fileExtension)

    const filenameWithoutExtension = file.filename.replace(/\.[^/.]+$/, '')

    // CRITICAL FIX: Use folder parameter in upload_stream options
    // DO NOT include folder in public_id, Cloudinary will add it automatically
    const publicId = filenameWithoutExtension

    console.log(`⬆️  UPLOADING TO CLOUDINARY`)
    console.log(`📁 Target Folder: ${folderSrc}`)
    console.log(`📝 Public ID (without folder): ${publicId}`)
    console.log(`📝 Final path will be: ${folderSrc}/${publicId}`)
    console.log(`📄 Original filename: ${file.filename}`)

    return new Promise<void>((resolve, reject) => {
      const uploadStream = getStorageClient().uploader.upload_stream(
        {
          resource_type: isVideo ? 'video' : 'image',
          folder: folderSrc, // THIS IS CRITICAL - Cloudinary uses this to place file in folder
          public_id: publicId, // Just the filename, folder is added automatically
          overwrite: true,
          invalidate: true,
          quality: 'auto:good',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log(`✅ UPLOAD SUCCESSFUL!`)
            console.log(`📂 Cloudinary Folder: ${result?.folder}`)
            console.log(`🆔 Full Public ID: ${result?.public_id}`)
            console.log(`🌐 Secure URL: ${result?.secure_url}`)
            console.log(`---`)
            resolve()
          }
        },
      )

      uploadStream.end(file.buffer)
    })
  }

// Static Handler function
const getHandler =
  ({ folderSrc, getStorageClient }: HandlerArgs): StaticHandler =>
  async (req, { params }) => {
    try {
      const { filename } = params
      const fileExtension = filename.toLowerCase().split('.').pop() as string
      const isVideo = videoExtensions.includes(fileExtension)

      const filenameWithoutExtension = filename.replace(/\.[^/.]+$/, '')
      const publicId = `${folderSrc}/${filenameWithoutExtension}`

      const url = getStorageClient().url(publicId, {
        resource_type: isVideo ? 'video' : 'image',
        secure: true,
        format: fileExtension,
      })

      console.log(`🔀 Static handler redirecting to: ${url}`)

      return new Response(null, {
        status: 307,
        headers: {
          Location: url,
        },
      })
    } catch (err: unknown) {
      req.payload.logger.error({ err, msg: 'Error in Cloudinary static handler' })

      return new Response('File not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }
  }

// Main Adapter Export
export const cloudinaryAdapter =
  ({ folder, config = {} }: CloudinaryAdapterArgs): Adapter =>
  ({ collection }): GeneratedAdapter => {
    if (!cloudinary) {
      throw new Error(
        'The package cloudinary is not installed, but is required for the Cloudinary adapter. Please install it.',
      )
    }

    let storageClient: null | typeof cloudinary = null

    // Use the folder you specify - this will be the folder in Cloudinary
    const folderSrc = folder || 'uploads'

    console.log(`====================================`)
    console.log(`🔧 CLOUDINARY ADAPTER INITIALIZED`)
    console.log(`📂 Target Cloudinary Folder: ${folderSrc}`)
    console.log(`📦 Collection: ${typeof collection === 'string' ? collection : collection.slug}`)
    console.log(`====================================`)

    const getStorageClient = (): typeof cloudinary => {
      if (storageClient) return storageClient
      cloudinary.config(config)
      storageClient = cloudinary
      console.log(`☁️  Cloudinary client configured`)
      console.log(`   Cloud name: ${config.cloud_name}`)
      return storageClient
    }

    return {
      name: 'cloudinary',
      generateURL: getGenerateURL({ folderSrc, getStorageClient }),
      handleDelete: getHandleDelete({ folderSrc, getStorageClient }),
      handleUpload: getHandleUpload({ folderSrc, getStorageClient }),
      staticHandler: getHandler({ folderSrc, getStorageClient }),
    }
  }
