import { useEffect, useState } from "react";

import { getProperty } from "../api";
import { navigate } from "../router";
import { mapBackendPropertyToUi, type Property } from "../types";

type Props = {
  propertyId: string;
};

export default function PropertyDetailPage({ propertyId }: Props) {
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
    return <main className="container"><p>Loading property...</p></main>;
  }

  if (!property || error) {
    return <main className="container"><p className="error">{error || "Property not found"}</p></main>;
  }

  return (
    <main className="container">
      <div className="row">
        <h1>{property.title}</h1>
        <button className="secondary" onClick={() => navigate("/home")}>Back</button>
      </div>

      <img src={property.image} alt={property.title} className="detail-image" />

      <section className="card">
        <p>{property.address}</p>
        <p><strong>Rent:</strong> INR {property.amount.toLocaleString("en-IN")}/month</p>
        <p><strong>Type:</strong> {property.type}</p>
        <p><strong>Interior:</strong> {property.interior}</p>
        <p><strong>Description:</strong> {property.description}</p>
      </section>
    </main>
  );
}
