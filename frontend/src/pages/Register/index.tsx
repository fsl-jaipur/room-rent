import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import brandLogo from "../../assets/Roombaazi Final Logo.png";

const PHONE_RULES = /^\d{10}$/;

function hasSequenceOrRepeat(pw: string): boolean {
  for (let i = 0; i <= pw.length - 3; i++) {
    const a = pw.charCodeAt(i);
    const b = pw.charCodeAt(i + 1);
    const c = pw.charCodeAt(i + 2);
    if (b === a + 1 && c === a + 2) return true; // ascending: 123, abc
    if (b === a - 1 && c === a - 2) return true; // descending: 321, cba
    if (a === b && b === c) return true;           // repeated: 000, aaa
  }
  return false;
}

function getPasswordChecks(pw: string) {
  return {
    length:    pw.length >= 11 && pw.length <= 15,
    casing:    /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    numSpecial: /\d/.test(pw) && /[^a-zA-Z0-9]/.test(pw),
    noSequence: pw.length > 0 && !hasSequenceOrRepeat(pw),
  };
}

function isPasswordStrong(pw: string): boolean {
  const c = getPasswordChecks(pw);
  return c.length && c.casing && c.numSpecial && c.noSequence;
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
  const { refreshSession } = useAuth();

  const passwordChecks = getPasswordChecks(password);
  const passwordStrong = isPasswordStrong(password);
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
    if (!passwordStrong) {
      setErrorMsg("Password is not secure and password must be Strong.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiFetch<{
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

      await refreshSession();
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
                    onChange={(e) => setPassword(e.target.value.slice(0, 15))}
                    placeholder="Enter a strong password"
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
                {password.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    {!passwordStrong && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.5rem 0.75rem",
                        background: "#fee",
                        border: "1px solid #fcc",
                        borderRadius: "4px",
                        marginBottom: "0.5rem",
                      }}>
                        <span style={{ color: "#c33", fontWeight: 700, fontSize: "1rem" }}>⊗</span>
                        <p style={{ color: "#c33", margin: 0, fontSize: "0.8rem" }}>
                          Password is not secure and password must be Strong.
                        </p>
                      </div>
                    )}
                    {([
                      [passwordChecks.length,     "Minimum 8 to Maximum 24 characters allowed."],
                      [passwordChecks.casing,     "Password must contain at least one small and one capital alphabet."],
                      [passwordChecks.numSpecial, "At least one Numeric digit and one special character (@#$%^&* etc.)"],
                      [passwordChecks.noSequence, "Password should not contain any sequence or repeated numbers like 123, 000, 111\u00a0, abc\u00a0, aaa etc."],
                    ] as [boolean, string][]).map(([pass, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", marginBottom: "0.2rem" }}>
                        <span style={{ color: pass ? "#16a34a" : "#c33", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0, lineHeight: "1.4" }}>
                          {pass ? "✓" : "✗"}
                        </span>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: pass ? "#16a34a" : "#c33", lineHeight: "1.4" }}>
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
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
