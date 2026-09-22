const SignAuthLayout = ({ children }) => {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-[#e8ecef]">
      {/* Background image */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center lg:block"
        style={{
          backgroundImage: "url('/assets/BGAUTH.png')",
        }}
        aria-hidden="true"
      />

      {/* Grey auth panel */}
      <section className="relative z-10 flex min-h-dvh w-full items-center lg:w-[49%]">
        {/* Grey panel background */}
        <div
          className="absolute inset-0 bg-[#e8ecef] lg:[clip-path:polygon(0_0,100%_0,80%_50%,100%_100%,0_100%)]"
          aria-hidden="true"
        />

        {/* Panel content */}
        <div className="relative z-10 flex min-h-dvh w-full flex-col px-8 py-8 sm:px-12 sm:py-10 lg:px-14 xl:px-16">
          {/* Logo */}
          <div>
            <img
              src="/assets/TailorIt_Logo.png"
              alt="TailorIt"
              className="h-16 w-16 object-contain"
            />
          </div>

          {/* Auth content */}
          <div className="flex flex-1 items-center">
            <div className="w-full max-w-[420px]">
              {children}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default SignAuthLayout