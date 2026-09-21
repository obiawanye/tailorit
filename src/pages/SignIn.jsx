import { useSignIn } from '@clerk/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

import AuthLayout from '../components/AuthLayout'
import AuthModal from '../components/AuthModal'

function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
  })

  const isLoading = fetchStatus === 'fetching'

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

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const { error } = await signIn.password({
        emailAddress: email,
        password,
      })

      if (error) {
        console.error('Clerk sign-in error:', error)

        const errorCode =
          error?.code ||
          error?.errors?.[0]?.code ||
          ''

        if (
          errorCode === 'form_identifier_not_found' ||
          errorCode ===
            'form_identifier_not_found_for_instance'
        ) {
          openAuthModal(
            'Account not found',
            'We couldn’t find an account associated with this email.'
          )
        } else if (
          errorCode === 'form_password_incorrect'
        ) {
          openAuthModal(
            'Incorrect password',
            'The password you entered is incorrect. Please try again.'
          )
        } else {
          openAuthModal(
            'Unable to sign in',
            error.message ||
              'We were unable to sign you in. Please check your details and try again.'
          )
        }

        return
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(
                'Session task:',
                session.currentTask
              )
              return
            }

            const url = decorateUrl('/catalog')

            if (url.startsWith('http')) {
              window.location.href = url
            } else {
              navigate(url)
            }
          },
        })

        return
      }

      if (signIn.status === 'needs_client_trust') {
        openAuthModal(
          'Verification required',
          'This device needs to be verified before you can sign in.'
        )

        console.log(
          'Sign-in requires client trust:',
          signIn
        )

        return
      }

      if (signIn.status === 'needs_second_factor') {
        openAuthModal(
          'Additional verification required',
          'Additional verification is required to sign in.'
        )

        console.log(
          'Sign-in requires a second factor:',
          signIn
        )

        return
      }

      console.log(
        'Sign-in is not complete:',
        signIn
      )

      openAuthModal(
        'Unable to sign in',
        'Sign-in could not be completed. Please try again.'
      )
    } catch (error) {
      console.error(
        'Sign-in error:',
        error
      )

      openAuthModal(
        'Something went wrong',
        'We couldn’t complete your sign in. Please try again.'
      )
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)

    try {
      const { error } = await signIn.sso({
        strategy: 'oauth_google',
        redirectCallbackUrl: '/sso-callback',
        redirectUrl: '/catalog',
      })

      if (error) {
        console.error(
          'Google sign-in error:',
          JSON.stringify(error, null, 2)
        )

        openAuthModal(
          'Google sign-in failed',
          error.message ||
            'Unable to sign in with Google. Please try again.'
        )

        setGoogleLoading(false)
        return
      }

      if (signIn.status === 'complete') {
        console.log('Google sign-in complete')
      } else {
        console.log(
          'Google sign-in requires additional steps:',
          signIn.status
        )
      }
    } catch (error) {
      console.error(
        'Google sign-in exception:',
        JSON.stringify(error, null, 2)
      )

      openAuthModal(
        'Google sign-in failed',
        'Unable to sign in with Google. Please try again.'
      )

      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full text-black">
        {/* Heading */}
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[36px]">
            Welcome back
            <span className="block text-[#ff5a00]">
              Make it yours.
            </span>
          </h1>

          <p className="mt-2 text-sm leading-5 text-gray-500">
            Sign in to continue your Tailorit journey
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-normal text-black sm:text-sm"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00]"
            />

            {errors?.fields?.emailAddress && (
              <p className="mt-1 text-xs text-red-500">
                {errors.fields.emailAddress.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-normal text-black sm:text-sm"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 pr-11 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#ff5a00] focus:ring-1 focus:ring-[#ff5a00]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>
            </div>

            {errors?.fields?.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.fields.password.message}
              </p>
            )}
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer items-center gap-3 text-xs text-gray-500 sm:text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(
                    event.target.checked
                  )
                }
                className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-[#ff5a00]"
              />

              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-xs text-[#ff5a00] transition hover:underline sm:text-sm"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <div className="mt-3 h-12 w-full p-[2px]">
            <div className="relative h-full w-full border border-black">
              <button
                type="submit"
                disabled={isLoading}
                className="absolute inset-0 h-full w-full -translate-x-[4px] -translate-y-[4px] bg-[#ff5a00] text-sm font-medium text-white transition-transform duration-200 hover:translate-x-0 hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? 'Signing in...'
                  : 'SIGN IN'}
              </button>
            </div>
          </div>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-300" />

          <span className="text-xs text-gray-500 sm:text-sm">
            or
          </span>

          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || isLoading}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-transparent text-sm font-normal text-black transition hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FcGoogle size={20} />

          {googleLoading
            ? 'Connecting to Google...'
            : 'Continue with Google'}
        </button>

        {/* Sign Up */}
        <p className="mt-5 text-center text-xs text-gray-500 sm:text-sm">
          Don’t have an account?{' '}
          <Link
            to="/sign-up"
            className="text-[#ff5a00] transition hover:underline"
          >
            Sign up
          </Link>
        </p>
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

export default SignIn