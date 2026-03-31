import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MapPin, IndianRupee } from "lucide-react";
import type { Property } from "@/lib/property";

const PropertyCard = ({ property }: { property: Property }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/property/${property.id}`)}
      className="bg-card rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow cursor-pointer border border-border"
    >
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-44 object-cover"
          loading="lazy"
          width={800}
          height={600}
        />
        <Badge
          className={`absolute top-3 left-3 font-heading text-xs px-2.5 py-1 rounded-lg ${
            property.available
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {property.available ? "Available" : "Occupied"}
        </Badge>
        <Badge className="absolute top-3 right-3 bg-card/90 text-foreground backdrop-blur-sm font-heading text-xs px-2.5 py-1 rounded-lg border-0">
          {property.type}
        </Badge>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-heading font-semibold text-foreground text-base">
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-sm font-body">{property.area}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center text-primary font-heading font-bold text-lg">
            <IndianRupee className="h-4 w-4" />
            {property.amount.toLocaleString("en-IN")}
            <span className="text-muted-foreground font-body font-normal text-xs ml-1">/month</span>
          </div>
          <span className="text-xs font-body text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {property.interior}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
