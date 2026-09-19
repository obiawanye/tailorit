import { useState } from 'react'
import { Link } from 'react-router'
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi'

const formatPrice = (price) => `N${Number(price || 0).toLocaleString()}`

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
  none: 'No pattern',
  camo: 'Camouflage',
  'abstract-white': 'Abstract White',
  'abstract-black': 'Abstract Black',
  'orange-black': 'Orange Black',
}

const graphicNames = {
  none: 'No graphic',
  lightning: 'Lightning',
  star: 'Star',
  globe: 'Globe',
  fire: 'Fire',
}

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
  const [cart, setCart] = useState(getSavedCart)

  const updateCart = (updatedCart) => {
    setCart(updatedCart)

    localStorage.setItem(
      'tailorit-cart',
      JSON.stringify(updatedCart),
    )
  }

  const increaseQuantity = (cartId) => {
    const updatedCart = cart.map((item) => {
      if (item.cartId === cartId) {
        return {
          ...item,
          quantity: Number(item.quantity || 1) + 1,
        }
      }

      return item
    })

    updateCart(updatedCart)
  }

  const decreaseQuantity = (cartId) => {
    const updatedCart = cart
      .map((item) => {
        if (item.cartId === cartId) {
          return {
            ...item,
            quantity: Number(item.quantity || 1) - 1,
          }
        }

        return item
      })
      .filter((item) => Number(item.quantity || 0) > 0)

    updateCart(updatedCart)
  }

  const removeItem = (cartId) => {
    const updatedCart = cart.filter(
      (item) => item.cartId !== cartId,
    )

    updateCart(updatedCart)
  }

  const total = cart.reduce((sum, item) => {
    return (
      sum +
      Number(item.totalPrice || 0) *
        Number(item.quantity || 1)
    )
  }, 0)

  const itemCount = cart.reduce((sum, item) => {
    return sum + Number(item.quantity || 1)
  }, 0)

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 border-b border-[#dddddd] bg-white">
        <nav className="mx-auto flex h-[86px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" className="shrink-0">
            <img
              src="/assets/TailorIt_Logo.png"
              alt="TailorIt"
              className="h-[58px] w-[58px] object-contain sm:h-[62px] sm:w-[62px]"
            />
          </Link>

          <div className="hidden items-center gap-10 text-[16px] md:flex lg:gap-12">
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

          <Link
            to="/catalog"
            className="text-sm transition hover:text-[#ff5a00]"
          >
            Continue shopping
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mb-8">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-sm transition hover:text-[#ff5a00]"
          >
            <FiArrowLeft />
            Back to catalog
          </Link>

          <h1 className="mt-6 text-[36px] font-bold tracking-[-1.5px] sm:text-[44px]">
            Your Cart
          </h1>

          <p className="mt-1 text-gray-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center border border-[#dddddd]">
            <h2 className="text-2xl font-bold">
              Your cart is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Find something you like and make it yours.
            </p>

            <Link
              to="/catalog"
              className="mt-6 bg-[#ff5a00] px-8 py-4 font-semibold text-white transition hover:scale-[0.98]"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              {cart.map((item) => (
                <article
                  key={item.cartId}
                  className="border border-[#dddddd] p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="h-[180px] w-full shrink-0 overflow-hidden bg-[#f5f5f5] sm:h-[180px] sm:w-[180px]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {item.name}
                          </h2>

                          <p className="mt-1 text-lg font-medium">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.cartId)}
                          aria-label="Remove item"
                          className="text-gray-500 transition hover:text-red-600"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-5 space-y-1 text-sm text-gray-600">
                        {item.customization?.text && (
                          <p>
                            <span className="font-medium text-black">
                              Name/Text:
                            </span>{' '}
                            {item.customization.text}
                          </p>
                        )}

                        <p>
                          <span className="font-medium text-black">
                            Colour:
                          </span>{' '}
                          {colorNames[
                            item.customization?.color
                          ] ||
                            item.customization?.color ||
                            'Orange'}
                        </p>

                        <p>
                          <span className="font-medium text-black">
                            Pattern:
                          </span>{' '}
                          {patternNames[
                            item.customization?.pattern
                          ] ||
                            item.customization?.pattern ||
                            'No pattern'}
                        </p>

                        <p>
                          <span className="font-medium text-black">
                            Graphic:
                          </span>{' '}
                          {graphicNames[
                            item.customization?.graphic
                          ] ||
                            item.customization?.graphic ||
                            'No graphic'}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-5">
                        <div className="flex items-center border border-[#cccccc]">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item.cartId)
                            }
                            className="flex h-10 w-10 items-center justify-center transition hover:bg-gray-100"
                          >
                            <FiMinus />
                          </button>

                          <span className="flex h-10 w-10 items-center justify-center border-x border-[#cccccc] text-sm font-medium">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item.cartId)
                            }
                            className="flex h-10 w-10 items-center justify-center transition hover:bg-gray-100"
                          >
                            <FiPlus />
                          </button>
                        </div>

                        <p className="font-semibold">
                          {formatPrice(
                            Number(item.totalPrice || 0) *
                              Number(item.quantity || 1),
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit border border-[#dddddd] p-6 lg:sticky lg:top-[110px]">
              <h2 className="text-2xl font-bold">
                Order Summary
              </h2>

              <div className="my-6 h-px bg-[#dddddd]" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="my-6 h-px bg-[#dddddd]" />

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">
                  Total
                </span>

                <span className="text-xl font-bold text-[#ff5a00]">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                type="button"
                className="mt-6 h-[52px] w-full bg-[#ff5a00] font-semibold text-white transition hover:scale-[0.99]"
              >
                Proceed to checkout
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}