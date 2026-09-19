import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useUser } from '@clerk/react'
import {
  FiSearch,
  FiShoppingCart,
  FiArrowLeft,
  FiArrowRight,
} from 'react-icons/fi'

import { products } from '../data/products'

const profilePlaceholder = '/assets/profile-placeholder.jpeg'

const colors = [
  { id: 'orange', name: 'Orange', value: '#ff5a00' },
  { id: 'white', name: 'White', value: '#ffffff' },
  { id: 'black', name: 'Black', value: '#000000' },
  { id: 'red', name: 'Red', value: '#ef1b1b' },
  { id: 'green', name: 'Green', value: '#20e000' },
  { id: 'blue', name: 'Blue', value: '#3f82ee' },
  { id: 'purple', name: 'Purple', value: '#9134e8' },
]

const patterns = [
  {
    id: 'none',
    name: 'No pattern',
    image: '/assets/Customization/none.png',
  },
  {
    id: 'camo',
    name: 'Camouflage',
    image: '/assets/Customization/patterns-camo.png',
  },
  {
    id: 'abstract-white',
    name: 'Abstract White',
    image: '/assets/Customization/patterns-abstract-white.png',
  },
  {
    id: 'abstract-black',
    name: 'Abstract Black',
    image: '/assets/Customization/patterns-abstract-black.png',
  },
  {
    id: 'orange-black',
    name: 'Orange Black',
    image: '/assets/Customization/patterns-abstract-orange.png',
  },
]

const graphics = [
  {
    id: 'none',
    name: 'No graphic',
    image: '/assets/Customization/none.png',
  },
  {
    id: 'lightning',
    name: 'Lightning',
    image: '/assets/Customization/graphics-lightning.png',
  },
  {
    id: 'star',
    name: 'Star',
    image: '/assets/Customization/graphics-star.png',
  },
  {
    id: 'globe',
    name: 'Globe',
    image: '/assets/Customization/graphics-globe.png',
  },
  {
    id: 'fire',
    name: 'Fire',
    image: '/assets/Customization/graphics-fire.png',
  },
]

const formatPrice = (price) => `N${price.toLocaleString()}`

function NoneIcon() {
  return (
    <span className="relative block h-7 w-7">
      <span className="absolute left-1/2 top-1/2 h-[2px] w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#d1d1d1]" />
      <span className="absolute inset-[3px] rounded-full border-2 border-[#d1d1d1]" />
    </span>
  )
}

function ColorOption({ color, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Select ${color.name}`}
      className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full transition ${
        selected
          ? 'border-2 border-[#ff5a00] ring-1 ring-[#ff5a00] ring-offset-1'
          : 'border-2 border-transparent'
      }`}
    >
      <span
        className="h-[38px] w-[38px] rounded-full border border-black/10"
        style={{ backgroundColor: color.value }}
      />
    </button>
  )
}

function PatternOption({ pattern, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={pattern.name}
      className={`flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-white transition ${
        selected
          ? 'border-2 border-[#ff5a00]'
          : 'border border-[#d8d8d8] hover:border-[#999]'
      }`}
    >
      {pattern.id === 'none' ? (
        <NoneIcon />
      ) : (
        <img
          src={pattern.image}
          alt={pattern.name}
          className="h-full w-full object-cover"
        />
      )}
    </button>
  )
}

function GraphicOption({ graphic, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={graphic.name}
      className={`flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-white transition ${
        selected
          ? 'border-2 border-[#ff5a00]'
          : 'border border-[#d8d8d8] hover:border-[#999]'
      }`}
    >
      {graphic.id === 'none' ? (
        <NoneIcon />
      ) : (
        <img
          src={graphic.image}
          alt={graphic.name}
          className="h-[34px] w-[34px] object-contain"
        />
      )}
    </button>
  )
}

