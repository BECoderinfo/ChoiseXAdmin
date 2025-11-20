import { Container, Row, Col, Card } from "react-bootstrap";
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

export default function Dashboard() {

  const Navigate = useNavigate();
  const stats = [
    { label: "Total Products", value: "24", icon: <Package size={26} />, trend: "+12%", color: "primary" },
    { label: "Total Orders", value: "156", icon: <ShoppingCart size={26} />, trend: "+8%", color: "success" },
    { label: "Total Users", value: "892", icon: <Users size={26} />, trend: "+23%", color: "info" },
    { label: "Revenue", value: "₹2,45,699", icon: <CreditCard size={26} />, trend: "+15%", color: "warning" },
  ];

  const recentActivities = [
    { icon: <ListOrdered size={18} />, text: "New order #ORD-0012 placed", time: "2 min ago" },
    { icon: <Package size={18} />, text: 'Product "Pressure Sensing Device" added', time: "1 hour ago" },
    { icon: <Users size={18} />, text: "New user registration", time: "2 hours ago" },
    { icon: <CreditCard size={18} />, text: "Payment of ₹2,499 received", time: "3 hours ago" },
  ];

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
