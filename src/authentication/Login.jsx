import { useState } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { loginAdmin } from "../api/auth";
import { useAuth } from "./useAuth";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({ phone: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.phone || !data.password) {
      enqueueSnackbar("Phone and password are required", { variant: "warning" });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginAdmin(data);
      login(response.token);
      enqueueSnackbar("Logged in successfully", { variant: "success" });
      navigate("/");
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="auth-wrapper">
      <Row className="auth-row">
        <Col md={6} className="auth-left">
          <div className="auth-brand">
            <h1>ChoiseX</h1>
            <p className="auth-tagline">Manage your store with confidence.</p>
          </div>
        </Col>

        <Col md={6} className="auth-right">
          <Card className="auth-card">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Login to your admin dashboard</p>

            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter registered phone"
                  value={data.phone}
                  onChange={(e) =>
                    setData({ ...data, phone: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={data.password}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                />
              </Form.Group>

              <Button className="w-100 mt-4 auth-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Login"}
              </Button>

              <p className="auth-helper">
                Forgot password? <Link to="/forgot-password">Reset it</Link>
              </p>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
