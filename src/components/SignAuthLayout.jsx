const SignAuthLayout = ({ children }) => {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#e8ecef]">
      {/* Background image */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center lg:block"
        style={{
          backgroundImage: "url('/assets/BGAUTH.png')",
        }}
        aria-hidden="true"
      />

      {/* Grey auth panel */}
      <section
        className="relative z-10 flex h-full w-full items-center bg-[#e8ecef] lg:w-[49%]"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 80% 50%, 100% 100%, 0 100%)',
        }}
      >
        <div className="flex h-full w-full flex-col px-8 py-8 sm:px-12 sm:py-10 lg:px-14 xl:px-16">
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