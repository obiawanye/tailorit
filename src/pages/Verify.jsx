import { useRef, useState } from 'react'
import { useSignUp } from '@clerk/react'
import { useNavigate } from 'react-router'

import AuthLayout from '../components/AuthLayout'

function Verify() {
  const { signUp } = useSignUp()
  const navigate = useNavigate()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const inputRefs = useRef([])

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
      const { error } = await signUp.verifications.verifyEmailCode({
        code,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (signUp.status === 'complete') {
        await signUp.finalize()
        navigate('/catalog')
      } else {
        setError('Verification succeeded, but your account still requires additional information.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full">

        {/* Heading */}
        <div>
          <h1 className="font-libre text-[32px] font-bold text-[#000000]">
            Check Your Email
          </h1>

          <p className="mt-3 text-sm  text-[#000000]">
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
              aria-label={`Verification code digit ${index + 1}`}
              className="h-12 min-w-0 flex-1 rounded-md border border-[#808080] border-[2px] bg-white text-center text-lg text-black outline-none transition focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00] sm:h-14"
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
        <button type="button" onClick={handleVerify} disabled={isLoading} className="mt-[32px] h-[56px] w-full rounded-md bg-[#ff5a00] text-sm font-medium text-white transition hover:bg-[#e94f00] disabled:cursor-not-allowed disabled:opacity-60">
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>

        {/* Resend */}
        <div className="mt-[32px] flex items-center justify-between text-sm">
          <span className="text-[#808080]">
            Didn't receive code?
          </span>

          <button type="button" className="text-[#ff5a00] text-[18px] transition hover:underline">
            Resend
          </button>
        </div>

      </div>
    </AuthLayout>
  )
}

export default Verify