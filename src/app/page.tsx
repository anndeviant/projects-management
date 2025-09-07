"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman guest
    router.replace("/guest");
  }, [router]);

  // Tampilan loading sementara saat redirect
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-sm">PM</span>
        </div>
        <p className="text-gray-600">Mengarahkan ke halaman transparansi...</p>
      </div>
    </div>
  );
}
