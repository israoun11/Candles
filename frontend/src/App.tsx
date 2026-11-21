import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AboutPage from './pages/AboutPage';
import AdminApp from './pages/admin/AdminApp';
import Checkout from './pages/Checkout';
import CollectionPage from './pages/CollectionPage';
import Collections from './pages/Collections';
import Contact from './pages/Contact';
import Home from './pages/Home';
import OrderConfirmation from './pages/OrderConfirmation';
import NotFound from './pages/NotFound';
import ProductPage from './pages/ProductPage';

export default function App() {
  return (
    <Routes>
      <Route path="admin/*" element={<AdminApp />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="collections" element={<Collections />} />
        <Route path="collections/:slug" element={<CollectionPage />} />
        <Route path="products/:slug" element={<ProductPage />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:number" element={<OrderConfirmation />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
