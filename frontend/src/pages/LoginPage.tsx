import { useEffect, useState } from "react";

import { createUser, DEFAULT_USER_ID, getHealth, getUser, updateUser } from "../api";
import { navigate } from "../router";

type Step = "details" | "otp" | "location";

type StoredUser = {
  name?: string;
  phone?: string;
  address?: string;
  userId?: string;
};

function buildUserPayload(name: string, phone: string, address: string) {
  const fullAddress = address.trim().length >= 10 ? address.trim() : `${address.trim()}, Bangalore`;

  return {
    userName: name.trim(),
    phone: phone.trim(),
    localAddress: fullAddress
  };
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("Checking API...");

  useEffect(() => {
    const initialize = async () => {
      try {
        const health = await getHealth();
        setApiStatus(`${health.service} is ${health.status}`);
      } catch {
        setApiStatus("API unavailable");
      }

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;
      if (savedUser.name) setName(savedUser.name);
      if (savedUser.phone) setPhone(savedUser.phone.replace(/^\+91/, ""));
      if (savedUser.address) setAddress(savedUser.address);

      const configuredUserId = savedUser.userId || DEFAULT_USER_ID;
      if (!configuredUserId) return;

      try {
        const apiUser = await getUser(configuredUserId);
        setName(apiUser.userName);
        setPhone(apiUser.phone.replace(/^\+91/, ""));
        setAddress(apiUser.localAddress);
      } catch {
        // Keep local values when fetch fails.
      }
    };

    void initialize();
  }, []);

  const handleContinue = async () => {
    setSaving(true);
    setError("");

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;
    const userId = currentUser.userId || DEFAULT_USER_ID;

    try {
      const payload = buildUserPayload(name, phone, address);

      if (userId) {
        await updateUser(userId, payload);
      } else {
        await createUser(payload);
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          name,
          phone,
          address,
          userId
        })
      );
      navigate("/home");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to sync user with backend.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container">
      <h1>Rent App</h1>
      <p>{apiStatus}</p>

      {step === "details" && (
        <section className="card">
          <input placeholder="Full Name" value={name} onChange={(event) => setName(event.target.value)} />
          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
          />
          <button disabled={!name.trim() || phone.length < 10} onClick={() => setStep("otp")}>Send OTP</button>
        </section>
      )}

      {step === "otp" && (
        <section className="card">
          <input
            placeholder="Enter 4-digit OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))}
          />
          <button disabled={otp.length < 4} onClick={() => setStep("location")}>Verify OTP</button>
          <button className="secondary" onClick={() => setStep("details")}>Change number</button>
        </section>
      )}

      {step === "location" && (
        <section className="card">
          <input placeholder="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
          {error ? <p className="error">{error}</p> : null}
          <button disabled={!address.trim() || saving} onClick={() => void handleContinue()}>
            {saving ? "Saving..." : "Continue"}
          </button>
        </section>
      )}
    </main>
  );
}
