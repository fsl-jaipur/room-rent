import type { Dispatch, SetStateAction } from "react";

export type Filters = {
  area: string;
  propertyType: string;
};

type Props = {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
};

const AREAS = ["", "Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Electronic City"];
const TYPES = ["", "1 BHK", "2 BHK", "3 BHK", "Studio"];

export default function FilterBar({ filters, setFilters }: Props) {
  return (
    <div className="filter-bar">
      <label>
        Area
        <select value={filters.area} onChange={(event) => setFilters((prev) => ({ ...prev, area: event.target.value }))}>
          {AREAS.map((item) => (
            <option key={item || "all-area"} value={item}>{item || "All"}</option>
          ))}
        </select>
      </label>

      <label>
        Type
        <select value={filters.propertyType} onChange={(event) => setFilters((prev) => ({ ...prev, propertyType: event.target.value }))}>
          {TYPES.map((item) => (
            <option key={item || "all-type"} value={item}>{item || "All"}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
