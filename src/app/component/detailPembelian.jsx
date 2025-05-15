"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getLaporanPembelianById } from "../service/laporan_pembelian.service";
import { fetchKatalogBarang } from "../service/katalog_barang.service";
import { Spinner } from "./spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const DetailPembelian = ({ id }) => {
  // Fetch laporan pembelian
  const idPembelian = id?.data?._id

  const {
    data: laporan,
    isLoading: laporanLoading,
    isError: laporanError,
    error: laporanErrorObj,
  } = useQuery({
    queryKey: ["laporanPembelian", idPembelian],
    queryFn: () => getLaporanPembelianById(idPembelian),
    enabled: !!idPembelian && typeof idPembelian === "string",
    onError: (err) => {
      console.error("Laporan error:", err);
      toast.error(err.message || "Gagal memuat detail laporan");
    },
  });

  // Fetch semua katalog barang
  const {
    data: katalogBarang,
    isLoading: katalogLoading,
    isError: katalogError,
    error: katalogErrorObj,
  } = useQuery({
    queryKey: ["katalogBarang"],
    queryFn: fetchKatalogBarang,
    onError: (err) => {
      console.error("Katalog error:", err);
      toast.error(err.message || "Gagal memuat katalog barang");
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return Number.isFinite(value)
      ? value.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : "Rp 0";
  };

  // Fungsi untuk mendapatkan nama_barang berdasarkan barang_id
  const getNamaBarang = (barangId) => {
    if (katalogLoading) return "Memuat...";
    if (katalogError) return "Gagal memuat nama";
    const barang = katalogBarang?.data?.find((item) => item._id === barangId);
    return barang?.nama_barang || "Barang tidak dikenal";
  };

  // Fungsi untuk menentukan kelas badge berdasarkan status
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "lunas":
        return "bg-green-500 text-white px-2 py-1 rounded";
      case "belum lunas":
        return "bg-red-500 text-white px-2 py-1 rounded";
      default:
        return "bg-gray-500 text-white px-2 py-1 rounded";
    }
  };

  if (laporanLoading || katalogLoading) return <Spinner />;
  if (laporanError || !laporan?.data) {
    return (
      <div className="text-red-500 text-center">
        Error: {laporanErrorObj?.message || "Gagal memuat detail laporan pembelian"}
      </div>
    );
  }
  if (katalogError) {
    toast.error(katalogErrorObj?.message || "Gagal memuat katalog barang");
  }

  const { barang, ongkir, ppn, discount, supplier, tgl_transaksi, status, tgl_pelunasan, keterangan, grand_total } = laporan.data;

  // Hitung total PPN
  const totalPPN = barang.reduce((sum, item) => sum + (item.harga * item.vol * (ppn || 0)), 0);

  return (
    <div className="container mx-auto my-4 p-4">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-4">Detail Laporan Pembelian</h2>

      {/* Informasi Umum */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p><strong>Tanggal Transaksi:</strong> {formatDate(tgl_transaksi)}</p>
            <p><strong>Supplier:</strong> {supplier || "-"}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={getStatusBadgeClass(status)}>
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "-"}
              </span>
            </p>
          </div>
          <div>
            <p><strong>Tanggal Pelunasan:</strong> {formatDate(tgl_pelunasan)}</p>
            <p><strong>Keterangan:</strong> {keterangan || "-"}</p>
          </div>
        </div>
      </div>

      {/* Tabel Detail Barang */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-center">No</th>
              <th className="px-4 py-2 border text-center">Nama Barang</th>
              <th className="px-4 py-2 border text-center">Harga Satuan</th>
              <th className="px-4 py-2 border text-center">Volume</th>
              <th className="px-4 py-2 border text-center">PPN (11%)</th>
              <th className="px-4 py-2 border text-center">Subtotal</th>
              <th className="px-4 py-2 border text-center">Diskon</th>
              <th className="px-4 py-2 border text-center">Ongkir</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(barang) && barang.length > 0 ? (
              barang.map((item, index) => (
                <tr key={item._id?._id || index} className="odd:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{index + 1}</td>
                  <td className="px-4 py-2 border text-center">
                    {getNamaBarang(item._id?._id)}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {formatCurrency(item.harga)}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {Number.isFinite(item.vol) ? item.vol : "0"}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {formatCurrency(item.harga * item.vol * (ppn || 0))}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {Number.isFinite(discount)
                      ? `${(discount * 100).toLocaleString("id-ID")}%`
                      : "0%"}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {index === 0 ? formatCurrency(ongkir) : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-2 border text-center text-gray-500">
                  Tidak ada barang dalam laporan ini
                </td>
              </tr>
            )}
          </tbody>
          {Array.isArray(barang) && barang.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan="4" className="px-4 py-2 border text-right">
                  Total
                </td>
                <td className="px-4 py-2 border text-center">
                  {formatCurrency(totalPPN)}
                </td>
                <td className="px-4 py-2 border text-center">
                  {formatCurrency(barang.reduce((sum, item) => sum + (item.total || 0), 0))}
                </td>
                <td className="px-4 py-2 border text-center">
                  {Number.isFinite(discount)
                    ? `${(discount * 100).toLocaleString("id-ID")}%`
                    : "0%"}
                </td>
                <td className="px-4 py-2 border text-center">
                  {formatCurrency(ongkir)}
                </td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan="4" className="px-4 py-2 border text-right">
                  Grand Total
                </td>
                <td colSpan="4" className="px-4 py-2 border text-center">
                  {formatCurrency(grand_total)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};