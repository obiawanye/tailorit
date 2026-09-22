/* global process */

import { createClerkClient, verifyToken } from '@clerk/backend'
import { db } from './firebaseAdmin.js'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const authorization = req.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

    const token = authorization.replace('Bearer ', '')

    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    const userId = verifiedToken.sub

    if (!userId) {
      return res.status(401).json({
        error: 'Invalid authentication token',
      })
    }

    const user = await clerk.users.getUser(userId)

    const userRef = db.collection('users').doc(userId)

    await userRef.set(
      {
        clerkUserId: userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email:
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          '',
        imageUrl: user.imageUrl || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return res.status(200).json({
      success: true,
      userId,
    })
  } catch (error) {
    console.error('User sync error:', error)

    return res.status(500).json({
      error: 'Failed to sync user',
    })
  }
}