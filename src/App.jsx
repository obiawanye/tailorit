import { Routes, Route } from 'react-router'
import Welcome from './pages/Welcome'
import SSOCallback from './pages/SSOCallback'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Catalog from './pages/Catalog'
import Verify from './pages/Verify'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SetNewPassword from './pages/SetNewPassword'
import ProductCustomization from './pages/ProductCustomization'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import MyOrders from './pages/MyOrders'
import UserSync from './components/UserSync'

function App() {
  return (
    <>
      <UserSync />
      
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
        <Route path="/product/:productId" element={<ProductCustomization />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
      </Routes>
    </>
  )
}

export default App