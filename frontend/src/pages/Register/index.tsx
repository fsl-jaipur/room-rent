import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Tenant' | 'Landlord'>('Tenant');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      const data = await apiFetch<{ user: { id: string; email: string; role: string } }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          role,
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      setUser(data.user);
      navigate("/listings");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="glass-card">
        <h2 className="text-center mb-4">Create Account</h2>
        
        {errorMsg && <p style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="flex-col">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="input-style" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>I am signing up as</label>
            <select
              className="input-style"
              value={role}
              onChange={(e) => setRole(e.target.value as 'Tenant' | 'Landlord')}
            >
              <option value="Tenant">Tenant</option>
              <option value="Landlord">Landlord</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              className="input-style" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
          </div>

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
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account? <Link to="/login" style={{ color: 'var(--brand-primary)' }}>Log in here</Link>
        </p>
      </div>
    </div>
  );
}
