import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="glass-card text-center" style={{ marginTop: '10%' }}>
      <h1>Landlord Dashboard</h1>
      <p className="mb-4">Welcome back! Ready to list a new property?</p>
      
      <Link to="/add-listing" style={{ textDecoration: 'none' }}>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
          <PlusCircle size={20} />
          Add New Listing
        </button>
      </Link>
    </div>
  );
}
