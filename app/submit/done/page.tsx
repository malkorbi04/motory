export const metadata = { title: "Submitted — Motory | موتوري" };

export default function SubmitDonePage() {
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 .001M13 16h2m-2 0H9m4 0h5m1 0v-5.535a2 2 0 00-.586-1.414l-3.463-3.465A2 2 0 0014.537 5H13" />
          </svg>
        </div>
        <div className="leading-none text-start">
          <p className="text-2xl font-extrabold text-white tracking-tight">Motory</p>
          <p className="text-blue-400 font-bold text-base">موتوري</p>
        </div>
      </div>

      {/* Success card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
        {/* Check icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">Submitted!</h1>
        <p className="text-gray-500 text-sm mb-1">تم الإرسال بنجاح!</p>
        <p className="text-gray-400 text-xs mt-4 leading-relaxed">
          We received your car listing and will contact you on WhatsApp shortly.
        </p>
        <p className="text-gray-400 text-xs mt-1 leading-relaxed">
          استلمنا إعلانك وسنتواصل معك على واتساب قريباً.
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-600">© {new Date().getFullYear()} Motory. All rights reserved.</p>
    </main>
  );
}
