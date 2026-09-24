/* global process */

import {
  createClerkClient,
  verifyToken,
} from '@clerk/backend'
import { db } from './firebaseAdmin.js'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

const DELIVERY_DAYS = 7

async function authenticateRequest(req) {
  const authorization =
    req.headers.authorization

  if (
    !authorization?.startsWith(
      'Bearer ',
    )
  ) {
    throw new Error('Unauthorized')
  }

  const token = authorization
    .replace('Bearer ', '')
    .trim()

  if (!token) {
    throw new Error('Unauthorized')
  }

  const verifiedToken =
    await verifyToken(token, {
      secretKey:
        process.env.CLERK_SECRET_KEY,
    })

  const userId =
    verifiedToken.sub

  if (!userId) {
    throw new Error(
      'Invalid authentication token',
    )
  }

  return userId
}

/*
 * Verify the transaction directly with Paystack.
 *
 * The secret key NEVER goes to the frontend.
 * Only this server-side function can use it.
 */
async function verifyPaystackTransaction(
  reference,
) {
  const secretKey =
    process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      'PAYSTACK_SECRET_KEY is not configured',
    )
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(
      reference,
    )}`,
    {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type':
          'application/json',
      },
    },
  )

  const responseText =
    await response.text()

  let data

  try {
    data = responseText
      ? JSON.parse(responseText)
      : {}
  } catch {
    throw new Error(
      'Paystack returned an invalid verification response',
    )
  }

  if (!response.ok) {
    console.error(
      'Paystack verification HTTP error:',
      {
        status: response.status,
        data,
      },
    )

    throw new Error(
      data?.message ||
        'Paystack transaction verification failed',
    )
  }

  if (data.status !== true) {
    throw new Error(
      data?.message ||
        'Paystack could not verify this transaction',
    )
  }

  if (!data.data) {
    throw new Error(
      'Paystack verification did not return transaction data',
    )
  }

  return data.data
}

export default async function handler(
  req,
  res,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    /*
     * 1. AUTHENTICATE THE USER
     */
    const userId =
      await authenticateRequest(req)

    /*
     * 2. GET REQUEST DATA
     */
    const {
      orderId,
      paymentReference,
    } = req.body || {}

    if (
      typeof orderId !== 'string' ||
      !orderId.trim()
    ) {
      return res.status(400).json({
        error: 'Order ID is required',
      })
    }

    if (
      typeof paymentReference !==
        'string' ||
      !paymentReference.trim()
    ) {
      return res.status(400).json({
        error:
          'Paystack payment reference is required',
      })
    }

    const reference =
      paymentReference.trim()

    /*
     * 3. GET THE FIRESTORE ORDER
     */
    const orderRef =
      db.collection('orders').doc(
        orderId.trim(),
      )

    const orderSnapshot =
      await orderRef.get()

    if (!orderSnapshot.exists) {
      return res.status(404).json({
        error: 'Order not found',
      })
    }

    const order =
      orderSnapshot.data()

    /*
     * 4. MAKE SURE THE ORDER BELONGS
     *    TO THE CURRENT USER
     */
    if (order.userId !== userId) {
      return res.status(403).json({
        error:
          'You do not have permission to update this order',
      })
    }

    /*
     * 5. PREVENT DUPLICATE PAYMENT UPDATES
     *
     * If Paystack already successfully
     * processed this order, simply return
     * the existing paid order.
     */
    if (
      order.paymentStatus === 'paid'
    ) {
      return res.status(200).json({
        success: true,
        alreadyPaid: true,

        order: {
          id: orderSnapshot.id,
          ...order,
        },
      })
    }

    /*
     * 6. VERIFY THE PAYMENT DIRECTLY
     *    WITH PAYSTACK
     */
    const transaction =
      await verifyPaystackTransaction(
        reference,
      )

    /*
     * 7. VERIFY THE TRANSACTION REFERENCE
     *
     * Make sure the Paystack transaction
     * we verified is the same transaction
     * reported by the frontend.
     */
    if (
      transaction.reference !==
      reference
    ) {
      console.error(
        'PAYSTACK REFERENCE MISMATCH:',
        {
          receivedReference:
            reference,

          verifiedReference:
            transaction.reference,
        },
      )

      return res.status(400).json({
        error:
          'Paystack payment reference does not match',
      })
    }

    /*
     * 8. VERIFY PAYMENT STATUS
     *
     * Paystack must explicitly report
     * the transaction as successful.
     */
    if (
      transaction.status !==
      'success'
    ) {
      console.error(
        'PAYSTACK PAYMENT NOT SUCCESSFUL:',
        {
          reference,

          status:
            transaction.status,
        },
      )

      return res.status(400).json({
        error:
          'Paystack payment was not successful',
      })
    }

    /*
     * 9. VERIFY CURRENCY
     */
    if (
      transaction.currency !==
      order.currency
    ) {
      console.error(
        'PAYSTACK CURRENCY MISMATCH:',
        {
          expected:
            order.currency,

          received:
            transaction.currency,
        },
      )

      return res.status(400).json({
        error:
          'Payment currency does not match the order currency',
      })
    }

    /*
     * 10. VERIFY PAYMENT AMOUNT
     *
     * TailorIt stores prices in NGN.
     *
     * Paystack expects amounts in the
     * smallest currency unit.
     *
     * Example:
     *
     * ₦20,600
     *
     * becomes:
     *
     * 2,060,000 kobo
     */
    const expectedAmount =
      Math.round(
        Number(order.total || 0) *
          100,
      )

    const receivedAmount =
      Number(
        transaction.amount,
      )

    if (
      !Number.isFinite(
        expectedAmount,
      ) ||
      expectedAmount <= 0
    ) {
      console.error(
        'INVALID ORDER AMOUNT:',
        {
          orderTotal:
            order.total,

          expectedAmount,
        },
      )

      return res.status(400).json({
        error:
          'The order has an invalid payment amount',
      })
    }

    if (
      receivedAmount !==
      expectedAmount
    ) {
      console.error(
        'PAYSTACK AMOUNT MISMATCH:',
        {
          orderId:
            orderSnapshot.id,

          expectedAmount,

          receivedAmount,

          reference,
        },
      )

      return res.status(400).json({
        error:
          'Payment amount does not match the order total',
      })
    }

    /*
     * 11. OPTIONAL METADATA VALIDATION
     *
     * If paystack-initialize.js sends
     * orderId and userId as metadata,
     * verify them here as an additional
     * layer of protection.
     */
    const metadata =
      transaction.metadata

    if (
      metadata &&
      typeof metadata ===
        'object'
    ) {
      if (
        metadata.orderId &&
        String(
          metadata.orderId,
        ) !==
          orderSnapshot.id
      ) {
        console.error(
          'PAYSTACK ORDER METADATA MISMATCH:',
          {
            expectedOrderId:
              orderSnapshot.id,

            receivedOrderId:
              metadata.orderId,

            reference,
          },
        )

        return res.status(400).json({
          error:
            'Payment does not belong to this order',
        })
      }

      if (
        metadata.userId &&
        String(
          metadata.userId,
        ) !== userId
      ) {
        console.error(
          'PAYSTACK USER METADATA MISMATCH:',
          {
            expectedUserId:
              userId,

            receivedUserId:
              metadata.userId,

            reference,
          },
        )

        return res.status(400).json({
          error:
            'Payment does not belong to this user',
        })
      }
    }

    /*
     * 12. GET THE CLERK USER
     */
    const user =
      await clerk.users.getUser(
        userId,
      )

    /*
     * 13. PAYMENT SUCCESS TIME
     */
    const now =
      new Date()

    const paidAt =
      now.toISOString()

    /*
     * 14. DELIVERY DATE
     *
     * Delivery is scheduled for
     * 7 days after successful payment.
     */
    const deliveryDate =
      new Date(now)

    deliveryDate.setDate(
      deliveryDate.getDate() +
        DELIVERY_DAYS,
    )

    const deliveryDateISO =
      deliveryDate.toISOString()

    /*
     * 15. UPDATE THE ORDER
     *
     * Only after Paystack has confirmed:
     *
     * ✓ transaction exists
     * ✓ transaction is successful
     * ✓ reference matches
     * ✓ currency matches
     * ✓ amount matches
     * ✓ user owns the order
     */
    const updatedOrder = {
      paymentStatus: 'paid',

      paymentReference:
        transaction.reference,

      paidAt,

      status: 'shipped',

      shippedAt: paidAt,

      deliveryDate:
        deliveryDateISO,

      estimatedDeliveryDate:
        deliveryDateISO,

      updatedAt: paidAt,

      customer: {
        ...(order.customer || {}),

        firstName:
          user.firstName ||
          order.customer
            ?.firstName ||
          '',

        lastName:
          user.lastName ||
          order.customer
            ?.lastName ||
          '',

        email:
          user.primaryEmailAddress
            ?.emailAddress ||
          order.customer
            ?.email ||
          '',
      },
    }

    await orderRef.update(
      updatedOrder,
    )

    /*
     * 16. RETURN THE UPDATED ORDER
     */
    const finalOrder = {
      id: orderSnapshot.id,

      ...order,

      ...updatedOrder,
    }

    return res.status(200).json({
      success: true,

      payment: {
        status: 'success',

        reference:
          transaction.reference,

        paidAt,

        amount:
          transaction.amount,

        currency:
          transaction.currency,
      },

      order: finalOrder,
    })
  } catch (error) {
    console.error(
      'ORDER PAYMENT API ERROR:',
      error,
    )

    if (
      error instanceof Error &&
      error.message ===
        'Unauthorized'
    ) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

    if (
      error instanceof Error &&
      error.message ===
        'Invalid authentication token'
    ) {
      return res.status(401).json({
        error:
          'Invalid authentication token',
      })
    }

    if (
      error instanceof Error &&
      error.message ===
        'PAYSTACK_SECRET_KEY is not configured'
    ) {
      return res.status(500).json({
        error:
          'Paystack is not configured on the server',
      })
    }

    if (
      error instanceof Error
    ) {
      return res.status(400).json({
        error: error.message,
      })
    }

    return res.status(500).json({
      error:
        'Failed to process payment',
    })
  }
}