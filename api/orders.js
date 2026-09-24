/* global process */

import {
  createClerkClient,
  verifyToken,
} from '@clerk/backend'
import { db } from './firebaseAdmin.js'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

const DELIVERY_FEE = 5000

const CUSTOMIZATION_PRICES = {
  nameText: 1000,
  color: 2000,
  pattern: 2500,
  graphic: 2500,
}

const PRODUCTS = {
  1: {
    name: 'CUSTOM ART LAPTOP SLEEVE',
    price: 800,
    image: '/assets/Catalog/catalog-laptop.png',
  },

  2: {
    name: 'CROSSBODY PHONE CASE',
    price: 800,
    image: '/assets/Catalog/catalog-phone-case.png',
  },

  3: {
    name: 'OLIVE CANVAS DUFFEL BAG',
    price: 800,
    image: '/assets/Catalog/catalog-olive-duffel.png',
  },

  4: {
    name: 'CLASSIC LOW-TOP SNEAKERS',
    price: 800,
    image: '/assets/Catalog/catalog-sneaker.png',
  },

  5: {
    name: 'TAILORIT EXCLUSIVE TRAVEL BAG',
    price: 900,
    image: '/assets/Catalog/catalog-black-orange-bag.png',
  },

  6: {
    name: 'CREASED BLACK EFFECT SHIRT',
    price: 800,
    image: '/assets/Catalog/catalog-black-shirt.png',
  },
}

const VALID_COLORS = new Set([
  'orange',
  'white',
  'black',
  'red',
  'green',
  'blue',
  'purple',
])

const VALID_PATTERNS = new Set([
  'none',
  'plain',

  'orange',
  'orange-white',
  'orange-black',
  'orange-red',
  'orange-green',
  'orange-blue',
  'orange-purple',

  'camo',
  'camo-white',
  'camo-black',
  'camo-orange',
  'camo-red',
  'camo-green',
  'camo-blue',
  'camo-purple',

  'chevron',
  'chevron-white',
  'chevron-black',
  'chevron-orange',
  'chevron-red',
  'chevron-green',
  'chevron-blue',
  'chevron-purple',

  'abstract',
  'abstract-white',
  'abstract-black',
  'abstract-orange',
  'abstract-red',
  'abstract-green',
  'abstract-blue',
  'abstract-purple',
])

const VALID_GRAPHICS = new Set([
  'none',
  'lightning',
  'star',
  'globe',
  'fire',
])

const MAX_TEXT_LENGTH = 52

function normalizePattern(pattern) {
  if (typeof pattern !== 'string') {
    return 'none'
  }

  const normalized = pattern
    .trim()
    .toLowerCase()

  if (normalized === 'plain') {
    return 'none'
  }

  return normalized
}

