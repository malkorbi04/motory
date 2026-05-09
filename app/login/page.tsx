import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Sign In — Motory" };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 .001M13 16h2m-2 0H9m4 0h5m1 0v-5.535a2 2 0 00-.586-1.414l-3.463-3.465A2 2 0 0014.537 5H13" />
          </svg>
        </div>
        <div className="leading-none">
          <p className="text-2xl font-extrabold text-white tracking-tight">Motory</p>
          <p className="text-blue-400 font-bold text-base">موتوري</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>
        <LoginForm />
      </div>

      <p className="mt-6 text-xs text-gray-600">© {new Date().getFullYear()} Motory. All rights reserved.</p>
    </main>
  );
}
