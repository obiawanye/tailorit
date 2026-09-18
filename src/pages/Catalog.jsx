import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useUser } from '@clerk/react'
import {
  FiSearch,
  FiShoppingCart,
  FiChevronDown,
  FiX,
} from 'react-icons/fi'


const products = [
  {
    id: 1,
    name: 'EASY CARE TEXTURED SHIRT',
    price: 800,
    originalPrice: 1100,
    category: 'laptops',
    type: 'customized',
    image: '/assets/Landing/laptop.png',
  },
  {
    id: 2,
    name: 'ABSTRACT JACQUARD SHIRT',
    price: 800,
    originalPrice: 1100,
    category: 'phone-cases',
    type: 'customized',
    image: '/assets/Landing/phone-case.png',
  },
  {
    id: 3,
    name: 'EASY KNIT POLO SHIRT WITH ABSTRACT PRINT',
    price: 800,
    originalPrice: 1100,
    category: 'bags',
    type: 'customized',
    image: '/assets/Landing/duffel-bag.png',
  },
  {
    id: 4,
    name: 'CREASED BLACK EFFECT SHIRT',
    price: 800,
    originalPrice: 1100,
    category: 'shoes',
    type: 'customized',
    image: '/assets/Landing/sneakers.png',
  },
  {
    id: 5,
    name: 'ABSTRACT JACQUARD SHIRT',
    price: 900,
    originalPrice: 1100,
    category: 'bags',
    type: 'customized',
    image: '/assets/Landing/orange-duffel.png',
  },
  {
    id: 6,
    name: 'CREASED BLACK EFFECT SHIRT',
    price: 800,
    originalPrice: 1100,
    category: 'shoes',
    type: 'customized',
    image: '/assets/Landing/black-shirt.png',
  },
]

const formatPrice = (price) => `N${price.toLocaleString()}`

function FilterCheckbox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 text-[16px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border border-black bg-white transition peer-checked:border-[#ff5a00] peer-checked:bg-[#ff5a00]">
        {checked && (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M5 12.5l4 4L19 7" />
          </svg>
        )}
      </span>

      <span>{label}</span>
    </label>
  )
}

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

      <div className="h-2 bg-white" />
    </Link>
  )
}

