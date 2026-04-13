import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';

type ListingCardProps = {
  listingId: string;
  title: string;
  colony: string;
  city: string;
  monthlyRent: number;
  rentTiers: { occupants: number; rent: number }[];
  maxOccupants: number;
  landlordGender: string | null;
  propertyTypeId: number | null;
  furnishingName: string;
  foodPreferenceName: string;
  coverPhotoUrl: string | null;
};

const propertyTypeMap: Record<number, string> = {
  1: 'PG',
  2: 'Individual',
  3: 'Flat',
};

export default function ListingCard(props: ListingCardProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <article
      className="listing-card"
      onClick={() => navigate(`/listings/${props.listingId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/listings/${props.listingId}`);
        }
      }}
    >
      <div className="listing-card-image">
        <div className="listing-card-badge">
          {props.maxOccupants} {props.maxOccupants === 1 ? 'BHK' : 'BHK'}
        </div>
        <div 
          className="listing-card-favorite"
          onClick={handleFavoriteClick}
          role="button"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            size={20} 
            fill={isFavorite ? "currentColor" : "none"}
            style={{ color: isFavorite ? '#ef4444' : 'currentColor' }}
          />
        </div>
        
        {props.coverPhotoUrl && !imageError ? (
          <img
            src={props.coverPhotoUrl}
            alt={props.title}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="listing-card-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>

      <div className="listing-card-content">
        <div className="listing-card-price">
          ₹{Number(props.monthlyRent).toLocaleString('en-IN')}
          <span className="listing-card-price-label">/mo</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.3rem' }}>
            ({props.maxOccupants} occ.)
          </span>
        </div>
        {props.rentTiers && props.rentTiers.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.4rem' }}>
            {[...props.rentTiers]
              .sort((a, b) => b.occupants - a.occupants)
              .map((tier) => (
                <span
                  key={tier.occupants}
                  style={{
                    fontSize: '0.75rem',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '999px',
                    padding: '0.1rem 0.5rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {tier.occupants} occ: ₹{Number(tier.rent).toLocaleString('en-IN')}
                </span>
              ))}
          </div>
        )}
        <h3 className="listing-card-title">{props.title}</h3>
        <p className="listing-card-location">
          <MapPin size={16} />
          {props.colony}, {props.city}
        </p>
        
        <div className="listing-card-features">
          <span className="feature-tag">{props.maxOccupants} {props.maxOccupants === 1 ? 'Person' : 'People'}</span>
          {props.propertyTypeId && (
            <span className="feature-tag">{propertyTypeMap[props.propertyTypeId] || 'Property'}</span>
          )}
          {props.landlordGender && (
            <span className="feature-tag">{props.landlordGender}</span>
          )}
          <span className="feature-tag">{props.furnishingName}</span>
        </div>
      </div>
    </article>
  );
}
