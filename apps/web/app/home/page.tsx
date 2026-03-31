'use client'

import { useEffect, useMemo, useState } from "react";
import { Search, MapPin } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import FilterBar, { type Filters } from "@/components/FilterBar";
import { listProperties } from "@/lib/api";
import { mapBackendPropertyToUi, type Property } from "@/lib/property";

type StoredUser = {
  name?: string;
  phone?: string;
  address?: string;
  userId?: string;
};

const defaultFilters: Filters = {
  area: "",
  amountRange: "",
  propertyType: "",
  smoking: "",
  foodPreference: "",
  interior: ""
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [propertyList, setPropertyList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<StoredUser>({ name: "User", address: "Bangalore" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;
    const effectiveUserId = storedUser.userId || process.env.NEXT_PUBLIC_DEFAULT_USER_ID;

    setUser({
      name: storedUser.name || "User",
      phone: storedUser.phone,
      address: storedUser.address || "Bangalore",
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
    return propertyList.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.area.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.area && p.area !== filters.area) return false;
      if (filters.propertyType && p.type !== filters.propertyType) return false;
      if (filters.smoking && p.smoking !== filters.smoking) return false;
      if (filters.foodPreference && p.foodPreference !== filters.foodPreference) return false;
      if (filters.interior && p.interior !== filters.interior) return false;
      if (filters.amountRange) {
        if (filters.amountRange.includes("Under") && p.amount >= 10000) return false;
        if (filters.amountRange.includes("10K") && filters.amountRange.includes("20K") && (p.amount < 10000 || p.amount > 20000)) return false;
        if (filters.amountRange.includes("20K") && filters.amountRange.includes("30K") && (p.amount < 20000 || p.amount > 30000)) return false;
        if (filters.amountRange.includes("Above") && p.amount <= 30000) return false;
      }
      return true;
    });
  }, [search, filters, propertyList]);

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="bg-primary px-5 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm font-body">Hello, {user.name}!</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-primary-foreground/80" />
              <span className="text-primary-foreground text-sm font-heading font-medium">{user.address || "Bangalore"}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card border-0 text-foreground placeholder:text-muted-foreground font-body"
          />
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        <FilterBar filters={filters} onChange={setFilters} />

        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading font-bold text-lg text-foreground">Properties</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-body">{filtered.length} found</span>
            <Button size="sm" className="rounded-xl gap-1.5 font-heading" asChild disabled={!user.userId}>
              <Link href="/property/add">Add Property</Link>
            </Button>
          </div>
        </div>

        {!user.userId ? (
          <p className="text-xs text-muted-foreground font-body">
            Add Property is disabled because no userId is available. Set NEXT_PUBLIC_DEFAULT_USER_ID in web env or store userId in localStorage.
          </p>
        ) : null}

        {loading ? <p className="text-sm text-muted-foreground font-body">Loading properties...</p> : null}
        {error ? <p className="text-sm text-destructive font-body">{error}</p> : null}

        {!loading && !error ? (
          <div className="space-y-4">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground font-body">No properties match your filters</p>
                <button
                  onClick={() => {
                    setFilters(defaultFilters);
                    setSearch("");
                  }}
                  className="text-primary text-sm font-body mt-2 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
