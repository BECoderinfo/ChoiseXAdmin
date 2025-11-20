import { useState } from "react";
import {
  CreditCard,
  IndianRupee,
  CheckCircle,
  TrendingUp,
  RotateCcw,
  Download,
  CalendarDays,
  Eye,
  FileText,
  Wallet,
  Banknote,
} from "lucide-react";
import "./styles/PaymentHistory.css";

export default function PaymentHistory() {
  const [payments] = useState([
    {
      id: 1,
      user: "Ravi Kumar",
      amount: "2499",
      method: "UPI",
      date: "2025-11-10",
      time: "14:30",
      status: "Completed",
      orderId: "ORD-0012",
      transactionId: "TXN789456123",
    },
    {
      id: 2,
      user: "Neha Shah",
      amount: "1999",
      method: "Credit Card",
      date: "2025-11-11",
      time: "10:15",
      status: "Completed",
      orderId: "ORD-0013",
      transactionId: "TXN789456124",
    },
    {
      id: 3,
      user: "Amit Verma",
      amount: "3299",
      method: "Debit Card",
      date: "2025-11-09",
      time: "16:45",
      status: "Failed",
      orderId: "ORD-0011",
      transactionId: "TXN789456125",
    },
    {
      id: 4,
      user: "Priya Singh",
      amount: "899",
      method: "Wallet",
      date: "2025-11-08",
      time: "11:20",
      status: "Refunded",
      orderId: "ORD-0010",
      transactionId: "TXN789456126",
    },
    {
      id: 5,
      user: "Sneha Reddy",
      amount: "1599",
      method: "Net Banking",
      date: "2025-11-07",
      time: "19:30",
      status: "Completed",
      orderId: "ORD-0009",
      transactionId: "TXN789456127",
    },
  ]);

  const totalRevenue = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + parseInt(p.amount), 0);
  const successfulPayments = payments.filter((p) => p.status === "Completed").length;

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "payment-history-status-completed";
      case "Failed":
        return "payment-history-status-failed";
      case "Refunded":
        return "payment-history-status-refunded";
      default:
        return "payment-history-status-pending";
    }
  };

  const getMethodIcon = (method) => {
    if (method === "UPI") return <Wallet size={16} />;
    if (method.includes("Card")) return <CreditCard size={16} />;
    if (method === "Net Banking") return <Banknote size={16} />;
    return <CreditCard size={16} />;
  };

  return (
    <div className="payment-history-container">

      <div className="add-product-header">
        <div className="add-product-icon">
          <CreditCard size={40} strokeWidth={1.8} />
        </div>
        <h1 className="add-product-title">View Payment History</h1>
        <p className="add-product-subtitle">
        Track all payment transactions and revenue in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="payment-history-stats-grid">
        <div className="payment-history-stat-card">
          <div className="payment-history-stat-content">
            <IndianRupee size={24} className="view-orders-stat-icon-icon" />
            <div className="payment-history-stat-info">
              <h3>₹{totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="payment-history-stat-card">
          <div className="payment-history-stat-content">
            <CheckCircle size={24} className="view-orders-stat-icon-icon"/>
            <div className="payment-history-stat-info">
              <h3>{successfulPayments}</h3>
              <p>Successful Payments</p>
            </div>
          </div>
        </div>

        <div className="payment-history-stat-card">
          <div className="payment-history-stat-content">
            <TrendingUp size={24} className="view-orders-stat-icon-icon"/>
            <div className="payment-history-stat-info">
              <h3>{payments.length}</h3>
              <p>Total Transactions</p>
            </div>
          </div>
        </div>

        <div className="payment-history-stat-card">
          <div className="payment-history-stat-content">
            <RotateCcw size={24} className="view-orders-stat-icon-icon"/>
            <div className="payment-history-stat-info">
              <h3>{payments.filter((p) => p.status === "Refunded").length}</h3>
              <p>Refunded Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Methods */}
      <div className="payment-history-summary-cards">
        <div className="payment-history-summary-card">
          <h4>Payment Methods</h4>
          <div className="payment-history-method-stats">
            <div className="payment-history-method-stat">
              <Wallet size={18} />
              <span>UPI: {payments.filter((p) => p.method === "UPI").length}</span>
            </div>
            <div className="payment-history-method-stat">
              <CreditCard size={18} />
              <span>
                Cards: {payments.filter((p) => p.method.includes("Card")).length}
              </span>
            </div>
            <div className="payment-history-method-stat">
              <Banknote size={18} />
              <span>
                Net Banking: {payments.filter((p) => p.method === "Net Banking").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="payment-history-table-container">
        <div className="payment-history-table-header">
          <h3 className="payment-history-table-title">Transaction History</h3>
          <div className="payment-history-table-actions">
            <button className="payment-history-secondary-btn">
              <Download size={14} style={{ marginRight: "6px" }} /> Export CSV
            </button>
            <button className="payment-history-secondary-btn">
              <CalendarDays size={14} style={{ marginRight: "6px" }} /> Filter by Date
            </button>
          </div>
        </div>

        <div className="payment-history-table-responsive">
          <table className="payment-history-data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <code className="payment-history-transaction-id">
                      {p.transactionId}
                    </code>
                  </td>
                  <td>
                    <div className="payment-history-user-info">
                      <div className="payment-history-user-avatar">
                        {p.user.charAt(0)}
                      </div>
                      <div className="payment-history-user-name">{p.user}</div>
                    </div>
                  </td>
                  <td>
                    <strong className="payment-history-order-id">{p.orderId}</strong>
                  </td>
                  <td>
                    <div className="payment-history-amount-cell">
                      <div className="payment-history-amount">₹{p.amount}</div>
                      {p.status === "Refunded" && (
                        <div className="payment-history-refund-badge">Refunded</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="payment-history-payment-method">
                      {getMethodIcon(p.method)} {p.method}
                    </div>
                  </td>
                  <td>
                    <div className="payment-history-datetime-cell">
                      <div className="payment-history-date">{p.date}</div>
                      <div className="payment-history-time">{p.time}</div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`payment-history-status-badge ${getStatusClass(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <div className="payment-history-empty-state">
            <p className="payment-history-empty-text">No payment records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
