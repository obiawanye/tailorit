import {
  FiSearch,
  FiChevronDown,
} from 'react-icons/fi'

const formatPrice = (price) =>
  `₦${Number(price || 0).toLocaleString()}`

export default function ProductFilters({
  category,
  setCategory,
  type,
  setType,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  search,
  setSearch,
  clearFilters,
}) {
  const handleMinPriceChange = (event) => {
    const value = Number(event.target.value)

    setMinPrice(
      Math.min(value, maxPrice - 5000),
    )
  }

  const handleMaxPriceChange = (event) => {
    const value = Number(event.target.value)

    setMaxPrice(
      Math.max(value, minPrice + 5000),
    )
  }

  return (
    <aside className="h-fit rounded-[7px] border border-[#d9d9d9] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold">
          FILTERS
        </h2>

        <button
          type="button"
          onClick={clearFilters}
          className="text-[14px] transition hover:text-[#ff5a00]"
        >
          Clear all
        </button>
      </div>

      <div className="my-5 border-t border-[#dddddd]" />

      {/* SEARCH */}
      <div className="mb-6">
        <div className="flex h-[42px] items-center rounded-[7px] border border-[#cccccc] px-3">
          <FiSearch className="mr-2 h-4 w-4 text-gray-500" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products"
            className="min-w-0 flex-1 text-sm outline-none"
          />
        </div>
      </div>

      {/* CATEGORIES */}
      <div>
        <h3 className="mb-5 text-[15px] font-bold">
          Categories
        </h3>

        <div className="space-y-5">
          <label className="flex cursor-pointer items-center gap-4 text-[15px]">
            <input
              type="radio"
              name="category"
              checked={category === 'all'}
              onChange={() =>
                setCategory('all')
              }
              className="h-4 w-4 accent-[#ff5a00]"
            />
            All products
          </label>

          <label className="flex cursor-pointer items-center gap-4 text-[15px]">
            <input
              type="radio"
              name="category"
              checked={category === 'shoes'}
              onChange={() =>
                setCategory('shoes')
              }
              className="h-4 w-4 accent-[#ff5a00]"
            />
            Shoes
          </label>

          <label className="flex cursor-pointer items-center gap-4 text-[15px]">
            <input
              type="radio"
              name="category"
              checked={category === 'bags'}
              onChange={() =>
                setCategory('bags')
              }
              className="h-4 w-4 accent-[#ff5a00]"
            />
            Bags
          </label>

          <label className="flex cursor-pointer items-center gap-4 text-[15px]">
            <input
              type="radio"
              name="category"
              checked={category === 'laptops'}
              onChange={() =>
                setCategory('laptops')
              }
              className="h-4 w-4 accent-[#ff5a00]"
            />
            Laptops
          </label>

          <label className="flex cursor-pointer items-center gap-4 text-[15px]">
            <input
              type="radio"
              name="category"
              checked={
                category === 'phone-cases'
              }
              onChange={() =>
                setCategory('phone-cases')
              }
              className="h-4 w-4 accent-[#ff5a00]"
            />
            Phone Cases
          </label>
        </div>
      </div>

      <div className="my-6 border-t border-[#dddddd]" />

      {/* PRICE RANGE */}
      <div>
        <h3 className="mb-6 text-[15px] font-bold">
          Price Range
        </h3>

        <div className="relative h-5">
          {/* TRACK */}
          <div className="absolute left-2 right-2 top-1/2 h-[2px] -translate-y-1/2 bg-[#dddddd]" />

          {/* ACTIVE RANGE */}
          <div
            className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-[#ff5a00]"
            style={{
              left: `calc(${(minPrice / 300000) * 100}% + 2px)`,
              right: `calc(${100 - (maxPrice / 300000) * 100}% + 2px)`,
            }}
          />

          {/* MINIMUM SLIDER */}
          <input
            type="range"
            min="0"
            max="300000"
            step="10000"
            value={minPrice}
            onChange={handleMinPriceChange}
            className="price-range absolute left-0 top-1/2 z-20 h-1 w-full -translate-y-1/2 appearance-none bg-transparent"
            aria-label="Minimum price"
          />

          {/* MAXIMUM SLIDER */}
          <input
            type="range"
            min="0"
            max="300000"
            step="10000"
            value={maxPrice}
            onChange={handleMaxPriceChange}
            className="price-range absolute left-0 top-1/2 z-30 h-1 w-full -translate-y-1/2 appearance-none bg-transparent"
            aria-label="Maximum price"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-[14px]">
          <span>
            {formatPrice(minPrice)}
          </span>

          <span>
            {formatPrice(maxPrice)}
            {maxPrice === 300000
              ? '+'
              : ''}
          </span>
        </div>
      </div>

      <div className="my-6 border-t border-[#dddddd]" />

      {/* TYPE */}
      <div>
        <h3 className="mb-5 text-[15px] font-bold">
          Type
        </h3>

        <div className="space-y-5">
          <label className="flex cursor-pointer items-center gap-4 text-[15px]">
            <input
              type="radio"
              name="type"
              checked={type === 'all'}
              onChange={() =>
                setType('all')
              }
              className="h-4 w-4 accent-[#ff5a00]"
            />
            All
          </label>

          <label className="flex cursor-pointer items-center gap-4 text-[15px]">
            <input
              type="radio"
              name="type"
              checked={type === 'plain'}
              onChange={() =>
                setType('plain')
              }
              className="h-4 w-4 accent-[#ff5a00]"
            />
            Plain
          </label>

          <label className="flex cursor-pointer items-center gap-4 text-[15px]">
            <input
              type="radio"
              name="type"
              checked={type === 'customized'}
              onChange={() =>
                setType('customized')
              }
              className="h-4 w-4 accent-[#ff5a00]"
            />
            Customized
          </label>
        </div>
      </div>

      <div className="my-6 border-t border-[#dddddd]" />

      {/* SORT */}
      <div>
        <h3 className="mb-4 text-[15px] font-bold">
          Sort By
        </h3>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
            className="h-[42px] w-full appearance-none rounded-[7px] border border-[#cccccc] bg-white px-3 pr-10 text-[14px] outline-none focus:border-[#ff5a00]"
          >
            <option value="popular">
              Popular
            </option>

            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>
          </select>

          <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>

      {/* RANGE SLIDER STYLES */}
      <style>{`
        .price-range {
          pointer-events: none;
        }

        .price-range::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: white;
          border: 1px solid black;
          cursor: pointer;
          pointer-events: auto;
          position: relative;
        }

        .price-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: white;
          border: 1px solid black;
          cursor: pointer;
          pointer-events: auto;
        }

        .price-range::-webkit-slider-runnable-track {
          background: transparent;
        }

        .price-range::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </aside>
  )
}