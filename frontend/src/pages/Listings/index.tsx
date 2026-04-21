import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter";
import FilterSidebar from "../../components/FilterSidebar";
import ListingCard from "../../components/ListingCard";
import Skeleton from "../../components/Skeleton";
import { ApiError, apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type Listing = {
  listingId: string;
  title: string;
  colony: string;
  city: string;
  monthlyRent: number;
  rentTiers: { occupants: number; rent: number }[];
  maxOccupants: number;
  landlordGender: string | null;
  furnishingName: string;
  propertyTypeId: number | null;
  foodPreferenceName: string;
  coverPhotoUrl: string | null;
  createdAt?: string;
};

type ListingsResponse = {
  page: number;
  total: number;
  totalPages: number;
  items: Listing[];
};

type FilterState = {
  search: string;
  minRent: number;
  maxRent: number;
  maxOccupants: number[];
  furnishingTypeId: number[];
  propertyTypeId: number[];
  sortBy: "newest" | "rent_asc" | "rent_desc";
};

const RENT_MIN = 1000;
const RENT_MAX = 50000;

const defaultFilters: FilterState = {
  search: "",
  minRent: RENT_MIN,
  maxRent: RENT_MAX,
  maxOccupants: [],
  furnishingTypeId: [],
  propertyTypeId: [],
  sortBy: "newest",
};

const parseNumberList = (value: string | null): number[] => {
  if (!value || !value.trim()) return [];
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
};

export default function ListingsPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState("");

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  useEffect(() => {
    const sanitized = new URLSearchParams();
    const keysToKeep = ["page", "sortBy", "search", "minRent", "maxRent", "maxOccupants", "furnishingTypeId", "propertyTypeId"];
    keysToKeep.forEach((key) => {
      const value = searchParams.get(key);
      if (value) sanitized.set(key, value);
    });

    const rawPropertyTypeIds = parseNumberList(searchParams.get("propertyTypeId")).filter((value) =>
      [1, 2, 3].includes(value),
    );
    if (rawPropertyTypeIds.length > 0) {
      sanitized.set("propertyTypeId", rawPropertyTypeIds.join(","));
    } else {
      sanitized.delete("propertyTypeId");
    }

    if (sanitized.toString() !== searchParams.toString()) {
      setSearchParams(sanitized, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      minRent: Number(searchParams.get("minRent")) || defaultFilters.minRent,
      maxRent: Number(searchParams.get("maxRent")) || defaultFilters.maxRent,
      maxOccupants: parseNumberList(searchParams.get("maxOccupants")),
      furnishingTypeId: parseNumberList(searchParams.get("furnishingTypeId")),
      propertyTypeId: parseNumberList(searchParams.get("propertyTypeId")).filter((value) =>
        [1, 2, 3].includes(value),
      ),
      sortBy:
        searchParams.get("sortBy") === "rent_asc" || searchParams.get("sortBy") === "rent_desc"
          ? (searchParams.get("sortBy") as "rent_asc" | "rent_desc")
          : "newest",
    });
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ ids: string[] }>("/api/favorites/ids", { method: "GET" })
      .then((data) => setFavoriteIds(new Set(data.ids)))
      .catch(() => setFavoriteIds(new Set()));
  }, [user]);

  const queryPath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "24");
    params.set("sortBy", filters.sortBy);

    if (filters.search.trim()) params.set("search", filters.search.trim());
    if (filters.minRent > RENT_MIN) params.set("minRent", String(filters.minRent));
    if (filters.maxRent < RENT_MAX) params.set("maxRent", String(filters.maxRent));
    if (filters.maxOccupants.length) params.set("maxOccupants", filters.maxOccupants.join(","));
    if (filters.furnishingTypeId.length) params.set("furnishingTypeId", filters.furnishingTypeId.join(","));
    if (filters.propertyTypeId.length) params.set("propertyTypeId", filters.propertyTypeId.join(","));

    return `/api/listings?${params.toString()}`;
  }, [filters, page]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const data = await apiFetch<ListingsResponse>(queryPath, { method: "GET" });
        if (!active) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotal(data.total ?? 0);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        setErrorMsg(error instanceof Error ? error.message : "Failed to load listings");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [queryPath, logout, navigate]);

  const updateParams = (nextFilters: FilterState, nextPage = 1) => {
    const next = new URLSearchParams();
    next.set("page", String(nextPage));
    next.set("sortBy", nextFilters.sortBy);
    if (nextFilters.search.trim()) next.set("search", nextFilters.search.trim());
    if (nextFilters.minRent > RENT_MIN) next.set("minRent", String(nextFilters.minRent));
    if (nextFilters.maxRent < RENT_MAX) next.set("maxRent", String(nextFilters.maxRent));
    if (nextFilters.maxOccupants.length) next.set("maxOccupants", nextFilters.maxOccupants.join(","));
    if (nextFilters.furnishingTypeId.length) next.set("furnishingTypeId", nextFilters.furnishingTypeId.join(","));
    if (nextFilters.propertyTypeId.length) next.set("propertyTypeId", nextFilters.propertyTypeId.join(","));
    setSearchParams(next);
  };

  const handleToggleFavorite = async (listingId: string) => {
    try {
      const data = await apiFetch<{ liked: boolean }>(`/api/favorites/${listingId}`, { method: "POST" });
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
    } catch {
      // no-op
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell">
        <section className="hero-panel hero-gradient">
          <div className="page-container" style={{ padding: "56px 0 52px" }}>
            <p className="eyebrow" style={{ marginBottom: 14 }}>Discover Rentals</p>
            <h1 style={{ fontSize: "3.25rem", lineHeight: 1.06, marginBottom: 10 }}>
              Find your next stay with confidence
            </h1>
            <p className="section-subtitle">
              Shortlist verified homes with smart filters for budget, type and preferences.
            </p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-container">
            <div className="listings-layout">
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onApply={(nextFilters) => updateParams(nextFilters)}
                onClear={() => {
                  setFilters(defaultFilters);
                  updateParams(defaultFilters, 1);
                }}
              />

              <div>
                <div className="sort-bar">
                  <div>
                    <h3>{loading ? "Loading properties..." : `${total.toLocaleString("en-IN")} properties found`}</h3>
                    <p>Updated just now</p>
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <input
                      className="input-style"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          const nextFilters = { ...filters, search: searchInput.trim() };
                          setFilters(nextFilters);
                          updateParams(nextFilters);
                        }
                      }}
                      placeholder="Search area or colony"
                      style={{ maxWidth: 260, height: 48 }}
                    />

                    <select
                      className="select-style"
                      value={filters.sortBy}
                      onChange={(event) => {
                        const nextFilters = {
                          ...filters,
                          sortBy: event.target.value as FilterState["sortBy"],
                        };
                        setFilters(nextFilters);
                        updateParams(nextFilters);
                      }}
                      style={{ maxWidth: 190, height: 48 }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="rent_asc">Price: Low to High</option>
                      <option value="rent_desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {errorMsg ? <div className="error-banner">{errorMsg}</div> : null}

                <div className="listing-grid">
                  {loading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <div key={`listing-skeleton-${index}`} className="listing-card">
                          <Skeleton style={{ aspectRatio: "1.24 / 1" }} />
                          <div style={{ padding: 18 }}>
                            <Skeleton style={{ height: 24, width: "42%", marginBottom: 10 }} />
                            <Skeleton style={{ height: 18, width: "76%", marginBottom: 8 }} />
                            <Skeleton style={{ height: 18, width: "58%", marginBottom: 14 }} />
                            <Skeleton style={{ height: 16, width: "90%" }} />
                          </div>
                        </div>
                      ))
                    : items.map((item) => (
                        <ListingCard
                          key={item.listingId}
                          listingId={item.listingId}
                          title={item.title}
                          colony={item.colony}
                          city={item.city}
                          monthlyRent={item.monthlyRent}
                          rentTiers={item.rentTiers ?? []}
                          maxOccupants={item.maxOccupants}
                          landlordGender={item.landlordGender}
                          propertyTypeId={item.propertyTypeId}
                          furnishingName={item.furnishingName}
                          foodPreferenceName={item.foodPreferenceName}
                          coverPhotoUrl={item.coverPhotoUrl}
                          isFavorited={favoriteIds.has(item.listingId)}
                          onToggleFavorite={handleToggleFavorite}
                          createdAt={item.createdAt}
                        />
                      ))}
                </div>

                {!loading && !errorMsg && items.length === 0 ? (
                  <div className="surface-card" style={{ padding: 28, marginTop: 20, textAlign: "center" }}>
                    <h3 style={{ marginBottom: 8 }}>No properties found</h3>
                    <p>Try widening your filters or searching another area.</p>
                  </div>
                ) : null}

                {totalPages > 1 ? (
                  <div className="pagination">
                    <button
                      className="btn btn-outline"
                      disabled={page <= 1}
                      onClick={() => updateParams(filters, page - 1)}
                    >
                      Previous
                    </button>
                    <span style={{ fontWeight: 700, color: "var(--slate-700)" }}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      className="btn btn-outline"
                      disabled={page >= totalPages}
                      onClick={() => updateParams(filters, page + 1)}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
