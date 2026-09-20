import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useClerk, useUser } from '@clerk/react'
import {
  FiSettings,
  FiLogOut,
} from 'react-icons/fi'

const profilePlaceholder =
  '/assets/profile-placeholder.jpeg'

export default function ProfileMenu() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const [isOpen, setIsOpen] = useState(false)

  const menuRef = useRef(null)

  const profileImage =
    user?.imageUrl || profilePlaceholder

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )
    }
  }, [])

  const handleLogout = () => {
    signOut({
      redirectUrl: '/',
    })
  }

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
    >
      {/* PROFILE BUTTON */}
      <button
        type="button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        className="block overflow-hidden rounded-full"
      >
        <img
          src={profileImage}
          alt="Profile"
          className="h-10 w-10 rounded-full border border-[#dddddd] object-cover transition hover:opacity-80"
        />
      </button>

      {/* PROFILE DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 top-[52px] z-[200] w-[320px] overflow-hidden rounded-[16px] border border-[#cccccc] bg-white shadow-[0_8px_25px_rgba(0,0,0,0.15)]">

          {/* PROFILE INFO */}
          <div className="flex items-center gap-4 px-5 py-5">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#32f000]">
              <img
                src={profileImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">

              <p className="truncate text-[18px] font-semibold">
                {user?.fullName ||
                  user?.firstName ||
                  'User'}
              </p>

              <p className="truncate text-[13px] text-gray-500">
                {user?.primaryEmailAddress
                  ?.emailAddress ||
                  user?.emailAddresses?.[0]
                    ?.emailAddress ||
                  ''}
              </p>

            </div>
          </div>

          <div className="border-t border-[#dddddd]" />

          {/* MY ORDERS */}
          <Link
            to="/my-orders"
            onClick={() => setIsOpen(false)}
            className="block px-5 py-4 text-[17px] font-medium transition hover:bg-[#f5f5f5] hover:text-[#ff5a00]"
          >
            My Orders
          </Link>

          {/* SETTINGS */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
            }}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-[17px] font-medium transition hover:bg-[#f5f5f5] hover:text-[#ff5a00]"
          >
            <span>Settings</span>

            <FiSettings className="h-5 w-5" />
          </button>

          <div className="border-t border-[#dddddd]" />

          {/* LOG OUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-[17px] font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
          >
            <span>Log Out</span>

            <FiLogOut className="h-5 w-5" />
          </button>

        </div>
      )}
    </div>
  )
}