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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Provider store={store}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product" element={<ProductsPage />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={< Cart/>} />
          {/* <Route path="/product" element={<Products />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/*" element={<PageNotFound />} /> */}
        </Routes>
        </Provider>
      </ScrollToTop>
     </BrowserRouter>
  )
}

export default App
