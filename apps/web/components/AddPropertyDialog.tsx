import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import type { PropertyDraft } from "@/lib/property";

type Props = {
  canAdd: boolean;
  onAdd: (property: PropertyDraft) => Promise<void>;
};

const AddPropertyDialog = ({ canAdd, onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setPropertyName("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!propertyName || !address || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Please enter valid property name, address, latitude, and longitude.");
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        propertyName,
        address,
        latitude: lat,
        longitude: lng
      });
      reset();
      setOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create property.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl gap-1.5 font-heading" disabled={!canAdd}>
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="propertyName" className="text-xs font-heading">Property Name *</Label>
            <Input
              id="propertyName"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g. Sunrise Residency"
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-heading">Full Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="4th Block, Koramangala, Bangalore"
              className="rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="latitude" className="text-xs font-heading">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="12.9352"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude" className="text-xs font-heading">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="77.6245"
                className="rounded-xl"
                required
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive font-body">{error}</p> : null}

          <Button type="submit" className="w-full h-12 rounded-xl font-heading font-semibold" disabled={submitting}>
            {submitting ? "Saving..." : "Add Property"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyDialog;
