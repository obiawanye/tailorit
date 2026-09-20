import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  FiSearch,
  FiShoppingCart,
  FiTrash2,
  FiMinus,
  FiPlus,
} from 'react-icons/fi'
import ProfileMenu from '../components/ProfileMenu'

const DELIVERY_FEE = 5000

const colorNames = {
  orange: 'Orange',
  white: 'White',
  black: 'Black',
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
  purple: 'Purple',
}

const patternNames = {
  none: 'No Pattern',
  camo: 'Camouflage',
  'abstract-white': 'Abstract',
  'abstract-black': 'Abstract',
  'abstract-orange': 'Abstract',
  'orange-black': 'Abstract',
}

const graphicNames = {
  none: 'No Graphic',
  lightning: 'Lightning',
  star: 'Star',
  globe: 'Globe',
  fire: 'Flame',
}

const formatPrice = (price) =>
  `N${Number(price || 0).toLocaleString()}`

/*
|--------------------------------------------------------------------------
| TEMPORARY CART STORAGE
|--------------------------------------------------------------------------
|
| For now the cart uses localStorage.
|
| Later:
| localStorage → Firestore
|
|--------------------------------------------------------------------------
*/

const getSavedCart = () => {
  try {
    const savedCart = JSON.parse(
      localStorage.getItem('tailorit-cart') || '[]',
    )

    return Array.isArray(savedCart) ? savedCart : []
  } catch (error) {
    console.error('Failed to load cart:', error)
    return []
  }
}

