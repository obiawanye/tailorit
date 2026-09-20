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

const formatPrice = (price) =>
  `₦${Number(price || 0).toLocaleString()}`

const formatDate = (dateString) => {
  const date = new Date(dateString)

  const day = String(date.getDate()).padStart(
    2,
    '0',
  )

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const year = String(
    date.getFullYear(),
  ).slice(-2)

  return `${day}/${month}/${year}`
}

const getTodayAtMidnight = () => {
  const today = new Date()

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
}

const getOrderStatus = (deliveryDate) => {
  if (!deliveryDate) {
    return {
      label: 'Delivery date unavailable',
      delivered: false,
    }
  }

  const delivery = new Date(deliveryDate)

  const deliveryDay = new Date(
    delivery.getFullYear(),
    delivery.getMonth(),
    delivery.getDate(),
  )

  const today = getTodayAtMidnight()

  if (today >= deliveryDay) {
    return {
      label: `Delivered: ${formatDate(
        deliveryDate,
      )}`,
      delivered: true,
    }
  }

  return {
    label: `To be delivered: ${formatDate(
      deliveryDate,
    )}`,
    delivered: false,
  }
}

const getSavedOrders = () => {
  try {
    const savedOrders = JSON.parse(
      localStorage.getItem(
        'tailorit-orders',
      ) || '[]',
    )

    return Array.isArray(savedOrders)
      ? savedOrders
      : []
  } catch (error) {
    console.error(
      'Failed to load orders:',
      error,
    )

    return []
  }
}

const getProductCategory = (item) => {
  const category =
    item.category?.toLowerCase()

  if (category === 'phone-cases') {
    return 'phone-cases'
  }

  if (category === 'laptops') {
    return 'laptops'
  }

  if (category === 'shoes') {
    return 'shoes'
  }

  if (category === 'bags') {
    return 'bags'
  }

  const name =
    item.name?.toLowerCase() || ''

  if (
    name.includes('phone') ||
    name.includes('case')
  ) {
    return 'phone-cases'
  }

  if (name.includes('laptop')) {
    return 'laptops'
  }

  if (
    name.includes('sneaker') ||
    name.includes('shoe')
  ) {
    return 'shoes'
  }

  if (
    name.includes('bag') ||
    name.includes('purse') ||
    name.includes('duffel')
  ) {
    return 'bags'
  }

  return 'other'
}

const getItemPrice = (item) => {
  return (
    Number(item.totalPrice || 0) *
    Number(item.quantity || 1)
  )
}

