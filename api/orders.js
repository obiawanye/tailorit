/* global process */

import { createClerkClient, verifyToken } from '@clerk/backend'
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
  'camo',
  'chevron',
  'abstract',
  'orange',
])

const VALID_GRAPHICS = new Set([
  'none',
  'lightning',
  'star',
  'globe',
  'fire',
])

const MAX_TEXT_LENGTH = 52

function calculateItemPrice(item) {
  const productId = Number(item?.productId)
  const product = PRODUCTS[productId]

  if (!product) {
    throw new Error('Invalid product')
  }

  const quantity = Number(item?.quantity)

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new Error('Invalid quantity')
  }

  const customization =
    item?.customization &&
    typeof item.customization === 'object'
      ? item.customization
      : {}

  const nameText =
    typeof customization.nameText === 'string'
      ? customization.nameText.trim()
      : typeof customization.text === 'string'
        ? customization.text.trim()
        : ''

  const color =
    typeof customization.color === 'string'
      ? customization.color
      : ''

  const pattern =
    typeof customization.pattern === 'string'
      ? customization.pattern
      : 'none'

  const graphic =
    typeof customization.graphic === 'string'
      ? customization.graphic
      : 'none'

  if (nameText.length > MAX_TEXT_LENGTH) {
    throw new Error(
      `Custom text cannot exceed ${MAX_TEXT_LENGTH} characters`,
    )
  }

  if (!VALID_COLORS.has(color)) {
    throw new Error('Invalid colour selection')
  }

  if (!VALID_PATTERNS.has(pattern)) {
    throw new Error('Invalid pattern selection')
  }

  if (!VALID_GRAPHICS.has(graphic)) {
    throw new Error('Invalid graphic selection')
  }

  const nameTextPrice = nameText
    ? CUSTOMIZATION_PRICES.nameText
    : 0

  const colorPrice = CUSTOMIZATION_PRICES.color

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

  const lineTotal = unitPrice * quantity

  return {
    cartItemId:
      typeof item?.cartItemId === 'string'
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

    lineTotal,
  }
}

function validateShippingAddress(shippingAddress) {
  if (
    !shippingAddress ||
    typeof shippingAddress !== 'object'
  ) {
    throw new Error('Shipping address is required')
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
      typeof shippingAddress[field] !== 'string' ||
      !shippingAddress[field].trim()
    ) {
      throw new Error(
        `Shipping address field "${field}" is required`,
      )
    }
  }

  return {
    fullName: shippingAddress.fullName.trim(),
    phone: shippingAddress.phone.trim(),
    street: shippingAddress.street.trim(),
    city: shippingAddress.city.trim(),
    state: shippingAddress.state.trim(),
    country: shippingAddress.country.trim(),
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    // 1. Get Clerk session token

    const authorization = req.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

    const token = authorization.replace('Bearer ', '').trim()

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

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

    // 3. Get authenticated Clerk user

    const user = await clerk.users.getUser(userId)

    // 4. Get request data

    const {
      items,
      shippingAddress,
    } = req.body || {}

    // 5. Validate items

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Order must contain at least one item',
      })
    }

    if (items.length > 50) {
      return res.status(400).json({
        error: 'Order contains too many items',
      })
    }

    // 6. Validate shipping address

    let validatedShippingAddress

    try {
      validatedShippingAddress =
        validateShippingAddress(shippingAddress)
    } catch (error) {
      return res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Invalid shipping address',
      })
    }

    // 7. Calculate prices on the server

    let calculatedItems

    try {
      calculatedItems = items.map(calculateItemPrice)
    } catch (error) {
      return res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Invalid order item',
      })
    }

    // 8. Calculate totals

    const baseSubtotal = calculatedItems.reduce(
      (sum, item) =>
        sum + item.basePrice * item.quantity,
      0,
    )

    const customizationTotal =
      calculatedItems.reduce((sum, item) => {
        const customizationPerUnit =
          item.customizationPrices.nameText +
          item.customizationPrices.color +
          item.customizationPrices.pattern +
          item.customizationPrices.graphic

        return (
          sum +
          customizationPerUnit * item.quantity
        )
      }, 0)

    const subtotal =
      baseSubtotal + customizationTotal

    const deliveryFee = DELIVERY_FEE

    const total = subtotal + deliveryFee

    // 9. Generate order number

    const orderNumber = `TT-${Date.now()
      .toString()
      .slice(-8)}`

    // 10. Create Firestore order

    const orderRef = db.collection('orders').doc()

    const now = new Date().toISOString()

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

      items: calculatedItems,

      shippingAddress:
        validatedShippingAddress,

      subtotal,

      baseSubtotal,

      customizationTotal,

      deliveryFee,

      total,

      currency: 'NGN',

      status: 'pending',

      paymentStatus: 'unpaid',

      paymentReference: null,

      createdAt: now,

      updatedAt: now,
    }

    await orderRef.set(orderData)

    // 11. Return the server-calculated order

    return res.status(201).json({
      success: true,

      order: {
        id: orderRef.id,
        ...orderData,
      },
    })
  } catch (error) {
    console.error(
      'Order creation error:',
      error,
    )

    return res.status(500).json({
      error: 'Failed to create order',
    })
  }
}