/* global process */

import { createClerkClient, verifyToken } from '@clerk/backend'
import { db } from './firebaseAdmin.js'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

async function authenticateRequest(req) {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }

  const token = authorization.replace('Bearer ', '').trim()

  if (!token) {
    throw new Error('Unauthorized')
  }

  const verifiedToken = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
  })

  const userId = verifiedToken.sub

  if (!userId) {
    throw new Error('Invalid authentication token')
  }

  return userId
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const userId = await authenticateRequest(req)

    const { orderId } = req.body || {}

    if (typeof orderId !== 'string' || !orderId.trim()) {
      return res.status(400).json({
        error: 'Order ID is required',
      })
    }

    const orderRef = db.collection('orders').doc(orderId.trim())
    const orderSnapshot = await orderRef.get()

    if (!orderSnapshot.exists) {
      return res.status(404).json({
        error: 'Order not found',
      })
    }

    const order = orderSnapshot.data()

    /*
     * Make sure the authenticated Clerk user
     * owns this order.
     */
    if (order.userId !== userId) {
      return res.status(403).json({
        error: 'You do not have permission to pay for this order',
      })
    }

    /*
     * Don't initialize another Paystack
     * transaction for an order that has
     * already been paid.
     */
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        error: 'This order has already been paid',
      })
    }

    if (!order.total || Number(order.total) <= 0) {
      return res.status(400).json({
        error: 'Invalid order total',
      })
    }

    const user = await clerk.users.getUser(userId)

    const email =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress ||
      order.customer?.email ||
      ''

    if (!email) {
      return res.status(400).json({
        error: 'No customer email address was found',
      })
    }

    /*
     * Paystack expects the amount in the
     * smallest currency unit.
     *
     * ₦20,600 becomes 2,060,000 kobo.
     */
    const amountInKobo = Math.round(Number(order.total) * 100)

    /*
     * Give every Paystack transaction a
     * unique reference.
     */
    const reference = `TAILORIT-${order.orderNumber}-${Date.now()}`

    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email,
          amount: String(amountInKobo),
          currency: 'NGN',
          reference,

          metadata: {
            orderId: orderSnapshot.id,
            orderNumber: order.orderNumber,
            userId,
          },
        }),
      },
    )

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status) {
      console.error(
        'Paystack initialization failed:',
        paystackData,
      )

      return res.status(502).json({
        error:
          paystackData.message ||
          'Paystack could not initialize the transaction',
      })
    }

    const accessCode = paystackData.data?.access_code
    const paystackReference = paystackData.data?.reference

    if (!accessCode || !paystackReference) {
      console.error(
        'Paystack returned an incomplete initialization response:',
        paystackData,
      )

      return res.status(502).json({
        error: 'Paystack returned an invalid transaction response',
      })
    }

    /*
     * Save the Paystack reference against
     * the order, but DO NOT mark it paid yet.
     */
    await orderRef.update({
      paymentReference: paystackReference,
      updatedAt: new Date().toISOString(),
    })

    return res.status(200).json({
      success: true,

      payment: {
        accessCode,
        reference: paystackReference,
      },
    })
  } catch (error) {
    console.error(
      'PAYSTACK INITIALIZATION ERROR:',
      error,
    )

    if (
      error instanceof Error &&
      error.message === 'Unauthorized'
    ) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

    if (
      error instanceof Error &&
      error.message === 'Invalid authentication token'
    ) {
      return res.status(401).json({
        error: 'Invalid authentication token',
      })
    }

    return res.status(500).json({
      error: 'Failed to initialize Paystack payment',
    })
  }
}