function calculateItemPrice(item) {
  const productId = Number(
    item?.productId,
  )

  const product = PRODUCTS[productId]

  if (!product) {
    throw new Error(
      `Invalid product ID: "${item?.productId}"`,
    )
  }

  const quantity = Number(
    item?.quantity,
  )

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100
  ) {
    throw new Error(
      `Invalid quantity: "${item?.quantity}"`,
    )
  }

  const customization =
    item?.customization &&
    typeof item.customization ===
      'object'
      ? item.customization
      : {}

  const nameText =
    typeof customization.nameText ===
      'string'
      ? customization.nameText.trim()
      : typeof customization.text ===
          'string'
        ? customization.text.trim()
        : ''

  const color =
    typeof customization.color ===
      'string'
      ? customization.color
          .trim()
          .toLowerCase()
      : ''

  const rawPattern =
    typeof customization.pattern ===
      'string'
      ? customization.pattern
          .trim()
          .toLowerCase()
      : 'none'

  const pattern =
    normalizePattern(rawPattern)

  const graphic =
    typeof customization.graphic ===
      'string'
      ? customization.graphic
          .trim()
          .toLowerCase()
      : 'none'

  if (
    nameText.length >
    MAX_TEXT_LENGTH
  ) {
    throw new Error(
      `Custom text cannot exceed ${MAX_TEXT_LENGTH} characters`,
    )
  }

  if (!VALID_COLORS.has(color)) {
    throw new Error(
      `Invalid colour selection: "${color}"`,
    )
  }

  if (!VALID_PATTERNS.has(pattern)) {
    throw new Error(
      `Invalid pattern selection: "${pattern}" (raw: "${rawPattern}")`,
    )
  }

  if (!VALID_GRAPHICS.has(graphic)) {
    throw new Error(
      `Invalid graphic selection: "${graphic}"`,
    )
  }

  const nameTextPrice = nameText
    ? CUSTOMIZATION_PRICES.nameText
    : 0

  const colorPrice =
    CUSTOMIZATION_PRICES.color

  const patternPrice =
    pattern !== 'none'
      ? CUSTOMIZATION_PRICES.pattern
      : 0

  const graphicPrice =
    graphic !== 'none'
      ? CUSTOMIZATION_PRICES.graphic
      : 0

  const customizationPerUnit =
    nameTextPrice +
    colorPrice +
    patternPrice +
    graphicPrice

  const unitPrice =
    product.price +
    customizationPerUnit

  const lineTotal =
    unitPrice * quantity

  return {
    cartItemId:
      typeof item?.cartItemId ===
      'string'
        ? item.cartItemId
        : `${productId}-${Date.now()}`,

    productId,

    name: product.name,

    image: product.image,

    quantity,

    basePrice: product.price,

    customization: {
      nameText,

      text: nameText,

      color,

      pattern,

      graphic,
    },

    customizationPrices: {
      nameText: nameTextPrice,

      color: colorPrice,

      pattern: patternPrice,

      graphic: graphicPrice,
    },

    unitPrice,

    totalPrice: unitPrice,

    lineTotal,
  }
}

function validateShippingAddress(
  shippingAddress,
) {
  if (
    !shippingAddress ||
    typeof shippingAddress !==
      'object'
  ) {
    throw new Error(
      'Shipping address is required',
    )
  }

  const requiredFields = [
    'fullName',
    'phone',
    'street',
    'city',
    'state',
    'country',
  ]

  for (const field of requiredFields) {
    if (
      typeof shippingAddress[
        field
      ] !== 'string' ||
      !shippingAddress[
        field
      ].trim()
    ) {
      throw new Error(
        `Shipping address field "${field}" is required`,
      )
    }
  }

  return {
    fullName:
      shippingAddress.fullName.trim(),

    phone:
      shippingAddress.phone.trim(),

    street:
      shippingAddress.street.trim(),

    city:
      shippingAddress.city.trim(),

    state:
      shippingAddress.state.trim(),

    country:
      shippingAddress.country.trim(),
  }
}

