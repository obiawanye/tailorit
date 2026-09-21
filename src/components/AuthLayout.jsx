const AuthLayout = ({ children }) => {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-black">
      {/* Background image */}
      <img
        src="/assets/BGAUTH.png"
        alt=""
        className="fixed inset-0 h-full w-full object-cover object-center"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
        {/* Grey auth card */}
        <div className="w-full max-w-[500px] rounded-[14px] bg-[#e8ecef] px-8 py-8 shadow-lg sm:px-12 sm:py-10">
          {/* TailorIt logo */}
          <div className="flex justify-center">
            <img
              src="/assets/TailorIt_Logo.png"
              alt="TailorIt"
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
          </div>

          {/* Page-specific content */}
          <div className="mt-6 w-full">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

export default AuthLayout