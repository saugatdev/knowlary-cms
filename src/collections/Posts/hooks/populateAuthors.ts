import type { CollectionAfterReadHook } from 'payload'
import { User } from 'src/payload-types'

// Populate full author details for blog posts, including profile picture and other fields
export const populateAuthors: CollectionAfterReadHook = async ({ doc, req, req: { payload } }) => {
  if (doc?.authors && doc.authors.length > 0) {
    const authorDocs: User[] = []

    for (const author of doc.authors) {
      try {
        const authorDoc = await payload.findByID({
          id: typeof author === 'object' ? author?.id : author,
          collection: 'users',
          depth: 1, // populate profilePicture and nested media
        })

        if (authorDoc) {
          authorDocs.push(authorDoc)
        }
      } catch {
        // silently ignore errors
      }
    }

    if (authorDocs.length > 0) {
      doc.populatedAuthors = authorDocs.map((authorDoc) => ({
        id: authorDoc.id,
        name: authorDoc.name,
        profilePicture: authorDoc.profilePicture, // full media object with URL
        bio: authorDoc.bio,
        socialLinks: authorDoc.socialLinks,
        website: authorDoc.website,
        role: authorDoc.role,
      }))
    }
  }

  return doc
}
