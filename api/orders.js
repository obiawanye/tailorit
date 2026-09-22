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
    // 1. Get Clerk token

    const authorization = req.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

    const token = authorization.replace('Bearer ', '')

    // 2. Verify Clerk session

    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    const userId = verifiedToken.sub

    if (!userId) {
      return res.status(401).json({
        error: 'Invalid authentication token',
      })
    }

    // 3. Get the authenticated Clerk user

    const user = await clerk.users.getUser(userId)

    // 4. Get order data from frontend

    const {
      items,
      shippingAddress,
      subtotal,
      customizationTotal,
      deliveryFee,
      total,
    } = req.body || {}

    // 5. Basic validation

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Order must contain at least one item',
      })
    }

    if (!shippingAddress) {
      return res.status(400).json({
        error: 'Shipping address is required',
      })
    }

    if (total === undefined || Number(total) <= 0) {
      return res.status(400).json({
        error: 'Invalid order total',
      })
    }

    // 6. Generate order number

    const orderNumber = `TT-${Date.now()
      .toString()
      .slice(-8)}`

    // 7. Create Firestore order

    const orderRef = db.collection('orders').doc()

    const orderData = {
      orderNumber,

      userId,

      customer: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email:
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          '',
      },

      items,

      shippingAddress,

      subtotal: Number(subtotal || 0),

      customizationTotal: Number(
        customizationTotal || 0,
      ),

      deliveryFee: Number(deliveryFee || 0),

      total: Number(total),

      status: 'pending',

      paymentStatus: 'unpaid',

      paymentReference: null,

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),
    }

    await orderRef.set(orderData)

    // 8. Return created order

    return res.status(201).json({
      success: true,

      order: {
        id: orderRef.id,
        ...orderData,
      },
    })
  } catch (error) {
    console.error('Order creation error:', error)

    return res.status(500).json({
      error: 'Failed to create order',
    })
  }
}