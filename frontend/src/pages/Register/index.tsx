import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import brandLogo from "../../assets/Roombaazi Final Logo.png";

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,24}$/;
const PHONE_RULES = /^\d{10}$/;

function getPasswordError(pw: string): string {
  if (pw.length === 0) return '';
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (pw.length > 24) return 'Password must be at most 24 characters';
  if (!/[A-Z]/.test(pw)) return 'Need at least one uppercase letter';
  if (!/[a-z]/.test(pw)) return 'Need at least one lowercase letter';
  if (!/\d/.test(pw)) return 'Need at least one number';
  if (!/[^a-zA-Z0-9]/.test(pw)) return 'Need at least one special character';
  return '';
}

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const passwordError = getPasswordError(password);
  const confirmError =
    confirmPassword.length > 0 && password !== confirmPassword
      ? "Passwords do not match"
      : "";
  const phoneError =
    phone.length > 0 && !PHONE_RULES.test(phone)
      ? "Phone number must be exactly 10 digits"
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!PHONE_RULES.test(phone.trim())) {
      setErrorMsg("Phone number must be exactly 10 digits");
      return;
    }
    if (!PASSWORD_RULES.test(password)) {
      setErrorMsg(passwordError || "Password does not meet requirements");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<{
        user: { id: string; email: string; role: string };
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          gender,
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      setUser(data.user);
      navigate("/listings");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="wrapper">
      <div id="login-register-wrapper">
        <div className="centered-div">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <img src={brandLogo} alt="Roombaazi" id="logo" />
          </div>

          <div className="glass-card">
            <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
              Create Account
            </h2>

            {errorMsg && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "#fee",
                  border: "1px solid #fcc",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              >
                <p style={{ color: "#c33", margin: 0, fontSize: "0.875rem" }}>
                  {errorMsg}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="input-style"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  className="input-style"
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as "Male" | "Female" | "Other")
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="input-style"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10-digit mobile number"
                  required
                />
                {phoneError && (
                  <p style={{ color: "#c33", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                    {phoneError}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="input-style"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-style"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.slice(0, 24))}
                    placeholder="Min 8 chars, upper, lower, number, special"
                    required
                    style={{ paddingRight: "2.75rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <p style={{ color: "#c33", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="input-style"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value.slice(0, 24))}
                    placeholder="Re-enter your password"
                    required
                    style={{ paddingRight: "2.75rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmError && (
                  <p style={{ color: "#c33", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                    {confirmError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: "1.5rem" }}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div
              style={{
                marginTop: "1.5rem",
                textAlign: "center",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.9375rem" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "var(--brand-secondary)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
