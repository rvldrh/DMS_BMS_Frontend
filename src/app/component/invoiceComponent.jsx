"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getLaporanPenjualanById } from "@/app/service/laporan_penjualan.service";
import { formatCurrency, numberToWords } from "../utils";
import { Spinner } from "./spinner";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";

export const InvoiceComponent = ({ invoiceId }) => {
	const Logo = "/img/bms.png";
	const [itemsWithDetails, setItemsWithDetails] = useState([]);
	const [subtotal, setSubtotal] = useState(0);
	const invoiceRef = useRef(null);

	const id = invoiceId?.data?._id;

	const {
		data: invoiceData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["invoice", invoiceId],
		queryFn: () => getLaporanPenjualanById(id),
		enabled: !!invoiceId,
	});

	const invoiceDataa = invoiceData?.data;

	useEffect(() => {
		if (invoiceDataa?.item) {
			const itemDetails = invoiceDataa.item.map((item) => {
				const harga = item?._id?.harga || 0;
				const jumlah = harga * item.qty;
				return {
					...item,
					satuan: item?._id?.satuan || "Unknown",
					harga,
					jumlah,
				};
			});
			setItemsWithDetails(itemDetails);

			// Hitung subtotal
			const total = itemDetails.reduce((acc, item) => acc + item.jumlah, 0);
			setSubtotal(total);
		}
	}, [invoiceDataa]);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef, // 👈 This is correct
    documentTitle: `Nota_${invoiceDataa?._id || "Transaksi"}`,
    onBeforePrint: async () => {
      if (!invoiceRef.current) {  // Use invoiceRef instead of componentRef
        console.error("Elemen invoiceRef tidak ditemukan!");
        throw new Error("There is nothing to print");
      }
    },
    onAfterPrint: () => console.log("Printing completed"),
  });
  
  

	if (isLoading) return <Spinner />;
	if (isError) return <div>Error loading invoice data.</div>;

	const ppnAmount = subtotal * (invoiceDataa?.ppn || 0);
	const grandTotal = subtotal + ppnAmount;
	const grandTotalInWords = numberToWords(grandTotal);

	return (
		<div className="p-4">
			<button
				onClick={handlePrint}
				className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>
				Cetak PDF
			</button>

			<div ref={invoiceRef} className="p-8 bg-white">
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
									Dusun Tulusayu GG Bima, RT 007 RW 001, Kec. Wagir
									<br />
									Kabupaten Malang
									<br />
									Telp. 0852-0457-6519
								</p>
							</div>
						</div>
					</div>

					<hr className="border-t-2 border-black mb-4" />

					{/* Address */}
					<div className="mb-4">
						<p className="font-bold">Kepada Yth:</p>
						<p>{invoiceDataa?.kepada || "Data tidak tersedia"}</p>
					</div>

					{/* Invoice Info */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
						<div>
							<p className="font-bold">NO.INVOICE</p>
							<p>{invoiceDataa?.no_invoice || "-"}</p>
						</div>
						<div>
							<p className="font-bold">TANGGAL</p>
							<p>{invoiceDataa?.tanggal || "-"}</p>
						</div>
						<div>
							<p className="font-bold">TGL. JATUH TEMPO</p>
							<p>{invoiceDataa?.tgl_jatuhTempo || "-"}</p>
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
								<span>Rp {formatCurrency(subtotal)}</span>
							</div>
							<div className="flex justify-between mb-2">
								<span>PPN {invoiceDataa.ppn * 100}%:</span>
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
						{invoiceDataa?.basicOutlet === "negeri" ? (
							<p>
								Transfer via Bank Jatim
								<br />
								No. Rek : 004.111.2085
								<br />
								An. Berlian Muda Sukses, PT
							</p>
						) : invoiceDataa?.basicOutlet === "swasta" ? (
							<p>
								Pembayaran ke Bank BCA
								<br />
								No. Rek. 816.188.9497
								<br />
								a/n Berlian Muda Sukses PT
							</p>
						) : (
							<p>Informasi pembayaran tidak tersedia</p>
						)}
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
		</div>
	);
};