export default function ProductCustomization() {
  const { productId } = useParams()
  const { isSignedIn, user } = useUser()

  const [customText, setCustomText] = useState('')
  const [selectedColor, setSelectedColor] = useState('orange')
  const [selectedPattern, setSelectedPattern] = useState('none')
  const [selectedGraphic, setSelectedGraphic] = useState('none')

  const product = useMemo(() => {
    return products.find(
      (item) => String(item.id) === String(productId),
    )
  }, [productId])

  const namePrice = customText.trim() ? 1000 : 0

  // A colour is mandatory, so this is always charged.
  const colorPrice = 2000

  const patternPrice =
    selectedPattern !== 'none' ? 2500 : 0

  const graphicPrice =
    selectedGraphic !== 'none' ? 2500 : 0

  const totalPrice =
    (product?.price || 0) +
    namePrice +
    colorPrice +
    patternPrice +
    graphicPrice

  const handleAddToCart = () => {
    if (!product) return

    const cartItem = {
      cartId: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,

      customization: {
        text: customText.trim(),
        color: selectedColor,
        pattern: selectedPattern,
        graphic: selectedGraphic,
      },

      customizationPrices: {
        nameText: namePrice,
        color: colorPrice,
        pattern: patternPrice,
        graphic: graphicPrice,
      },

      totalPrice,
      quantity: 1,
    }

    const existingCart = JSON.parse(
      localStorage.getItem('tailorit-cart') || '[]',
    )

    const updatedCart = [...existingCart, cartItem]

    localStorage.setItem(
      'tailorit-cart',
      JSON.stringify(updatedCart),
    )

    if (!isSignedIn) {
      localStorage.setItem(
        'tailorit-pending-cart',
        JSON.stringify(cartItem),
      )

      window.location.href = '/sign-in'
      return
    }

    window.location.href = '/cart'
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white text-black">
        <header className="sticky top-0 z-50 border-b border-[#dddddd] bg-white">
          <nav className="mx-auto flex h-[86px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
            <Link to="/" className="shrink-0">
              <img
                src="/assets/TailorIt_Logo.png"
                alt="TailorIt"
                className="h-[58px] w-[58px] object-contain"
              />
            </Link>

            <div className="hidden items-center gap-10 text-[16px] md:flex">
              <Link
                to="/"
                className="transition hover:text-[#ff5a00]"
              >
                Home
              </Link>

              <Link
                to="/catalog"
                className="font-semibold text-[#ff5a00]"
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

            <div className="flex items-center gap-5">
              <Link
                to="/sign-in"
                className="hidden border border-black bg-[#ff5a00] px-9 py-3 text-sm font-semibold text-white shadow-[3px_3px_0_#000] sm:block"
              >
                SIGN IN
              </Link>

              <button
                type="button"
                aria-label="Search"
              >
                <FiSearch className="h-6 w-6" />
              </button>

              <Link
                to="/cart"
                aria-label="Shopping cart"
              >
                <FiShoppingCart className="h-6 w-6" />
              </Link>
            </div>
          </nav>
        </header>

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              Product not found
            </h1>

            <Link
              to="/catalog"
              className="mt-6 inline-flex items-center gap-2 bg-[#ff5a00] px-6 py-3 font-semibold text-white"
            >
              <FiArrowLeft />
              Back to catalog
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* NAVBAR */}
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
              className="font-semibold text-[#ff5a00]"
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

          <div className="flex items-center gap-4 sm:gap-6">
            {isSignedIn ? (
              <Link
                to="/profile"
                className="flex h-10 w-10 overflow-hidden rounded-full bg-[#20ed00]"
              >
                <img
                  src={user?.imageUrl || profilePlaceholder}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </Link>
            ) : (
              <Link
                to="/sign-in"
                className="hidden border border-black bg-[#ff5a00] px-9 py-3 text-sm font-semibold text-white shadow-[3px_3px_0_#000] transition duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none sm:block"
              >
                SIGN IN
              </Link>
            )}

            <button
              type="button"
              aria-label="Search"
              className="transition hover:text-[#ff5a00]"
            >
              <FiSearch className="h-6 w-6" />
            </button>

            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="transition hover:text-[#ff5a00]"
            >
              <FiShoppingCart className="h-6 w-6" />
            </Link>
          </div>
        </nav>
      </header>

      {/* MAIN PRODUCT CUSTOMIZATION AREA */}
      <section className="mx-auto grid w-full max-w-[1450px] grid-cols-1 items-start gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_500px] lg:gap-7 lg:px-10 xl:grid-cols-[minmax(0,1fr)_500px] xl:px-12">
        {/* LEFT */}
        <div className="min-w-0">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-[15px] transition hover:text-[#ff5a00]"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>

          <div className="mt-8">
            <h1 className="text-[34px] font-bold tracking-[-1.5px] sm:text-[40px]">
              {product.name}
            </h1>

            <p className="mt-1 text-[16px]">
              Customize your design
            </p>
          </div>

          {/* PRODUCT IMAGE */}
          <div className="mt-7 flex h-[580px] w-full items-center justify-center overflow-hidden bg-[#f7f7f7]">
            <img
              src={product.image}
              alt={product.name}
              className="h-[108%] w-[108%] object-contain"
            />
          </div>
        </div>

        {/* RIGHT CUSTOMIZATION PANEL */}
        <aside className="w-full rounded-[10px] border border-[#d7d7d7] bg-white p-5 lg:p-5 xl:p-6">
          <h2 className="text-[23px] font-bold tracking-[-0.6px]">
            Customization Options
          </h2>

          {/* NAME */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-[15px] font-medium">
              <span>1. Name/Text</span>
              <span>+N1,000</span>
            </div>

            <div className="relative mt-3">
              <input
                type="text"
                value={customText}
                maxLength={52}
                onChange={(event) =>
                  setCustomText(event.target.value)
                }
                placeholder="Enter your preferred write up"
                className="h-[44px] w-full rounded-[7px] border border-[#d9d9d9] bg-white px-3 pr-12 text-[13px] outline-none transition placeholder:text-[#cfcfcf] focus:border-[#ff5a00]"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#d0d0d0]">
                {customText.length}/52
              </span>
            </div>
          </div>

          {/* COLOURS */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-[15px] font-medium">
              <span>2. Colours</span>
              <span>+N2,000</span>
            </div>

            <p className="mt-2 text-[12px] text-[#555]">
              Choose main colour
            </p>

            <div className="mt-1 flex items-center justify-between">
              {colors.map((color) => (
                <ColorOption
                  key={color.id}
                  color={color}
                  selected={selectedColor === color.id}
                  onClick={() =>
                    setSelectedColor(color.id)
                  }
                />
              ))}
            </div>
          </div>

          {/* PATTERNS */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[15px] font-medium">
              <span>3. Patterns</span>
              <span>+N2,500</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              {patterns.map((pattern) => (
                <PatternOption
                  key={pattern.id}
                  pattern={pattern}
                  selected={selectedPattern === pattern.id}
                  onClick={() =>
                    setSelectedPattern(pattern.id)
                  }
                />
              ))}
            </div>
          </div>

          {/* GRAPHICS */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[15px] font-medium">
              <span>4. Graphics</span>
              <span>+N2,500</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              {graphics.map((graphic) => (
                <GraphicOption
                  key={graphic.id}
                  graphic={graphic}
                  selected={selectedGraphic === graphic.id}
                  onClick={() =>
                    setSelectedGraphic(graphic.id)
                  }
                />
              ))}
            </div>
          </div>

          {/* PRICE BREAKDOWN */}
          <div className="mt-4 border-t border-[#dedede] pt-3">
            <div className="space-y-[3px] text-[14px]">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span>{formatPrice(product.price)}</span>
              </div>

              <div className="flex justify-between">
                <span>Name/Text</span>
                <span>
                  {namePrice > 0
                    ? formatPrice(namePrice)
                    : 'N0'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Colours</span>
                <span>{formatPrice(colorPrice)}</span>
              </div>

              <div className="flex justify-between">
                <span>Patterns</span>
                <span>
                  {patternPrice > 0
                    ? formatPrice(patternPrice)
                    : 'N0'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Graphics</span>
                <span>
                  {graphicPrice > 0
                    ? formatPrice(graphicPrice)
                    : 'N0'}
                </span>
              </div>
            </div>
          </div>

          {/* TOTAL + BUTTON */}
          <div className="mt-4 border-t border-[#dedede] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[19px] font-bold">
                Total
              </span>

              <span className="text-[19px] font-bold text-[#ff5a00]">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-3 flex h-[48px] w-full items-center justify-center gap-4 rounded-[7px] bg-[#ff5a00] text-[16px] font-semibold text-white transition hover:scale-[0.99]"
            >
              <span>Add to cart</span>
              <FiArrowRight className="h-5 w-5" />
            </button>
          </div>
        </aside>
      </section>
    </main>
  )
}