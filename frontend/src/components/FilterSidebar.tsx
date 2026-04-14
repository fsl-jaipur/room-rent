import { useEffect, useRef } from 'react';

type FilterState = {
  search: string;
  city: string;
  minRent: number;
  maxRent: number;
  maxOccupants: number[];
  floorLevelId: number[];
  furnishingTypeId: number[];
  foodPreferenceId: number[];
  propertyTypeId: number[];
  gender: ("Male" | "Female" | "Other")[];
  allowSmoking: boolean[];
  sortBy: 'newest' | 'rent_asc' | 'rent_desc';
};

type FilterSidebarProps = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onApply: (flushed: FilterState) => void;
  onClear: () => void;
};

const RENT_MIN = 1000;
const RENT_MAX = 50000;

const toggleNumber = (current: number[], value: number): number[] =>
  current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

const toggleExclusive = <T,>(current: T[], value: T): T[] =>
  current.includes(value) ? [] : [value];

const occupantOptions = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
  { value: 4, label: "Family" },
];

export default function FilterSidebar({ filters, onFilterChange, onApply, onClear }: FilterSidebarProps) {
  const latestFilters = useRef(filters);

  // Always keep latest filters ref current
  useEffect(() => { latestFilters.current = filters; });

  const handleApply = () => {
    onFilterChange(latestFilters.current);
    onApply(latestFilters.current);
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="btn-text" onClick={onClear}>Clear all</button>
      </div>

      {/* Budget sliders with labels */}
      <div className="filter-section">
        <label className="filter-label">Budget</label>

        <div style={{ marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Min Rent</span>
            <span style={{ fontWeight: 600 }}>{'₹'}{filters.minRent.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={RENT_MIN}
            max={RENT_MAX}
            step={500}
            value={filters.minRent}
            style={{ width: '100%' }}
            onChange={(e) => {
              const next = Number(e.target.value);
              onFilterChange({ ...filters, minRent: Math.min(next, filters.maxRent) });
            }}
          />
        </div>

        <div style={{ marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Max Rent</span>
            <span style={{ fontWeight: 600 }}>{'₹'}{filters.maxRent.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={RENT_MIN}
            max={RENT_MAX}
            step={500}
            value={filters.maxRent}
            style={{ width: '100%' }}
            onChange={(e) => {
              const next = Number(e.target.value);
              onFilterChange({ ...filters, maxRent: Math.max(next, filters.minRent) });
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
        </div>
      </div>

      {/* Occupants â€“ single select */}
      <div className="filter-section">
        <label className="filter-label">Occupants</label>
        <div className="checkbox-grid">
          {occupantOptions.map((option) => (
            <label key={option.value} className="checkbox-pill">
              <input
                type="checkbox"
                checked={filters.maxOccupants.includes(option.value)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    maxOccupants: toggleExclusive(filters.maxOccupants, option.value),
                  })
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Property Type â€“ single select */}
      <div className="filter-section">
        <label className="filter-label">Property Type</label>
        <div className="checkbox-list">
          {[
            { id: 1, name: 'PG' },
            { id: 2, name: 'Individual' },
            { id: 3, name: 'Flat' },
          ].map((type) => (
            <label key={type.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.propertyTypeId.includes(type.id)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    propertyTypeId: toggleExclusive(filters.propertyTypeId, type.id),
                  })
                }
              />
              <span>{type.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Room For (Gender) â€“ single select */}
      <div className="filter-section">
        <label className="filter-label">Room For</label>
        <div className="checkbox-list">
          {["Male", "Female", "Other"].map((g) => (
            <label key={g} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.gender.includes(g as "Male" | "Female" | "Other")}
                onChange={() => {
                  const value = g as "Male" | "Female" | "Other";
                  onFilterChange({
                    ...filters,
                    gender: toggleExclusive(filters.gender, value),
                  });
                }}
              />
              <span>{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Furnishing */}
      <div className="filter-section">
        <label className="filter-label">Furnishing</label>
        <div className="checkbox-list">
          {[
            { id: 1, name: 'Unfurnished' },
            { id: 2, name: 'Semi-Furnished' },
            { id: 3, name: 'Fully-Furnished' },
          ].map((f) => (
            <label key={f.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.furnishingTypeId.includes(f.id)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    furnishingTypeId: toggleNumber(filters.furnishingTypeId, f.id),
                  })
                }
              />
              <span>{f.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Food Preference */}
      <div className="filter-section">
        <label className="filter-label">Food Preference</label>
        <div className="checkbox-list">
          {[
            { id: 1, name: 'Veg Only' },
            { id: 2, name: 'Non-Veg Allowed' },
            { id: 3, name: 'No Restriction' },
          ].map((f) => (
            <label key={f.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.foodPreferenceId.includes(f.id)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    foodPreferenceId: toggleNumber(filters.foodPreferenceId, f.id),
                  })
                }
              />
              <span>{f.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="btn btn-primary w-full" onClick={handleApply}>
        Apply Filters
      </button>
    </aside>
  );
}
