'use client'

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, User, Shield } from "lucide-react";
import { createUser, getHealth, getUser, updateUser } from "@/lib/api";

type Step = "details" | "otp" | "location";

type StoredUser = {
  name?: string;
  phone?: string;
  address?: string;
  userId?: string;
};

function buildUserPayload(name: string, phone: string, address: string) {
  const normalizedPhone = `+91${phone}`;
  const fullAddress = address.trim().length >= 10 ? address.trim() : `${address.trim()}, Bangalore`;

  return {
    userName: name.trim(),
    phone: phone.trim(),
    localAddress: fullAddress
  };
}
export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
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

      const configuredUserId = savedUser.userId || process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
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

  const handleSendOtp = () => {
    if (name.trim() && phone.trim().length >= 10) {
      setError("");
      setStep("otp");
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      setError("");
      setStep("location");
    }
  };

  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setAddress("Koramangala, Bangalore");
          setLocating(false);
        },
        () => {
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    setError("");

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;
    const userId = currentUser.userId || process.env.NEXT_PUBLIC_DEFAULT_USER_ID;

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
      router.push("/home");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to sync user with backend.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="pt-12 pb-8 px-6 text-center">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Find Your <span className="text-primary">Home</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-body">
          Discover rental properties near you
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-body">API: {apiStatus}</p>
      </div>

      <div className="flex items-center justify-center gap-2 px-6 mb-8">
        {["details", "otp", "location"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-heading font-semibold transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : ["details", "otp", "location"].indexOf(step) > i
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div
                className={`w-12 h-0.5 ${
                  ["details", "otp", "location"].indexOf(step) > i
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 px-6">
        {step === "details" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <label className="text-sm font-body font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-card border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-body font-medium text-foreground">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="pl-10 h-12 rounded-xl bg-card border-border"
                  type="tel"
                />
              </div>
            </div>
            <Button
              onClick={handleSendOtp}
              disabled={!name.trim() || phone.length < 10}
              className="w-full h-12 rounded-xl font-heading font-semibold text-base"
            >
              Send OTP
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-4">
              <Shield className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body">
                OTP sent to <span className="font-semibold text-foreground">+91 {phone}</span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-body font-medium text-foreground">Enter OTP</label>
              <Input
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="h-14 rounded-xl bg-card border-border text-center text-2xl tracking-[1em] font-heading"
                type="tel"
              />
            </div>
            <Button
              onClick={handleVerifyOtp}
              disabled={otp.length < 4}
              className="w-full h-12 rounded-xl font-heading font-semibold text-base"
            >
              Verify OTP
            </Button>
            <button
              onClick={() => setStep("details")}
              className="w-full text-sm text-primary font-body hover:underline"
            >
              Change number
            </button>
          </div>
        )}

        {step === "location" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-4">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body">
                Set your location to find nearby properties
              </p>
            </div>
            <Button
              onClick={handleGetLocation}
              variant="outline"
              disabled={locating}
              className="w-full h-12 rounded-xl font-heading font-semibold text-base border-primary text-primary hover:bg-primary/5"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {locating ? "Detecting..." : "Use Current Location"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-sm text-muted-foreground font-body">or</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-body font-medium text-foreground">Enter Address</label>
              <Input
                placeholder="e.g. Koramangala, Bangalore"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12 rounded-xl bg-card border-border"
              />
            </div>
            {error ? <p className="text-sm text-destructive font-body">{error}</p> : null}
            <Button
              onClick={handleContinue}
              disabled={!address.trim() || saving}
              className="w-full h-12 rounded-xl font-heading font-semibold text-base"
            >
              {saving ? "Saving..." : "Continue"}
            </Button>
          </div>
        )}
      </div>

      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground font-body">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}



