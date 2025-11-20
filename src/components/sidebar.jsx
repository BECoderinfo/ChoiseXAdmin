import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Eye,
  ShoppingCart,
  Users,
  CreditCard,
  LogOut,
} from "lucide-react";
import "./styles/Sidebar.css";
import logo from '../assets/mainlogo.png'

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/add-category", label: "Add Category", icon: <PlusCircle size={18} /> },
    { path: "/add-product", label: "Add Product", icon: <Package size={18} /> },
    { path: "/view-products", label: "View Products", icon: <Eye size={18} /> },
    { path: "/view-orders", label: "View Orders", icon: <ShoppingCart size={18} /> },
    { path: "/view-users", label: "View Users", icon: <Users size={18} /> },
    { path: "/payment-history", label: "Payment History", icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          <div className="logo-wrapper">
            <img src={logo} alt="Brand Logo" className="logo-img" />
          </div>
        </div>
      </div>




      <div className="sidebar-menu">
        <div className="menu-section">
          <ul className="menu-list">
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                <Link to={item.path} className="menu-link">
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                  <span className="active-indicator"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
