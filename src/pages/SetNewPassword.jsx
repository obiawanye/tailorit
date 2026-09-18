import { useState } from 'react'
import { useSignIn } from '@clerk/react'
import { useNavigate } from 'react-router'
import { FiCheck, FiEye, FiEyeOff } from 'react-icons/fi'

import AuthLayout from '../components/AuthLayout'

function SetNewPassword() {
  const { signIn } = useSignIn()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const passwordRules = {
    length: password.length >= 8,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[*\\,$]/.test(password),
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!passwordRules.length) {
      setError('Your password must contain at least 8 characters.')
      return
    }

    if (!passwordRules.case) {
      setError('Your password must contain both uppercase and lowercase letters.')
      return
    }

    if (!passwordRules.number) {
      setError('Your password must contain at least one number.')
      return
    }

    if (!passwordRules.special) {
      setError('Your password must contain at least one special character.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (signIn.status === 'complete') {
        setShowSuccessModal(true)
      } else {
        setError('Your password could not be reset. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full text-white">

        {/* Heading */}
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[36px]">
            Create New Password
          </h1>

          <p className="mt-3 text-sm leading-5 text-white/80">
            Create your new unique password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6">

          {/* New Password */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-white/80">
              New Password
            </label>

            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="Enter your new password" autoComplete="new-password" required className="h-12 w-full rounded-md border border-[#D2D2D2] bg-white px-3 pr-11 text-sm text-black outline-none transition placeholder:text-[#8F8F8F] focus:border-[#FD5C02] focus:ring-1 focus:ring-[#FD5C02]" />

              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F8F8F] hover:text-[#555]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mt-3">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm text-white/80">
              Confirm Password
            </label>

            <div className="relative">
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError('') }} placeholder="Confirm your new password" autoComplete="new-password" required className="h-12 w-full rounded-md border border-[#D2D2D2] bg-white px-3 pr-11 text-sm text-black outline-none transition placeholder:text-[#8F8F8F] focus:border-[#FD5C02] focus:ring-1 focus:ring-[#FD5C02]" />

              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F8F8F] hover:text-[#555]" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="mt-6">
            <p className="text-sm text-white/80">
              Your password must contain:
            </p>

            <div className="mt-2 space-y-2">

              {/* Minimum 8 Characters */}
              <div className="flex items-center gap-3">
                <span className={`h-5 w-5 rounded border ${passwordRules.length ? 'border-[#FD5C02] bg-[#FD5C02]' : 'border-white/70'}`}>
                  {passwordRules.length && <FiCheck className="h-full w-full p-0.5 text-white" />}
                </span>

                <span className="text-sm text-white/70">
                  Minimum of 8 characters
                </span>
              </div>

              {/* Upper + Lower Case */}
              <div className="flex items-center gap-3">
                <span className={`h-5 w-5 rounded border ${passwordRules.case ? 'border-[#FD5C02] bg-[#FD5C02]' : 'border-white/70'}`}>
                  {passwordRules.case && <FiCheck className="h-full w-full p-0.5 text-white" />}
                </span>

                <span className="text-sm text-white/70">
                  Combination of upper and lower case letters
                </span>
              </div>

              {/* Number */}
              <div className="flex items-center gap-3">
                <span className={`h-5 w-5 rounded border ${passwordRules.number ? 'border-[#FD5C02] bg-[#FD5C02]' : 'border-white/70'}`}>
                  {passwordRules.number && <FiCheck className="h-full w-full p-0.5 text-white" />}
                </span>

                <span className="text-sm text-white/70">
                  Atleast one number
                </span>
              </div>

              {/* Special Character */}
              <div className="flex items-center gap-3">
                <span className={`h-5 w-5 rounded border ${passwordRules.special ? 'border-[#FD5C02] bg-[#FD5C02]' : 'border-white/70'}`}>
                  {passwordRules.special && <FiCheck className="h-full w-full p-0.5 text-white" />}
                </span>

                <span className="text-sm text-white/70">
                  Atleast one special character (e.g *, \, $)
                </span>
              </div>

            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Reset Password */}
          <button type="submit" disabled={isLoading} className="mt-7 h-12 w-full rounded-md bg-[#ff5a00] text-sm font-medium text-white transition hover:bg-[#e94f00] disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>

        </form>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

            <div className="w-full max-w-[830px] rounded-lg bg-white px-8 py-14 text-center sm:px-12 sm:py-16">

              {/* Success Icon */}
              <div className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#2EAD45]">
                <FiCheck className="h-16 w-16 text-white" strokeWidth={3} />
              </div>

              {/* Heading */}
              <h2 className="mt-12 text-[42px] font-bold leading-tight text-black sm:text-[52px]">
                Successful
              </h2>

              {/* Description */}
              <p className="mt-5 text-[20px] text-[#666666] sm:text-[24px]">
                Your password has successfully been reset
              </p>

              {/* Continue */}
              <button type="button" onClick={() => navigate('/sign-in')} className="mt-16 h-[64px] w-full rounded-lg bg-[#ff5a00] text-[20px] font-medium text-white transition hover:bg-[#e94f00]">
                Continue
              </button>

            </div>

          </div>
        )}

      </div>
    </AuthLayout>
  )
}

export default SetNewPassword