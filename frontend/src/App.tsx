import AddPropertyPage from "./pages/AddPropertyPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import { getPropertyIdFromPath, usePathname } from "./router";

export default function App() {
  const path = usePathname();

  if (path === "/") {
    return <LoginPage />;
  }

  if (path === "/home") {
    return <HomePage />;
  }

  if (path === "/property/add") {
    return <AddPropertyPage />;
  }

  if (path.startsWith("/property/")) {
    return <PropertyDetailPage propertyId={getPropertyIdFromPath(path)} />;
  }

  return (
    <main className="container">
      <h1>Page not found</h1>
    </main>
  );
}
