import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Info } from "lucide-react";
import { apiFetch } from "../../lib/api";
import brandLogo from "../../assets/Roombaazi Final Logo.png";

const OTP_RESEND_LIMIT = 3;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const [isLimitHit, setIsLimitHit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMsg("");

    try {
      const response = await apiFetch<{ message: string; resetToken?: string; email?: string; otpCode?: string }>(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email: email.trim() }),
        }
      );
      const newCount = resendCount + 1;
      setResendCount(newCount);
      setMessage(response.message);
      if (response.resetToken && response.email) {
        const otpQuery = response.otpCode ? `&otp=${encodeURIComponent(response.otpCode)}` : "";
        navigate(
          `/reset-password?token=${encodeURIComponent(response.resetToken)}&email=${encodeURIComponent(
            response.email
          )}${otpQuery}`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      setErrorMsg(msg);
      // 429 = limit exhausted
      if (msg.toLowerCase().includes("maximum") || msg.toLowerCase().includes("limit")) {
        setIsLimitHit(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const remaining = OTP_RESEND_LIMIT - resendCount;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "var(--bg-color)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <img
            src={brandLogo}
            alt="Roombaazi"
            style={{ width: "210px", maxWidth: "100%", margin: "0 auto 0.75rem", display: "block" }}
          />
          <p style={{ color: "var(--text-muted)" }}>Password reset instructions will be sent to your email.</p>
        </div>

        <div className="glass-card">
          <h2 style={{ marginBottom: "1.25rem", textAlign: "center" }}>Forgot Password</h2>

          {/* Static info banner — always visible */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.6rem",
              padding: "0.75rem 1rem",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <Info size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#92400e", lineHeight: 1.5 }}>
              You can request an OTP up to <strong>{OTP_RESEND_LIMIT} times</strong> per 24 hours.
              {resendCount > 0 && (
                <span>
                  {" "}
                  <strong style={{ color: remaining <= 1 ? "#dc2626" : "#92400e" }}>
                    {remaining} attempt{remaining !== 1 ? "s" : ""} remaining.
                  </strong>
                </span>
              )}
            </p>
          </div>

          {message && (
            <div
              style={{
                padding: "0.75rem",
                background: "#eef9f1",
                border: "1px solid #b7e4c7",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              <p style={{ color: "#146c43", margin: 0, fontSize: "0.9rem" }}>{message}</p>
            </div>
          )}

          {/* Error / limit-hit banner */}
          {errorMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
                padding: "0.75rem 1rem",
                background: isLimitHit ? "#fef2f2" : "#fee",
                border: `1px solid ${isLimitHit ? "#fca5a5" : "#fcc"}`,
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              <AlertTriangle size={16} style={{ color: "#dc2626", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ color: "#991b1b", margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input-style"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLimitHit}
              />
            </div>
            <button className="btn btn-primary w-full" type="submit" disabled={loading || isLimitHit}>
              {loading ? "Sending..." : resendCount > 0 ? `Resend OTP (${remaining} left)` : "Send Reset Email"}
            </button>
          </form>

          <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
            <Link to="/reset-password" style={{ color: "var(--brand-secondary)", fontWeight: 600, textDecoration: "none" }}>
              Already have OTP? Reset now
            </Link>
          </div>
          <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
            <Link to="/login" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