export default function Cart() {
  const navigate = useNavigate()

  const [cart, setCart] = useState(getSavedCart)

  /*
   * IDs of items currently selected for checkout.
   */
  const [selectedItems, setSelectedItems] = useState(() => {
    const savedCart = getSavedCart()

    return savedCart.map((item) => item.cartId)
  })

  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState('')

  /*
  |--------------------------------------------------------------------------
  | CART
  |--------------------------------------------------------------------------
  */

  const updateCart = (updatedCart) => {
    setCart(updatedCart)

    localStorage.setItem(
      'tailorit-cart',
      JSON.stringify(updatedCart),
    )
  }

  /*
  |--------------------------------------------------------------------------
  | SELECTION
  |--------------------------------------------------------------------------
  */

  const toggleItemSelection = (cartId) => {
    setSelectedItems((currentSelected) => {
      if (currentSelected.includes(cartId)) {
        return currentSelected.filter(
          (id) => id !== cartId,
        )
      }

      return [...currentSelected, cartId]
    })
  }

  const selectAllItems = () => {
    setSelectedItems(
      cart.map((item) => item.cartId),
    )
  }

  const deselectAllItems = () => {
    setSelectedItems([])
  }

  /*
  |--------------------------------------------------------------------------
  | QUANTITY
  |--------------------------------------------------------------------------
  */

  const increaseQuantity = (cartId) => {
    const updatedCart = cart.map((item) => {
      if (item.cartId !== cartId) {
        return item
      }

      return {
        ...item,
        quantity: Number(item.quantity || 1) + 1,
      }
    })

    updateCart(updatedCart)
  }

  const decreaseQuantity = (cartId) => {
    const updatedCart = cart
      .map((item) => {
        if (item.cartId !== cartId) {
          return item
        }

        return {
          ...item,
          quantity: Number(item.quantity || 1) - 1,
        }
      })
      .filter(
        (item) =>
          Number(item.quantity || 0) > 0,
      )

    const remainingIds = updatedCart.map(
      (item) => item.cartId,
    )

    setSelectedItems((currentSelected) =>
      currentSelected.filter((id) =>
        remainingIds.includes(id),
      ),
    )

    updateCart(updatedCart)
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE ITEMS
  |--------------------------------------------------------------------------
  */

  const removeItem = (cartId) => {
    const updatedCart = cart.filter(
      (item) => item.cartId !== cartId,
    )

    setSelectedItems((currentSelected) =>
      currentSelected.filter((id) => id !== cartId),
    )

    updateCart(updatedCart)
  }

  const deleteAll = () => {
    updateCart([])
    setSelectedItems([])
  }

  /*
  |--------------------------------------------------------------------------
  | SELECTED ITEMS
  |--------------------------------------------------------------------------
  */

  const selectedCartItems = cart.filter((item) =>
    selectedItems.includes(item.cartId),
  )

  const totalItems = cart.reduce((sum, item) => {
    return sum + Number(item.quantity || 1)
  }, 0)

  const selectedItemCount = selectedCartItems.reduce(
    (sum, item) => {
      return sum + Number(item.quantity || 1)
    },
    0,
  )

  const subtotal = selectedCartItems.reduce(
    (sum, item) => {
      return (
        sum +
        Number(item.totalPrice || 0) *
          Number(item.quantity || 1)
      )
    },
    0,
  )

  const deliveryFee =
    selectedCartItems.length > 0
      ? DELIVERY_FEE
      : 0

  const finalPayment = subtotal + deliveryFee

  const allSelected =
    cart.length > 0 &&
    selectedItems.length === cart.length

  /*
  |--------------------------------------------------------------------------
  | PROMO CODE
  |--------------------------------------------------------------------------
  */

  const applyPromoCode = () => {
    const code = promoCode.trim()

    if (!code) {
      setPromoMessage('Enter a promo code.')
      return
    }

    setPromoMessage('Promo code applied.')
  }

  /*
  |--------------------------------------------------------------------------
  | CHECKOUT
  |--------------------------------------------------------------------------
  */

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      return
    }

    /*
     * Store ONLY the selected items.
     *
     * The complete cart remains in localStorage.
     *
     * sessionStorage is temporary and lasts for the
     * current browser session.
     */
    sessionStorage.setItem(
      'tailorit-checkout-items',
      JSON.stringify(selectedCartItems),
    )

    /*
     * Store the checkout totals too so the checkout
     * page can immediately display them.
     */
    sessionStorage.setItem(
      'tailorit-checkout-summary',
      JSON.stringify({
        subtotal,
        deliveryFee,
        finalPayment,
        totalItems: selectedItemCount,
        promoCode: promoCode.trim(),
      }),
    )

    navigate('/checkout')
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* NAVBAR */}

      <header className="border-b border-[#eeeeee] bg-white">
        <nav className="mx-auto flex h-[92px] w-full items-center justify-between px-8 lg:px-12">
          <Link
            to="/"
            className="shrink-0"
          >
            <img
              src="/assets/TailorIt_Logo.png"
              alt="TailorIt"
              className="h-[58px] w-[68px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-10 text-[16px]">
            <Link
              to="/"
              className="transition hover:text-[#ff5a00]"
            >
              Home
            </Link>

            <Link
              to="/catalog"
              className="transition hover:text-[#ff5a00]"
            >
              Catalog
            </Link>

            <Link
              to="/my-orders"
              className="transition hover:text-[#ff5a00]"
            >
              My Orders
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <ProfileMenu />

            <button
              type="button"
              aria-label="Search"
              className="transition hover:text-[#ff5a00]"
            >
              <FiSearch className="h-[24px] w-[24px]" />
            </button>

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative text-[#ff5a00]"
            >
              <FiShoppingCart className="h-[25px] w-[25px]" />

              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff5a00] px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </header>

      {/* CONTENT */}

      <section className="mx-auto w-full max-w-[1500px] px-8 py-12 lg:px-10">
        {cart.length === 0 ? (
          <div className="flex min-h-[650px] flex-col items-center justify-center">
            <h1 className="text-[42px] font-bold tracking-[-1.5px]">
              Your Cart
            </h1>

            <p className="mt-3 text-gray-500">
              Your cart is currently empty.
            </p>

            <Link
              to="/catalog"
              className="mt-8 bg-[#ff5a00] px-10 py-4 font-semibold text-white transition hover:scale-[0.98]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_465px]">
            {/* LEFT SIDE */}

            <div>
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={
                      allSelected
                        ? deselectAllItems
                        : selectAllItems
                    }
                    aria-label={
                      allSelected
                        ? 'Deselect all items'
                        : 'Select all items'
                    }
                    className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border ${
                      allSelected
                        ? 'border-[#ff5a00] bg-[#ff5a00]'
                        : 'border-black bg-white'
                    }`}
                  >
                    {allSelected && (
                      <span className="text-[18px] font-bold text-white">
                        ✓
                      </span>
                    )}
                  </button>

                  <h1 className="text-[40px] font-bold tracking-[-1.5px]">
                    Your Cart
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={deleteAll}
                  className="flex items-center gap-3 text-[17px] text-red-500 transition hover:text-red-700"
                >
                  <FiTrash2 className="h-5 w-5" />
                  Delete All
                </button>
              </div>

              {/* CART ITEMS */}

              <div>
                {cart.map((item, index) => {
                  const isSelected =
                    selectedItems.includes(
                      item.cartId,
                    )

                  const isTailored =
                    item.customization?.text ||
                    item.customization
                      ?.pattern !== 'none' ||
                    item.customization
                      ?.graphic !== 'none'

                  return (
                    <article
                      key={item.cartId}
                      className={`py-5 ${
                        index !== cart.length - 1
                          ? 'border-b border-dashed border-[#cfcfcf]'
                          : ''
                      }`}
                    >
                      <div className="flex gap-6">
                        {/* SELECTION */}

                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() =>
                              toggleItemSelection(
                                item.cartId,
                              )
                            }
                            aria-label={
                              isSelected
                                ? `Deselect ${item.name}`
                                : `Select ${item.name}`
                            }
                            className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border ${
                              isSelected
                                ? 'border-[#ff5a00] bg-[#ff5a00]'
                                : 'border-black bg-white'
                            }`}
                          >
                            {isSelected && (
                              <span className="text-[18px] font-bold text-white">
                                ✓
                              </span>
                            )}
                          </button>
                        </div>

                        {/* IMAGE */}

                        <div className="flex h-[170px] w-[170px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#eeeeee]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        {/* DETAILS */}

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-6">
                            <div>
                              <span
                                className={`inline-flex rounded-full border px-4 py-2 text-[14px] font-semibold ${
                                  isTailored
                                    ? 'border-[#ff5a00] text-[#ff5a00]'
                                    : 'border-[#999999] text-[#555555]'
                                }`}
                              >
                                {isTailored
                                  ? 'Tailored'
                                  : 'Plain'}
                              </span>

                              <h2 className="mt-4 text-[27px] font-bold tracking-[-0.7px]">
                                {item.name}
                              </h2>
                            </div>

                            <p className="whitespace-nowrap text-[27px] font-semibold">
                              {formatPrice(
                                item.totalPrice,
                              )}
                            </p>
                          </div>

                          <div className="mt-3 space-y-1 text-[17px]">
                            <p>
                              <span className="font-semibold">
                                Color:
                              </span>{' '}
                              {colorNames[
                                item.customization
                                  ?.color
                              ] ||
                                item.customization
                                  ?.color ||
                                'Orange'}
                            </p>

                            {item.customization
                              ?.text && (
                              <p>
                                <span className="font-semibold">
                                  Name:
                                </span>{' '}
                                {
                                  item
                                    .customization
                                    .text
                                }
                              </p>
                            )}

                            {item.customization
                              ?.pattern &&
                              item.customization
                                .pattern !==
                                'none' && (
                                <p>
                                  <span className="font-semibold">
                                    Pattern:
                                  </span>{' '}
                                  {patternNames[
                                    item
                                      .customization
                                      .pattern
                                  ] ||
                                    item
                                      .customization
                                      .pattern}
                                </p>
                              )}

                            {item.customization
                              ?.graphic &&
                              item.customization
                                .graphic !==
                                'none' && (
                                <p>
                                  <span className="font-semibold">
                                    Graphic:
                                  </span>{' '}
                                  {graphicNames[
                                    item
                                      .customization
                                      .graphic
                                  ] ||
                                    item
                                      .customization
                                      .graphic}
                                </p>
                              )}
                          </div>

                          <div className="mt-auto flex items-end justify-between pt-5">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    item.cartId,
                                  )
                                }
                                aria-label="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#cccccc] transition hover:bg-gray-100"
                              >
                                <FiMinus className="h-3.5 w-3.5" />
                              </button>

                              <span className="min-w-[20px] text-center text-[16px]">
                                {String(
                                  item.quantity ||
                                    1,
                                ).padStart(2, '0')}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    item.cartId,
                                  )
                                }
                                aria-label="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#cccccc] transition hover:bg-gray-100"
                              >
                                <FiPlus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  item.cartId,
                                )
                              }
                              aria-label={`Remove ${item.name}`}
                              className="text-[#888888] transition hover:text-red-500"
                            >
                              <FiTrash2 className="h-[20px] w-[20px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>

            {/* SUMMARY */}

            <aside>
              <h2 className="mb-8 text-[40px] font-bold tracking-[-1.5px]">
                Summary
              </h2>

              <div className="rounded-[12px] border border-[#d8d8d8] p-6">
                <div className="flex items-center justify-between text-[18px]">
                  <span className="font-semibold">
                    Total Items
                  </span>

                  <span className="font-semibold">
                    {selectedItemCount}{' '}
                    {selectedItemCount === 1
                      ? 'Item'
                      : 'Items'}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between text-[18px]">
                  <span className="font-semibold">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between text-[18px]">
                  <span className="font-semibold">
                    Delivery Fee
                  </span>

                  <span className="font-semibold">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>

                <div className="my-6 border-t border-dashed border-[#bdbdbd]" />

                <div className="flex items-center justify-between">
                  <span className="text-[26px] font-bold">
                    Final Payment
                  </span>

                  <span className="text-[28px] font-bold text-[#ff5a00]">
                    {formatPrice(finalPayment)}
                  </span>
                </div>

                <div className="mt-7 flex h-[58px] overflow-hidden rounded-[12px] border-2 border-[#d8d8d8]">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(
                        event.target.value,
                      )
                      setPromoMessage('')
                    }}
                    placeholder="Enter Promo Code"
                    className="min-w-0 flex-1 px-4 text-[17px] outline-none"
                  />

                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className="m-1 w-[82px] rounded-[11px] bg-[#ff5a00] text-[17px] font-medium text-white transition hover:bg-[#e95000]"
                  >
                    APPLY
                  </button>
                </div>

                {promoMessage && (
                  <p className="mt-2 text-sm text-gray-500">
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={
                  selectedCartItems.length ===
                  0
                }
                className="mt-5 h-[60px] w-full rounded-[11px] bg-[#ff5a00] text-[20px] font-semibold text-white transition hover:bg-[#e95000] disabled:cursor-not-allowed disabled:bg-[#cccccc]"
              >
                CHECKOUT
              </button>

              {/* CONTINUE SHOPPING */}

              <Link
                to="/catalog"
                className="mt-4 flex h-[60px] w-full items-center justify-center rounded-[11px] border border-black text-[20px] font-medium transition hover:bg-black hover:text-white"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}