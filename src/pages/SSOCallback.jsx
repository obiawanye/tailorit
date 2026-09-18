import { AuthenticateWithRedirectCallback } from '@clerk/react'

function SSOCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">
        Signing you in...
      </p>

      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/catalog"
        signUpForceRedirectUrl="/catalog"
      />
    </div>
  )
}

export default SSOCallback