export default function MyOrders() {
  const { isSignedIn } = useUser()

  const [orders] =
    useState(getSavedOrders)

  const [category, setCategory] =
    useState('all')

  const [type, setType] =
    useState('all')

  const [minPrice, setMinPrice] =
    useState(5000)

  const [maxPrice, setMaxPrice] =
    useState(300000)

  const [sortBy, setSortBy] =
    useState('popular')

  const [search, setSearch] =
    useState('')

  const [showSearch, setShowSearch] =
    useState(false)

  /*
   * Flatten all orders into individual product rows.
   * Each purchased product gets its own row.
   */
  const orderItems = useMemo(() => {
    return orders.flatMap((order) => {
      const items = Array.isArray(
        order.items,
      )
        ? order.items
        : []

      return items.map((item, index) => ({
        ...item,
        orderNumber:
          order.orderNumber,
        orderDate:
          order.orderDate,
        deliveryDate:
          order.deliveryDate,
        orderIndex: index,
      }))
    })
  }, [orders])

  const filteredItems = useMemo(() => {
    let filtered = [...orderItems]

    /* CATEGORY FILTER */
    if (category !== 'all') {
      filtered = filtered.filter(
        (item) =>
          getProductCategory(item) ===
          category,
      )
    }

    /* TYPE FILTER */
    if (type !== 'all') {
      filtered = filtered.filter(
        (item) => {
          const isCustomized =
            Boolean(
              item.customization?.text,
            ) ||
            item.customization
              ?.pattern !== 'none' ||
            item.customization
              ?.graphic !== 'none'

          return type === 'customized'
            ? isCustomized
            : !isCustomized
        },
      )
    }

    /* PRICE FILTER */
    filtered = filtered.filter(
      (item) => {
        const price = Number(
          item.totalPrice || 0,
        )

        return (
          price >= minPrice &&
          price <= maxPrice
        )
      },
    )

    /* SEARCH */
    if (search.trim()) {
      const searchTerm =
        search.trim().toLowerCase()

      filtered = filtered.filter(
        (item) => {
          const name =
            item.name?.toLowerCase() ||
            ''

          return name.includes(
            searchTerm,
          )
        },
      )
    }

    /* SORT */
    if (sortBy === 'price-low') {
      filtered.sort(
        (a, b) =>
          Number(a.totalPrice || 0) -
          Number(b.totalPrice || 0),
      )
    }

    if (sortBy === 'price-high') {
      filtered.sort(
        (a, b) =>
          Number(b.totalPrice || 0) -
          Number(a.totalPrice || 0),
      )
    }

    if (sortBy === 'newest') {
      filtered.sort(
        (a, b) =>
          new Date(b.orderDate) -
          new Date(a.orderDate),
      )
    }

    if (sortBy === 'oldest') {
      filtered.sort(
        (a, b) =>
          new Date(a.orderDate) -
          new Date(b.orderDate),
      )
    }

    return filtered
  }, [
    orderItems,
    category,
    type,
    minPrice,
    maxPrice,
    sortBy,
    search,
  ])

  const clearFilters = () => {
    setCategory('all')
    setType('all')
    setMinPrice(5000)
    setMaxPrice(300000)
    setSortBy('popular')
    setSearch('')
  }

  const hasActiveFilters =
    category !== 'all' ||
    type !== 'all' ||
    minPrice !== 5000 ||
    maxPrice !== 300000 ||
    sortBy !== 'popular' ||
    search !== ''

  const toggleSearch = () => {
    if (showSearch) {
      setShowSearch(false)
      setSearch('')
    } else {
      setShowSearch(true)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* =========================================
          NAVBAR
      ========================================== */}

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
              className="transition hover:text-[#ff5a00]"
            >
              Catalog
            </Link>

            <Link
              to="/my-orders"
              className="font-semibold text-[#ff5a00]"
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
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search orders..."
                    autoFocus
                    className="w-[180px] border-b border-black bg-transparent px-1 py-2 pr-8 text-sm outline-none placeholder:text-gray-400 lg:w-[220px]"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch('')
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
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search orders..."
                autoFocus
                className="w-full border-b border-black bg-transparent px-1 py-2 pr-8 text-sm outline-none placeholder:text-gray-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch('')
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

      {/* =========================================
          MY ORDERS
      ========================================== */}

      <section className="mx-auto w-full max-w-[1500px] px-7 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
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
            search={search}
            setSearch={setSearch}
            clearFilters={clearFilters}
          />

          {/* ORDERS */}

          <section className="min-w-0">
            {filteredItems.length ===
            0 ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <h1 className="text-[32px] font-bold">
                  No orders found
                </h1>

                <p className="mt-3 text-gray-500">
                  {orders.length === 0
                    ? 'You have not placed any orders yet.'
                    : 'Try changing your filters.'}
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-7 rounded-[8px] bg-[#ff5a00] px-8 py-3 font-semibold text-white"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="border-t border-dashed border-[#cfcfcf]">
                {filteredItems.map(
                  (item, index) => {
                    const status =
                      getOrderStatus(
                        item.deliveryDate,
                      )

                    const quantity =
                      Number(
                        item.quantity || 1,
                      )

                    return (
                      <article
                        key={`${item.orderNumber}-${item.cartId}-${index}`}
                        className="flex flex-col gap-6 border-b border-dashed border-[#cfcfcf] py-5 md:flex-row md:items-center"
                      >
                        {/* PRODUCT IMAGE */}

                        <div className="flex h-[155px] w-[155px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#eeeeee]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        {/* PRODUCT DETAILS */}

                        <div className="min-w-0 flex-1">
                          <span className="inline-flex rounded-full border border-[#ff5a00] px-3 py-1.5 text-[14px] font-medium text-[#ff5a00]">
                            {status.label}
                          </span>

                          <h2 className="mt-4 text-[25px] font-bold tracking-[-0.5px]">
                            {item.name}
                          </h2>

                          <div className="mt-3 text-[16px] leading-6">
                            <p>
                              <span className="font-semibold">
                                Color:
                              </span>{' '}
                              {item
                                .customization
                                ?.color ||
                                'Orange'}
                            </p>

                            {item
                              .customization
                              ?.text && (
                              <>
                                <span className="font-semibold">
                                  Name:
                                </span>{' '}
                                {
                                  item
                                    .customization
                                    .text
                                }
                              </>
                            )}

                            {item
                              .customization
                              ?.text &&
                              item
                                .customization
                                ?.pattern !==
                                'none' && (
                                <span className="mx-2">
                                  •
                                </span>
                              )}

                            {item
                              .customization
                              ?.pattern &&
                              item
                                .customization
                                .pattern !==
                                'none' && (
                                <span>
                                  <span className="font-semibold">
                                    Pattern:
                                  </span>{' '}
                                  {
                                    item
                                      .customization
                                      .pattern
                                  }
                                </span>
                              )}

                            {item
                              .customization
                              ?.pattern !==
                              'none' &&
                              item
                                .customization
                                ?.graphic !==
                                'none' && (
                                <span className="mx-2">
                                  •
                                </span>
                              )}

                            {item
                              .customization
                              ?.graphic &&
                              item
                                .customization
                                .graphic !==
                                'none' && (
                                <span>
                                  <span className="font-semibold">
                                    Graphic:
                                  </span>{' '}
                                  {
                                    item
                                      .customization
                                      .graphic
                                  }
                                </span>
                              )}
                          </div>
                        </div>

                        {/* PRICE + QUANTITY */}

                        <div className="flex shrink-0 items-center justify-between gap-8 md:w-[150px] md:flex-col md:items-end md:justify-center">
                          <p className="text-[25px] font-semibold">
                            {formatPrice(
                              getItemPrice(
                                item,
                              ),
                            )}
                          </p>

                          <p className="text-[15px]">
                            {quantity}{' '}
                            {quantity ===
                            1
                              ? 'item'
                              : 'items'}
                          </p>
                        </div>
                      </article>
                    )
                  },
                )}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}