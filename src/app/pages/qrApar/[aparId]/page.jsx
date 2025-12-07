'use client';
import { use } from "react";
import { useQrAparById } from "../../../hooks/useQrApar";


export default function DetailApar({ params }) {
  const { aparId } = use(params);
  const { data, isLoading, error } = useQrAparById(aparId);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const Detail = ({ label, value }) => (
    <div className="flex justify-between text-sm">
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </div>
  );

  function LoadingSkeleton() {
    return (
      <div className="max-w-md mx-auto p-5 mt-6 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto" />
        <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto" />
        <div className="h-20 bg-gray-300 rounded-xl" />
        <div className="h-40 bg-gray-300 rounded-xl" />
      </div>
    );
  }
  
  function ErrorMessage() {
    return (
      <div className="max-w-md mx-auto p-6 text-center text-red-600 font-semibold">
        Gagal memuat data — coba scan ulang QR
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage />;

  const isExpired = new Date(data.tanggal_exp) < new Date();
  const statusText = isExpired ? "KEDALUARSA" : "MASIH VALID";
  const statusColor = isExpired ? "bg-red-600" : "bg-green-600";

  return (
    <div className="max-w-md mx-auto p-5 mt-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col items-center space-y-1">
        <span className={"px-3 py-1 text-xs font-semibold bg-blue-400 rounded-full text-whitehbbbbnggggggggggggggggggggggggggg-=[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[g2qw1wn  vvvvvvvvvvvv3e4/"}>
          Informasi APAR
        </span>
        <h1 className="text-3xl text-center font-extrabold tracking-tight bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">
          {data.jenis}
        </h1>
        <p className="text-sm text-gray-500">
          {data.kode}
        </p>
      </div>



      {/* Status */}
      <div className={`rounded-2xl py-6 text-center text-white font-bold text-xl shadow ${statusColor}`}>
        APAR {statusText}
      </div>

      {/* Detail card */}
      <div className="bg-white shadow-md border rounded-2xl divide-y">
        <Detail label="Tanggal Isi" value={formatDate(data.tanggal_isi)} />
        <Detail label="Tanggal Expired" value={formatDate(data.tanggal_exp)} />
        <Detail label="Outlet" value={data.outlet} />
        <Detail label="Marketing" value={data.marketing} />
      </div>

      {/* Footer / reminder */}
      <p className="text-center text-gray-500 text-xs mt-2">
        Scan QR pada APAR lain untuk pengecekan berikutnya
      </p>
    </div>
  );
}
