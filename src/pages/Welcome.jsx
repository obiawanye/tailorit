import { useState } from 'react'
import { Link } from 'react-router'
import { FiSearch, FiShoppingCart, FiArrowLeft, FiArrowRight } from 'react-icons/fi'

const products = [
  {
    id: 1,
    name: 'EASY CARE TEXTURED SHIRT',
    price: 'N800',
    oldPrice: 'N1100',
    image: '/assets/Landing/laptop.png',
    category: 'LAPTOPS',
  },
  {
    id: 2,
    name: 'ABSTRACT JACQUARD SHIRT',
    price: 'N500',
    oldPrice: 'N900',
    image: '/assets/Landing/phone-case.png',
    category: 'PHONE CASES',
  },
  {
    id: 3,
    name: 'EASY KNIT POLO SHIRT WITH ABSTRACT PRINT',
    price: 'N699',
    oldPrice: 'N800',
    image: '/assets/Landing/duffel-bag.png',
    category: 'BAGS',
  },
  {
    id: 4,
    name: 'CLASSIC SNEAKER',
    price: 'N500',
    oldPrice: 'N1200',
    image: '/assets/Landing/sneakers.png',
    category: 'SHOES',
  },
  {
    id: 5,
    name: 'TAILORIT DUFFEL BAG',
    price: 'N500',
    oldPrice: 'N900',
    image: '/assets/Landing/orange-duffel.png',
    category: 'BAGS',
  },
  {
    id: 6,
    name: 'CREASED BLACK SHIRT',
    price: 'N500',
    oldPrice: 'N1200',
    image: '/assets/Landing/black-shirt.png',
    category: 'SHOES',
  },
]

const categories = ['BAGS', 'SHOES', 'PHONE CASES', 'LAPTOPS']

const Button = ({ children, to = '/catalog', className = '' }) => (
  <Link
    to={to}
    className={`group relative inline-flex w-fit items-center justify-center ${className}`}
  >
    {/* Black base */}
    <span className="absolute inset-0 translate-x-[5px] translate-y-[5px] border border-black bg-black" />

    {/* White offset */}
    <span className="absolute inset-0 translate-x-[3px] translate-y-[3px] border border-white bg-white" />

    {/* Orange button */}
    <span className="relative border border-black bg-[#ff5a00] px-8 py-4 text-xs font-bold text-white transition-transform duration-200 group-hover:translate-x-[3px] group-hover:translate-y-[3px] group-active:translate-x-[4px] group-active:translate-y-[4px] sm:px-10">
      {children}
    </span>
  </Link>
)

const ProductCard = ({ product }) => (
  <Link
    to="/catalog"
    className="group flex h-full flex-col overflow-hidden border border-black bg-white"
  >
    <div className="aspect-square shrink-0 overflow-hidden bg-[#f3f3f3]">
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>

    <div className="flex min-h-[108px] flex-1 items-center justify-between bg-black px-4 py-4 text-white">
      <div className="min-w-0">
        <p className="max-w-[230px] text-xs leading-5 tracking-wide">
          {product.name}
        </p>

        <div className="mt-1 flex items-center gap-3">
          <span className="text-lg">
            {product.price}
          </span>

          <span className="text-xs text-gray-400 line-through">
            {product.oldPrice}
          </span>
        </div>
      </div>

      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-black transition-transform duration-200 group-hover:scale-90">
        +
      </span>
    </div>
  </Link>
)

const Stat = ({ value, label }) => (
  <div className="text-center sm:text-left">
    <div className="text-4xl font-black tracking-tight sm:text-5xl">
      {value}
    </div>

    <div className="mt-1 text-xs font-bold uppercase tracking-wide sm:text-sm">
      {label}
    </div>
  </div>
)

const PatternBackground = ({ children, className = '' }) => (
  <section className={`relative overflow-hidden bg-[#EAF3F5] ${className}`}>
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.14]"
      style={{
        backgroundImage: `url('/assets/Landing/landing-pattern.png')`,
        backgroundRepeat: 'repeat',
      }}
    />

    <div className="relative">
      {children}
    </div>
  </section>
)

