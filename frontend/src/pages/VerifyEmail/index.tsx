import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader, Mail } from "lucide-react";
import brandLogo from "../../assets/Roombaazi Final Logo.png";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type Status = "verifying" | "success" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found in the link.");
      return;
    }

    apiFetch<{ token: string; user: unknown }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (data) => {
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
        await refreshSession();
        setStatus("success");
        setTimeout(() => navigate("/browse"), 2800);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Verification failed. The link may have expired.");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async () => {
    if (!resendEmail.trim() || resendStatus === "sending") return;
    setResendStatus("sending");
    try {
      await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
    } catch {
      // silently ignore — response is always generic
    }
    setResendStatus("sent");
  };

  return (
    <div className="app-shell auth-shell">
      <main className="auth-main">
        <div className="page-container">
          <div className="auth-logo-wrap">
            <img src={brandLogo} alt="Roombaazi" />
          </div>

          <div className="surface-card auth-card" style={{ textAlign: "center", padding: "48px 40px" }}>
            {status === "verifying" && (
              <>
                <Loader size={48} style={{ color: "var(--orange-500)", marginBottom: 20, animation: "spin 1s linear infinite" }} />
                <h2 style={{ marginBottom: 10 }}>Verifying your email…</h2>
                <p style={{ color: "var(--text-secondary)" }}>Hang tight, this only takes a second.</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle size={52} style={{ color: "#22c55e", marginBottom: 20 }} />
                <h2 style={{ marginBottom: 10 }}>Email Confirmed!</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                  Welcome to Roombaazi! Your account is now active.<br />
                  Redirecting you to browse rooms…
                </p>
                <div style={{ width: 200, height: 4, background: "var(--border-color)", borderRadius: 4, margin: "0 auto", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: "var(--orange-500)",
                      borderRadius: 4,
                      animation: "grow-bar 2.8s linear forwards",
                    }}
                  />
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle size={52} style={{ color: "#ef4444", marginBottom: 20 }} />
                <h2 style={{ marginBottom: 10 }}>Verification Failed</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{errorMsg}</p>

                {resendStatus === "sent" ? (
                  <>
                    <Mail size={36} style={{ color: "var(--orange-500)", marginBottom: 12 }} />
                    <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
                      A new verification link has been sent if that email exists and is unverified.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, marginBottom: 10 }}>Get a new verification link</p>
                    <div style={{ display: "flex", gap: 8, maxWidth: 360, margin: "0 auto 20px" }}>
                      <input
                        className="input-style"
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="Enter your email"
                        onKeyDown={(e) => e.key === "Enter" && handleResend()}
                      />
                      <button
                        className="btn btn-primary btn-md"
                        onClick={handleResend}
                        disabled={resendStatus === "sending" || !resendEmail.trim()}
                      >
                        {resendStatus === "sending" ? "Sending…" : "Resend"}
                      </button>
                    </div>
                  </>
                )}

                <Link to="/login" className="btn btn-outline btn-md">Back to Login</Link>
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes grow-bar { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
}
