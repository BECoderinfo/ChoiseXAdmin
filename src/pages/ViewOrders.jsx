import { useEffect, useMemo, useState } from "react";
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
  MapPin,
} from "lucide-react";
import { fetchOrders, getTracking, updateTracking, refundOrder } from "../api/order";
import { useSnackbar } from "notistack";
import { Modal, Button, Form } from "react-bootstrap";

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showTracking, setShowTracking] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundingOrderId, setRefundingOrderId] = useState(null);
  const [trackingForm, setTrackingForm] = useState({
    referenceNumber: "",
    estimateDate: "",
    courierPartner: "",
    trackingLink: "",
    status: "Order Confirmed",
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchOrders();
        if (res?.success) {
          setOrders(res.data || []);
        }
      } catch (err) {
        enqueueSnackbar(err.message || "Failed to load orders", { variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      Delivered: { class: "view-orders-status-delivered", icon: <CheckCircle size={14} />, label: "Delivered" },
      Pending: { class: "view-orders-status-pending", icon: <Clock size={14} />, label: "Pending" },
      Shipped: { class: "view-orders-status-shipped", icon: <Truck size={14} />, label: "Shipped" },
      Cancelled: { class: "view-orders-status-cancelled", icon: <XCircle size={14} />, label: "Cancelled" },
      "Payment Failed": { class: "view-orders-status-cancelled", icon: <XCircle size={14} />, label: "Payment Failed" },
    };
    return statusConfig[status] || statusConfig["Pending"];
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );
  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;
  const paidOrders = orders.filter((o) => o.paymentStatus === "Paid").length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerName = order.user?.name || order.address?.name || "";
      const matchesText =
        searchText.trim().length === 0 ||
        (order.orderId || "").toLowerCase().includes(searchText.toLowerCase()) ||
        customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        (order.cart?.map((i) => `${i.name} x ${i.quantity}`).join("<br/>") || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (order.paymentMethod || "").toLowerCase().includes(searchText.toLowerCase());

      // Fix filter: Use order.status for filtering
      const matchesStatus =
        statusFilter === "All" ? true : (order.status || "Pending") === statusFilter;

      return matchesText && matchesStatus;
    });
  }, [orders, searchText, statusFilter]);

  const openTrackingModal = async (order) => {
    setSelectedOrder(order);
    setShowTracking(true);
    setTrackingLoading(true);
    try {
      const res = await getTracking(order.orderId);
      const data = res?.data || {};
      setTrackingForm({
        referenceNumber: data.referenceNumber || "",
        estimateDate: data.estimateDate ? data.estimateDate.split("T")[0] : "",
        courierPartner: data.courierPartner || "",
        trackingLink: data.trackingLink || "",
        status: data.status || "Order Confirmed",
      });
    } catch (err) {
      enqueueSnackbar(err.message || "Failed to load tracking", { variant: "error" });
      setTrackingForm({
        referenceNumber: "",
        estimateDate: "",
        courierPartner: "",
        trackingLink: "",
        status: "Order Confirmed",
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleTrackingSave = async () => {
    if (!selectedOrder) return;
    const { referenceNumber, estimateDate, courierPartner, trackingLink, status } = trackingForm;
    if (!referenceNumber || !estimateDate || !courierPartner || !trackingLink || !status) {
      enqueueSnackbar("All tracking fields are required", { variant: "warning" });
      return;
    }
    try {
      setTrackingLoading(true);
      await updateTracking(selectedOrder.orderId, {
        referenceNumber,
        estimateDate,
        courierPartner,
        trackingLink,
        status,
      });
      enqueueSnackbar("Tracking updated", { variant: "success" });

      // Refresh orders to get updated status from backend
      const res = await fetchOrders();
      if (res?.success) {
        setOrders(res.data || []);
      }

      setShowTracking(false);
    } catch (err) {
      enqueueSnackbar(err.message || "Failed to update tracking", { variant: "error" });
    } finally {
      setTrackingLoading(false);
    }
  };
  const handleRefund = async (order) => {
    try {
      setRefundingOrderId(order.orderId);
      const res = await refundOrder(order.orderId);
      if (res?.success) {
        enqueueSnackbar("Refund processed", { variant: "success" });
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === order.orderId
              ? { ...o, refundStatus: res.data?.refundStatus || "Refunded", refundId: res.data?.refundId }
              : o
          )
        );
      } else {
        enqueueSnackbar(res?.message || "Refund failed", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Refund failed", { variant: "error" });
    } finally {
      setRefundingOrderId(null);
    }
  };

  const handleExportPDF = () => {

    const printable = filteredOrders;
    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    const rows = printable
      .map(
        (order) => `
        <tr>
          <td>${order.orderId || ""}</td>
          <td>${order.address?.name || "Customer"}</td>
          <td>${order.cart?.map((i) => `${i.name} x ${i.quantity}`).join("<br/>") || "-"}</td>
          <td>₹${order.totalAmount || 0}</td>
          <td>${order.paymentMethod || "N/A"} / ${order.paymentStatus || "Pending"}</td>
          <td>${order.date || order.createdAt || ""}</td>
          <td>${order.status || "Pending"}</td>
        </tr>
      `
      )
      .join("");

    newWindow.document.write(`
      <html>
        <head>
          <title>Orders Export</title>
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
          <h2>Orders Report</h2>
          <div class="summary">
            Total Orders: ${printable.length} | Revenue: ₹${totalRevenue.toLocaleString()}
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Date</th>
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
        <div className="view-orders-stat-card">
          <div className="view-orders-stat-content">
            <div className="view-orders-stat-icon">
              <CheckCircle size={26} className="view-orders-stat-icon-icon" />
            </div>
            <div className="view-orders-stat-info">
              <h3>{paidOrders}</h3>
              <p>Paid (Razorpay)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="view-orders-table-container">
        <div className="view-orders-table-header">
          <h3 className="view-orders-table-title">Recent Orders</h3>
          <div className="view-orders-table-actions">
            <input
              className="view-orders-search"
              placeholder="Search by order ID or customer"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select
              className="view-orders-search"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className="view-orders-secondary-btn d-flex align-items-center justify-content-center" onClick={handleExportPDF}>
              <Download size={14} style={{ marginRight: "6px" }} /> Export PDF
            </button>
          </div>
        </div>

        <div className="view-orders-table-responsive">
          <table className="view-orders-data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Tracking</th>

              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                // Map tracking status to order status for display
                let displayStatus = order.status;
                
                if (order.paymentStatus === "Failed") {
                  displayStatus = "Payment Failed";
                }
                // If order is Cancelled, always show Cancelled (don't override)
                if (order.status === "Cancelled") {
                  displayStatus = "Cancelled";
                } 
                // If order has tracking, map tracking status to order status
                else if (order.tracking?.status) {
                  if (order.tracking.status === "Order Confirmed") {
                    displayStatus = "Pending";
                  } else if (order.tracking.status === "Picked by Courier") {
                    displayStatus = "Shipped";
                  } else if (order.tracking.status === "Delivered") {
                    displayStatus = "Delivered";
                  }
                }

                const statusInfo = getStatusBadge(displayStatus);

                return (
                  <tr key={order.orderId}>
                    <td style={{ fontSize: "0.8em" }}>
                      <strong>{order.orderId}</strong>
                    </td>
                    <td>
                      <div className="view-orders-user-info">
                        <div>
                          <div className="view-orders-user-name">
                            {order.user?.name || order.address?.name || "Customer"}
                          </div>
                          <div className="view-orders-user-address">
                            {order.address?.city}, {order.address?.state}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                      <td>
                        <div className="view-orders-product-list">
                          {order.cart?.map((item) => (
                            <div key={item.id || item._id} className="view-orders-item-line d-flex align-items-center gap-2">
                              <img src={item.image} alt={item.name} className="view-orders-product-image" />
                              <span className="view-orders-product-nameSpan">{item.name} x {item.quantity}</span> 
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong className="view-orders-price">₹{order.totalAmount}</strong>
                      </td>
                      <td>
                        <div className="payment-pill" style={{ fontSize: "0.9rem" }}>
                          {order.paymentMethod || "N/A"} / {order.paymentStatus || "Pending"}
                        </div>
                        {order.refundStatus && (
                          <div className="small text-muted">Refund: {order.refundStatus}</div>
                        )}
                      </td>
                      <td style={{ fontSize: "0.9rem" }}>{order.date || order.createdAt}</td>
                      <td>
                        <span className={`view-orders-status-badge ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        {order.status !== "Cancelled" && (
                          <button
                            className="view-orders-secondary-btn d-flex align-items-center"
                            onClick={() => openTrackingModal(order)}
                          >
                            {order.tracking?.status || "Add"}
                          </button>
                        )}


                        {order.paymentMethod === "Razorpay" &&
                          order.paymentStatus === "Paid" &&
                          order.status === "Cancelled" &&
                          order.refundStatus !== "Refunded" && (
                            <button
                              className="view-orders-secondary-btn d-flex align-items-center mt-2"
                              onClick={() => handleRefund(order)}
                              disabled={refundingOrderId === order.orderId}
                            >
                              {refundingOrderId === order.orderId ? "Refunding..." : "Refund"}
                            </button>
                          )}
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
        {loading && (
          <div className="view-orders-empty-state">
            <p className="view-orders-empty-text">Loading orders...</p>
          </div>
        )}
      </div>

      <Modal show={showTracking} onHide={() => setShowTracking(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Tracking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {trackingLoading ? (
            <p>Loading...</p>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Delivery Reference Number</Form.Label>
                <Form.Control
                  type="text"
                  value={trackingForm.referenceNumber}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({ ...prev, referenceNumber: e.target.value }))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Delivery Estimated Date</Form.Label>
                <Form.Control
                  type="date"
                  value={trackingForm.estimateDate}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({ ...prev, estimateDate: e.target.value }))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Courier Partner Name</Form.Label>
                <Form.Control
                  type="text"
                  value={trackingForm.courierPartner}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({ ...prev, courierPartner: e.target.value }))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tracking Link</Form.Label>
                <Form.Control
                  type="url"
                  value={trackingForm.trackingLink}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({ ...prev, trackingLink: e.target.value }))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={trackingForm.status}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  required
                >
                  <option>Order Confirmed</option>
                  <option>Picked by Courier</option>
                  <option>On the Way</option>
                  <option>Ready for Pickup</option>
                  <option>Delivered</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTracking(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleTrackingSave} disabled={trackingLoading}>
            {trackingLoading ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
