import { useEffect, useMemo, useState } from "react";

import { DEFAULT_USER_ID, listProperties } from "../api";
import FilterBar, { type Filters } from "../components/FilterBar";
import PropertyCard from "../components/PropertyCard";
import { navigate } from "../router";
import { mapBackendPropertyToUi, type Property } from "../types";

type StoredUser = {
  name?: string;
  userId?: string;
};

const defaultFilters: Filters = {
  area: "",
  propertyType: ""
};

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [propertyList, setPropertyList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<StoredUser>({ name: "User" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;
    const effectiveUserId = storedUser.userId || DEFAULT_USER_ID;

    setUser({
      name: storedUser.name || "User",
      userId: effectiveUserId
    });

    const loadProperties = async () => {
      setLoading(true);
      setError("");

      try {
        const properties = await listProperties(effectiveUserId);
        setPropertyList(properties.map(mapBackendPropertyToUi));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load properties.");
      } finally {
        setLoading(false);
      }
    };

    void loadProperties();
  }, []);

  const filtered = useMemo(() => {
    return propertyList.filter((property) => {
      if (
        search &&
        !property.title.toLowerCase().includes(search.toLowerCase()) &&
        !property.area.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      if (filters.area && property.area !== filters.area) {
        return false;
      }

      if (filters.propertyType && property.type !== filters.propertyType) {
        return false;
      }

      return true;
    });
  }, [search, filters, propertyList]);

  return (
    <main className="container">
      <div className="row">
        <h1>Hi, {user.name}</h1>
        <button onClick={() => navigate("/property/add")} disabled={!user.userId}>Add Property</button>
      </div>

      <input
        placeholder="Search by name or area"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <FilterBar filters={filters} setFilters={setFilters} />

      {loading ? <p>Loading properties...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <section className="property-grid">
        {filtered.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </section>
    </main>
  );
}
