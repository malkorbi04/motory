import InventoryGrid from "@/components/InventoryGrid";
import { AppBar, AdminHeader } from "@/components/PageHeader";

export const metadata = { title: "Admin — Motory" };

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <AppBar />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <AdminHeader />
        <InventoryGrid />
      </div>
    </main>
  );
}
