const AuthLayout = ({ children }) => {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-black">

      {/* Background image */}
      <img
        src='/assets/BGAUTH.png'
        alt=""
        className="
          fixed
          inset-0
          h-full
          w-full
          object-cover
          object-center
        "
      />

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 min-h-dvh">
        <div
          className="
            flex
            min-h-dvh
            flex-col
            px-5
            py-8

            sm:px-8
            sm:py-10

            md:px-10
            md:py-12

            lg:px-[5.8vw]
            lg:py-[4.8vh]
          "
        >

          {/* TailorIt logo */}
          <img
            src='/assets/TailorIt_Logo.png'
            alt="TailorIt"
            className="
              h-14
              w-14
              shrink-0

              sm:h-16
              sm:w-16

              lg:h-20
              lg:w-20
            "
          />

          {/* Page-specific content */}
          <div
            className="
              mt-7
              w-full
              max-w-[400px]

              sm:mt-8

              lg:mt-9
              lg:max-w-[400px]
            "
          >
            {children}
          </div>

        </div>
      </div>

    </main>
  )
}

export default AuthLayout