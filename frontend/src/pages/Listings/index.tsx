import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import FilterSidebar from "../../components/FilterSidebar";
import ListingCard from "../../components/ListingCard";
import Skeleton from "../../components/Skeleton";

type Listing = {
  listingId: string;
  title: string;
  colony: string;
  city: string;
  monthlyRent: number;
  maxOccupants: number;
  landlordName: string;
  landlordGender: string | null;
  furnishingName: string;
  foodPreferenceName: string;
  propertyTypeId: number | null;
  allowSmoking: boolean;
  coverPhotoUrl: string | null;
};

type ListingsResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Listing[];
};

type FilterState = {
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
  sortBy: "newest" | "rent_asc" | "rent_desc";
};

const RENT_MIN = 1000;
const RENT_MAX = 50000;

const defaultFilters: FilterState = {
  search: "",
  minRent: RENT_MIN,
  maxRent: RENT_MAX,
  maxOccupants: [],
  floorLevelId: [],
  furnishingTypeId: [],
  foodPreferenceId: [],
  propertyTypeId: [],
  gender: [],
  allowSmoking: [],
  sortBy: "newest",
};

const parseNumberList = (value: string | null): number[] =>
  (value || "")
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v !== "")
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

const parseBooleanList = (value: string | null): boolean[] =>
  (value || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v === "true" || v === "false")
    .map((v) => v === "true");

const parseGenderList = (value: string | null): ("Male" | "Female")[] =>
  (value || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v === "male" || v === "female")
    .map((v) => (v === "male" ? "Male" : "Female"))
    .slice(0, 1);

