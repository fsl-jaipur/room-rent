import { useState } from 'react';
import { MapPin, Plus, Trash2, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LocationState {
  latitude: number;
  longitude: number;
}

interface RoomDetails {
  id: string; // for React keys
  floorLevelId: number;
  maxOccupants: number;
  foodPreferenceId: number;
  allowSmoking: boolean;
  monthlyRent: number;
  furnishingTypeId: number;
  availableFrom: string;
}

export default function AddListing() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Location, 2: Rooms, 3: Success
  const [location, setLocation] = useState<LocationState | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [rooms, setRooms] = useState<RoomDetails[]>([
    {
      id: crypto.randomUUID(),
      floorLevelId: 1,
      maxOccupants: 1,
      foodPreferenceId: 1,
      allowSmoking: false,
      monthlyRent: 5000,
      furnishingTypeId: 1,
      availableFrom: new Date().toISOString().split('T')[0],
    }
  ]);

  const handleFetchLocation = () => {
    setIsLocating(true);
    setErrorMsg('');
    
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setAddress(''); // Clear plain english address
        setIsLocating(false);
        setStep(2);
      },
      (error) => {
        console.error(error);
        setErrorMsg('Failed to fetch location. Please ensure you have granted location permissions.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim().length > 5) {
      setLocation(null); // Clear coords to rely strictly on address forward-geocoding
      setStep(2);
    } else {
      setErrorMsg('Please enter a full, valid address');
    }
  };

  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      {
        id: crypto.randomUUID(),
        floorLevelId: 1,
        maxOccupants: 1,
        foodPreferenceId: 1,
        allowSmoking: false,
        monthlyRent: 5000,
        furnishingTypeId: 1,
        availableFrom: new Date().toISOString().split('T')[0],
      }
    ]);
  };

  const handleRemoveRoom = (id: string) => {
    if (rooms.length === 1) return; // Must have at least 1 room
    setRooms(rooms.filter(r => r.id !== id));
  };

  const updateRoom = (id: string, field: keyof RoomDetails, value: any) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async () => {
    if (!location && !address) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Format payload correctly (stripping UI-only ids)
      const payloadRooms = rooms.map(({ id, ...rest }) => rest);
      
      const isBulk = payloadRooms.length > 1;
      const url = `http://localhost:5000/api/listings${isBulk ? '/bulk' : ''}`;
      
      const body = isBulk 
        ? { location, address, rooms: payloadRooms }
        : { location, address, room: payloadRooms[0] };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: "include"
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit listing');
      }

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <h1 className="mb-4">Host a new room</h1>
      
      {/* STEP 1: LOCATION */}
      {step === 1 && (
        <div className="glass-card text-center text-left">
          <h2 className="text-center">Where is your property located?</h2>
          <p className="mb-4 text-center">We'll precisely pinpoint your location to help tenants find you easily.</p>
          
          <div className="text-center mb-4">
            <button 
              className="btn btn-primary" 
              onClick={handleFetchLocation}
              disabled={isLocating}
            >
              <MapPin size={20} />
              {isLocating ? 'Locating...' : 'Fetch My Location'}
            </button>
          </div>

          <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ padding: '0 1rem', fontSize: '0.9rem' }}>OR ENTER MANUALLY</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <form onSubmit={handleManualLocation} className="flex-col" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Full Property Address</label>
              <textarea 
                className="input-style" 
                placeholder="e.g. Plot No 24, Near SBI Bank, Malviya Nagar, Jaipur, Rajasthan 302017"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                required 
              />
            </div>
            <button type="submit" className="btn btn-outline" style={{ width: '100%' }}>
              Confirm Address
            </button>
          </form>
          
          {errorMsg && <p className="mt-4 text-center" style={{ color: '#ef4444' }}>{errorMsg}</p>}
        </div>
      )}

      {/* STEP 2: ROOM DETAILS */}
      {step === 2 && (
        <>
          <div className="mb-4 flex-row justify-between">
            <h2>Room Details</h2>
            <button className="btn btn-outline" onClick={handleAddRoom}>
              <Plus size={18} /> Add Another Room
            </button>
          </div>

          <div className="flex-col">
            {rooms.map((room, index) => (
              <div key={room.id} className="glass-card" style={{ position: 'relative' }}>
                {rooms.length > 1 && (
                  <button 
                    onClick={() => handleRemoveRoom(room.id)}
                    className="btn btn-danger"
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem' }}
                    aria-label="Remove room"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                
                <h3 className="mb-4">Room {index + 1}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  
                  <div className="form-group">
                    <label>Floor Level</label>
                    <select 
                      className="input-style"
                      value={room.floorLevelId}
                      onChange={(e) => updateRoom(room.id, 'floorLevelId', parseInt(e.target.value))}
                    >
                      <option value={1}>Ground Floor</option>
                      <option value={2}>1st Floor</option>
                      <option value={3}>2nd Floor</option>
                      <option value={4}>3rd Floor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Max Occupants</label>
                    <input 
                      type="number" min="1" max="4"
                      className="input-style"
                      value={room.maxOccupants}
                      onChange={(e) => updateRoom(room.id, 'maxOccupants', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Monthly Rent (₹)</label>
                    <input 
                      type="number" min="0" step="500"
                      className="input-style"
                      value={room.monthlyRent}
                      onChange={(e) => updateRoom(room.id, 'monthlyRent', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Furnishing</label>
                    <select 
                      className="input-style"
                      value={room.furnishingTypeId}
                      onChange={(e) => updateRoom(room.id, 'furnishingTypeId', parseInt(e.target.value))}
                    >
                      <option value={1}>Unfurnished</option>
                      <option value={2}>Semi-Furnished</option>
                      <option value={3}>Fully-Furnished</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Food Preference</label>
                    <select 
                      className="input-style"
                      value={room.foodPreferenceId}
                      onChange={(e) => updateRoom(room.id, 'foodPreferenceId', parseInt(e.target.value))}
                    >
                      <option value={1}>Any / No Restrictions</option>
                      <option value={2}>Vegetarian Only</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Available From</label>
                    <input 
                      type="date"
                      className="input-style"
                      value={room.availableFrom}
                      onChange={(e) => updateRoom(room.id, 'availableFrom', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="checkbox-group">
                      <input 
                        type="checkbox" 
                        checked={room.allowSmoking}
                        onChange={(e) => updateRoom(room.id, 'allowSmoking', e.target.checked)}
                      />
                      Smoking Allowed
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {errorMsg && <p className="text-center" style={{ color: '#ef4444' }}>{errorMsg}</p>}

            <div className="text-center mt-4">
              <button 
                className="btn btn-primary" 
                style={{ width: '200px' }}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : <><Send size={18} /> Publish Listing</>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 3 && (
        <div className="glass-card text-center">
          <CheckCircle2 color="#10b981" size={64} style={{ margin: '0 auto 1.5rem' }} />
          <h2>Successfully Published!</h2>
          <p className="mb-4">Your rooms are now active and visible to potential tenants.</p>
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
