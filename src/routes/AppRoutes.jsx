import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import AddCategory from "../pages/AddCategory";
import AddProduct from "../pages/AddProduct";
import ViewOrders from "../pages/ViewOrders";
import ViewUsers from "../pages/ViewUsers";
import PaymentHistory from "../pages/PaymentHistory";
import ViewProducts from "../pages/ViewProducts";
import ScrollToTop from "../ScrollToTop";
import Login from "../authentication/Login";
import ForgotPassword from "../authentication/ForgotPassword";
import SetPassword from "../authentication/SetPassword";
import Protected from "../authentication/Protected";

export default function AppRoutes() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <Protected>
      <Layout />
    </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="view-products" element={<ViewProducts />} />
          <Route path="view-orders" element={<ViewOrders />} />
          <Route path="view-users" element={<ViewUsers />} />
          <Route path="payment-history" element={<PaymentHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}
