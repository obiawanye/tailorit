import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi'

function AuthModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'error',
  buttonText = 'OK',
}) {
  if (!isOpen) return null

  const isSuccess = type === 'success'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-5"
      onMouseDown={onClose}
    >
      <div
        className="relative w-full max-w-[420px] bg-[#e8ecef] p-6 sm:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 transition hover:text-black"
          aria-label="Close"
        >
          <FiX className="text-xl" />
        </button>

        {/* Icon */}
        <div className="mb-5 flex justify-center">
          {isSuccess ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5a00]">
              <FiCheckCircle className="text-2xl text-white" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5a00]">
              <FiAlertCircle className="text-2xl text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="font-serif text-2xl font-medium text-black">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {message}
          </p>
        </div>

        {/* Button */}
        <div className="mx-auto mt-7 h-11 w-full max-w-[220px] bg-white p-[2px]">
          <div className="relative h-full w-full border border-black">
            <button
              type="button"
              onClick={onClose}
              className="absolute inset-0 h-full w-full -translate-x-[4px] -translate-y-[4px] bg-[#ff5a00] text-sm font-medium text-white transition-transform duration-200 hover:translate-x-0 hover:translate-y-0"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal