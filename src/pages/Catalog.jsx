import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useUser } from '@clerk/react'
import {
  FiSearch,
  FiShoppingCart,
  FiX,
} from 'react-icons/fi'
import ProfileMenu from '../components/ProfileMenu'
import ProductFilters from '../components/ProductFilters'

const products = [
  {
    id: 1,
    name: 'CUSTOM ART LAPTOP SLEEVE',
    price: 800,
    originalPrice: 1100,
    category: 'laptops',
    type: 'customized',
    image: '/assets/Catalog/catalog-laptop.png',
  },
  {
    id: 2,
    name: 'CROSSBODY PHONE CASE',
    price: 800,
    originalPrice: 1100,
    category: 'phone-cases',
    type: 'customized',
    image: '/assets/Catalog/catalog-phone-case.png',
  },
  {
    id: 3,
    name: 'OLIVE CANVAS DUFFEL BAG',
    price: 800,
    originalPrice: 1100,
    category: 'bags',
    type: 'customized',
    image: '/assets/Catalog/catalog-olive-duffel.png',
  },
  {
    id: 4,
    name: 'CLASSIC LOW-TOP SNEAKERS',
    price: 800,
    originalPrice: 1100,
    category: 'shoes',
    type: 'customized',
    image: '/assets/Catalog/catalog-sneaker.png',
  },
  {
    id: 5,
    name: 'TAILORIT EXCLUSIVE TRAVEL BAG',
    price: 900,
    originalPrice: 1100,
    category: 'bags',
    type: 'customized',
    image: '/assets/Catalog/catalog-black-orange-bag.png',
  },
  {
    id: 6,
    name: 'CREASED BLACK EFFECT SHIRT',
    price: 800,
    originalPrice: 1100,
    category: 'shirts',
    type: 'customized',
    image: '/assets/Catalog/catalog-black-shirt.png',
  },
]

const formatPrice = (price) =>
  `N${price.toLocaleString()}`

function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block overflow-hidden border border-black bg-white"
    >
      <div className="aspect-square overflow-hidden bg-[#f5f5f5]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="relative min-h-[96px] bg-black px-3 py-3 pr-20 text-white sm:min-h-[108px] sm:px-4 sm:py-4">
        <h3 className="max-w-[90%] text-[13px] leading-[1.35] sm:text-[15px]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-[20px] sm:text-[21px]">
            {formatPrice(product.price)}
          </span>

          <span className="text-[12px] text-gray-400 line-through sm:text-[13px]">
            {formatPrice(product.originalPrice)}
          </span>
        </div>

        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black transition duration-150 hover:scale-95 sm:right-4 sm:h-14 sm:w-14"
        >
          <span className="text-[28px] font-light leading-none">
            +
          </span>
        </button>
      </div>
    </Link>
  )
}

export default function Catalog() {
  const { isSignedIn } = useUser()

  const [category, setCategory] =
    useState('all')

  const [type, setType] =
    useState('all')

  const [minPrice, setMinPrice] =
    useState(0)

  const [maxPrice, setMaxPrice] =
    useState(300000)

  const [sortBy, setSortBy] =
    useState('popular')

  const [searchQuery, setSearchQuery] =
    useState('')

  const [showSearch, setShowSearch] =
    useState(false)

  const clearFilters = () => {
    setCategory('all')
    setType('all')
    setMinPrice(0)
    setMaxPrice(300000)
    setSortBy('popular')
    setSearchQuery('')
  }

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase(),
          )

      const matchesCategory =
        category === 'all' ||
        product.category === category

      const matchesType =
        type === 'all' ||
        product.type === type

      const matchesPrice =
        product.price >= minPrice &&
        product.price <= maxPrice

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesPrice
      )
    })

    if (sortBy === 'price-low') {
      result = [...result].sort(
        (a, b) => a.price - b.price,
      )
    }

    if (sortBy === 'price-high') {
      result = [...result].sort(
        (a, b) => b.price - a.price,
      )
    }

    return result
  }, [
    searchQuery,
    category,
    type,
    minPrice,
    maxPrice,
    sortBy,
  ])

  const toggleSearch = () => {
    if (showSearch) {
      setShowSearch(false)
      setSearchQuery('')
    } else {
      setShowSearch(true)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* NAVBAR */}

      <header className="sticky top-0 z-50 border-b border-[#dddddd] bg-white">
        <nav className="mx-auto flex h-[92px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* LOGO */}

          <Link
            to="/"
            className="shrink-0"
          >
            <img
              src="/assets/TailorIt_Logo.png"
              alt="TailorIt"
              className="h-[58px] w-[58px] object-contain sm:h-[64px] sm:w-[64px]"
            />
          </Link>

          {/* NAVIGATION */}

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

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-4 sm:gap-6">
            {/* SEARCH INPUT */}

            {showSearch && (
              <div className="hidden items-center sm:flex">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value,
                      )
                    }
                    placeholder="Search products..."
                    autoFocus
                    className="w-[180px] border-b border-black bg-transparent px-1 py-2 pr-8 text-sm outline-none placeholder:text-gray-400 lg:w-[220px]"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchQuery('')
                      }
                      aria-label="Clear search"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* PROFILE / SIGN IN */}

            {isSignedIn ? (
              <ProfileMenu />
            ) : (
              <Link
                to="/sign-in"
                className="hidden border border-black bg-[#ff5a00] px-10 py-3 text-sm font-semibold text-white shadow-[3px_3px_0_#000] transition duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none sm:block"
              >
                SIGN IN
              </Link>
            )}

            {/* SEARCH BUTTON */}

            <button
              type="button"
              aria-label="Search"
              onClick={toggleSearch}
              className={`transition hover:text-[#ff5a00] ${
                showSearch
                  ? 'text-[#ff5a00]'
                  : ''
              }`}
            >
              <FiSearch className="h-6 w-6" />
            </button>

            {/* CART */}

            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="transition hover:text-[#ff5a00]"
            >
              <FiShoppingCart className="h-6 w-6" />
            </Link>
          </div>
        </nav>

        {/* MOBILE SEARCH */}

        {showSearch && (
          <div className="border-t border-[#dddddd] px-5 py-3 sm:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder="Search products..."
                autoFocus
                className="w-full border-b border-black bg-transparent px-1 py-2 pr-8 text-sm outline-none placeholder:text-gray-400"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery('')
                  }
                  aria-label="Clear search"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* CATALOG */}

      <section className="mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        {/* HEADING */}

        <div className="mb-8 flex items-start justify-between gap-5">
          <div>
            <h1 className="text-[32px] font-bold tracking-[-1.5px] sm:text-[40px] lg:text-[48px]">
              All Products
            </h1>

            <p className="mt-1 text-[16px] sm:text-[18px]">
              Choose a product and make it yours
            </p>
          </div>

          <p className="pt-2 text-sm font-medium sm:text-base">
            {filteredProducts.length} items
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* REUSABLE FILTERS */}

          <ProductFilters
            category={category}
            setCategory={setCategory}
            type={type}
            setType={setType}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            sortBy={sortBy}
            setSortBy={setSortBy}
            search={searchQuery}
            setSearch={setSearchQuery}
            clearFilters={clearFilters}
          />

          {/* PRODUCT GRID */}

          <div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="flex min-h-[460px] items-center justify-center border border-dashed border-[#cfcfcf]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    No products found
                  </h2>

                  <p className="mt-2 text-gray-500">
                    Try changing your filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 bg-[#ff5a00] px-8 py-4 font-semibold text-white transition hover:scale-[0.98]"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}