import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import {
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Activity,
  Rocket,
  PlusCircle,
  ListOrdered,
  UserCog,
  Wallet,
  Eye,
} from "lucide-react";
import "./styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProducts } from "../api/product";
import { fetchOrders } from "../api/order";
import { fetchAdminUsers } from "../api/users";
import { useSnackbar } from "notistack";

export default function Dashboard() {
  const Navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  

  

  const formatRelativeTime = (date) => {
    if (!date) return "just now";
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    (async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchAdminUsers(),
        ]);

        const products = productsRes?.data || [];
        const orders = ordersRes?.data || [];
        const users = usersRes?.data || [];

        const revenue = orders.reduce(
          (sum, order) => sum + Number(order.totalAmount || 0),
          0
        );

        setStats([
          { label: "Total Products", value: products.length, icon: <Package size={26} />, color: "primary" },
          { label: "Total Orders", value: orders.length, icon: <ShoppingCart size={26} />, color: "success" },
          { label: "Total Users", value: users.length, icon: <Users size={26} />, color: "info" },
          { label: "Revenue", value: `₹${revenue.toLocaleString()}`, icon: <CreditCard size={26} />, color: "warning" },
        ]);

        // Merge ALL activities first, then sort, then take top 6
        const activities = [];

        // Add all orders (not just first 5)
        orders.forEach((o) => {
          if (o.createdAt || o.orderDate) {
            activities.push({
              createdAt: o.createdAt || o.orderDate,
              icon: <ListOrdered size={18} />,
              text: `Order ${o.orderId || o.id || ""} placed`,
            });
          }
        });

        // Add all products (not just first 5)
        products.forEach((p) => {
          if (p.createdAt) {
            activities.push({
              createdAt: p.createdAt,
              icon: <Package size={18} />,
              text: `Product "${p.name || "New Product"}" added`,
            });
          }
        });

        // Add all users (not just first 5) - use joinDate instead of createdAt
        users.forEach((u) => {
          // Backend returns joinDate, not createdAt
          const userDate = u.joinDate || u.createdAt;
          if (userDate) {
            activities.push({
              createdAt: userDate,
              icon: <Users size={18} />,
              text: `User ${u.name || u.username || "New User"} registered`,
            });
          }
        });

        // Sort ALL activities by date (newest first), then take top 6
        const sortedActivities = activities
          .filter((a) => a.createdAt) // Only include activities with valid dates
          .sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA; // Newest first
          })
          .slice(0, 6) // Take only the latest 6
          .map((a) => ({
            ...a,
            time: formatRelativeTime(a.createdAt),
          }));

        setRecentActivities(sortedActivities);
      } catch (error) {
        enqueueSnackbar(error.message || "Failed to load dashboard data", { variant: "error" });
      } 
    })();
  }, []);

  const quickActions = [
    { icon: <PlusCircle size={18} />, text: "Add New Product", color: "primary" ,nav:'/add-product'},
    { icon: <Eye size={18} />, text: "View Product", color: "success" ,nav:'/view-products'},
    { icon: <ListOrdered size={18} />, text: "View Orders", color: "warning" ,nav:'/view-orders'},
    { icon: <UserCog size={18} />, text: "View Users", color: "info" ,nav:'/view-users'},
    { icon: <Wallet size={18} />, text: "Payment History", color: "warning" ,nav:'/payment-history'},
  ];

  return (
    <Container fluid className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-icon">
          <Activity size={38} strokeWidth={1.8} />
        </div>
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <p className="dashboard-subtitle">Get insights into your store’s performance.</p>
      </div>

      <div className="view-orders-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="view-orders-stat-card">
            <div className="view-orders-stat-content">
              <div className="view-orders-stat-icon view-orders-stat-icon-icon">
                {stat.icon}
              </div>
              <div className="view-orders-stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
           
              </div>
            </div>
          </div>
        ))}
      </div>


      <Row className="dashboard-content">
        <Col lg={8} className="mb-4">
          <Card className="dashboard-content-card">
            <Card.Header>
              <h3 className="dashboard-card-title">
                <Activity size={18} style={{ marginRight: "8px" }} /> Recent Activity
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="dashboard-activity-list">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="dashboard-activity-item">
                    <div className="dashboard-activity-icon">{activity.icon}</div>
                    <div className="dashboard-activity-content">
                      <p className="dashboard-activity-text">{activity.text}</p>
                      <span className="dashboard-activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="dashboard-content-card">
            <Card.Header>
              <h3 className="dashboard-card-title">
                <Rocket size={18} style={{ marginRight: "8px" }} /> Quick Actions
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="dashboard-quick-actions">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`dashboard-quick-action-btn dashboard-${action.color}`}
                    onClick={()=>Navigate(action.nav)}
                  >
                    <span className="dashboard-btn-icon">{action.icon}</span>
                    <span className="dashboard-btn-text">{action.text}</span>
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
