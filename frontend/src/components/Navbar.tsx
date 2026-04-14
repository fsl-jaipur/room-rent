import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';
import brandLogo from '../assets/Roombaazi Final Logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const profileCompletionPct = user
    ? Math.round(
        [
          user.hasFullName,
          user.hasEmail,
          user.hasPhone,
          user.hasGender,
          user.hasAadhaar,
          user.hasPhoto,
        ].filter(Boolean).length /
          6 *
          100
      )
    : 0;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? '/listings' : '/'} className="navbar-brand">
          <img
            src={brandLogo}
            alt="Roombaazi"
            className="navbar-brand-logo"
          />
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/listings" className={`nav-link ${isActive('/listings') ? 'active' : ''}`}>
                Browse
              </Link>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                My Properties
              </Link>
              <Link to="/add-listing" className="btn btn-primary btn-sm">
                + Post Property
              </Link>
              <Link to="/profile" className={`nav-link profile-link-wrapper ${isActive('/profile') ? 'active' : ''}`}>
                <User size={18} />
                Profile
                {user && (
                  <span className="profile-nudge-badge" title={profileCompletionPct < 100 ? 'Complete your profile!' : 'Profile complete'}>{profileCompletionPct}%</span>
                )}
              </Link>
              <button className="btn btn-outline btn-sm" onClick={logout}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