export default function Welcome() {
  const [activeCategory, setActiveCategory] = useState('BAGS')

  const filteredProducts = products.filter(
    (product) => product.category === activeCategory
  )

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#EAF3F5] text-black">

      
      <header className="fixed left-0 right-0 top-0 z-[100] border-b border-black/40 bg-[#e8ecef]">

        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between border-x border-black/30 bg-[#e8ecef] px-5 sm:px-8">

          {/* Logo */}
          <Link
            to="/"
            aria-label="TailorIt home"
          >
            <img
              src='/assets/TailorIt_Logo.png'
              alt="TailorIt"
              className="h-12 w-12 object-contain"
            />
          </Link>


          {/* Navigation */}
          <nav className="hidden items-center gap-8 text-sm sm:flex">

            <Link
              to="/"
              className="font-semibold text-[#ff5a00]"
            >
              Home
            </Link>

            <Link
              to="/catalog"
              className="transition-colors hover:text-[#ff5a00]"
            >
              Catalog
            </Link>

            <Link
              to="/my-orders"
              className="transition-colors hover:text-[#ff5a00]"
            >
              My Orders
            </Link>

          </nav>


          {/* Right side */}
          <div className="flex items-center gap-4">

            {/* SIGN UP */}
            <Link
              to="/sign-up"
              className="group relative hidden w-[105px] items-center justify-center sm:inline-flex"
            >

              {/* Black base */}
              <span className="absolute inset-0 translate-x-[5px] translate-y-[5px] border border-black bg-black" />

              {/* White offset */}
              <span className="absolute inset-0 translate-x-[3px] translate-y-[3px] border border-white bg-white" />

              {/* Orange button */}
              <span className="relative flex h-[40px] w-full items-center justify-center border border-black bg-[#ff5a00] text-xs font-bold text-white transition-transform duration-200 group-hover:translate-x-[3px] group-hover:translate-y-[3px] group-active:translate-x-[4px] group-active:translate-y-[4px]">
                SIGN UP
              </span>

            </Link>


            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              className="transition-transform duration-200 hover:scale-90"
            >
              <FiSearch size={21} />
            </button>


            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="transition-transform duration-200 hover:scale-90"
            >
              <FiShoppingCart size={22} />
            </Link>

          </div>

        </div>

      </header>


      
      <section className="border-b border-black/40 bg-[#e8ecef] pt-[72px]">

        <div className="mx-auto max-w-[1180px] border-x border-black/30 bg-[#e8ecef]">

          <div className="grid min-h-[680px] items-center gap-8 px-5 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-0 lg:px-12 lg:py-0">

            {/* Hero text */}
            <div className="z-10">

              <h1 className="max-w-[620px] text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-[70px]">
                Designed for you,
                <br />
                Made by <span className="text-[#ff5a00]">you</span>
              </h1>

              <p className="mt-7 max-w-[430px] text-sm leading-6 text-gray-600 sm:text-base">
                Embre Group is a dynamic and continuously growing group of companies creating a buoyant economic climate.
              </p>

              <Button className="mt-8">
                CREATE NOW!
              </Button>


              {/* Stats */}
              <div className="mt-12 grid max-w-[530px] grid-cols-3 gap-5">

                <Stat
                  value="2+"
                  label="Year of experience"
                />

                <Stat
                  value="8+"
                  label="Countries"
                />

                <Stat
                  value="10M+"
                  label="Products nationwide"
                />

              </div>

            </div>


            {/* Models */}
            <div className="relative flex items-end justify-center self-stretch">

              <img
                src="/assets/Landing/hero-models.png"
                alt="TailorIt models"
                className="w-full max-w-[660px] object-contain lg:absolute lg:bottom-0 lg:right-[-20px] lg:h-[650px] lg:w-[660px]"
              />

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          FEATURE STRIP
      ========================================== */}
      <section className="border-b border-black/40">

        <div className="mx-auto grid max-w-[1180px] grid-cols-2 border-x border-black/30 bg-[#EAF3F5] sm:grid-cols-4">

          {[
            '100% Fresh & Pure',
            '100% Cotton',
            'Dust proof material',
            'Machine wash cold',
          ].map((item, index) => (

            <div
              key={item}
              className={`
                flex min-h-[76px] items-center justify-center
                border-black/30 px-4 text-center
                text-xs font-semibold
                ${index < 2 ? 'border-b' : ''}
                ${index % 2 === 0 ? 'border-r' : ''}
                sm:border-b-0
                sm:border-r
                sm:last:border-r-0
              `}
            >
              {item}
            </div>

          ))}

        </div>

      </section>


      {/* =========================================
          OUR IMPACT
      ========================================== */}
      <PatternBackground className="border-b border-black/40">

        <div className="mx-auto max-w-[1180px] border-x border-black/30 px-5 py-16 sm:px-10 sm:py-20 lg:px-12">

          <h2 className="max-w-[620px] text-4xl font-black uppercase leading-[0.95] sm:text-5xl lg:text-6xl">
            Our impact on
            <br />
            climate change
          </h2>

          <p className="mt-7 max-w-[570px] text-sm font-medium leading-6 text-gray-600">
            As a company, we take full responsibility for our environmental footprint by using more sustainable materials and manufacturing processes, while working with our customers to ensure our products last longer.
          </p>

          <Button className="mt-8">
            EXPLORE MORE
          </Button>


          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">

            <Stat
              value="150k+"
              label="Plastics converted"
            />

            <Stat
              value="70%"
              label="Lower carbon footprint"
            />

            <Stat
              value="18"
              label="Pools of water saved"
            />

          </div>

        </div>

      </PatternBackground>


      {/* =========================================
          WHAT WE MAKE
      ========================================== */}
      <PatternBackground className="border-b border-black/40">

        <div className="mx-auto max-w-[1180px] border-x border-black/30 px-5 py-16 sm:px-10 sm:py-20 lg:px-12">

          <div className="text-center">

            <h2 className="text-4xl font-black uppercase sm:text-5xl lg:text-6xl">
              What we make
            </h2>

            <p className="mt-2 text-xs font-bold uppercase sm:text-sm">
              Recommended products
            </p>


            {/* Category filters */}
            <div className="mx-auto mt-7 flex max-w-[720px] items-center justify-center gap-5 overflow-x-auto border-b border-black/50 pb-3 sm:gap-10">

              {categories.map((category) => (

                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`
                    shrink-0 pb-3 text-xs font-bold
                    transition-colors sm:text-sm
                    ${
                      activeCategory === category
                        ? 'border-b-2 border-[#ff5a00] text-[#ff5a00]'
                        : 'text-black hover:text-[#ff5a00]'
                    }
                  `}
                >
                  {category}
                </button>

              ))}

            </div>

          </div>


          {/* Product grid */}
          <div className="relative mt-10">

            {filteredProducts.length > 0 ? (

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {filteredProducts.map((product) => (

                  <ProductCard
                    key={product.id}
                    product={product}
                  />

                ))}

              </div>

            ) : (

              <div className="flex min-h-[300px] items-center justify-center border border-black/30 bg-[#EAF3F5]">

                <p className="text-sm font-semibold">
                  No products available in this category yet.
                </p>

              </div>

            )}


            {/* Previous */}
            <button
              type="button"
              aria-label="Previous products"
              className="absolute -left-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-black bg-[#EAF3F5] transition-transform hover:scale-90 lg:flex"
            >
              <FiArrowLeft size={20} />
            </button>


            {/* Next */}
            <button
              type="button"
              aria-label="Next products"
              className="absolute -right-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-black bg-[#EAF3F5] transition-transform hover:scale-90 lg:flex"
            >
              <FiArrowRight size={20} />
            </button>

          </div>


          {/* More products */}
          <div className="mt-10 flex justify-center">

            <Button>
              MORE PRODUCTS
            </Button>

          </div>

        </div>

      </PatternBackground>


      {/* =========================================
          FOR THE PLANET
      ========================================== */}
      <PatternBackground className="border-b border-black/40">

        <div className="mx-auto max-w-[1180px] border-x border-black/30 px-5 py-16 sm:px-10 sm:py-20 lg:px-12">

          <div className="flex justify-center">

            <img
              src='/assets/Landing/solar-panel.png'

              alt="TailorIt sustainability"
              className="h-auto w-full max-w-[1000px] object-contain"
            />

          </div>

        </div>

      </PatternBackground>


      {/* =========================================
          FREE DELIVERY
      ========================================== */}
      <PatternBackground className="border-b border-black/40">

        <div className="mx-auto max-w-[1180px] border-x border-black/30 px-5 py-10 sm:px-10 lg:px-12">

          <div className="relative min-h-[280px] overflow-hidden bg-black px-8 py-10 text-white sm:px-12 sm:py-12 lg:min-h-[320px]">

            {/* Pattern inside CTA */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage: `url('/assets/Landing/landing-pattern.png')`,
                backgroundRepeat: 'repeat',
              }}
            />


            <div className="relative z-10 max-w-[620px]">

              <h2 className="max-w-[600px] text-3xl font-black uppercase leading-tight sm:text-4xl lg:text-5xl">
                Free delivery for new and returning users
              </h2>

              <Button className="mt-8">
                START SHOPPING NOW!
              </Button>

            </div>


            {/* Shopping bag */}
            <img
              src='/assets/Landing/orange-shopping-bag.png'
              alt="TailorIt shopping bag"
              className="absolute bottom-[-20px] right-[5%] z-10 hidden w-[240px] object-contain sm:block lg:w-[300px]"
            />

          </div>

        </div>

      </PatternBackground>


      {/* =========================================
          FOOTER
      ========================================== */}
      <footer className="relative overflow-hidden border-t border-black/40 bg-[#EAF3F5]">

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `url('/assets/Landing/landing-pattern.png')`,
            backgroundRepeat: 'repeat',
          }}
        />


        <div className="relative mx-auto grid max-w-[1180px] grid-cols-2 gap-10 border-x border-black/30 px-5 py-12 sm:px-10 lg:grid-cols-4 lg:px-12">

          {[
            [
              'THE COMPANY',
              [
                'ABOUT TAILORIT',
                'CODE OF ETHICS',
                'WORK WITH US',
                'NEWS',
                'TALENTS',
                'LEGAL NOTICES',
              ],
            ],
            [
              'MAY WE HELP YOU?',
              [
                'CONTACT US',
                'GET STORE',
                'SITEMAP',
                'FAQS',
                'LOCATION',
              ],
            ],
            [
              'TAILORIT SERVICES',
              [
                'DISCOVER OUR SERVICES',
                'BOOK A MEET',
                'COLLECT IN LOCATION',
                'SHIPPINGS',
                'EXPERIENCES',
              ],
            ],
            [
              'FOLLOW US',
              [
                'INSTAGRAM',
                'TWITTER',
                'YOUTUBE',
                'LINKEDIN',
                'THREAD',
                'PINTEREST',
                'FACEBOOK',
              ],
            ],
          ].map(([heading, links]) => (

            <div key={heading}>

              <h3 className="text-sm font-black">
                {heading}
              </h3>

              <div className="mt-5 space-y-2 text-xs text-gray-700">

                {links.map((link) => (

                  <a
                    href="#"
                    key={link}
                    className="block transition-colors hover:text-[#ff5a00]"
                  >
                    {link}
                  </a>

                ))}

              </div>

            </div>

          ))}

        </div>


        {/* Bottom black bar */}
        <div className="relative h-24 bg-black" />

      </footer>

    </main>
  )
}