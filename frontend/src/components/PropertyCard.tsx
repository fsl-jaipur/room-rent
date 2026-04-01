import { navigate } from "../router";
import type { Property } from "../types";

type Props = {
  property: Property;
};

export default function PropertyCard({ property }: Props) {
  return (
    <button className="property-card" onClick={() => navigate(`/property/${property.id}`)}>
      <img src={property.image} alt={property.title} className="property-image" />
      <div className="property-body">
        <h3>{property.title}</h3>
        <p>{property.area}</p>
        <p className="price">INR {property.amount.toLocaleString("en-IN")}/month</p>
      </div>
    </button>
  );
}
