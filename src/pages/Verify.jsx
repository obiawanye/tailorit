import { useRef, useState } from 'react'
import { useSignUp } from '@clerk/react'
import { useNavigate } from 'react-router'

import AuthLayout from '../components/AuthLayout'
import AuthModal from '../components/AuthModal'

function Verify() {
  const { signUp } = useSignUp()
  const navigate = useNavigate()

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
  })

  const inputRefs = useRef([])

  const openAuthModal = (
    title,
    message,
    type = 'error'
  ) => {
    setAuthModal({
      isOpen: true,
      title,
      message,
      type,
    })
  }

  const closeAuthModal = () => {
    setAuthModal((current) => ({
      ...current,
      isOpen: false,
    }))
  }

  const handleChange = (index, value) => {
    const digit = value
      .replace(/\D/g, '')
      .slice(-1)

    const newOtp = [...otp]
    newOtp[index] = digit

    setOtp(newOtp)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, event) => {
    if (
      event.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()

    const pastedCode = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)

    if (!pastedCode) return

    const newOtp = [
      '',
      '',
      '',
      '',
      '',
      '',
    ]

    pastedCode.split('').forEach((digit, index) => {
      newOtp[index] = digit
    })

    setOtp(newOtp)

    const nextIndex = Math.min(
      pastedCode.length,
      5
    )

    inputRefs.current[nextIndex]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')

    if (code.length !== 6) {
      openAuthModal(
        'Incomplete code',
        'Please enter the 6-digit verification code sent to your email.'
      )
      return
    }

    setIsLoading(true)

    try {
      const { error } =
        await signUp.verifications.verifyEmailCode({
          code,
        })

      if (error) {
        console.error(
          'Verification error:',
          error
        )

        openAuthModal(
          'Verification failed',
          error.message ||
            'The verification code is incorrect or has expired. Please try again.'
        )

        return
      }

      if (signUp.status === 'complete') {
        await signUp.finalize()
        navigate('/catalog')
      } else {
        openAuthModal(
          'Verification incomplete',
          'Your email was verified, but your account still requires additional information.'
        )
      }
    } catch (error) {
      console.error(
        'Verification exception:',
        error
      )

      openAuthModal(
        'Something went wrong',
        'We couldn’t verify your email. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)

    try {
      const { error } =
        await signUp.verifications.sendEmailCode()

      if (error) {
        console.error(
          'Resend verification error:',
          error
        )

        openAuthModal(
          'Unable to resend code',
          error.message ||
            'We couldn’t send a new verification code. Please try again.'
        )

        return
      }

      openAuthModal(
        'Code sent',
        'A new verification code has been sent to your email.',
        'success'
      )
    } catch (error) {
      console.error(
        'Resend verification exception:',
        error
      )

      openAuthModal(
        'Unable to resend code',
        'We couldn’t send a new verification code. Please try again.'
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full text-black">
        {/* Heading */}
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[36px]">
            Check Your Email
          </h1>

          <p className="mt-3 text-sm leading-5 text-gray-500">
            Enter the code shared on your email
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="mt-9 flex w-full gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(event) =>
                handleChange(
                  index,
                  event.target.value
                )
              }
              onKeyDown={(event) =>
                handleKeyDown(index, event)
              }
              onPaste={handlePaste}
              aria-label={`Verification code digit ${
                index + 1
              }`}
              className="h-12 min-w-0 flex-1 rounded-md border border-gray-300 bg-white text-center text-lg text-black outline-none transition focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00] sm:h-14"
            />
          ))}
        </div>

        {/* Verify Button */}
        <div className="mt-7 h-12 w-full  p-[2px]">
          <div className="relative h-full w-full border border-black">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isLoading}
              className="absolute inset-0 h-full w-full -translate-x-[4px] -translate-y-[4px] bg-[#ff5a00] text-sm font-medium text-white transition-transform duration-200 hover:translate-x-0 hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? 'Verifying...'
                : 'VERIFY'}
            </button>
          </div>
        </div>

        {/* Resend */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Didn’t receive code?
          </span>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-[#ff5a00] transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending
              ? 'Sending...'
              : 'Resend'}
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        title={authModal.title}
        message={authModal.message}
        type={authModal.type}
      />
    </AuthLayout>
  )
}

export default Verify