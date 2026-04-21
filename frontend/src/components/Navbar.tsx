import { Link, useLocation } from "react-router-dom";
import { User, ArrowRightToLine, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import brandLogo from "../assets/Roombaazi Final Logo.png";

const routeAliases: Record<string, string[]> = {
  browse: ["/browse", "/listings", "/listings/"],
  properties: ["/my-properties", "/dashboard"],
  post: ["/post-property", "/add-listing"],
  profile: ["/profile"],
};

const matchAlias = (pathname: string, aliases: string[]) =>
  aliases.some((alias) => pathname === alias || pathname.startsWith(alias));

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAuthenticated = Boolean(user);

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <Link to={isAuthenticated ? "/browse" : "/"} className="brand-link">
          <img className="brand-logo" src={brandLogo} alt="Roombaazi" />
        </Link>

        <nav className="nav-center" aria-label="Primary">
          <Link
            to={isAuthenticated ? "/browse" : "/"}
            className={`nav-link ${matchAlias(location.pathname, routeAliases.browse) ? "active" : ""}`}
          >
            Browse
          </Link>
          <Link
            to={isAuthenticated ? "/my-properties" : "/login"}
            className={`nav-link ${matchAlias(location.pathname, routeAliases.properties) ? "active" : ""}`}
          >
            My Properties
          </Link>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link to="/post-property" className="btn btn-primary btn-sm">
                <Plus size={18} />
                Post Property
                <span className="btn-free-tag">FREE</span>
              </Link>
              <Link
                to="/profile"
                className={`nav-link ${matchAlias(location.pathname, routeAliases.profile) ? "active" : ""}`}
              >
                <User size={18} />
                Profile
              </Link>
              <button className="icon-pill" onClick={() => void logout()} aria-label="Logout">
                <ArrowRightToLine size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
