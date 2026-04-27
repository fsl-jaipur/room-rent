import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Eye, EyeOff } from "lucide-react";
import brandLogo from "../../assets/Roombaazi Final Logo.png";
import SiteFooter from "../../components/SiteFooter";
import Select from "../../components/Select";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export default function Register() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const passwordRules = [
    {
      key: "length",
      label: "At least 6 characters",
      valid: password.length >= 6,
    },
    {
      key: "uppercase",
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      key: "number",
      label: "One number",
      valid: /\d/.test(password),
    },
  ];

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!phone.trim()) nextErrors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(phone.trim())) nextErrors.phone = "Enter a valid 10-digit mobile number";
    if (!email.trim()) nextErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "Enter a valid email address";
    if (!password) nextErrors.password = "Password is required";
    else if (passwordRules.some((rule) => !rule.valid)) nextErrors.password = "Please satisfy all password rules";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    return nextErrors;
  };

  const hasStartedPassword = password.length > 0;
  const bottomError = errorMsg || Object.values(fieldErrors)[0] || "";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    const nextErrors = validateForm();
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          gender,
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      await refreshSession();
      navigate("/browse");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell auth-shell">
      <main className="auth-main">
        <div className="page-container">
          <div className="auth-logo-wrap">
            <img src={brandLogo} alt="Roombaazi" />
          </div>

          <div className="surface-card auth-card">
            <h1 style={{ fontSize: "clamp(1.85rem, 4.2vw, 2.35rem)", textAlign: "center", marginBottom: 8 }}>Create Account</h1>
            <p style={{ textAlign: "center", marginBottom: 28 }}>Join thousands of renters &amp; owners</p>

            <form onSubmit={handleSubmit}>
              <div className="field" style={{ marginBottom: 18 }}>
                <label>Full Name</label>
                <input
                  className={`input-style ${fieldErrors.fullName ? "input-error" : ""}`}
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="field" style={{ marginBottom: 18 }}>
                <label>Gender</label>
                <Select
                  className={fieldErrors.gender ? "input-error" : ""}
                  value={gender}
                  onChange={(next) => {
                    setGender(next as typeof gender);
                    setFieldErrors((prev) => ({ ...prev, gender: "" }));
                  }}
                  options={GENDER_OPTIONS}
                  aria-label="Select gender"
                />
              </div>

              <div className="field" style={{ marginBottom: 18 }}>
                <label>Phone Number</label>
                <input
                  className={`input-style ${fieldErrors.phone ? "input-error" : ""}`}
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
                    setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>

              <div className="field" style={{ marginBottom: 18 }}>
                <label>Email Address</label>
                <input
                  className={`input-style ${fieldErrors.email ? "input-error" : ""}`}
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="field" style={{ marginBottom: 18 }}>
                <label>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className={`input-style ${fieldErrors.password ? "input-error" : ""}`}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder="Enter a strong password"
                    style={{ paddingRight: 54 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: 18,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      color: "var(--slate-600)",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {hasStartedPassword ? (
                  <div className="password-rules" aria-live="polite">
                    {passwordRules.map((rule) => (
                      <div key={rule.key} className={`password-rule ${rule.valid ? "valid" : "invalid"}`}>
                        <Check size={14} />
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className={`input-style ${fieldErrors.confirmPassword ? "input-error" : ""}`}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    placeholder="Re-enter your password"
                    style={{ paddingRight: 54 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: 18,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      color: "var(--slate-600)",
                      cursor: "pointer",
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {bottomError ? <div className="form-error-summary">{bottomError}</div> : null}

              <button className="btn btn-dark btn-block" style={{ marginTop: 24 }} disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="auth-link-row" style={{ marginTop: 28 }}>
              Already have an account? <Link to="/login">Log in</Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
