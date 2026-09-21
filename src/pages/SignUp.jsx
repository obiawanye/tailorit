import { useSignUp } from '@clerk/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

import SignAuthLayout from '../components/SignAuthLayout'

function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')

  const passwordRequirements = {
    minLength: password.length >= 8,
    upperAndLower:
      /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const passwordRequirementsMet =
    passwordRequirements.minLength &&
    passwordRequirements.upperAndLower &&
    passwordRequirements.number &&
    passwordRequirements.special

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!passwordRequirementsMet) {
      setErrorMessage('Please meet all password requirements.')
      return
    }

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
    <SignAuthLayout>
      <div className="w-full ">
        {/* Heading */}
        <div>
          <h1 className="font-libre text-[30px] text-[#000000] font-medium sm:text-[34px]">
            Get started with
            <span className="block text-[#ff5a00]">
              Making it yours.
            </span>
          </h1>

          <p className="mt-3 text-sm leading-5 text-[#000000]">
            Create your account to start your journey now
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-normal text-[#000000] sm:text-sm"
            >
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
              className="h-11 w-full rounded-md border border-white/10 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00]"
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
              className="mb-1.5 block text-xs font-normal text-[#000000] sm:text-sm"
            >
              Set Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onPaste={(event) => event.preventDefault()}
                onCopy={(event) => event.preventDefault()}
                onCut={(event) => event.preventDefault()}
                placeholder="Enter your password"
                required
                autoComplete="new-password"
                className="h-11 w-full rounded-md border border-white/10 bg-white px-3 pr-11 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00]"
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
              className="mb-1.5 block text-xs font-normal text-[#000000] sm:text-sm"
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
                onPaste={(event) => event.preventDefault()}
                onCopy={(event) => event.preventDefault()}
                onCut={(event) => event.preventDefault()}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                className="h-11 w-full rounded-md border border-white/10 bg-white px-3 pr-11 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00]"
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

          {/* Password Requirements */}
          <div className="space-y-1">
            <p className="text-sm text-[#8F8F8F]">
              Your password must contain:
            </p>

            {/* Minimum 8 characters */}
            <div className="flex items-center gap-3">
              <span
                className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[3px] border ${
                  passwordRequirements.minLength
                    ? 'border-[#ff5a00] bg-[#ff5a00]'
                    : 'border-[#8F8F8F] bg-transparent'
                }`}
              >
                {passwordRequirements.minLength && (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M4 10.5L8 14L16 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <span className="text-sm text-[#8F8F8F]">
                Minimum of 8 characters
              </span>
            </div>

            {/* Upper and lower case */}
            <div className="flex items-center gap-3">
              <span
                className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[3px] border ${
                  passwordRequirements.upperAndLower
                    ? 'border-[#ff5a00] bg-[#ff5a00]'
                    : 'border-[#8F8F8F] bg-transparent'
                }`}
              >
                {passwordRequirements.upperAndLower && (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M4 10.5L8 14L16 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <span className="text-sm text-[#8F8F8F]">
                Combination of upper and lower case letters
              </span>
            </div>

            {/* Number */}
            <div className="flex items-center gap-3">
              <span
                className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[3px] border ${
                  passwordRequirements.number
                    ? 'border-[#ff5a00] bg-[#ff5a00]'
                    : 'border-[#8F8F8F] bg-transparent'
                }`}
              >
                {passwordRequirements.number && (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M4 10.5L8 14L16 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <span className="text-sm text-[#8F8F8F]">
                At least one number
              </span>
            </div>

            {/* Special character */}
            <div className="flex items-center gap-3">
              <span
                className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[3px] border ${
                  passwordRequirements.special
                    ? 'border-[#ff5a00] bg-[#ff5a00]'
                    : 'border-[#8F8F8F] bg-transparent'
                }`}
              >
                {passwordRequirements.special && (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M4 10.5L8 14L16 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <span className="text-sm text-[#8F8F8F]">
                At least one special character (e.g. *, $, !)
              </span>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <p className="text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          {/* Sign Up */}
          <div className="mt-1 h-12 w-full  p-[2px]">
            <div className="relative h-full w-full border border-black">
              <button
                type="submit"
                disabled={isLoading}
                className="absolute inset-0 h-full w-full -translate-x-[4px] -translate-y-[4px] bg-[#ff5a00] text-sm font-medium text-white transition-transform duration-200 hover:translate-x-0 hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Creating account...' : 'SIGN UP'}
              </button>
            </div>
          </div>
        </form>

        {/* Divider */}
        <div className="my-3 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#AFADAC]" />

          <span className="text-xs text-[#AFADAC] sm:text-sm">
            or
          </span>

          <div className="h-px flex-1 bg-[#AFADAC]" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#8F8F8F] bg-transparent text-sm font-normal text-[#000000] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </button>

        {/* Login */}
        <p className="mt-3 text-center text-xs text-[#7D7F81] sm:text-sm">
          Already have an account?{' '}
          <Link
            to="/sign-in"
            className="text-[#ff5a00] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </SignAuthLayout>
  )
}

export default SignUp