export default function Catalog() {
  const { isSignedIn, user } = useUser()

  const [selectedCategories, setSelectedCategories] =
    useState([])

  const [selectedTypes, setSelectedTypes] =
    useState([])

  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(300000)

  const [sortBy, setSortBy] = useState('Popular')

  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const toggleCategory = (category) => {
    if (category === 'all') {
      setSelectedCategories([])
      return
    }

    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
  }

  const toggleType = (type) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedTypes([])
    setMinPrice(0)
    setMaxPrice(300000)
    setSortBy('Popular')
    setSearchQuery('')
  }

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category)

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(product.type)

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

    if (sortBy === 'Price: Low to High') {
      result = [...result].sort(
        (a, b) => a.price - b.price,
      )
    }

    if (sortBy === 'Price: High to Low') {
      result = [...result].sort(
        (a, b) => b.price - a.price,
      )
    }

    return result
  }, [
    searchQuery,
    selectedCategories,
    selectedTypes,
    minPrice,
    maxPrice,
    sortBy,
  ])

  const handleMinPriceChange = (event) => {
    const value = Number(event.target.value)

    if (value <= maxPrice) {
      setMinPrice(value)
    }
  }

  const handleMaxPriceChange = (event) => {
    const value = Number(event.target.value)

    if (value >= minPrice) {
      setMaxPrice(value)
    }
  }

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
              src='/assets/TailorIt_Logo.png'
              alt="TailorIt"
              className="h-[58px] w-[58px] object-contain sm:h-[64px] sm:w-[64px]"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
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
            {/* DESKTOP SEARCH INPUT */}
            {showSearch && (
              <div className="hidden items-center sm:flex">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
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
              <Link
                to="/profile"
                className="block shrink-0"
                aria-label="Profile"
              >
                <img
                  src={
                    user?.imageUrl ||
                    '/assets/profile-placeholder.jpeg'
                  }
                  alt="Profile"
                  className="h-10 w-10 rounded-full border border-[#dddddd] object-cover transition hover:opacity-80"
                />
              </Link>
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
                  setSearchQuery(event.target.value)
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[310px_1fr] xl:grid-cols-[330px_1fr]">
          {/* FILTER SIDEBAR */}
          <aside className="h-fit rounded-[6px] border border-[#d8d8d8] p-6 lg:sticky lg:top-[116px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold">
                FILTERS
              </h2>

              <button
                type="button"
                onClick={clearFilters}
                className="text-sm transition hover:text-[#ff5a00]"
              >
                Clear all
              </button>
            </div>

            <div className="my-6 h-px bg-[#dddddd]" />

            {/* CATEGORIES */}
            <div>
              <h3 className="mb-6 text-[17px] font-bold">
                Categories
              </h3>

              <div className="space-y-5">
                <FilterCheckbox
                  label="All products"
                  checked={
                    selectedCategories.length === 0
                  }
                  onChange={() =>
                    toggleCategory('all')
                  }
                />

                <FilterCheckbox
                  label="Shoes"
                  checked={selectedCategories.includes(
                    'shoes',
                  )}
                  onChange={() =>
                    toggleCategory('shoes')
                  }
                />

                <FilterCheckbox
                  label="Bags"
                  checked={selectedCategories.includes(
                    'bags',
                  )}
                  onChange={() =>
                    toggleCategory('bags')
                  }
                />

                <FilterCheckbox
                  label="Laptops"
                  checked={selectedCategories.includes(
                    'laptops',
                  )}
                  onChange={() =>
                    toggleCategory('laptops')
                  }
                />

                <FilterCheckbox
                  label="Phone Cases"
                  checked={selectedCategories.includes(
                    'phone-cases',
                  )}
                  onChange={() =>
                    toggleCategory('phone-cases')
                  }
                />
              </div>
            </div>

            <div className="my-6 h-px bg-[#dddddd]" />

            {/* PRICE RANGE */}
            <div>
              <h3 className="mb-7 text-[17px] font-bold">
                Price Range
              </h3>

              <div className="relative h-5">
                <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#ff5a00]" />

                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="100"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  className="range-input absolute inset-0 z-20 w-full appearance-none bg-transparent"
                  aria-label="Minimum price"
                />

                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="100"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  className="range-input pointer-events-none absolute inset-0 z-10 w-full appearance-none bg-transparent"
                  aria-label="Maximum price"
                />

                <div
                  className="pointer-events-none absolute top-1/2 z-30 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black bg-white"
                  style={{
                    left: `${(minPrice / 300000) * 100}%`,
                  }}
                />

                <div
                  className="pointer-events-none absolute top-1/2 z-30 h-5 w-5 -translate-y-1/2 rounded-full border border-black bg-white"
                  style={{
                    left: `${(maxPrice / 300000) * 100}%`,
                  }}
                />
              </div>

              <div className="mt-5 flex justify-between text-sm font-semibold">
                <span>
                  {formatPrice(minPrice)}
                </span>

                <span>
                  {maxPrice >= 300000
                    ? 'N300,000+'
                    : formatPrice(maxPrice)}
                </span>
              </div>
            </div>

            <div className="my-6 h-px bg-[#dddddd]" />

            {/* TYPE */}
            <div>
              <h3 className="mb-6 text-[17px] font-bold">
                Type
              </h3>

              <div className="space-y-5">
                <FilterCheckbox
                  label="Plain"
                  checked={selectedTypes.includes(
                    'plain',
                  )}
                  onChange={() =>
                    toggleType('plain')
                  }
                />

                <FilterCheckbox
                  label="Customized"
                  checked={selectedTypes.includes(
                    'customized',
                  )}
                  onChange={() =>
                    toggleType('customized')
                  }
                />
              </div>
            </div>

            <div className="my-6 h-px bg-[#dddddd]" />

            {/* SORT */}
            <div>
              <h3 className="mb-5 text-[17px] font-bold">
                Sort By
              </h3>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  className="w-full appearance-none rounded-[6px] border border-[#d2d2d2] bg-white px-4 py-3 pr-10 text-[16px] outline-none transition focus:border-[#ff5a00]"
                >
                  <option>Popular</option>
                  <option>
                    Price: Low to High
                  </option>
                  <option>
                    Price: High to Low
                  </option>
                </select>

                <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
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

      {/* RANGE SLIDER STYLES */}
      <style>{`
        .range-input::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: white;
          border: 1px solid black;
          cursor: pointer;
          pointer-events: auto;
        }

        .range-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: white;
          border: 1px solid black;
          cursor: pointer;
          pointer-events: auto;
        }

        .range-input::-webkit-slider-runnable-track {
          background: transparent;
        }

        .range-input::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </main>
  )
}