import { Link } from "react-router-dom";
import { Search, Home as HomeIcon, Shield, Clock, Star, Quote } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import brandLogo from "../../assets/Roombaazi Final Logo.png";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Tenant · Mumbai",
    avatar: "PS",
    rating: 5,
    review:
      "Found my perfect PG within 2 days of signing up! The filters made it so easy to narrow down exactly what I needed. The landlord was verified and the photos matched the real place. Highly recommend Roombaazi to anyone moving to a new city.",
  },
  {
    id: 2,
    name: "Arjun Mehta",
    role: "Landlord · Pune",
    avatar: "AM",
    rating: 5,
    review:
      "I listed my 2 rooms and got genuine inquiries within the first week. Roombaazi helped me find responsible tenants without any hassle. The listing process is straightforward and the interface is clean. Great platform for landlords!",
  },
  {
    id: 3,
    name: "Sneha Kulkarni",
    role: "Tenant · Bangalore",
    avatar: "SK",
    rating: 5,
    review:
      "As a working professional relocating from Nagpur, Roombaazi was a lifesaver. The location picker and map view helped me find a room close to my office. Everything was transparent — rent, deposit, amenities. No surprises!",
  },
  {
    id: 4,
    name: "Rohit Desai",
    role: "Landlord · Hyderabad",
    avatar: "RD",
    rating: 4,
    review:
      "Managing my properties has become much simpler. I can update availability, pause listings, and connect with tenants all in one place. The platform is genuinely built with both landlords and tenants in mind.",
  },
  {
    id: 5,
    name: "Anjali Verma",
    role: "Tenant · Delhi",
    avatar: "AV",
    rating: 5,
    review:
      "The best thing about Roombaazi is how genuine the listings feel. Every property I visited matched its description online. I finally settled in a fully-furnished room at a fair price. Zero broker fees, zero stress!",
  },
  {
    id: 6,
    name: "Karan Joshi",
    role: "Tenant · Chennai",
    avatar: "KJ",
    rating: 5,
    review:
      "Coming from a small town, I was nervous about finding accommodation in Chennai. Roombaazi's verified listings gave me confidence. I booked a viewing online and moved in the same week. Absolutely seamless experience.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div id="wrapper">
      <section id="hero">
        <div style={{ width: "100%" }}>
          <img id="logo" src={brandLogo} alt="Roombaazi" />
          <h1>Find Your Perfect Rental Home</h1>
          <p>
            Discover thousands of verified rental properties. Simple, safe, and
            hassle-free.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {user ? (
              <>
                <Link to="/listings" style={{ textDecoration: "none" }}>
                  <button
                    className="btn btn-accent"
                    style={{
                      padding: "0.875rem 2rem",
                      fontSize: "1.0625rem",
                      fontWeight: 600,
                    }}
                  >
                    <Search size={20} />
                    Browse Properties
                  </button>
                </Link>
                <Link to="/add-listing" style={{ textDecoration: "none" }}>
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: "0.875rem 2rem",
                      fontSize: "1.0625rem",
                      fontWeight: 600,
                    }}
                  >
                    Post Your Property
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <button
                    className="btn btn-accent"
                    style={{
                      padding: "0.875rem 2rem",
                      fontSize: "1.0625rem",
                      fontWeight: 600,
                    }}
                  >
                    Get Started
                  </button>
                </Link>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: "0.875rem 2rem",
                      fontSize: "1.0625rem",
                      fontWeight: 600,
                    }}
                  >
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: "4rem 1.5rem", background: "var(--bg-card)" }}>
        <div style={{ width: "100%" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "2rem",
              marginBottom: "3rem",
              color: "var(--text-main)",
            }}
          >
            Why Choose Roombaazi?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "linear-gradient(135deg, rgba(31, 79, 118, 0.15) 0%, rgba(239, 180, 91, 0.2) 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  color: "var(--brand-primary)",
                }}
              >
                <Search size={36} />
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
                Easy Search
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                Find your ideal property with powerful filters and smart search
              </p>
            </div>

            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "linear-gradient(135deg, rgba(31, 79, 118, 0.15) 0%, rgba(239, 180, 91, 0.2) 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  color: "var(--brand-primary)",
                }}
              >
                <Shield size={36} />
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
                Verified Listings
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                All properties are verified for authenticity and accuracy
              </p>
            </div>

            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "linear-gradient(135deg, rgba(31, 79, 118, 0.15) 0%, rgba(239, 180, 91, 0.2) 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  color: "var(--brand-primary)",
                }}
              >
                <Clock size={36} />
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
                Quick Process
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                Connect with owners instantly and move in faster
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "5rem 1.5rem", background: "var(--bg-color)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.75rem" }}>
              What Our Users Say
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: "520px", margin: "0 auto" }}>
              Thousands of tenants and landlords trust Roombaazi every day
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginTop: "0.75rem" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={20} fill="var(--brand-accent)" stroke="var(--brand-accent)" />
              ))}
              <span style={{ marginLeft: "0.5rem", fontWeight: 600, color: "var(--text-main)", fontSize: "0.95rem" }}>
                4.9 / 5 from 2,400+ reviews
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "16px",
                  padding: "1.75rem",
                  boxShadow: "var(--shadow-card)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                {/* Quote icon */}
                <Quote size={28} style={{ color: "var(--brand-accent)", flexShrink: 0 }} />

                {/* Stars */}
                <div style={{ display: "flex", gap: "3px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={15}
                      fill={s <= t.rating ? "var(--brand-accent)" : "none"}
                      stroke={s <= t.rating ? "var(--brand-accent)" : "var(--text-light)"}
                    />
                  ))}
                </div>

                {/* Review text */}
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.9375rem", flexGrow: 1, margin: 0 }}>
                  "{t.review}"
                </p>

                {/* Reviewer */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      flexShrink: 0,
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>{t.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "4rem 1.5rem",
          background: "var(--bg-color)",
          textAlign: "center",
        }}
      >
        <div style={{ width: "100%" }}>
          <HomeIcon
            size={48}
            style={{ color: "var(--brand-primary)", marginBottom: "1.5rem" }}
          />
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Ready to Find Your Home?
          </h2>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--text-muted)",
              marginBottom: "2rem",
              lineHeight: "1.6",
            }}
          >
            Join thousands of happy tenants and landlords on Roombaazi
          </p>
          <Link
            to={user ? "/listings" : "/register"}
            style={{ textDecoration: "none" }}
          >
            <button
              className="btn btn-primary"
              style={{
                padding: "0.875rem 2.5rem",
                fontSize: "1.0625rem",
              }}
            >
              {user ? "Browse Properties" : "Get Started Free"}
            </button>
          </Link>
        </div>
      </section>

      <footer
        style={{
          background: "var(--brand-dark)",
          color: "white",
          padding: "2rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ width: "100%" }}>
          <img
            src={brandLogo}
            alt="Roombaazi"
            style={{
              width: "168px",
              maxWidth: "70%",
              margin: "0 auto 0.75rem",
              display: "block",
            }}
          />
          <p style={{ margin: 0, opacity: 0.9, color: "white" }}>
            © 2026 Roombaazi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
