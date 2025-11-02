'use client';

// UI_UNIFIED_WITH_DASHBOARD
// ROLLBACK_NOTE: To revert to old login/register look, remove shared layout import.

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <a href="/landing" aria-label="Go to landing page" className="flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <div className="w-8 h-1 bg-red-600 rounded"></div>
              <div className="w-8 h-1 bg-red-600 rounded"></div>
              <div className="w-8 h-1 bg-red-600 rounded"></div>
            </div>
            <span className="text-white text-xl font-semibold">Letushack</span>
          </a>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-zinc-900/80 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-gray-800/50">
            <h1 className="text-white text-2xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}