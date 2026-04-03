import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const data = await apiFetch<{ user: { id: string; email: string; role: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      setUser(data.user);
      navigate("/listings");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="glass-card">
        <h2 className="text-center mb-4">Welcome Back</h2>
        
        {errorMsg && <p style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="flex-col">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input-style" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-style" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center mt-4">
          Don't have an account? <Link to="/register" style={{ color: 'var(--brand-primary)' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
