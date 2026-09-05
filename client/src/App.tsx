import { Routes, Route } from "react-router"
import MainLayout from "./layouts/MainLayout"
import Home from "./pages/Home"
import Shop from "./pages/Shop"
import ProductDetails from "./pages/ProductDetails"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Orders from "./pages/Orders"
import NotFound from "./pages/NotFound"
import Wishlist from "./pages/Wishlist"
import CheckoutPayment from "./pages/CheckoutPayment"
import OrderConfirmation from "./pages/OrderConfirmation"
import OrderDetails from "./pages/OrderDetails"

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/checkout/payment" element={<CheckoutPayment />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App