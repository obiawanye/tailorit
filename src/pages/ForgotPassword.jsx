import { useState } from 'react'
import { useSignIn } from '@clerk/react'
import { Link, useNavigate } from 'react-router'
import { FiArrowLeft } from 'react-icons/fi'

import AuthLayout from '../components/AuthLayout'

export default function ForgotPassword() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const isLoading = fetchStatus === 'fetching'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const { error: createError } = await signIn.create({
      identifier: email,
    })

    if (createError) {
      console.error('Forgot password error:', createError)
      setError(createError.message || 'Unable to find an account with that email.')
      return
    }

    const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode()

    if (sendCodeError) {
      console.error('Reset password error:', sendCodeError)
      setError(sendCodeError.message || 'Unable to send the reset code.')
      return
    }

    navigate('/reset-password', { state: { otpSent: true } })
  }

  return (
    <AuthLayout>
      <div className="w-full text-white">

        {/* Heading */}
        <div>
          <h1 className="font-serif text-[32px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[36px]">
            Forgot Your Password?
          </h1>

          <p className="mt-3 text-sm leading-5 text-[#E1E1E1]">
            Don't worry, it happens! Please enter your registered email
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-9">

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-normal text-white">
              Email address
            </label>

            <input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" className="h-12 w-full rounded-md border border-[#D2D2D2] bg-white px-3 text-sm text-black outline-none transition placeholder:text-[#8F8F8F] focus:border-[#FD5C02] focus:ring-1 focus:ring-[#FD5C02]" />

            {errors?.fields?.identifier && (
              <p className="mt-1 text-xs text-red-400">
                {errors.fields.identifier.message}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Send Reset Link */}
          <button type="submit" disabled={isLoading} className="mt-7 h-14 w-full rounded-md bg-[#FD5C02] text-sm font-medium text-white transition hover:bg-[#E04B02] disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {/* Back to Login */}
        <Link to="/sign-in" className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-md border border-[#D2D2D2] text-sm font-medium text-[#E1E1E1] transition hover:bg-white/10 hover:text-white">
          <FiArrowLeft className="h-4 w-4" />
          Back to log in
        </Link>

      </div>
    </AuthLayout>
  )
}