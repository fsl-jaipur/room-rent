'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, IndianRupee, Phone, Cigarette, UtensilsCrossed, Sofa, Building2, Compass, Layers } from "lucide-react";
import { getProperty } from "@/lib/api";
import { mapBackendPropertyToUi, type Property } from "@/lib/property";

export default function PropertyDetail() {
  const params = useParams();
  const router = useRouter();
  const propertyId = typeof params.id === "string" ? params.id : "";

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        setError("Property ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await getProperty(propertyId);
        setProperty(mapBackendPropertyToUi(response));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load property.");
      } finally {
        setLoading(false);
      }
    };

    void loadProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-muted-foreground font-body text-center">{error || "Property not found"}</p>
      </div>
    );
  }

  const details = [
    { icon: Building2, label: "Type", value: property.type },
    { icon: Layers, label: "Floor", value: property.floor },
    { icon: Compass, label: "Facing", value: property.facing },
    { icon: Sofa, label: "Interior", value: property.interior },
    { icon: Cigarette, label: "Smoking", value: property.smoking },
    { icon: UtensilsCrossed, label: "Food", value: property.foodPreference }
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="relative">
        <img src={property.image} alt={property.title} className="w-full h-64 object-cover" width={800} height={600} />
        <button
          onClick={() => router.back()}
          className="absolute top-10 left-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <Badge
          className={`absolute top-10 right-4 font-heading text-xs px-3 py-1 rounded-lg ${
            property.available
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {property.available ? "Available" : "Occupied"}
        </Badge>
      </div>

      <div className="px-5 -mt-6 relative">
        <div className="bg-card rounded-2xl p-5 shadow-[var(--shadow-elevated)] border border-border space-y-4">
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">{property.title}</h1>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-sm font-body">{property.address}</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-body">Monthly Rent</p>
              <div className="flex items-center text-primary font-heading font-bold text-2xl">
                <IndianRupee className="h-5 w-5" />
                {property.amount.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-body">Deposit</p>
              <div className="flex items-center text-foreground font-heading font-semibold text-base">
                <IndianRupee className="h-3.5 w-3.5" />
                {property.deposit.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="font-heading font-bold text-base text-foreground mb-3">Details</h2>
          <div className="grid grid-cols-3 gap-3">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card rounded-xl p-3 border border-border text-center">
                <Icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
                <p className="text-[10px] text-muted-foreground font-body">{label}</p>
                <p className="text-xs font-heading font-semibold text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <h2 className="font-heading font-bold text-base text-foreground mb-2">Description</h2>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">{property.description}</p>
        </div>

        <div className="mt-5">
          <h2 className="font-heading font-bold text-base text-foreground mb-3">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {property.amenities.length > 0 ? property.amenities.map((a) => (
              <Badge key={a} variant="secondary" className="font-body text-xs rounded-lg px-3 py-1.5">
                {a}
              </Badge>
            )) : (
              <p className="text-sm text-muted-foreground font-body">No amenities available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-heading font-semibold border-primary text-primary">
            <Phone className="h-4 w-4 mr-2" />
            Call Owner
          </Button>
          <Button className="flex-1 h-12 rounded-xl font-heading font-semibold">
            Book Visit
          </Button>
        </div>
      </div>
    </div>
  );
}
