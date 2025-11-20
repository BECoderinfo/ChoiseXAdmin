import { useState, useEffect } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { resetAdminPassword } from "../api/auth";
import "./Auth.css";

export default function SetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      enqueueSnackbar("Reset token missing. Please restart the process.", { variant: "warning" });
      navigate("/forgot-password", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      enqueueSnackbar("Both password fields are required", { variant: "warning" });
      return;
    }

    if (password !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return;
    }

    try {
      setIsSubmitting(true);
      await resetAdminPassword({ token, password });
      enqueueSnackbar("Password updated. Please login again.", { variant: "success" });
      navigate("/login");
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <Container fluid className="auth-wrapper">
      <Row className="auth-row">
        <Col md={6} className="auth-left">
          <div className="auth-brand">
            <h1>ChoiseX</h1>
            <p className="auth-tagline">Create a secure password to continue.</p>
          </div>
        </Col>

        <Col md={6} className="auth-right">
          <Card className="auth-card">
            <h2 className="auth-title">Set New Password</h2>
            <p className="auth-subtitle">Choose a strong password for admin access.</p>

            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>

              <Button className="w-100 mt-4 auth-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}


