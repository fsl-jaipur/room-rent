import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddListing from './pages/AddListing';

function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-listing" element={<AddListing />} />
      </Routes>
    </div>
  );
}

export default App;
