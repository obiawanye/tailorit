import {
  FiAlertCircle,
  FiCheckCircle,
  FiX,
} from 'react-icons/fi'

function AuthModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'error',
}) {
  if (!isOpen) return null

  const isSuccess = type === 'success'

  return (
    <div className="fixed right-5 top-5 z-[100] w-[calc(100%-40px)] max-w-[380px]">
      <div className="relative border border-black bg-[#e8ecef] p-5 shadow-[4px_4px_0px_#000]">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 transition-colors duration-200 hover:text-black"
          aria-label="Close notification"
        >
          <FiX className="text-lg" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4 pr-6">
          {/* Icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isSuccess
                ? 'bg-[#ff5a00]'
                : 'bg-[#ff5a00]'
            }`}
          >
            {isSuccess ? (
              <FiCheckCircle className="text-xl text-white" />
            ) : (
              <FiAlertCircle className="text-xl text-white" />
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 pt-0.5">
            <h2 className="pr-4 font-serif text-lg font-medium leading-tight text-black">
              {title}
            </h2>

            <p className="mt-1.5 text-sm leading-5 text-gray-600">
              {message}
            </p>
          </div>
        </div>

        {/* Orange accent */}
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#ff5a00]" />
      </div>
    </div>
  )
}

export default AuthModal