export default function ListingsPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      minRent: Number(searchParams.get("minRent")) || defaultFilters.minRent,
      maxRent: Number(searchParams.get("maxRent")) || defaultFilters.maxRent,
      maxOccupants: parseNumberList(searchParams.get("maxOccupants")).slice(0, 1),
      floorLevelId: parseNumberList(searchParams.get("floorLevelId")),
      furnishingTypeId: parseNumberList(searchParams.get("furnishingTypeId")),
      foodPreferenceId: parseNumberList(searchParams.get("foodPreferenceId")),
      propertyTypeId: parseNumberList(searchParams.get("propertyTypeId")),
      gender: parseGenderList(searchParams.get("gender")),
      allowSmoking: parseBooleanList(searchParams.get("allowSmoking")),
      sortBy:
        searchParams.get("sortBy") === "rent_asc" || searchParams.get("sortBy") === "rent_desc"
          ? (searchParams.get("sortBy") as "rent_asc" | "rent_desc")
          : "newest",
    });
  }, [searchParams]);

  const queryPath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "24");
    params.set("sortBy", filters.sortBy);

    if (filters.search.trim()) params.set("search", filters.search.trim());
    if (filters.minRent > RENT_MIN) params.set("minRent", String(filters.minRent));
    if (filters.maxRent < RENT_MAX) params.set("maxRent", String(filters.maxRent));
    if (filters.maxOccupants.length) params.set("maxOccupants", filters.maxOccupants.join(","));
    if (filters.floorLevelId.length) params.set("floorLevelId", filters.floorLevelId.join(","));
    if (filters.furnishingTypeId.length) {
      params.set("furnishingTypeId", filters.furnishingTypeId.join(","));
    }
    if (filters.foodPreferenceId.length) {
      params.set("foodPreferenceId", filters.foodPreferenceId.join(","));
    }
    if (filters.propertyTypeId.length) {
      params.set("propertyTypeId", filters.propertyTypeId.join(","));
    }
    if (filters.gender.length) {
      params.set("gender", filters.gender.join(","));
    }
    if (filters.allowSmoking.length) {
      params.set("allowSmoking", filters.allowSmoking.map(String).join(","));
    }

    return `/api/listings?${params.toString()}`;
  }, [filters, page]);

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const data = await apiFetch<ListingsResponse>(queryPath, { method: "GET" });
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(Math.max(1, data.totalPages));
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        setErrorMsg(error instanceof Error ? error.message : "Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [queryPath, logout, navigate]);

  const applyFilters = () => {
    const next = new URLSearchParams();
    next.set("page", "1");
    next.set("sortBy", filters.sortBy);
    if (filters.search.trim()) next.set("search", filters.search.trim());
    if (filters.minRent > RENT_MIN) next.set("minRent", String(filters.minRent));
    if (filters.maxRent < RENT_MAX) next.set("maxRent", String(filters.maxRent));
    if (filters.maxOccupants.length) next.set("maxOccupants", filters.maxOccupants.join(","));
    if (filters.floorLevelId.length) next.set("floorLevelId", filters.floorLevelId.join(","));
    if (filters.furnishingTypeId.length) next.set("furnishingTypeId", filters.furnishingTypeId.join(","));
    if (filters.foodPreferenceId.length) next.set("foodPreferenceId", filters.foodPreferenceId.join(","));
    if (filters.propertyTypeId.length) next.set("propertyTypeId", filters.propertyTypeId.join(","));
    if (filters.gender.length) next.set("gender", filters.gender.join(","));
    if (filters.allowSmoking.length) next.set("allowSmoking", filters.allowSmoking.map(String).join(","));
    setSearchParams(next);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchParams({ page: "1" });
  };

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />
      <div className="listings-container">
        <div className="listings-hero">
          <div>
            <p className="listings-hero-eyebrow">Discover Rentals</p>
            <h2>Find your next stay with confidence</h2>
            <p>Shortlist verified homes with smart filters for budget, type, and preferences.</p>
          </div>
       
        </div>

        <div className="listings-layout">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onApply={applyFilters}
            onClear={clearFilters}
          />

          <section>
            <div className="sort-bar">
              <div className="sort-bar-count">
                {loading ? <Skeleton style={{ width: 180, height: 20 }} /> : `${total.toLocaleString("en-IN")} properties found`}
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => {
                  const newFilters = {
                    ...filters,
                    sortBy: e.target.value as "newest" | "rent_asc" | "rent_desc",
                  };
                  setFilters(newFilters);
                  const next = new URLSearchParams(searchParams);
                  next.set("sortBy", e.target.value);
                  next.set("page", "1");
                  setSearchParams(next);
                }}
              >
                <option value="newest">Newest First</option>
                <option value="rent_asc">Price: Low to High</option>
                <option value="rent_desc">Price: High to Low</option>
              </select>
            </div>

            {errorMsg && (
              <div className="glass-card text-center" style={{ color: "#ef4444", marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            {!loading && !errorMsg && items.length === 0 && (
              <div className="glass-card text-center">
                <p style={{ margin: 0 }}>No properties found matching your criteria.</p>
              </div>
            )}

            <div className="listings-grid">
              {loading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`listing-skeleton-${idx}`} className="listing-card" style={{ padding: 0, overflow: "hidden" }}>
                      <Skeleton style={{ width: "100%", aspectRatio: "4 / 3" }} />
                      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <Skeleton style={{ width: "50%", height: 24 }} />
                        <Skeleton style={{ width: "80%", height: 18 }} />
                        <Skeleton style={{ width: "65%", height: 16 }} />
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Skeleton style={{ width: 70, height: 26, borderRadius: 999 }} />
                          <Skeleton style={{ width: 90, height: 26, borderRadius: 999 }} />
                        </div>
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
                      maxOccupants={item.maxOccupants}
                      landlordGender={item.landlordGender}
                      propertyTypeId={item.propertyTypeId}
                      furnishingName={item.furnishingName}
                      foodPreferenceName={item.foodPreferenceName}
                      coverPhotoUrl={item.coverPhotoUrl}
                    />
                  ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-outline"
                  disabled={page >= totalPages}
                  onClick={() => changePage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
