import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AnnouncementBar from "./components/AnnouncementBar.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import BookingSuccess from "./pages/BookingSuccess.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-maroon focus:px-4 focus:py-2 focus:text-cream">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <ScrollManager />
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/shop" element={<Navigate to="/products" replace />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Navigate to="/cart" replace />} />
          <Route path="/booking-success/:bookingReference" element={<BookingSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
