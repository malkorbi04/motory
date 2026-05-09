import CarForm from "@/components/CarForm";
import { AppBar } from "@/components/PageHeader";

export const metadata = { title: "Sell Your Car — Motory | موتوري" };

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <AppBar />

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-11 flex items-center">
          <p className="text-sm font-semibold text-gray-700">Sell Your Car · بيع سيارتك</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        <CarForm mode="add" userRole="public" />
      </div>
    </main>
  );
}
