import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth, useUser } from '@clerk/react'
import PaystackPop from '@paystack/inline-js'
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronRight,
  FiPlus,
  FiX,
} from 'react-icons/fi'

const DELIVERY_FEE = 5000

const formatPrice = (price) =>
  `₦${Number(price || 0).toLocaleString()}`

const getCheckoutItems = () => {
  try {
    const savedItems = JSON.parse(
      sessionStorage.getItem('tailorit-checkout-items') || '[]',
    )

    return Array.isArray(savedItems) ? savedItems : []
  } catch (error) {
    console.error('Failed to load checkout items:', error)
    return []
  }
}

const getSavedAddress = () => {
  try {
    const savedAddress = JSON.parse(
      localStorage.getItem('tailorit-shipping-address') || 'null',
    )

    return savedAddress
  } catch (error) {
    console.error('Failed to load shipping address:', error)
    return null
  }
}

const formatOrderDate = (date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()

  const [checkoutItems] = useState(getCheckoutItems)

  const [shippingAddress, setShippingAddress] =
    useState(getSavedAddress)

  const [showAddressModal, setShowAddressModal] =
    useState(false)

  const [paymentProcessing, setPaymentProcessing] =
    useState(false)

  const [isCreatingOrder, setIsCreatingOrder] =
    useState(false)

  const [showSuccessModal, setShowSuccessModal] =
    useState(false)

  const [completedOrder, setCompletedOrder] =
    useState(null)

  const [paymentError, setPaymentError] =
    useState('')

  const [addressForm, setAddressForm] = useState(() => {
    const savedAddress = getSavedAddress()

    return {
      fullName: savedAddress?.fullName || '',
      phone: savedAddress?.phone || '',
      street: savedAddress?.street || '',
      city: savedAddress?.city || '',
      state: savedAddress?.state || '',
      country: savedAddress?.country || 'Nigeria',
    }
  })

  const baseSubtotal = checkoutItems.reduce(
    (sum, item) => {
      return (
        sum +
        Number(item.basePrice || 0) *
          Number(item.quantity || 1)
      )
    },
    0,
  )

  const customizationTotal = checkoutItems.reduce(
    (sum, item) => {
      const quantity = Number(
        item.quantity || 1,
      )

      const customizationPrice =
        Number(item.totalPrice || 0) -
        Number(item.basePrice || 0)

      return (
        sum +
        Math.max(customizationPrice, 0) *
          quantity
      )
    },
    0,
  )

  const subtotal =
    baseSubtotal + customizationTotal

  const deliveryFee =
    checkoutItems.length > 0
      ? DELIVERY_FEE
      : 0

  const finalTotal =
    subtotal + deliveryFee

  const handleAddressChange = (event) => {
    const { name, value } = event.target

    setAddressForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const openAddressModal = () => {
    setAddressForm({
      fullName:
        shippingAddress?.fullName || '',
      phone:
        shippingAddress?.phone || '',
      street:
        shippingAddress?.street || '',
      city:
        shippingAddress?.city || '',
      state:
        shippingAddress?.state || '',
      country:
        shippingAddress?.country ||
        'Nigeria',
    })

    setShowAddressModal(true)
  }

  const saveAddress = (event) => {
    event.preventDefault()

    const cleanedAddress = {
      fullName:
        addressForm.fullName.trim(),

      phone:
        addressForm.phone.trim(),

      street:
        addressForm.street.trim(),

      city:
        addressForm.city.trim(),

      state:
        addressForm.state.trim(),

      country:
        addressForm.country.trim(),
    }

    const hasEmptyField = Object.values(
      cleanedAddress,
    ).some((value) => !value)

    if (hasEmptyField) {
      return
    }

    setShippingAddress(
      cleanedAddress,
    )

    localStorage.setItem(
      'tailorit-shipping-address',
      JSON.stringify(
        cleanedAddress,
      ),
    )

    setShowAddressModal(false)
  }

  const startCheckout = async () => {
    if (!shippingAddress) {
      openAddressModal()
      return
    }

    if (checkoutItems.length === 0) {
      return
    }

    setPaymentError('')
    setIsCreatingOrder(true)

    try {
      const token = await getToken()

      if (!token) {
        throw new Error(
          'Your session has expired. Please sign in again.',
        )
      }

      const orderResponse = await fetch(
        '/api/orders',
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            items: checkoutItems,
            shippingAddress,
          }),
        },
      )

      const responseText =
        await orderResponse.text()

      let orderData = {}

      try {
        orderData = responseText
          ? JSON.parse(responseText)
          : {}
      } catch {
        throw new Error(
          `Checkout service returned an invalid response (${orderResponse.status}). Please try again.`,
        )
      }

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error ||
            'Failed to create your order.',
        )
      }

      if (!orderData.order?.id) {
        throw new Error(
          'The order was created but no order ID was returned.',
        )
      }

      const order = orderData.order

      const initializeResponse = await fetch(
        '/api/paystack-initialize',
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            orderId: order.id,
          }),
        },
      )

      const initializeText =
        await initializeResponse.text()

      let initializeData = {}

      try {
        initializeData = initializeText
          ? JSON.parse(initializeText)
          : {}
      } catch {
        throw new Error(
          `Paystack initialization returned an invalid response (${initializeResponse.status}). Please try again.`,
        )
      }

      if (!initializeResponse.ok) {
        throw new Error(
          initializeData.error ||
            'Paystack could not initialize your payment.',
        )
      }

      const accessCode =
        initializeData.payment?.accessCode

      const paymentReference =
        initializeData.payment?.reference

      if (!accessCode || !paymentReference) {
        throw new Error(
          'Paystack did not return a valid payment session.',
        )
      }

      const paystack = new PaystackPop()

      paystack.resumeTransaction(
        accessCode,
        {
          onLoad: () => {
            setIsCreatingOrder(false)
            setPaymentProcessing(true)

            console.log(
              'Paystack checkout loaded successfully.',
            )
          },

          onSuccess: async (transaction) => {
            await handlePaystackSuccess(
              transaction?.reference ||
                paymentReference,
              order,
            )
          },

          onCancel: () => {
            setIsCreatingOrder(false)
            setPaymentProcessing(false)

            setPaymentError(
              'Payment was cancelled. Your order is still pending and can be paid again.',
            )
          },

          onError: (error) => {
            console.error(
              'Paystack popup error:',
              error,
            )

            setIsCreatingOrder(false)
            setPaymentProcessing(false)

            setPaymentError(
              error?.message ||
                'Paystack could not load the payment checkout.',
            )
          },
        },
      )
    } catch (error) {
      console.error(
        'Checkout/Paystack initialization error:',
        error,
      )

      setIsCreatingOrder(false)
      setPaymentProcessing(false)

      setPaymentError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while starting your payment.',
      )
    }
  }

  const handlePaystackSuccess = async (
    reference,
    order,
  ) => {
    if (!reference) {
      setPaymentProcessing(false)

      setPaymentError(
        'Paystack reported success, but no payment reference was returned.',
      )

      return
    }

    if (!order?.id) {
      setPaymentProcessing(false)

      setPaymentError(
        'Payment succeeded, but the TailorIt order could not be found. Please contact support with your Paystack reference.',
      )

      return
    }

    setPaymentProcessing(true)
    setPaymentError('')

    try {
      const token = await getToken()

      if (!token) {
        throw new Error(
          'Your session has expired. Please sign in again.',
        )
      }

      const paymentResponse =
        await fetch(
          '/api/order-payment',
          {
            method: 'POST',

            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              orderId: order.id,
              paymentReference: reference,
            }),
          },
        )

      const paymentText =
        await paymentResponse.text()

      let paymentData = {}

      try {
        paymentData = paymentText
          ? JSON.parse(paymentText)
          : {}
      } catch {
        throw new Error(
          `Payment verification returned an invalid response (${paymentResponse.status}). Please try again.`,
        )
      }

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.error ||
            'Paystack payment could not be verified.',
        )
      }

      const paidOrder =
        paymentData.order

      if (!paidOrder) {
        throw new Error(
          'Payment was verified but the updated order was not returned.',
        )
      }

      const deliveryDate =
        paidOrder.deliveryDate
          ? new Date(
              paidOrder.deliveryDate,
            )
          : null

      const estimatedDelivery =
        deliveryDate &&
        !Number.isNaN(
          deliveryDate.getTime(),
        )
          ? deliveryDate.toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              },
            )
          : '7 days'

      sessionStorage.setItem(
        'tailorit-demo-payment',
        JSON.stringify({
          reference:
            paidOrder.paymentReference,

          amount:
            paidOrder.total,

          status: 'success',

          createdAt:
            paidOrder.paidAt,
        }),
      )

      try {
        const savedCart =
          JSON.parse(
            localStorage.getItem(
              'tailorit-cart',
            ) || '[]',
          )

        const purchasedIds =
          new Set(
            checkoutItems
              .map(
                (item) =>
                  item.cartId ||
                  item.cartItemId,
              )
              .filter(Boolean),
          )

        const remainingCart =
          Array.isArray(savedCart)
            ? savedCart.filter(
                (item) =>
                  !purchasedIds.has(
                    item.cartId ||
                      item.cartItemId,
                  ),
              )
            : []

        localStorage.setItem(
          'tailorit-cart',
          JSON.stringify(
            remainingCart,
          ),
        )
      } catch (error) {
        console.error(
          'Failed to update cart after checkout:',
          error,
        )
      }

      const orderDate =
        paidOrder.createdAt
          ? formatOrderDate(
              new Date(
                paidOrder.createdAt,
              ),
            )
          : formatOrderDate(
              new Date(),
            )

      const firstName =
        paidOrder.customer
          ?.firstName ||
        user?.firstName ||
        shippingAddress?.fullName?.split(
          ' ',
        )[0] ||
        'Customer'

      const completedOrderData = {
        ...paidOrder,

        orderNumber:
          paidOrder.orderNumber,

        orderDate,

        estimatedDelivery,

        firstName,

        items:
          paidOrder.items,

        subtotal:
          paidOrder.subtotal,

        customizationTotal:
          paidOrder.customizationTotal,

        deliveryFee:
          paidOrder.deliveryFee,

        total:
          paidOrder.total,

        paymentReference:
          paidOrder.paymentReference,

        shippingAddress:
          paidOrder.shippingAddress ||
          shippingAddress,
      }

      setPaymentProcessing(false)
      setIsCreatingOrder(false)

      setCompletedOrder(
        completedOrderData,
      )

      setShowSuccessModal(true)
    } catch (error) {
      console.error(
        'Paystack payment verification error:',
        error,
      )

      setPaymentProcessing(false)
      setIsCreatingOrder(false)

      setPaymentError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while verifying your Paystack payment.',
      )
    }
  }

  const finishDemoOrder = () => {
    sessionStorage.removeItem(
      'tailorit-checkout-items',
    )

    sessionStorage.removeItem(
      'tailorit-checkout-summary',
    )

    setShowSuccessModal(false)

    navigate('/catalog')
  }

  const viewOrderHistory = () => {
    sessionStorage.removeItem(
      'tailorit-checkout-items',
    )

    sessionStorage.removeItem(
      'tailorit-checkout-summary',
    )

    setShowSuccessModal(false)

    navigate('/my-orders')
  }

  if (checkoutItems.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-black">
        <div className="text-center">
          <h1 className="text-[38px] font-bold">
            Nothing to checkout
          </h1>

          <p className="mt-3 text-gray-500">
            Select some products from your cart first.
          </p>

          <Link
            to="/cart"
            className="mt-8 inline-flex items-center gap-3 rounded-[8px] bg-[#ff5a00] px-8 py-4 font-semibold text-white"
          >
            <FiArrowLeft />
            Back To Cart
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white px-6 py-14 text-black md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-[1450px]">
        <h1 className="mb-12 text-[40px] font-bold tracking-[-1px]">
          Checkout
        </h1>

        <section className="rounded-[10px] border border-[#d8d8d8] p-6">
          <h2 className="mb-5 text-[20px] font-bold">
            Order Summary
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-7 lg:pr-10">
              {checkoutItems.map(
                (item) => {
                  const quantity =
                    Number(
                      item.quantity ||
                        1,
                    )

                  const isCustom =
                    Boolean(
                      item.customization
                        ?.nameText ||
                        item.customization
                          ?.text ||
                        (
                          item
                            .customization
                            ?.pattern !==
                          'none'
                        ) ||
                        (
                          item
                            .customization
                            ?.graphic !==
                          'none'
                        ),
                    )

                  return (
                    <div
                      key={
                        item.cartId ||
                        item.cartItemId ||
                        item.productId
                      }
                      className="flex items-center gap-7"
                    >
                      <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#eeeeee]">
                        <img
                          src={item.image}
                          alt={
                            item.name
                          }
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-[19px] font-semibold">
                          {item.name}

                          {isCustom
                            ? ' (Custom)'
                            : ' (Plain)'}
                        </h3>

                        <p className="mt-1 text-[15px] text-gray-600">
                          Qty:{' '}
                          {quantity}
                        </p>
                      </div>

                      <p className="whitespace-nowrap text-[20px] font-semibold">
                        {formatPrice(
                          Number(
                            item.totalPrice ||
                              item.unitPrice ||
                              0,
                          ) *
                            quantity,
                        )}
                      </p>
                    </div>
                  )
                },
              )}
            </div>

            <div className="mt-8 border-t border-[#dddddd] pt-8 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-8">
              <div className="space-y-7 text-[17px] text-gray-600">
                <div className="flex justify-between gap-5">
                  <span>
                    Subtotal
                  </span>

                  <span>
                    {formatPrice(
                      baseSubtotal,
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span>
                    Customization Total
                  </span>

                  <span>
                    {formatPrice(
                      customizationTotal,
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span>
                    Delivery Fee
                  </span>

                  <span>
                    {formatPrice(
                      deliveryFee,
                    )}
                  </span>
                </div>
              </div>

              <div className="my-7 border-t border-[#dddddd]" />

              <div className="flex items-center justify-between">
                <span className="text-[18px] font-bold">
                  Total
                </span>

                <span className="text-[20px] font-semibold text-[#ff5a00]">
                  {formatPrice(
                    finalTotal,
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-[10px] border border-[#d8d8d8] p-5">
            <h2 className="mb-6 text-[26px] font-semibold">
              Payment Method
            </h2>

            <div className="flex min-h-[105px] items-center justify-between rounded-[10px] border border-[#bdbdbd] px-5">
              <div className="flex items-center gap-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black">
                  <FiCheck className="h-4 w-4" />
                </span>

                <span className="text-[18px]">
                  Pay with Paystack
                </span>
              </div>

              <img
                src="/assets/paystack.png"
                alt="Paystack"
                className="h-[42px] w-auto object-contain"
              />
            </div>
          </section>

          <section className="rounded-[10px] border border-[#d8d8d8] p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[26px] font-semibold">
                Shipping Address
              </h2>

              <button
                type="button"
                onClick={
                  openAddressModal
                }
                aria-label="Add shipping address"
                className="text-[#ff5a00]"
              >
                <FiPlus className="h-7 w-7" />
              </button>
            </div>

            {shippingAddress ? (
              <button
                type="button"
                onClick={
                  openAddressModal
                }
                className="flex min-h-[105px] w-full items-center justify-between rounded-[10px] border border-[#bdbdbd] px-5 text-left"
              >
                <div className="flex items-center gap-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#ff5a00] text-[#ff5a00]">
                    <FiCheck className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="font-semibold text-[#ff5a00]">
                      Default
                    </p>

                    <p className="mt-2 max-w-[390px] text-[16px] leading-5">
                      {
                        shippingAddress.street
                      }
                      ,{' '}
                      {
                        shippingAddress.city
                      }
                      ,{' '}
                      {
                        shippingAddress.state
                      }
                      ,{' '}
                      {
                        shippingAddress.country
                      }
                    </p>
                  </div>
                </div>

                <FiChevronRight className="h-7 w-7 shrink-0 text-[#ff5a00]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  openAddressModal
                }
                className="flex min-h-[105px] w-full items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#bdbdbd] text-gray-500 transition hover:border-[#ff5a00] hover:text-[#ff5a00]"
              >
                <FiPlus />
                Add shipping address
              </button>
            )}
          </section>
        </div>

        {paymentError && (
          <div className="mt-6 rounded-[10px] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-600">
            {paymentError}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Link
            to="/cart"
            className="flex h-[66px] items-center justify-center gap-8 rounded-[10px] border-2 border-[#ff5a00] text-[19px] font-semibold text-[#ff5a00] transition hover:bg-[#fff5f0]"
          >
            <FiArrowLeft className="h-7 w-7" />
            Back To Cart
          </Link>

          <button
            type="button"
            onClick={
              startCheckout
            }
            disabled={
              isCreatingOrder ||
              paymentProcessing
            }
            className="flex h-[66px] items-center justify-center gap-8 rounded-[10px] bg-[#ff5a00] text-[19px] font-semibold text-white transition hover:bg-[#e95000] disabled:cursor-wait disabled:opacity-60"
          >
            {isCreatingOrder
              ? 'Preparing Checkout...'
              : paymentProcessing
                ? 'Processing Payment...'
                : 'Checkout With Paystack'}

            <FiArrowRight className="h-7 w-7" />
          </button>
        </div>
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-5">
          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-[16px] bg-white p-7 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[28px] font-bold">
                  Shipping Address
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Where should we deliver your order?
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddressModal(
                    false,
                  )
                }
                aria-label="Close"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={saveAddress}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={
                    addressForm.fullName
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="John Doe"
                  className="h-[52px] w-full rounded-[8px] border border-[#cccccc] px-4 outline-none focus:border-[#ff5a00]"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={
                    addressForm.phone
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="+234..."
                  className="h-[52px] w-full rounded-[8px] border border-[#cccccc] px-4 outline-none focus:border-[#ff5a00]"
                />
              </div>

              <div>
                <label
                  htmlFor="street"
                  className="mb-2 block text-sm font-semibold"
                >
                  Street Address
                </label>

                <input
                  id="street"
                  name="street"
                  type="text"
                  required
                  value={
                    addressForm.street
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="30 Sage Drive"
                  className="h-[52px] w-full rounded-[8px] border border-[#cccccc] px-4 outline-none focus:border-[#ff5a00]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={
                      addressForm.city
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="Abuja"
                    className="h-[52px] w-full rounded-[8px] border border-[#cccccc] px-4 outline-none focus:border-[#ff5a00]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="mb-2 block text-sm font-semibold"
                  >
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={
                      addressForm.state
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="FCT"
                    className="h-[52px] w-full rounded-[8px] border border-[#cccccc] px-4 outline-none focus:border-[#ff5a00]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="mb-2 block text-sm font-semibold"
                >
                  Country
                </label>

                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={
                    addressForm.country
                  }
                  onChange={
                    handleAddressChange
                  }
                  className="h-[52px] w-full rounded-[8px] border border-[#cccccc] px-4 outline-none focus:border-[#ff5a00]"
                />
              </div>

              <button
                type="submit"
                className="h-[56px] w-full rounded-[8px] bg-[#ff5a00] font-semibold text-white transition hover:bg-[#e95000]"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal &&
        completedOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-6 sm:px-6">
            <div className="max-h-[94vh] w-full max-w-[1250px] overflow-y-auto rounded-[4px] bg-white px-6 py-8 shadow-2xl sm:px-8 lg:px-12 lg:py-10">
              <div className="flex flex-col items-center text-center">
                <img
                  src="/assets/green-checkmark.png"
                  alt="Order successful"
                  className="h-[86px] w-[86px] object-contain"
                />

                <h1 className="mt-7 text-[34px] font-bold tracking-[-1.5px] sm:text-[38px]">
                  Thank you,{' '}
                  <span className="text-[#ff5a00]">
                    {
                      completedOrder.firstName
                    }
                    !
                  </span>
                </h1>

                <p className="mt-3 text-[17px] text-[#666666] sm:text-[18px]">
                  Your order has been placed successfully.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[430px_minmax(0,1fr)]">
                <div className="space-y-6">
                  <div className="rounded-[9px] border border-[#d9d9d9] p-6">
                    <h2 className="text-[19px] font-bold">
                      Order Details
                    </h2>

                    <div className="mt-6 space-y-4 text-[16px]">
                      <div className="grid grid-cols-[120px_1fr] gap-5">
                        <span className="text-[#666666]">
                          Order Number
                        </span>

                        <span className="font-medium text-[#555555]">
                          {
                            completedOrder.orderNumber
                          }
                        </span>
                      </div>

                      <div className="grid grid-cols-[120px_1fr] gap-5">
                        <span className="text-[#666666]">
                          Order Date
                        </span>

                        <span className="font-medium text-[#555555]">
                          {
                            completedOrder.orderDate
                          }
                        </span>
                      </div>

                      <div className="grid grid-cols-[120px_1fr] gap-5">
                        <span className="text-[#666666]">
                          Payment
                        </span>

                        <span className="font-medium text-[#555555]">
                          Paid
                        </span>
                      </div>

                      <div className="grid grid-cols-[120px_1fr] gap-5">
                        <span className="text-[#666666]">
                          Status
                        </span>

                        <span className="font-medium capitalize text-[#555555]">
                          {
                            completedOrder.status
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[9px] border border-[#d9d9d9] p-6">
                    <h2 className="text-[19px] font-bold">
                      Estimated Delivery
                    </h2>

                    <p className="mt-6 text-[17px] font-medium">
                      {
                        completedOrder.estimatedDelivery
                      }
                    </p>

                    <p className="mt-3 text-[16px] leading-[1.4] text-[#666666]">
                      Your order has been shipped and is expected to be delivered on this date.
                    </p>
                  </div>
                </div>

                <div className="rounded-[9px] border border-[#d9d9d9] p-6">
                  <h2 className="text-[19px] font-bold">
                    Order Summary
                  </h2>

                  <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_1px_300px]">
                    <div className="space-y-5">
                      {completedOrder.items.map(
                        (item) => {
                          const quantity =
                            Number(
                              item.quantity ||
                                1,
                            )

                          const isCustom =
                            Boolean(
                              item
                                .customization
                                ?.nameText ||
                                item
                                  .customization
                                  ?.text ||
                                (
                                  item
                                    .customization
                                    ?.pattern !==
                                  'none'
                                ) ||
                                (
                                  item
                                    .customization
                                    ?.graphic !==
                                  'none'
                                ),
                            )

                          return (
                            <div
                              key={
                                item.cartId ||
                                item.cartItemId ||
                                item.productId
                              }
                              className="flex gap-4"
                            >
                              <div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#eeeeee]">
                                <img
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.name
                                  }
                                  className="h-full w-full object-contain"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-[16px] font-medium">
                                  {
                                    item.name
                                  }{' '}
                                  <span className="text-[#666666]">
                                    (
                                    {isCustom
                                      ? 'Customized'
                                      : 'Plain'}
                                    )
                                  </span>
                                </p>

                                <div className="mt-3 flex items-center justify-between gap-4 text-[16px]">
                                  <span className="text-[#666666]">
                                    Qty:{' '}
                                    {
                                      quantity
                                    }
                                  </span>

                                  <span className="font-medium">
                                    {formatPrice(
                                      Number(
                                        item.totalPrice ||
                                          item.unitPrice ||
                                          0,
                                      ) *
                                        quantity,
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        },
                      )}
                    </div>

                    <div className="hidden bg-[#dddddd] lg:block" />

                    <div className="space-y-7">
                      <div className="flex items-center justify-between gap-6 text-[16px]">
                        <span className="text-[#666666]">
                          Subtotal
                        </span>

                        <span className="font-medium">
                          {formatPrice(
                            completedOrder.subtotal,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-6 text-[16px]">
                        <span className="text-[#666666]">
                          Customization Total
                        </span>

                        <span className="font-medium">
                          {formatPrice(
                            completedOrder.customizationTotal,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-6 text-[16px]">
                        <span className="text-[#666666]">
                          Delivery Fee
                        </span>

                        <span className="font-medium">
                          {formatPrice(
                            completedOrder.deliveryFee,
                          )}
                        </span>
                      </div>

                      <div className="border-t border-[#dddddd] pt-7">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-[18px] font-bold">
                            Total
                          </span>

                          <span className="text-[19px] font-bold text-[#ff5a00]">
                            {formatPrice(
                              completedOrder.total,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                <button
                  type="button"
                  onClick={
                    finishDemoOrder
                  }
                  className="flex h-[58px] items-center justify-center rounded-[9px] bg-[#ff5a00] text-[17px] font-medium text-white transition hover:bg-[#e95000]"
                >
                  Continue Shopping
                </button>

                <button
                  type="button"
                  onClick={
                    viewOrderHistory
                  }
                  className="flex h-[58px] items-center justify-center rounded-[9px] border border-[#d5d5d5] text-[17px] font-medium text-black transition hover:bg-black hover:text-white"
                >
                  View Order History
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  )
}