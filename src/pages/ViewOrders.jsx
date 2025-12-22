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
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { fetchOrders, getTracking, updateTracking, refundOrder } from "../api/order";
import { useSnackbar } from "notistack";
import { Modal, Button, Form } from "react-bootstrap";
import jsPDF from "jspdf";

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showTracking, setShowTracking] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundingOrderId, setRefundingOrderId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

      // Update order with tracking data immediately
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrder.orderId
            ? { ...o, tracking: { ...trackingForm, estimateDate: trackingForm.estimateDate + "T00:00:00" } }
            : o
        )
      );

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

  const openDetailsModal = async (order) => {
    setDetailsOrder(order);
    setShowDetails(true);
    // Fetch tracking info if available
    try {
      const res = await getTracking(order.orderId);
      if (res?.data) {
        setDetailsOrder({ ...order, tracking: res.data });
      }
    } catch (err) {
      // Tracking not available, continue with order details
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




  const formatCurrency = (amount) => {
    return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const formatOrderDateTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // 12-hour format

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

  const handleExportInvoices = () => {
    try {
      // Parse selected date
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);

      // Filter orders: selected date only, exclude cancelled
      const eligibleOrders = orders.filter(order => {
        if (order.status === "Cancelled" || order.status === "Canceled") return false;

        const orderDate = new Date(order.createdAt || order.date);
        orderDate.setHours(0, 0, 0, 0);

        return orderDate.getTime() === selectedDateObj.getTime();
      });

      // Sort by creation time (ascending)
      eligibleOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateA - dateB;
      });

      if (eligibleOrders.length === 0) {
        enqueueSnackbar(`No eligible orders found for ${selectedDate}`, { variant: "warning" });
        return;
      }

      const pdf = new jsPDF("p", "mm", "a4");

      // Invoice layout
      const invoiceWidth = 95;
      const invoiceHeight = 135;
      const marginX = 7.5;
      const marginY = 10;
      const gapX = 5;
      const gapY = 7;

      const positions = [
        { x: marginX, y: marginY },
        { x: marginX + invoiceWidth + gapX, y: marginY },
        { x: marginX, y: marginY + invoiceHeight + gapY },
        { x: marginX + invoiceWidth + gapX, y: marginY + invoiceHeight + gapY }
      ];

      // ================= DRAW INVOICE =================
      const drawInvoice = (x, y, order) => {
        const lx = x + 3;
        const rx = x + invoiceWidth - 3;
        let cy = y + 5;

        // Column alignment (FIXED)
        const colProductX = lx;
        const colQtyX = x + invoiceWidth - 42;
        const colPriceX = x + invoiceWidth - 20;
        const colSubtotalX = x + invoiceWidth - 5;

        // Border
        pdf.setLineWidth(0.5);
        pdf.rect(x, y, invoiceWidth, invoiceHeight);

        // ===== HEADER =====
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("TAX INVOICE", x + invoiceWidth / 2, cy, { align: "center" });
        cy += 6;

        pdf.setLineWidth(0.3);
        pdf.line(lx, cy, rx, cy);
        cy += 5;

        // ===== CUSTOMER DETAILS =====
        pdf.setFontSize(8);
        pdf.text("Customer Details", lx, cy);
        cy += 4;

        pdf.setFontSize(9);
        pdf.text(order.address?.name || order.user?.name || "Customer", lx, cy);
        cy += 4;

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Mobile: ${order.address?.mobile || "N/A"}`, lx, cy);
        cy += 4;

        pdf.text(`Email : ${order.address?.email || "N/A"}`, lx, cy);
        cy += 4;

        const fullAddress = `${order.address?.address || ""}, ${order.address?.area || ""}, ${order.address?.city || ""}, ${order.address?.state || ""} - ${order.address?.postal || ""}`;
        const addressLines = pdf.splitTextToSize(fullAddress, invoiceWidth - 6);
        pdf.text(addressLines, lx, cy);
        cy += addressLines.length * 3.5 + 3;

        pdf.line(lx, cy, rx, cy);
        cy += 4;

        // ===== ORDER DETAILS =====
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text("Order Details", lx, cy);
        cy += 4;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text(`Order ID: ${order.orderId || "N/A"}`, lx, cy);
        cy += 3.5;

        pdf.text(
          `Order Date: ${formatOrderDateTime(order.createdAt || order.date)}`,
          lx,
          cy
        );

        cy += 3.5;

        pdf.text(`Payment: ${order.paymentMethod || "N/A"}`, lx, cy);
        cy += 3.5;

        



        pdf.line(lx, cy, rx, cy);
        cy += 4;

        // ===== PRODUCT TABLE HEADER =====
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.text("Product", colProductX, cy);
        pdf.text("Qty", colQtyX, cy, { align: "right" });
        pdf.text("Price", colPriceX, cy, { align: "right" });
        pdf.text("Subtotal", colSubtotalX, cy, { align: "right" });

        cy += 3;
        pdf.setLineWidth(0.2);
        pdf.line(lx, cy, rx, cy);
        cy += 3;

        // ===== PRODUCT ROWS =====
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);

        if (order.cart && order.cart.length > 0) {
          order.cart.forEach(item => {
            const qty = item.quantity || 1;
            const priceNum = Number(item.price) || 0;
            const subtotalNum = qty * priceNum;

            const nameLines = pdf.splitTextToSize(
              item.name || "Product",
              colQtyX - colProductX - 2
            );

            pdf.text(nameLines, colProductX, cy);
            pdf.text(String(qty), colQtyX, cy, { align: "right" });
            pdf.text(`Rs. ${formatCurrency(priceNum)}`, colPriceX, cy, { align: "right" });
            pdf.text(`Rs. ${formatCurrency(subtotalNum)}`, colSubtotalX, cy, { align: "right" });

            cy += nameLines.length * 3.2 + 1;
          });
        }

        cy += 2;
        pdf.line(lx, cy, rx, cy);
        cy += 4;

        // ===== PRICE SUMMARY =====
        const itemTotal = order.totalAmount || 0;

        pdf.setFontSize(7);
        pdf.text("Item Total:", colPriceX, cy, { align: "right" });
        pdf.text(`Rs. ${itemTotal}`, colSubtotalX, cy, { align: "right" });
        cy += 3.5;

        pdf.text("GST (included):", colPriceX, cy, { align: "right" });
        pdf.text("Included", colSubtotalX, cy, { align: "right" });
        cy += 4;

        pdf.setLineWidth(0.3);
        pdf.line(lx, cy, rx, cy);
        cy += 4;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("Grand Total:", colPriceX, cy, { align: "right" });
        pdf.text(`Rs. ${itemTotal}`, colSubtotalX, cy, { align: "right" });
        cy += 5;

        // ===== COD NOTE =====
        if (order.paymentMethod === "COD" || order.paymentMethod === "Cash on Delivery") {
          pdf.setFillColor(255, 255, 200);
          pdf.rect(lx, cy - 2, invoiceWidth - 6, 7, "F");

          pdf.setFontSize(8);
          pdf.text(
            `Cash on Delivery – Collect Rs. ${itemTotal}`,
            x + invoiceWidth / 2,
            cy + 3,
            { align: "center" }
          );
        }

        // ===== FOOTER =====
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(6);
        pdf.text(
          "Thank you for your order!",
          x + invoiceWidth / 2,
          y + invoiceHeight - 6,
          { align: "center" }
        );
      };

      // ===== GENERATE PDF =====
      let invoiceCount = 0;

      for (const order of eligibleOrders) {
        const pos = positions[invoiceCount % 4];
        drawInvoice(pos.x, pos.y, order);

        invoiceCount++;

        if (invoiceCount % 4 === 0 && invoiceCount < eligibleOrders.length) {
          pdf.addPage();
        }
      }

      pdf.save(`Invoices_${selectedDate}.pdf`);
      enqueueSnackbar(`Exported ${eligibleOrders.length} invoices`, { variant: "success" });

    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to generate invoices", { variant: "error" });
    }
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
            <input
              type="date"
              className="view-orders-search"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: "auto" }}
            />
            <button className="view-orders-secondary-btn d-flex align-items-center justify-content-center" onClick={handleExportPDF}>
              <Download size={14} style={{ marginRight: "6px" }} /> Export PDF
            </button>
            <button className="view-orders-secondary-btn d-flex align-items-center justify-content-center" onClick={handleExportInvoices}>
              <FileText size={14} style={{ marginRight: "6px" }} /> Export Invoices (PDF)
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
                <th>Actions</th>

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
                          <div className="view-orders-user-name " style={{ fontSize: "0.8em" }}>
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
                            <span className="view-orders-product-nameSpan" style={{ fontSize: "0.7rem" }}>{item.name} x {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong className="view-orders-price" style={{ fontSize: "0.8em" }}>₹{order.totalAmount}</strong>
                    </td>
                    <td>
                      <div className="payment-pill" style={{ fontSize: "0.7rem" }}>
                        {order.paymentMethod || "N/A"} / {order.paymentStatus || "Pending"}
                      </div>
                      {order.refundStatus && (
                        <div className="small text-muted" style={{ fontSize: "0.7rem" }}>Refund: {order.refundStatus}</div>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{formatOrderDateTime(order.createdAt || order.date)}</td>
                    <td>
                      <span className={`view-orders-status-badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="view-orders-action-buttons-column">
                        <button
                          className="view-orders-action-btn view-orders-details-btn"
                          onClick={() => openDetailsModal(order)}
                          title="View Details"
                        >
                          <Eye size={16} />
                          <span>Details</span>
                        </button>

                        {order.status !== "Cancelled" && (
                          <button
                            className="view-orders-action-btn view-orders-tracking-btn"
                            onClick={() => openTrackingModal(order)}
                            title="Update Tracking"
                          >
                            <Truck size={16} />
                            <span>{order.tracking?.status || "Add Tracking"}</span>
                          </button>
                        )}

                    

                        {order.paymentMethod === "Razorpay" &&
                          order.paymentStatus === "Paid" &&
                          order.status === "Cancelled" &&
                          order.refundStatus !== "Refunded" && (
                            <button
                              className="view-orders-action-btn view-orders-refund-btn"
                              onClick={() => handleRefund(order)}
                              disabled={refundingOrderId === order.orderId}
                              title="Refund Order"
                            >
                              <XCircle size={16} />
                              <span>{refundingOrderId === order.orderId ? "Refunding..." : "Refund"}</span>
                            </button>
                          )}
                      </div>
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

      {/* Order Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="lg" className="order-details-modal">
        <Modal.Header closeButton className="order-details-header">
          <Modal.Title>
            <div className="d-flex align-items-center gap-2">
              <Package size={24} />
              <span>Order Details</span>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-details-body">
          {detailsOrder && (
            <div className="order-details-content">
              {/* Order Info Section */}
              <div className="order-details-section">
                <h5 className="order-details-section-title">
                  <ShoppingCart size={18} /> Order Information
                </h5>
                <div className="order-details-grid">
                  <div className="order-details-item">
                    <span className="order-details-label">Order ID:</span>
                    <span className="order-details-value">{detailsOrder.orderId}</span>
                  </div>
                  <div className="order-details-item">
                    <span className="order-details-label">Order Date:</span>
                    <span className="order-details-value">{formatOrderDateTime(detailsOrder.createdAt || detailsOrder.date)}</span>
                  </div>
                  <div className="order-details-item">
                    <span className="order-details-label">Status:</span>
                    <span className={`view-orders-status-badge ${getStatusBadge(detailsOrder.status).class}`}>
                      {getStatusBadge(detailsOrder.status).label}
                    </span>
                  </div>
                  <div className="order-details-item">
                    <span className="order-details-label">Total Amount:</span>
                    <span className="order-details-value order-details-price">₹{detailsOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info Section */}
              <div className="order-details-section">
                <h5 className="order-details-section-title">
                  <User size={18} /> Customer Information
                </h5>
                <div className="order-details-grid">
                  <div className="order-details-item">
                    <span className="order-details-label">Name:</span>
                    <span className="order-details-value">{detailsOrder.user?.name || detailsOrder.address?.name || "N/A"}</span>
                  </div>
                  {detailsOrder.user?.email && (
                    <div className="order-details-item">
                      <span className="order-details-label">
                        <Mail size={14} /> Email:
                      </span>
                      <span className="order-details-value">{detailsOrder.user.email}</span>
                    </div>
                  )}
                  {detailsOrder.address?.mobile && (
                    <div className="order-details-item">
                      <span className="order-details-label">
                        <Phone size={14} /> Phone:
                      </span>
                      <span className="order-details-value">{detailsOrder.address.mobile}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Section */}
              {detailsOrder.address && (
                <div className="order-details-section">
                  <h5 className="order-details-section-title">
                    <MapPin size={18} /> Delivery Address
                  </h5>
                  <div className="order-details-address">
                    <p>{detailsOrder.address.address || ""}</p>
                    <p>{detailsOrder.address.area}</p>
                    <p>
                      {detailsOrder.address.city || ""}, {detailsOrder.address.state || ""} - {detailsOrder.address.postal || ""}
                    </p>
                  </div>
                </div>
              )}

              {/* Items Section */}
              {detailsOrder.cart && detailsOrder.cart.length > 0 && (
                <div className="order-details-section">
                  <h5 className="order-details-section-title">
                    <PackagePlus size={18} /> Order Items
                  </h5>
                  <div className="order-details-items">
                    {detailsOrder.cart.map((item, index) => (
                      <div key={item.id || item._id || index} className="order-details-item-row">
                        <img src={item.image} alt={item.name} className="order-details-item-image" />
                        <div className="order-details-item-info">
                          <div className="order-details-item-name">{item.name}</div>
                          <div className="order-details-item-meta">
                            Quantity: {item.quantity} | Price: ₹{item.price || 0}
                          </div>
                        </div>
                        <div className="order-details-item-total">
                          ₹{(item.price || 0) * (item.quantity || 1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Section */}
              <div className="order-details-section">
                <h5 className="order-details-section-title">
                  <FileText size={18} /> Payment Information
                </h5>
                <div className="order-details-grid">
                  <div className="order-details-item">
                    <span className="order-details-label">Payment Method:</span>
                    <span className="order-details-value">{detailsOrder.paymentMethod || "N/A"}</span>
                  </div>
                  <div className="order-details-item">
                    <span className="order-details-label">Payment Status:</span>
                    <span className="order-details-value">{detailsOrder.paymentStatus || "Pending"}</span>
                  </div>
                  {detailsOrder.refundStatus && (
                    <div className="order-details-item">
                      <span className="order-details-label">Refund Status:</span>
                      <span className="order-details-value">{detailsOrder.refundStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Section */}
              {detailsOrder.tracking && detailsOrder.tracking.referenceNumber && (
                <div className="order-details-section">
                  <h5 className="order-details-section-title">
                    <Truck size={18} /> Tracking Information
                  </h5>
                  <div className="order-details-grid">
                    <div className="order-details-item">
                      <span className="order-details-label">Reference Number:</span>
                      <span className="order-details-value">{detailsOrder.tracking.referenceNumber}</span>
                    </div>
                    <div className="order-details-item">
                      <span className="order-details-label">Courier Partner:</span>
                      <span className="order-details-value">{detailsOrder.tracking.courierPartner}</span>
                    </div>
                    {detailsOrder.tracking.estimateDate && (
                      <div className="order-details-item">
                        <span className="order-details-label">Estimated Delivery:</span>
                        <span className="order-details-value">
                          {new Date(detailsOrder.tracking.estimateDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="order-details-item">
                      <span className="order-details-label">Status:</span>
                      <span className="order-details-value">{detailsOrder.tracking.status}</span>
                    </div>
                    {detailsOrder.tracking.trackingLink && (
                      <div className="order-details-item full-width">
                        <span className="order-details-label">Tracking Link:</span>
                        <a href={detailsOrder.tracking.trackingLink} target="_blank" rel="noopener noreferrer" className="order-details-link">
                          {detailsOrder.tracking.trackingLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="order-details-footer">
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Tracking Modal */}
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
