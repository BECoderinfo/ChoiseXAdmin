import { useState } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { requestPasswordOtp, verifyPasswordOtp } from "../api/auth";
import "./Auth.css";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      enqueueSnackbar("Please enter your registered phone number", { variant: "warning" });
      return;
    }

    try {
      setIsSending(true);
      await requestPasswordOtp({ phone });
      setOtpSent(true);
      enqueueSnackbar("OTP sent successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      enqueueSnackbar("Enter the OTP you received", { variant: "warning" });
      return;
    }

    try {
      setIsVerifying(true);
      const response = await verifyPasswordOtp({ phone, otp });
      enqueueSnackbar("OTP verified", { variant: "success" });
      navigate(`/set-password?token=${response.resetToken}`);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Container fluid className="auth-wrapper">
      <Row className="auth-row">
        <Col md={6} className="auth-left">
          <div className="auth-brand">
            <h1>ChoiseX</h1>
            <p className="auth-tagline">Secure access to your admin space.</p>
          </div>
        </Col>

        <Col md={6} className="auth-right">
          <Card className="auth-card">
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-subtitle">
              Enter your registered phone number to receive an OTP.
            </p>

            <Form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
              <Form.Group>
                <Form.Label>Registered Phone</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                />
              </Form.Group>

              {otpSent && (
                <Form.Group className="mt-3">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </Form.Group>
              )}

              <Button
                className="w-100 mt-4 auth-btn"
                type="submit"
                disabled={otpSent ? isVerifying : isSending}
              >
                {otpSent
                  ? isVerifying
                    ? "Verifying..."
                    : "Verify OTP"
                  : isSending
                  ? "Sending..."
                  : "Send OTP"}
              </Button>

              {!otpSent && (
                <p className="auth-helper mt-3">
                  We will send a one-time password to your registered number.
                </p>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}


