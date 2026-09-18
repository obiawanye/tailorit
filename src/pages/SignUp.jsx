import { useSignUp } from '@clerk/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

import AuthLayout from '../components/AuthLayout'

function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
      })

      if (error) {
        console.error(error)
        setErrorMessage(
          error.message || 'Unable to create your account.'
        )
        return
      }

      const { error: verificationError } =
        await signUp.verifications.sendEmailCode()

      if (verificationError) {
        console.error(verificationError)
        setErrorMessage(
          verificationError.message ||
            'Unable to send the verification code.'
        )
        return
      }

      navigate('/verify')
    } catch (error) {
      console.error(error)
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  const handleGoogleSignUp = async () => {
    setErrorMessage('')

    try {
      const { error } = await signUp.sso({
        strategy: 'oauth_google',
        redirectCallbackUrl: '/sso-callback',
        redirectUrl: '/catalog',
      })

      if (error) {
        console.error(error)
        setErrorMessage(
          error.message || 'Unable to continue with Google.'
        )
      }
    } catch (error) {
      console.error(error)
      setErrorMessage('Unable to continue with Google.')
    }
  }

  const isLoading = fetchStatus === 'fetching'

  return (
    <AuthLayout>
      <div className="w-full text-white">

        {/* Heading */}
        <div>
          <h1 className=" font-serif text-[32px] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[36px]">
            Get started with
            <span className="block text-[#ff5a00]">
              Making it yours.
            </span>
          </h1>

          <p className="mt-4 text-sm leading-5 text-white/80">
            Create your account to start your journey now
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-9 space-y-4"
        >

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-normal text-white sm:text-sm">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="h-12 w-full rounded-md border border-white/10 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00]"
            />

            {errors?.fields?.emailAddress && (
              <p className="mt-1 text-xs text-red-400">
                {errors.fields.emailAddress.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-normal text-white sm:text-sm"
            >
              Set Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                autoComplete="new-password"
                className="h-12 w-full rounded-md border border-white/10 bg-white px-3 pr-11 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700"
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {errors?.fields?.password && (
              <p className="mt-1 text-xs text-red-400">
                {errors.fields.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-xs font-normal text-white sm:text-sm"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                className="h-12 w-full rounded-md border border-white/10 bg-white px-3 pr-11 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700"
                aria-label={
                  showConfirmPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showConfirmPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <p className="text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          {/* Sign Up */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 h-14 w-full rounded-md bg-[#ff5a00] text-sm font-medium text-white transition hover:bg-[#e95000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? 'Creating account...'
              : 'Sign up'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/70" />

          <span className="text-xs text-white sm:text-sm">
            or
          </span>

          <div className="h-px flex-1 bg-white/70" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-md border border-white/70 bg-transparent text-sm font-normal text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </button>

        {/* Login */}
        <p
          className=" mt-5 text-center text-xs text-white sm:text-sm"
        >
          Already have an account?{' '}
          <Link
            to="/sign-in"
            className="text-[#ff5a00] hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </AuthLayout>
  )
}

export default SignUp