import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Search } from 'lucide-react';
import brandLogo from '../assets/Roombaazi Final Logo.png';
import { useRef, useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isListings = location.pathname === '/listings';

  const urlSearch = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived state: sync input when URL changes externally (e.g. Clear all)
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setLocalSearch(urlSearch);
  }

  const fireDebounced = (value: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value.trim()) {
          next.set('search', value.trim());
        } else {
          next.delete('search');
        }
        next.set('page', '1');
        return next;
      }, { replace: true });
    }, 400);
  };

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

        {isListings && (
          <div style={{ position: 'relative', flex: 1, maxWidth: 420, margin: '0 1rem' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              className="input-style"
              style={{ paddingLeft: '2rem', fontSize: '0.82rem', height: '2.1rem', width: '100%' }}
              placeholder="Search by area, colony or city..."
              value={localSearch}
              onChange={(e) => { setLocalSearch(e.target.value); fireDebounced(e.target.value); }}
            />
          </div>
        )}

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

