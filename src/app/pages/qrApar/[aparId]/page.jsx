'use client';


export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function Detail({ label, value }) {
  return (
    <div className="flex justify-between items-center px-5 py-3">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

// ───────────────────────────────
// Loading state (biar tidak jelek pas fetch)
// ───────────────────────────────
export function LoadingSkeleton() {
  return (
    <div className="max-w-md mx-auto p-5 mt-6 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto" />
      <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto" />
      <div className="h-20 bg-gray-300 rounded-xl" />
      <div className="h-40 bg-gray-300 rounded-xl" />
    </div>
  );
}

export function ErrorMessage() {
  return (
    <div className="max-w-md mx-auto p-6 text-center text-red-600 font-semibold">
      Gagal memuat data — coba scan ulang QR
    </div>
  );
}
