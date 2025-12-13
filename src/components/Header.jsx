import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { User, Settings, LogOut } from "lucide-react";
import "./styles/Header.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/useAuth";
import { logoutAdmin } from "../api/auth";

export default function Header() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Call backend logout API
      await logoutAdmin();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state and navigate
      logout();
      navigate("/login", { replace: true });
    }
  };
  return (
    <Navbar className="admin-header" expand="lg">
      <Container fluid>
        <div className="header-content">
          <div className="welcome-section">
            <h3 className="welcome-title">Welcome back, Admin</h3>
            <p className="welcome-subtitle">
              Here’s an overview of your store today.
            </p>
          </div>

          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-basic"
                className="profile-dropdown"
              >
                <div className="profile-avatar">A</div>
                <span className="profile-name">Admin</span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="profile-menu">
                <Dropdown.Item onClick={handleLogout}>
                  <LogOut size={16} style={{ marginRight: "8px" }} /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
}
