"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getLaporanPenjualanById } from "../service/laporan_penjualan.service";
import { formatCurrency, numberToWords } from "../utils";
import { Spinner } from "./spinner";
import Image from "next/image";

export const InvoiceComponent = ({ invoiceId }) => {
  const Logo = "/img/bms.png";

  const [itemsWithDetails, setItemsWithDetails] = useState([]);


  useEffect(() => {
    if (invoiceId?.data?.item) {
      const itemDetails = invoiceId.data.item.map((item) => ({
        ...item,
        satuan: item?._id?.satuan || "Unknown",
        stok_awal: item?._id?.stok_awal || 0,
        stok_akhir: item?._id?.stok_akhir || 0,
        harga: item?._id?.harga || 0,
      }));

      setItemsWithDetails(itemDetails);
    }
  }, [invoiceId?.data]);

  // if (laporanLoading) {
  //   return <Spinner />;
  // }

  // if (laporanError instanceof Error) {
  //   return <div>Error: {laporanError?.message}</div>;
  // }

  // if (!invoiceId) {
  //   return <div>No data found</div>;
  // }

  const ppnAmount = invoiceId?.data?.subtotal * invoiceId?.data?.ppn;
  const grandTotal = invoiceId?.data?.subtotal + ppnAmount;
  const grandTotalInWords = numberToWords(grandTotal);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto border p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Image
              src={Logo}
              alt="Company Logo"
              className="mr-4"
              width={64}
              height={64}
            />
            <div>
              <h1 className="text-xl font-bold">PT. BERLIAN MUDA SUKSES</h1>
              <p>
                Dusun Tulusuyu GG Bima, RT 007 RW 001, Kec. Wagir
                <br />
                Kabupaten Malang
                <br />
                Telp. 0852-0457-6519
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t-2 border-black mb-4" />

        {/* Address */}
        <div className="mb-4">
          <p className="font-bold">Kepada Yth:</p>
          <p>{invoiceId?.data?.kepada || "Data tidak tersedia"}</p>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="font-bold">NO.INVOICE</p>
            <p>{invoiceId?.data?.no_invoice || "-"}</p>
          </div>
          <div>
            <p className="font-bold">TANGGAL</p>
            <p>{invoiceId?.data?.tanggal || "-"}</p>
          </div>
          <div>
            <p className="font-bold">TGL. JATUH TEMPO</p>
            <p>{invoiceId?.data?.tgl_jatuhTempo || "-"}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border mb-4 table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">No</th>
              <th className="border p-2">Nama Item</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Satuan</th>
              <th className="border p-2">Harga Satuan</th>
              <th className="border p-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {itemsWithDetails.map((item, index) => (
              <tr key={`${item._id}-${index}`}>
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{item._id?.nama_barang || "-"}</td>
                <td className="border p-2 text-center">{item.qty}</td>
                <td className="border p-2 text-center">{item.satuan}</td>
                <td className="border p-2 text-right">
                  {formatCurrency(item.harga)}
                </td>
                <td className="border p-2 text-right">
                  {formatCurrency(item.jumlah)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-4">
          <div className="w-full sm:w-1/2">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>Rp {formatCurrency(invoiceId.data.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>PPN {invoiceId.data.ppn * 100}%:</span>
              <span>Rp {formatCurrency(ppnAmount)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Grand Total:</span>
              <span>Rp {formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Terbilang */}
        <div className="mb-4">
          <p className="font-bold"># {grandTotalInWords} #</p>
        </div>

        {/* Payment Info */}
        <div className="mb-4">
          <p className="font-bold">Cara Pembayaran :</p>
          <p>
            Transfer via Bank Jatim
            <br />
            No. Rek : 004.111.2085
            <br />
            An. Berlian Muda Sukses, PT
          </p>
        </div>

        {/* Signatures */}
        <div className="flex justify-between">
          <div>
            <p className="mt-8"> </p>
          </div>
          <div className="text-center">
            <p>Hormat Kami</p>
            <div className="mt-24">
              <p>(Agus Riyanto, S.Pd)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
