import { useEffect, useMemo, useState } from "react";
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
import { fetchOrders } from "../api/order";
import { useSnackbar } from "notistack";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchOrders();
        if (res?.success) {
          const orders = res.data || [];
          const flattened = [];

          orders.forEach((order) => {
            const customerName = order.user?.name || order.address?.name || "Customer";
            const list = Array.isArray(order.paymentHistory)
              ? order.paymentHistory
              : [];

            if (list.length > 0) {
              list.forEach((p, idx) => {
                flattened.push({
                  id: `${order.orderId}-${idx}`,
                  user: customerName,
                  amount: Number(p.amount || order.totalAmount || 0),
                  method: p.provider || order.paymentMethod || "N/A",
                  status: p.status || order.paymentStatus || "Pending",
                  orderId: order.orderId,
                  transactionId: p.txnId || order.razorpayPaymentId || "N/A",
                  createdAt: p.createdAt || order.createdAt,
                });
              });
              return;
            }

            flattened.push({
              id: `${order.orderId}-fallback`,
              user: customerName,
              amount: Number(order.totalAmount || 0),
              method: order.paymentMethod || "N/A",
              status: order.paymentStatus || "Pending",
              orderId: order.orderId,
              transactionId: order.razorpayPaymentId || order.razorpayOrderId || "N/A",
              createdAt: order.createdAt,
            });
          });

          setPayments(flattened);
        }
      } catch (err) {
        enqueueSnackbar(err.message || "Failed to load payment history", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesText =
        searchText.trim().length === 0 ||
        (p.user || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (p.orderId || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (p.transactionId || "").toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ? true : (p.status || "Pending") === statusFilter;
      const matchesMethod =
        methodFilter === "All"
          ? true
          : (p.method || "").toLowerCase() === methodFilter.toLowerCase();
      return matchesText && matchesStatus && matchesMethod;
    });
  }, [payments, searchText, statusFilter, methodFilter]);

  const revenue = filteredPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );
  const successfulPayments = useMemo(
    () => filteredPayments.filter((p) => ["Completed", "Paid"].includes(p.status)).length,
    [filteredPayments]
  );

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

  const handleExportPDF = () => {
    const printable = filteredPayments;
    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    const rows = printable
      .map((p) => {
        const created = p.createdAt ? new Date(p.createdAt) : null;
        const dateStr = created
          ? created.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : "N/A";
        const timeStr = created
          ? created.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
          : "N/A";

        return `
          <tr>
            <td>${p.transactionId}</td>
            <td>${p.user}</td>
            <td>${p.orderId}</td>
            <td>₹${p.amount}</td>
            <td>${p.method}</td>
            <td>${dateStr} ${timeStr}</td>
            <td>${p.status}</td>
          </tr>
        `;
      })
      .join("");

    newWindow.document.write(`
      <html>
        <head>
          <title>Payments Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h2 { margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; }
            .summary { margin-bottom: 16px; font-size: 13px; }
          </style>
        </head>
        <body>
          <h2>Payment History</h2>
          <div class="summary">
            Transactions: ${printable.length} | Revenue: ₹${revenue.toLocaleString()} | Successful: ${successfulPayments}
          </div>
          <table>
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
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
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
              <h3>₹{revenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="payment-history-stat-card">
          <div className="payment-history-stat-content">
            <CheckCircle size={24} className="view-orders-stat-icon-icon" />
            <div className="payment-history-stat-info">
              <h3>{successfulPayments}</h3>
              <p>Successful Payments</p>
            </div>
          </div>
        </div>

        <div className="payment-history-stat-card">
          <div className="payment-history-stat-content">
            <TrendingUp size={24} className="view-orders-stat-icon-icon" />
            <div className="payment-history-stat-info">
              <h3>{payments.length}</h3>
              <p>Total Transactions</p>
            </div>
          </div>
        </div>

        <div className="payment-history-stat-card">
          <div className="payment-history-stat-content">
            <RotateCcw size={24} className="view-orders-stat-icon-icon" />
            <div className="payment-history-stat-info">
              <h3>{payments.filter((p) => p.status === "Refunded").length}</h3>
              <p>Refunded Payments</p>
            </div>
          </div>
        </div>
      </div>



      {/* Table */}
      <div className="payment-history-table-container">
        <div className="payment-history-table-header">
          <h3 className="payment-history-table-title">Transaction History</h3>
          <div className="payment-history-table-actions">
            <input
              className="view-orders-search"
              placeholder="Search customer, order, txn"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select
              className="view-orders-search"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            <select
              className="view-orders-search"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="All">All Methods</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Razorpay">Razorpay</option>
            </select>
            <button className="payment-history-secondary-btn d-flex align-items-center justify-content-center" onClick={handleExportPDF}>
              <Download size={14} style={{ marginRight: "6px" }} /> Export PDF
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
              {filteredPayments.map((p) => {
                const created = p.createdAt ? new Date(p.createdAt) : null;
                const dateStr = created
                  ? created.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : "N/A";
                const timeStr = created
                  ? created.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "N/A";
                return (
                  <tr key={p.id}>
                    <td>
                      <code className="payment-history-transaction-id">
                        {p.transactionId}
                      </code>
                    </td>
                    <td>


                      <div className="payment-history-user-name">{p.user}</div>

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
                        <div className="payment-history-date">{dateStr}</div>
                        <div className="payment-history-time">{timeStr}</div>
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
                );
              })}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <div className="payment-history-empty-state">
            <p className="payment-history-empty-text">No payment records found</p>
          </div>
        )}
        {loading && (
          <div className="payment-history-empty-state">
            <p className="payment-history-empty-text">Loading payments...</p>
          </div>
        )}
      </div>
    </div>
  );
}
