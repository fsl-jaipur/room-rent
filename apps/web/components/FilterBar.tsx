import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";

export type Filters = {
  area: string;
  amountRange: string;
  propertyType: string;
  smoking: string;
  foodPreference: string;
  interior: string;
};

const defaultFilters: Filters = {
  area: "",
  amountRange: "",
  propertyType: "",
  smoking: "",
  foodPreference: "",
  interior: "",
};

const areas = ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Electronic City"];
const amountRanges = ["Under ₹10K", "₹10K - ₹20K", "₹20K - ₹30K", "Above ₹30K"];
const propertyTypes = ["1 BHK", "2 BHK", "3 BHK", "Studio"];
const smokingOptions = ["Allowed", "Not Allowed"];
const foodOptions = ["Veg", "Non-Veg", "Any"];
const interiorOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];

type FilterSectionProps = {
  title: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
};

const FilterSection = ({ title, options, value, onChange }: FilterSectionProps) => (
  <div className="space-y-2.5">
    <h4 className="font-heading font-semibold text-sm text-foreground">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${
            value === opt
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

type FilterBarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const FilterBar = ({ filters, onChange }: FilterBarProps) => {
  const [draft, setDraft] = useState<Filters>(filters);
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const handleApply = () => {
    onChange(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(defaultFilters);
    onChange(defaultFilters);
  };

  // Quick filter chips
  const quickFilters = [
    { key: "propertyType" as const, options: propertyTypes },
  ];

  return (
    <div className="space-y-3">
      {/* Top row: quick chips + filter button */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl shrink-0 gap-1.5 font-heading border-border"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeCount > 0 && (
                <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <SheetHeader className="pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="font-heading text-lg">Filters</SheetTitle>
                {activeCount > 0 && (
                  <button onClick={handleClear} className="text-xs text-primary font-body flex items-center gap-1">
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>
            </SheetHeader>
            <div className="space-y-5 pb-24">
              <FilterSection title="Area" options={areas} value={draft.area} onChange={(v) => setDraft({ ...draft, area: v })} />
              <FilterSection title="Budget" options={amountRanges} value={draft.amountRange} onChange={(v) => setDraft({ ...draft, amountRange: v })} />
              <FilterSection title="Property Type" options={propertyTypes} value={draft.propertyType} onChange={(v) => setDraft({ ...draft, propertyType: v })} />
              <FilterSection title="Smoking" options={smokingOptions} value={draft.smoking} onChange={(v) => setDraft({ ...draft, smoking: v })} />
              <FilterSection title="Food Preference" options={foodOptions} value={draft.foodPreference} onChange={(v) => setDraft({ ...draft, foodPreference: v })} />
              <FilterSection title="Interior" options={interiorOptions} value={draft.interior} onChange={(v) => setDraft({ ...draft, interior: v })} />
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
              <Button onClick={handleApply} className="w-full h-12 rounded-xl font-heading font-semibold">
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {quickFilters[0].options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange({ ...filters, propertyType: filters.propertyType === opt ? "" : opt })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-body whitespace-nowrap shrink-0 transition-colors ${
              filters.propertyType === opt
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground border border-border"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
