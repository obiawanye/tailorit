import { useEffect, useRef, useState } from 'react'
import { useSignIn } from '@clerk/react'
import { useLocation, useNavigate } from 'react-router'

import AuthLayout from '../components/AuthLayout'

function ResetPassword() {
  const { signIn } = useSignIn()
  const navigate = useNavigate()
  const location = useLocation()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showOtpToast, setShowOtpToast] = useState(() => Boolean(location.state?.otpSent))

  const inputRefs = useRef([])

  // Clear the router state after showing the notification
  useEffect(() => {
    if (location.state?.otpSent) {
      navigate('/reset-password', {
        replace: true,
        state: {},
      })
    }
  }, [location.state, navigate])

  // Automatically hide the notification after 5 seconds
  useEffect(() => {
    if (!showOtpToast) return

    const timer = setTimeout(() => {
      setShowOtpToast(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [showOtpToast])

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)

    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    setError('')
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()

    const pastedCode = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

    if (!pastedCode) return

    const newOtp = ['', '', '', '', '', '']

    pastedCode.split('').forEach((digit, index) => {
      newOtp[index] = digit
    })

    setOtp(newOtp)

    const nextIndex = Math.min(pastedCode.length, 5)
    inputRefs.current[nextIndex]?.focus()

    setError('')
  }

  const handleVerify = async () => {
    const code = otp.join('')

    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (signIn.status === 'needs_new_password') {
        navigate('/set-new-password')
      } else {
        setError('Verification succeeded, but something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')

    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode()

      if (error) {
        setError(error.message)
        return
      }

      setShowOtpToast(true)
    } catch {
      setError('Unable to resend the code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full text-white">

        {/* OTP Sent Notification */}
        {showOtpToast && (
          <div className="fixed left-4 top-4 z-50 w-[calc(100%-2rem)] max-w-[408px] overflow-hidden rounded-md border border-[#D9D9D9] bg-white shadow-lg sm:left-10 sm:top-9">

            <div className="flex">

              {/* Green Accent */}
              <div className="w-1.5 shrink-0 bg-[#079A3D]" />

              <div className="flex flex-1 items-start px-5 py-5">

                {/* Success Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#B8E8C9] bg-[#EAF9EF]">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#079A3D]">
                    <span className="text-xs font-bold leading-none text-white">
                      ✓
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="ml-4 flex-1">
                  <p className="text-[16px] font-bold leading-5 text-[#172033]">
                    OTP sent to mail
                  </p>

                  <p className="mt-1 text-[15px] leading-6 text-[#526078]">
                    The OTP to reset your password has been sent to your email.
                  </p>
                </div>

                {/* Close */}
                <button type="button" onClick={() => setShowOtpToast(false)} className="ml-3 shrink-0 text-[28px] font-light leading-none text-black transition hover:opacity-60" aria-label="Close notification">
                  ×
                </button>

              </div>

            </div>

          </div>
        )}

        {/* Heading */}
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[36px]">
            Check Your Email
          </h1>

          <p className="mt-3 text-sm leading-5 text-white/80">
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
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              aria-label={`Reset password code digit ${index + 1}`}
              className="h-12 min-w-0 flex-1 rounded-md border border-white/20 bg-white text-center text-lg text-black outline-none transition focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00] sm:h-14"
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Verify Button */}
        <button type="button" onClick={handleVerify} disabled={isLoading} className="mt-7 h-12 w-full rounded-md bg-[#ff5a00] text-sm font-medium text-white transition hover:bg-[#e94f00] disabled:cursor-not-allowed disabled:opacity-60">
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>

        {/* Resend */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-white/80">
            Didn’t receive code?
          </span>

          <button type="button" onClick={handleResend} disabled={isResending} className="text-[#ff5a00] transition hover:underline disabled:cursor-not-allowed disabled:opacity-60">
            {isResending ? 'Sending...' : 'Resend'}
          </button>
        </div>

      </div>
    </AuthLayout>
  )
}

export default ResetPassword