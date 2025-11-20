import { useState } from "react";
import "./styles/ViewOrders.css";
import {
  Package,
  IndianRupee,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Eye,
  Filter,
  Download,
  User,
  ShoppingCart,
  PackagePlus,
} from "lucide-react";

export default function ViewOrders() {
  const [orders] = useState([
    {
      id: 1,
      user: "Ravi Kumar",
      product: "Pressure Sensing Fish Vibrator",
      price: "2499",
      status: "Delivered",
      orderDate: "2025-11-10",
      deliveryDate: "2025-11-12",
      address: "Mumbai, Maharashtra",
      quantity: 1,
    },
    {
      id: 2,
      user: "Meena Shah",
      product: "Masturbator Cup",
      price: "1999",
      status: "Pending",
      orderDate: "2025-11-11",
      deliveryDate: "2025-11-13",
      address: "Delhi, India",
      quantity: 2,
    },
    {
      id: 3,
      user: "Priya Singh",
      product: "Premium Vibrator",
      price: "3299",
      status: "Shipped",
      orderDate: "2025-11-09",
      deliveryDate: "2025-11-11",
      address: "Bangalore, Karnataka",
      quantity: 1,
    },
    {
      id: 4,
      user: "Amit Verma",
      product: "Massage Oil Set",
      price: "899",
      status: "Cancelled",
      orderDate: "2025-11-08",
      deliveryDate: "2025-11-10",
      address: "Chennai, Tamil Nadu",
      quantity: 3,
    },
  ]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      Delivered: { class: "view-orders-status-delivered", icon: <CheckCircle size={14} />, label: "Delivered" },
      Pending: { class: "view-orders-status-pending", icon: <Clock size={14} />, label: "Pending" },
      Shipped: { class: "view-orders-status-shipped", icon: <Truck size={14} />, label: "Shipped" },
      Cancelled: { class: "view-orders-status-cancelled", icon: <XCircle size={14} />, label: "Cancelled" },
    };
    return statusConfig[status] || statusConfig["Pending"];
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseInt(order.price),
    0
  );
  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  return (
    <div className="view-orders-container">
  
      <div className="add-product-header">
        <div className="add-product-icon">
          <ShoppingCart size={40} strokeWidth={1.8} />
        </div>
        <h1 className="add-product-title">View Orders</h1>
        <p className="add-product-subtitle">
        Manage and track all orders efficiently.
        </p>
      </div>

      {/* Order Stats */}
      <div className="view-orders-stats-grid">
        <div className="view-orders-stat-card">
          <div className="view-orders-stat-content">
            <div className="view-orders-stat-icon">
            <ShoppingCart size={26} className="view-orders-stat-icon-icon" />
              </div>
            <div className="view-orders-stat-info">
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
          </div>
        </div>

        <div className="view-orders-stat-card">
          <div className="view-orders-stat-content">
          <div className="view-orders-stat-icon">
            <IndianRupee size={26} className="view-orders-stat-icon-icon" />
            </div>
            <div className="view-orders-stat-info">
              <h3>₹{totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="view-orders-stat-card">
          <div className="view-orders-stat-content">
          <div className="view-orders-stat-icon">
            <CheckCircle size={26} className="view-orders-stat-icon-icon" />
            </div>
            <div className="view-orders-stat-info">
              <h3>{deliveredOrders}</h3>
              <p>Delivered Orders</p>
            </div>
          </div>
        </div>

        <div className="view-orders-stat-card">
          <div className="view-orders-stat-content">
          <div className="view-orders-stat-icon">
            <Clock size={26} className="view-orders-stat-icon-icon" />
            </div>
            <div className="view-orders-stat-info">
              <h3>{orders.filter((o) => o.status === "Pending").length}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="view-orders-table-container">
        <div className="view-orders-table-header">
          <h3 className="view-orders-table-title">Recent Orders</h3>
          <div className="view-orders-table-actions">
            <button className="view-orders-secondary-btn">
              <Download size={14} style={{ marginRight: "6px" }} /> Export
            </button>
            <button className="view-orders-secondary-btn">
              <Filter size={14} style={{ marginRight: "6px" }} /> Filter
            </button>
          </div>
        </div>

        <div className="view-orders-table-responsive">
          <table className="view-orders-data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Order Date</th>
                <th>Status</th>
  
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>#ORD-{order.id.toString().padStart(4, "0")}</strong>
                    </td>
                    <td>
                      <div className="view-orders-user-info">
                        <div className="view-orders-user-avatar">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="view-orders-user-name">{order.user}</div>
                          <div className="view-orders-user-address">{order.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="view-orders-product-name">{order.product}</td>
                    <td>
                      <span className="view-orders-quantity-badge">{order.quantity}</span>
                    </td>
                    <td>
                      <strong className="view-orders-price">₹{order.price}</strong>
                    </td>
                    <td>{order.orderDate}</td>
                    <td>
                      <span className={`view-orders-status-badge ${statusInfo.class}`}>
                        {statusInfo.icon}{statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="view-orders-empty-state">
            <p className="view-orders-empty-text">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