async function authenticateRequest(
  req,
) {
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

async function getUserOrders(
  userId,
) {
  const snapshot =
    await db
      .collection('orders')
      .where(
        'userId',
        '==',
        userId,
      )
      .get()

  const now = new Date()

  const orders = []

  for (const document of snapshot.docs) {
    const order = {
      id: document.id,
      ...document.data(),
    }

    /*
     * There is intentionally no cron job
     * required for this demo.
     *
     * When the user requests their orders,
     * we check whether a shipped order has
     * reached its delivery date.
     *
     * If it has, Firestore is updated to
     * delivered immediately.
     */
    if (
      order.status === 'shipped' &&
      order.deliveryDate
    ) {
      const deliveryDate =
        new Date(
          order.deliveryDate,
        )

      if (
        !Number.isNaN(
          deliveryDate.getTime(),
        ) &&
        now >= deliveryDate
      ) {
        const deliveredAt =
          now.toISOString()

        await document.ref.update({
          status: 'delivered',

          deliveredAt,

          updatedAt: deliveredAt,
        })

        order.status = 'delivered'

        order.deliveredAt =
          deliveredAt

        order.updatedAt =
          deliveredAt
      }
    }

    orders.push(order)
  }

  orders.sort((a, b) => {
    const dateA = new Date(
      a.createdAt || 0,
    ).getTime()

    const dateB = new Date(
      b.createdAt || 0,
    ).getTime()

    return dateB - dateA
  })

  return orders
}

async function createOrder(
  req,
  res,
  userId,
) {
  const user =
    await clerk.users.getUser(
      userId,
    )

  const {
    items,
    shippingAddress,
  } = req.body || {}

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      error:
        'Order must contain at least one item',
    })
  }

  if (items.length > 50) {
    return res.status(400).json({
      error:
        'Order contains too many items',
    })
  }

  let validatedShippingAddress

  try {
    validatedShippingAddress =
      validateShippingAddress(
        shippingAddress,
      )
  } catch (error) {
    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Invalid shipping address',
    })
  }

  let calculatedItems

  try {
    calculatedItems =
      items.map(
        calculateItemPrice,
      )
  } catch (error) {
    console.error(
      'ORDER ITEM VALIDATION ERROR:',
      error,
    )

    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Invalid order item',
    })
  }

  /*
   * IMPORTANT:
   *
   * We calculate all prices on the
   * server instead of trusting the
   * prices sent by the browser.
   */

  const baseSubtotal =
    calculatedItems.reduce(
      (sum, item) =>
        sum +
        item.basePrice *
          item.quantity,
      0,
    )

  const customizationTotal =
    calculatedItems.reduce(
      (sum, item) => {
        const customizationPerUnit =
          item.customizationPrices
            .nameText +
          item.customizationPrices
            .color +
          item.customizationPrices
            .pattern +
          item.customizationPrices
            .graphic

        return (
          sum +
          customizationPerUnit *
            item.quantity
        )
      },
      0,
    )

  const subtotal =
    baseSubtotal +
    customizationTotal

  const deliveryFee =
    DELIVERY_FEE

  const total =
    subtotal +
    deliveryFee

  const orderNumber =
    `TT-${Date.now()
      .toString()
      .slice(-8)}`

  const orderRef =
    db.collection('orders').doc()

  const now =
    new Date().toISOString()

  const orderData = {
    orderNumber,

    userId,

    customer: {
      firstName:
        user.firstName || '',

      lastName:
        user.lastName || '',

      email:
        user.primaryEmailAddress
          ?.emailAddress ||
        user.emailAddresses?.[0]
          ?.emailAddress ||
        '',
    },

    items:
      calculatedItems,

    shippingAddress:
      validatedShippingAddress,

    subtotal,

    baseSubtotal,

    customizationTotal,

    deliveryFee,

    total,

    currency: 'NGN',

    /*
     * New orders begin here.
     *
     * Payment changes this to:
     * paymentStatus = paid
     * status = shipped
     */
    status: 'pending',

    paymentStatus: 'unpaid',

    paymentReference: null,

    createdAt: now,

    updatedAt: now,
  }

  await orderRef.set(
    orderData,
  )

  return res.status(201).json({
    success: true,

    order: {
      id: orderRef.id,

      ...orderData,
    },
  })
}

export default async function handler(
  req,
  res,
) {
  try {
    const userId =
      await authenticateRequest(
        req,
      )

    /*
     * GET /api/orders
     *
     * Used by MyOrders.jsx.
     */
    if (req.method === 'GET') {
      const orders =
        await getUserOrders(
          userId,
        )

      return res.status(200).json({
        success: true,

        orders,
      })
    }

    /*
     * POST /api/orders
     *
     * Creates a new pending order
     * before payment.
     */
    if (req.method === 'POST') {
      return await createOrder(
        req,
        res,
        userId,
      )
    }

    return res.status(405).json({
      error:
        'Method not allowed',
    })
  } catch (error) {
    console.error(
      'ORDER API ERROR:',
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

    return res.status(500).json({
      error:
        'Failed to process order request',
    })
  }
}