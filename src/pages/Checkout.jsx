import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useUser } from '@clerk/react'
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

const getEstimatedDelivery = () => {
  const startDate = new Date()
  const endDate = new Date()

  startDate.setDate(startDate.getDate() + 7)
  endDate.setDate(endDate.getDate() + 10)

  const start = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const end = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return `${start} - ${end}`
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [checkoutItems] = useState(getCheckoutItems)

  const [shippingAddress, setShippingAddress] =
    useState(getSavedAddress)

  const [showAddressModal, setShowAddressModal] =
    useState(false)

  const [showDemoPayment, setShowDemoPayment] =
    useState(false)

  const [paymentProcessing, setPaymentProcessing] =
    useState(false)

  const [showSuccessModal, setShowSuccessModal] =
    useState(false)

  const [completedOrder, setCompletedOrder] =
    useState(null)

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
      const quantity = Number(item.quantity || 1)

      const customizationPrice =
        Number(item.totalPrice || 0) -
        Number(item.basePrice || 0)

      return (
        sum +
        Math.max(customizationPrice, 0) * quantity
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
      fullName: shippingAddress?.fullName || '',
      phone: shippingAddress?.phone || '',
      street: shippingAddress?.street || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      country: shippingAddress?.country || 'Nigeria',
    })

    setShowAddressModal(true)
  }

  const saveAddress = (event) => {
    event.preventDefault()

    const cleanedAddress = {
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      street: addressForm.street.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      country: addressForm.country.trim(),
    }

    const hasEmptyField = Object.values(
      cleanedAddress,
    ).some((value) => !value)

    if (hasEmptyField) {
      return
    }

    setShippingAddress(cleanedAddress)

    localStorage.setItem(
      'tailorit-shipping-address',
      JSON.stringify(cleanedAddress),
    )

    setShowAddressModal(false)
  }

  const startCheckout = () => {
    if (!shippingAddress) {
      openAddressModal()
      return
    }

    if (checkoutItems.length === 0) {
      return
    }

    setShowDemoPayment(true)
  }

  const completeDemoPayment = () => {
    setPaymentProcessing(true)

    window.setTimeout(() => {
      const now = new Date()

      const demoReference = `TAILORIT-DEMO-${Date.now()}`

      const orderNumber = `TT-${Date.now()
        .toString()
        .slice(-8)}`

      const firstName =
        user?.firstName ||
        shippingAddress?.fullName?.split(' ')[0] ||
        'Customer'

      const orderDate = formatOrderDate(now)

      const estimatedDelivery =
        getEstimatedDelivery()

      const completedOrderData = {
        orderNumber,
        orderDate,
        estimatedDelivery,
        firstName,
        items: checkoutItems,
        subtotal: baseSubtotal,
        customizationTotal,
        deliveryFee,
        total: finalTotal,
        paymentReference: demoReference,
        shippingAddress,
      }

      sessionStorage.setItem(
        'tailorit-demo-payment',
        JSON.stringify({
          reference: demoReference,
          amount: finalTotal,
          status: 'success',
          createdAt: now.toISOString(),
        }),
      )

      /*
       * Remove only the products that were checked out.
       * Any products that were left unselected in the Cart
       * remain in localStorage.
       */
      try {
        const savedCart = JSON.parse(
          localStorage.getItem('tailorit-cart') || '[]',
        )

        const purchasedIds = checkoutItems.map(
          (item) => item.cartId,
        )

        const remainingCart = Array.isArray(savedCart)
          ? savedCart.filter(
              (item) =>
                !purchasedIds.includes(item.cartId),
            )
          : []

        localStorage.setItem(
          'tailorit-cart',
          JSON.stringify(remainingCart),
        )
      } catch (error) {
        console.error(
          'Failed to update cart after checkout:',
          error,
        )
      }

      /*
       * Save the completed order locally for now.
       * This can later be replaced with Firestore
       * when we build the real order backend.
       */
      try {
        const existingOrders = JSON.parse(
          localStorage.getItem('tailorit-orders') || '[]',
        )

        const orders = Array.isArray(existingOrders)
          ? existingOrders
          : []

        localStorage.setItem(
          'tailorit-orders',
          JSON.stringify([
            completedOrderData,
            ...orders,
          ]),
        )
      } catch (error) {
        console.error(
          'Failed to save order history:',
          error,
        )
      }

      setPaymentProcessing(false)
      setShowDemoPayment(false)
      setCompletedOrder(completedOrderData)
      setShowSuccessModal(true)
    }, 1200)
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
        {/* PAGE TITLE */}
        <h1 className="mb-12 text-[40px] font-bold tracking-[-1px]">
          Checkout
        </h1>

        {/* ORDER SUMMARY */}
        <section className="rounded-[10px] border border-[#d8d8d8] p-6">
          <h2 className="mb-5 text-[20px] font-bold">
            Order Summary
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
            {/* PRODUCTS */}
            <div className="space-y-7 lg:pr-10">
              {checkoutItems.map((item) => {
                const quantity = Number(
                  item.quantity || 1,
                )

                const isCustom =
                  item.customization?.text ||
                  item.customization?.pattern !==
                    'none' ||
                  item.customization?.graphic !==
                    'none'

                return (
                  <div
                    key={item.cartId}
                    className="flex items-center gap-7"
                  >
                    <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#eeeeee]">
                      <img
                        src={item.image}
                        alt={item.name}
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
                        Qty: {quantity}
                      </p>
                    </div>

                    <p className="whitespace-nowrap text-[20px] font-semibold">
                      {formatPrice(
                        Number(item.totalPrice || 0) *
                          quantity,
                      )}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* TOTAL BREAKDOWN */}
            <div className="mt-8 border-t border-[#dddddd] pt-8 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-8">
              <div className="space-y-7 text-[17px] text-gray-600">
                <div className="flex justify-between gap-5">
                  <span>Subtotal</span>

                  <span>
                    {formatPrice(baseSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span>Customization Total</span>

                  <span>
                    {formatPrice(
                      customizationTotal,
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span>Delivery Fee</span>

                  <span>
                    {formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="my-7 border-t border-[#dddddd]" />

              <div className="flex items-center justify-between">
                <span className="text-[18px] font-bold">
                  Total
                </span>

                <span className="text-[20px] font-semibold text-[#ff5a00]">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PAYMENT + SHIPPING */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* PAYMENT METHOD */}
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

          {/* SHIPPING ADDRESS */}
          <section className="rounded-[10px] border border-[#d8d8d8] p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[26px] font-semibold">
                Shipping Address
              </h2>

              <button
                type="button"
                onClick={openAddressModal}
                aria-label="Add shipping address"
                className="text-[#ff5a00]"
              >
                <FiPlus className="h-7 w-7" />
              </button>
            </div>

            {shippingAddress ? (
              <button
                type="button"
                onClick={openAddressModal}
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
                      {shippingAddress.street},{' '}
                      {shippingAddress.city},{' '}
                      {shippingAddress.state},{' '}
                      {shippingAddress.country}
                    </p>
                  </div>
                </div>

                <FiChevronRight className="h-7 w-7 shrink-0 text-[#ff5a00]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={openAddressModal}
                className="flex min-h-[105px] w-full items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#bdbdbd] text-gray-500 transition hover:border-[#ff5a00] hover:text-[#ff5a00]"
              >
                <FiPlus />
                Add shipping address
              </button>
            )}
          </section>
        </div>

        {/* BOTTOM BUTTONS */}
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
            onClick={startCheckout}
            className="flex h-[66px] items-center justify-center gap-8 rounded-[10px] bg-[#ff5a00] text-[19px] font-semibold text-white transition hover:bg-[#e95000]"
          >
            Checkout With Paystack
            <FiArrowRight className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* SHIPPING ADDRESS MODAL */}
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
                  setShowAddressModal(false)
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
                  value={addressForm.fullName}
                  onChange={handleAddressChange}
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
                  value={addressForm.phone}
                  onChange={handleAddressChange}
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
                  value={addressForm.street}
                  onChange={handleAddressChange}
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
                    value={addressForm.city}
                    onChange={handleAddressChange}
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
                    value={addressForm.state}
                    onChange={handleAddressChange}
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
                  value={addressForm.country}
                  onChange={handleAddressChange}
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

      {/* DEMO PAYSTACK PAYMENT MODAL */}
      {showDemoPayment && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-5">
          <div className="w-full max-w-[480px] rounded-[16px] bg-white p-7 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <img
                  src="/assets/paystack.png"
                  alt="Paystack"
                  className="h-[34px] w-auto object-contain"
                />

                <h2 className="mt-4 text-[27px] font-bold">
                  Complete Payment
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDemoPayment(false)
                }
                disabled={paymentProcessing}
                aria-label="Close payment"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="my-7 rounded-[10px] bg-[#f7f7f7] p-5">
              <p className="text-sm text-gray-500">
                Amount
              </p>

              <p className="mt-1 text-[30px] font-bold">
                {formatPrice(finalTotal)}
              </p>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                This is a TailorIt frontend demo.
                No real payment will be charged.
              </p>
            </div>

            <button
              type="button"
              onClick={completeDemoPayment}
              disabled={paymentProcessing}
              className="h-[56px] w-full rounded-[8px] bg-[#00a8d6] font-semibold text-white disabled:cursor-wait disabled:opacity-60"
            >
              {paymentProcessing
                ? 'Processing...'
                : `Pay ${formatPrice(finalTotal)}`}
            </button>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS MODAL */}
      {showSuccessModal && completedOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-6 sm:px-6">
          <div className="max-h-[94vh] w-full max-w-[1250px] overflow-y-auto rounded-[4px] bg-white px-6 py-8 shadow-2xl sm:px-8 lg:px-12 lg:py-10">
            {/* SUCCESS HEADER */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/assets/green-checkmark.png"
                alt="Order successful"
                className="h-[86px] w-[86px] object-contain"
              />

              <h1 className="mt-7 text-[34px] font-bold tracking-[-1.5px] sm:text-[38px]">
                Thank you,{' '}
                <span className="text-[#ff5a00]">
                  {completedOrder.firstName}!
                </span>
              </h1>

              <p className="mt-3 text-[17px] text-[#666666] sm:text-[18px]">
                Your order has been placed successfully.
              </p>
            </div>

            {/* ORDER INFORMATION */}
            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[430px_minmax(0,1fr)]">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* ORDER DETAILS */}
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
                        {completedOrder.orderNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-5">
                      <span className="text-[#666666]">
                        Order Date
                      </span>

                      <span className="font-medium text-[#555555]">
                        {completedOrder.orderDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ESTIMATED DELIVERY */}
                <div className="rounded-[9px] border border-[#d9d9d9] p-6">
                  <h2 className="text-[19px] font-bold">
                    Estimated Delivery
                  </h2>

                  <p className="mt-6 text-[17px] font-medium">
                    {completedOrder.estimatedDelivery}
                  </p>

                  <p className="mt-3 text-[16px] leading-[1.4] text-[#666666]">
                    Tracking information will be
                    available once shipped.
                  </p>
                </div>
              </div>

              {/* ORDER SUMMARY */}
              <div className="rounded-[9px] border border-[#d9d9d9] p-6">
                <h2 className="text-[19px] font-bold">
                  Order Summary
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_1px_300px]">
                  {/* PRODUCTS */}
                  <div className="space-y-5">
                    {completedOrder.items.map(
                      (item) => {
                        const quantity = Number(
                          item.quantity || 1,
                        )

                        const isCustom =
                          item.customization?.text ||
                          item.customization?.pattern !==
                            'none' ||
                          item.customization?.graphic !==
                            'none'

                        return (
                          <div
                            key={item.cartId}
                            className="flex gap-4"
                          >
                            <div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#eeeeee]">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[16px] font-medium">
                                {item.name}{' '}
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
                                  Qty: {quantity}
                                </span>

                                <span className="font-medium">
                                  {formatPrice(
                                    Number(
                                      item.totalPrice ||
                                        0,
                                    ) * quantity,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      },
                    )}
                  </div>

                  {/* VERTICAL DIVIDER */}
                  <div className="hidden bg-[#dddddd] lg:block" />

                  {/* TOTALS */}
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

            {/* ACTION BUTTONS */}
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              <button
                type="button"
                onClick={finishDemoOrder}
                className="flex h-[58px] items-center justify-center rounded-[9px] bg-[#ff5a00] text-[17px] font-medium text-white transition hover:bg-[#e95000]"
              >
                Continue Shopping
              </button>

              <button
                type="button"
                onClick={viewOrderHistory}
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