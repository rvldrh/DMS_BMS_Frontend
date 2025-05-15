"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
	getLaporanPembelian,
	addLaporanPembelian,
} from "../service/laporan_pembelian.service";
import { fetchKatalogBarang } from "../service/katalog_barang.service";
import { Spinner } from "./spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const LaporanPembelian = () => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [openModal, setOpenModal] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);
	const [keyword, setKeyword] = useState("");
	const [filterTglTransaksi, setFilterTglTransaksi] = useState("");
	const [filterTglPelunasan, setFilterTglPelunasan] = useState("");
	const [formLoading, setFormLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const [formData, setFormData] = useState({
		tgl_transaksi: "",
		supplier: "",
		barang: [{ _id: "", vol: 0, harga: 0 }],
		ongkir: 0,
		discount: 0,
		status: "",
		tgl_pelunasan: "",
		keterangan: "",
	});

	const {
		data: laporanPembelian,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["laporanPembelian"],
		queryFn: getLaporanPembelian,
		onError: (err) => {
			toast.error(err.message || "Gagal memuat laporan pembelian");
		},
	});

	const {
		data: katalogBarang,
		isLoading: katalogLoading,
		error: katalogError,
	} = useQuery({
		queryKey: ["katalogBarang"],
		queryFn: fetchKatalogBarang,
		refetchInterval: 3000,
		onError: (err) => {
			toast.error(err.message || "Gagal memuat katalog barang");
		},
	});

	const mutation = useMutation({
		mutationFn: addLaporanPembelian,
		onSuccess: async () => {
			setFormData({
				tgl_transaksi: "",
				supplier: "",
				barang: [{ _id: "", vol: 0, harga: 0 }],
				ongkir: 0,
				discount: 0,
				status: "",
				tgl_pelunasan: "",
				keterangan: "",
			});
			await queryClient.invalidateQueries(["laporanPembelian"]);
			setFormLoading(false);
			setOpenModal(false);
			toast.success("Laporan pembelian berhasil ditambahkan!");
		},
		onError: (error) => {
			setErrorMessage(error.message || "Gagal menambahkan laporan pembelian");
			setFormLoading(false);
		},
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleItemChange = (index, field, value) => {
		const updatedItems = [...formData.barang];
		updatedItems[index][field] =
			field === "vol" || field === "harga" ? Number(value) : value;
		setFormData((prevData) => ({
			...prevData,
			barang: updatedItems,
		}));
	};

	const handleAddItem = () => {
		setFormData((prevData) => ({
			...prevData,
			barang: [...prevData.barang, { _id: "", vol: 1, harga: 0 }],
		}));
	};

	const handleRemoveItem = (index) => {
		const updatedItems = formData.barang.filter((_, i) => i !== index);
		setFormData((prevData) => ({
			...prevData,
			barang:
				updatedItems.length > 0
					? updatedItems
					: [{ _id: "", vol: 0, harga: 0 }],
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setFormLoading(true);
		setErrorMessage("");

		const validItems = formData.barang.filter(
			(item) =>
				item._id &&
				item.vol > 0 &&
				Number.isFinite(item.harga) &&
				item.harga >= 0,
		);
		if (validItems.length === 0) {
			setErrorMessage(
				"Harap masukkan item yang valid (ID barang, volume > 0, dan harga valid).",
			);
			setFormLoading(false);
			return;
		}

		const payload = {
			...formData,
			discount: formData.discount || 0,
			ongkir: formData.ongkir || 0,
			barang: validItems,
		};
		mutation.mutate(payload);
	};

	const formatDate = (dateString) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	const filteredData = useMemo(() => {
		if (!laporanPembelian) return [];

		return laporanPembelian
			.filter(
				(item) =>
					item.supplier?.toLowerCase().includes(keyword.toLowerCase()) ||
					(item.keterangan || "").toLowerCase().includes(keyword.toLowerCase()),
			)
			.filter((item) =>
				filterTglTransaksi ? item.tgl_transaksi === filterTglTransaksi : true,
			)
			.filter((item) =>
				filterTglPelunasan ? item.tgl_pelunasan === filterTglPelunasan : true,
			);
	}, [laporanPembelian, keyword, filterTglTransaksi, filterTglPelunasan]);

	const paginatedData = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredData.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredData, currentPage, itemsPerPage]);

	const totalPages = Math.ceil(filteredData.length / itemsPerPage);

	if (isLoading || katalogLoading) return <Spinner />;
	if (isError || katalogError) {
		return (
			<div className="text-red-500 text-center">
				{error?.message || katalogError?.message || "Gagal memuat data"}
			</div>
		);
	}

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

	return (
		<div className="container mx-auto my-4 p-4">
			<ToastContainer />
			<div className="flex flex-wrap justify-between items-start gap-4 mb-4">
				<div className="flex flex-wrap gap-4 w-full md:w-4/5">
					<div className="flex flex-col w-full sm:w-[250px]">
						<label className="font-medium text-sm mb-1">
							Cari Supplier/Keterangan
						</label>
						<input
							type="text"
							placeholder="Cari supplier/keterangan..."
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
							className="border p-2 rounded-md w-full"
						/>
					</div>
					<div className="flex flex-col w-full sm:w-[200px]">
						<label className="font-medium text-sm mb-1">
							Search by Tanggal Transaksi
						</label>
						<input
							type="date"
							value={filterTglTransaksi}
							onChange={(e) => setFilterTglTransaksi(e.target.value)}
							className="border p-2 rounded-md w-full"
						/>
					</div>
					<div className="flex flex-col w-full sm:w-[200px]">
						<label className="font-medium text-sm mb-1">
							Search by Tanggal Pelunasan
						</label>
						<input
							type="date"
							value={filterTglPelunasan}
							onChange={(e) => setFilterTglPelunasan(e.target.value)}
							className="border p-2 rounded-md w-full"
						/>
					</div>
				</div>
				<div className="self-start">
					<button
						className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
						onClick={() => setOpenModal(true)}
					>
						Tambah Laporan Pembelian
					</button>
				</div>
			</div>

			<div className="overflow-x-auto bg-white shadow-md rounded-lg">
				<table className="min-w-full table-auto">
					<thead className="bg-gray-100">
						<tr>
							<th className="px-4 py-2 border text-center">
								Tanggal Transaksi
							</th>
							<th className="px-4 py-2 border text-center">Supplier</th>
							<th className="px-4 py-2 border text-center">Grand Total</th>
							<th className="px-4 py-2 border text-center">Status</th>
							<th className="px-4 py-2 border text-center">Pelunasan</th>
							<th className="px-4 py-2 border text-center">Keterangan</th>
							<th className="px-4 py-2 border text-center">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{paginatedData.map((item) => (
							<tr key={item._id} className="odd:bg-gray-50">
								<td className="px-4 py-2 border text-center">
									{formatDate(item.tgl_transaksi)}
								</td>
								<td className="px-4 py-2 border text-center">
									{item.supplier || "-"}
								</td>
								<td className="px-4 py-2 border text-center">
									{Number.isFinite(item?.grand_total)
										? item.grand_total.toLocaleString("id-ID", {
												style: "currency",
												currency: "IDR",
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
											})
										: "Rp 0"}
								</td>
								<td className="px-4 py-2 border text-center">
									<span className={getStatusBadgeClass(item.status)}>
										{item.status
											? item.status.charAt(0).toUpperCase() +
												item.status.slice(1)
											: "-"}
									</span>
								</td>
								<td className="px-4 py-2 border text-center">
									{formatDate(item.tgl_pelunasan)}
								</td>
								<td className="px-4 py-2 border text-center">
									{item.keterangan || "-"}
								</td>
								<td className="px-4 py-2 border text-center">
									<button
										className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
										onClick={() => {
											if (item._id) {
												console.log("Navigating to detail with ID:", item._id);
												router.push(
													`/pages/invoiceDMS/detailPembelian/${item._id}`,
												);
											} else {
												toast.error("ID laporan tidak valid");
											}
										}}
										disabled={!item._id}
									>
										Lihat Detail
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex justify-end items-center mt-4">
				<div className="flex items-center gap-2">
					<button
						disabled={currentPage === 1}
						onClick={() => setCurrentPage((prev) => prev - 1)}
						className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
					>
						Prev
					</button>
					<span>
						Page {currentPage} of {totalPages}
					</span>
					<button
						disabled={currentPage === totalPages}
						onClick={() => setCurrentPage((prev) => prev + 1)}
						className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
					>
						Next
					</button>
				</div>
			</div>

			{openModal && (
				<div
					className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50"
					onClick={() => setOpenModal(false)}
				>
					<div
						className="bg-white p-6 rounded-lg w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto"
						onClick={(e) => e.stopPropagation()}
					>
						<h2 className="text-2xl font-semibold mb-4">
							Tambah Laporan Pembelian
						</h2>
						<form onSubmit={handleSubmit}>
							<div className="space-y-4">
								<div className="flex flex-col">
									<label className="font-medium text-red-500 mb-1">
										*Tanggal Transaksi
									</label>
									<input
										type="date"
										name="tgl_transaksi"
										value={formData.tgl_transaksi}
										onChange={handleChange}
										className="border border-gray-300 p-2 rounded-md"
										required
										disabled={formLoading || mutation.isLoading}
									/>
								</div>
								<div className="flex flex-col">
									<label className="font-medium text-red-500 mb-1">
										*Supplier
									</label>
									<input
										type="text"
										name="supplier"
										value={formData.supplier}
										onChange={handleChange}
										className="border border-gray-300 p-2 rounded-md"
										placeholder="Supplier"
										required
										disabled={formLoading || mutation.isLoading}
									/>
								</div>
								<div className="flex flex-col">
									<label className="font-medium text-red-500 mb-1">
										*Ongkir
									</label>
									<input
										type="number"
										name="ongkir"
										value={formData.ongkir}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												ongkir:
													e.target.value === ""
														? 0
														: parseFloat(e.target.value),
											}))
										}
										className="border border-gray-300 p-2 rounded-md"
										placeholder="Ongkir (Rp)"
										min="0"
										disabled={formLoading || mutation.isLoading}
									/>
								</div>
								<div className="flex flex-col">
									<label className="font-medium text-red-500 mb-1">
										*Discount (0-1) contoh: 0.1
									</label>
									<input
										type="number"
										name="discount"
										step="0.01"
										min="0"
										max="1"
										value={formData.discount}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												discount:
													e.target.value === ""
														? 0
														: parseFloat(e.target.value),
											}))
										}
										className="border border-gray-300 p-2 rounded-md"
										placeholder="Discount"
										disabled={formLoading || mutation.isLoading}
									/>
								</div>
								<div className="flex flex-col">
									<label className="font-medium text-red-500 mb-1">
										*Status
									</label>
									<select
										name="status"
										value={formData.status}
										onChange={handleChange}
										className="border border-gray-300 p-2 rounded-md"
										required
										disabled={formLoading || mutation.isLoading}
									>
										<option value="">Pilih Status</option>
										<option value="Belum Lunas">Belum Lunas</option>
										<option value="Lunas">Lunas</option>
									</select>
								</div>
								<div className="flex flex-col">
									<label className="font-medium text-red-500 mb-1">
										{formData.status === "Belum Lunas"
											? "*Kemungkinan Rencana Pelunasan"
											: "*Tanggal Pelunasan"}
									</label>
									<input
										type="date"
										name="tgl_pelunasan"
										value={formData.tgl_pelunasan}
										onChange={handleChange}
										className="border border-gray-300 p-2 rounded-md"
										disabled={formLoading || mutation.isLoading}
									/>
								</div>
								<div className="flex flex-col">
									<label className="font-medium text-red-500 mb-1">
										Keterangan
									</label>
									<input
										type="text"
										name="keterangan"
										value={formData.keterangan}
										onChange={handleChange}
										className="border border-gray-300 p-2 rounded-md"
										placeholder="Keterangan"
										disabled={formLoading || mutation.isLoading}
									/>
								</div>

								<div className="space-y-4">
									<h3 className="font-medium">Item</h3>
									{formData.barang.map((item, index) => (
										<div
											className="flex flex-wrap gap-2 items-center"
											key={index}
										>
											<div className="flex flex-col flex-1 min-w-[150px]">
												<label className="text-sm text-gray-600 mb-1">
													Barang
												</label>
												<select
													className="border border-gray-300 p-2 rounded-md"
													value={item._id}
													onChange={(e) =>
														handleItemChange(index, "_id", e.target.value)
													}
													required
													disabled={formLoading || mutation.isLoading}
												>
													<option value="">Pilih Barang</option>
													{katalogBarang?.data?.map((barang) => (
														<option key={barang._id} value={barang._id}>
															{barang.nama_barang}
														</option>
													))}
												</select>
											</div>
											<div className="flex flex-col w-[80px]">
												<label className="text-sm text-gray-600 mb-1">
													Volume
												</label>
												<input
													type="number"
													className="border border-gray-300 p-2 rounded-md"
													value={item.vol}
													onChange={(e) =>
														handleItemChange(index, "vol", e.target.value)
													}
													required
													min="1"
													placeholder="Qty"
													disabled={formLoading || mutation.isLoading}
												/>
											</div>
											<div className="flex flex-col w-[120px]">
												<label className="text-sm text-gray-600 mb-1">
													Harga Satuan
												</label>
												<input
													type="number"
													className="border border-gray-300 p-2 rounded-md"
													value={item.harga}
													onChange={(e) =>
														handleItemChange(index, "harga", e.target.value)
													}
													required
													min="0"
													placeholder="Rp"
													disabled={formLoading || mutation.isLoading}
												/>
											</div>
											<button
												type="button"
												className="text-red-500 hover:text-red-700 self-end"
												onClick={() => handleRemoveItem(index)}
												disabled={formLoading || mutation.isLoading}
											>
												Hapus
											</button>
										</div>
									))}
									<button
										type="button"
										className="mt-2 text-blue-500 hover:text-blue-700"
										onClick={handleAddItem}
										disabled={formLoading || mutation.isLoading}
									>
										Tambah Item
									</button>
								</div>

								{errorMessage && (
									<p className="text-red-500 mt-2">{errorMessage}</p>
								)}
							</div>

							<div className="flex justify-end mt-6 space-x-4">
								<button
									type="button"
									className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
									onClick={() => setOpenModal(false)}
									disabled={formLoading || mutation.isLoading}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 min-w-[120px]"
									disabled={formLoading || mutation.isLoading}
								>
									{formLoading || mutation.isLoading ? (
										<>
											<Spinner className="w-5 h-5 mr-2" />
											Submitting...
										</>
									) : (
										"Submit"
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};
