import { MapPin } from 'lucide-react';

type FilterSidebarProps = {
  filters: {
    search: string;
    minRent: number;
    maxRent: number;
    maxOccupants: number[];
    floorLevelId: number[];
    furnishingTypeId: number[];
    foodPreferenceId: number[];
    propertyTypeId: number[];
    gender: ("Male" | "Female")[];
    allowSmoking: boolean[];
    sortBy: 'newest' | 'rent_asc' | 'rent_desc';
  };
  onFilterChange: (filters: FilterSidebarProps["filters"]) => void;
  onApply: () => void;
  onClear: () => void;
};

const RENT_MIN = 1000;
const RENT_MAX = 50000;

const toggleNumber = (current: number[], value: number): number[] =>
  current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

const occupantOptions = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
  { value: 4, label: "Family" },
];

export default function FilterSidebar({ filters, onFilterChange, onApply, onClear }: FilterSidebarProps) {
  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="btn-text" onClick={onClear}>Clear all</button>
      </div>

      <div className="filter-section">
        <label className="filter-label">
          <MapPin size={16} style={{ display: 'inline', marginRight: '0.375rem' }} />
          Search Location
        </label>
        <input
          className="input-style"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Enter locality, city..."
        />
      </div>

      <div className="filter-section">
        <label className="filter-label">Budget</label>
        <div className="budget-display">
          ₹{filters.minRent.toLocaleString('en-IN')} - ₹{filters.maxRent.toLocaleString('en-IN')}
        </div>
        <div className="range-inputs">
          <input
            type="range"
            min={RENT_MIN}
            max={RENT_MAX}
            step={500}
            value={filters.minRent}
            onChange={(e) => {
              const next = Number(e.target.value);
              onFilterChange({ ...filters, minRent: Math.min(next, filters.maxRent) });
            }}
          />
          <input
            type="range"
            min={RENT_MIN}
            max={RENT_MAX}
            step={500}
            value={filters.maxRent}
            onChange={(e) => {
              const next = Number(e.target.value);
              onFilterChange({ ...filters, maxRent: Math.max(next, filters.minRent) });
            }}
          />
        </div>
      </div>

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
                    maxOccupants: toggleNumber(filters.maxOccupants, option.value),
                  })
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

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
                    propertyTypeId: toggleNumber(filters.propertyTypeId, type.id),
                  })
                }
              />
              <span>{type.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Room For </label>
        <div className="checkbox-list">
          {["Male", "Female"].map((g) => (
            <label key={g} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.gender.includes(g as "Male" | "Female")}
                onChange={() => {
                  const value = g as "Male" | "Female";
                  onFilterChange({
                    ...filters,
                    gender: filters.gender.includes(value)
                      ? filters.gender.filter((item) => item !== value)
                      : [...filters.gender, value],
                  });
                }}
              />
              <span>{g}</span>
            </label>
          ))}
        </div>
      </div>

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

      <button className="btn btn-primary w-full" onClick={onApply}>
        Apply Filters
      </button>
    </aside>
  );
}
