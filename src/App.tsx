import './App.css'
import Home from './pages/Home'
import "../node_modules/font-awesome/css/font-awesome.min.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes } from 'react-router';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductsPage from './pages/ProductsPage';
import PageNotFound from './pages/PageNotFound';
import ScrollToTop from './components/scrollToTop';
import Product from './pages/Product';
import { Provider } from "react-redux";
import store from "./redux/store";
import Cart from './pages/Cart';
import { Toaster } from "react-hot-toast";
import { useCartSync } from "./hooks/useCartSync";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Component to handle cart sync
const CartSyncWrapper = () => {
  useCartSync();
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Provider store={store}>
        <CartSyncWrapper />
        <Routes>
          {/* Public Routes - Only accessible when NOT logged in */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* Protected Routes - Only accessible when logged in */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/product" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><Product /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          
          {/* 404 Page */}
          <Route path="*" element={<ProtectedRoute><PageNotFound /></ProtectedRoute>} />
        </Routes>
        <Toaster />
        </Provider>
      </ScrollToTop>
     </BrowserRouter>
  )
}

export default App
