"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getLaporanPenjualan,
	addLaporanPenjualan,
} from "../service/laporan_penjualan.service";
import { fetchKatalogBarang } from "../service/katalog_barang.service";
import { Spinner } from "./spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

export const LaporanPenjualanTable = () => {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [showModal, setShowModal] = useState(false);
	const [filterMonth, setFilterMonth] = useState("");
	const [searchKepada, setSearchKepada] = useState("");

	const { data: katalogData, isLoading: loadingKatalog } = useQuery({
		queryKey: ["katalogBarang"],
		queryFn: fetchKatalogBarang,
	});

	const {
		data: laporanData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["laporanPenjualan"],
		queryFn: getLaporanPenjualan,
	});

	const [formData, setFormData] = useState({
		tanggal: "",
		no_invoice: "",
		tgl_jatuhTempo: "",
		item: [{ _id: "", qty: 0 }],
		ppn: 0,
		kepada: "",
		basicOutlet: "",
	});

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleItemChange = (index, field, value) => {
		const updatedItems = formData.item.map((item, i) =>
			i === index ? { ...item, [field]: value } : item,
		);
		setFormData((prev) => ({ ...prev, item: updatedItems }));
	};

	const handleAddItem = () => {
		setFormData((prev) => ({
			...prev,
			item: [...prev.item, { _id: "", qty: 1 }],
		}));
	};

	const handleRemoveItem = (index) => {
		const updatedItems = formData.item.filter((_, i) => i !== index);
		setFormData((prev) => ({ ...prev, item: updatedItems }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const validItems = formData.item.filter((item) => item._id && item.qty > 0);
		if (validItems.length === 0) {
			toast.error(error.message);
			return;
		}

		try {
			let subtotal = 0;
			const updatedItems = validItems.map((item) => {
				const barang = katalogData?.data?.find((b) => b._id === item._id);
				if (!barang)
					toast.error(`Barang dengan ID ${item._id} tidak ditemukan.`);


				// 💥 Validasi stok cukup
				if (item.qty > barang.stok_akhir) {
					toast.error("Stok Barang Tdak Mencukupi");
				}

				const jumlah = barang.harga * item.qty;
				subtotal += jumlah;

				return { _id: item._id, qty: item.qty, jumlah };
			});

			const ppnFloat = parseFloat(formData.ppn);
			const ppnValue = subtotal * ppnFloat;
			const grand_total = subtotal + ppnValue;

			const finalData = {
				...formData,
				item: updatedItems,
				ppn: ppnFloat,
				subtotal,
				grand_total,
			};

			await addLaporanPenjualan(finalData);
			setShowModal(false);
			setFormData({
				tanggal: "",
				no_invoice: "",
				tgl_jatuhTempo: "",
				item: [{ _id: "", qty: 0 }],
				ppn: 0,
				kepada: "",
				basicOutlet: "",
			});
			refetch(); // refresh data
		} catch (error) {
			toast.error(error.message);
		}
	};

	const handleChangePage = (newPage) => {
		setPage(newPage);
	};

	const handleRowsPerPage = (e) => {
		setRowsPerPage(parseInt(e.target.value));
		setPage(0);
	};

	const filteredLaporan = (laporanData || []).filter((laporan) => {
		const jatuhTempo = new Date(laporan.tgl_jatuhTempo);
		const bulanFilter = filterMonth ? new Date(filterMonth + "-01") : null;
		const cocokBulan =
			!bulanFilter ||
			(jatuhTempo.getFullYear() === bulanFilter.getFullYear() &&
				jatuhTempo.getMonth() === bulanFilter.getMonth());
		const cocokKepada = (laporan.kepada || "")
			.toLowerCase()
			.includes(searchKepada.toLowerCase());
		return cocokBulan && cocokKepada;
	});

	const totalPages = Math.ceil(filteredLaporan.length / rowsPerPage);
	const paginatedData = filteredLaporan.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	return (
		<div className="container mx-auto my-4 p-4">
			{isLoading ? (
				<Spinner />
			) : error ? (
				<div className="text-red-500">Gagal memuat data laporan.</div>
			) : (
				<>
					{/* Filter & Button */}
					<ToastContainer />
					<div className="flex justify-between items-center mb-4 p-6">
						<div className="flex gap-4">
							<div>
								<label className="block text-sm mb-1 text-gray-700">
									Filter Bulan Jatuh Tempo:
								</label>
								<input
									type="month"
									value={filterMonth}
									onChange={(e) => setFilterMonth(e.target.value)}
									className="border border-gray-300 rounded-md p-1"
								/>
							</div>
							<div>
								<label className="block text-sm mb-1 text-gray-700">
									Search Kepada:
								</label>
								<input
									type="text"
									value={searchKepada}
									onChange={(e) => setSearchKepada(e.target.value)}
									placeholder="Masukkan nama"
									className="border border-gray-300 rounded-md p-1"
								/>
							</div>
						</div>
						<button
							className="bg-blue-500 text-white px-4 py-2 rounded-md"
							onClick={() => setShowModal(true)}
						>
							Add Laporan Penjualan
						</button>
					</div>

					{/* Table */}
					<table className="min-w-full table-auto bg-white shadow rounded">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-2">Tanggal</th>
								<th className="px-4 py-2">Invoice</th>
								<th className="px-4 py-2">Jatuh Tempo</th>
								<th className="px-4 py-2">Subtotal</th>
								<th className="px-4 py-2">PPN</th>
								<th className="px-4 py-2">Total</th>
								<th className="px-4 py-2">Kepada</th>
								<th className="px-4 py-2">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{paginatedData.map((laporan) => (
								<tr key={laporan._id} className="border-b">
									<td className="px-4 py-2 text-center">{laporan.tanggal}</td>
									<td className="px-4 py-2 text-center">
										{laporan.no_invoice}
									</td>
									<td className="px-4 py-2 text-center">
										{laporan.tgl_jatuhTempo}
									</td>
									<td className="px-4 py-2 text-center">{laporan.subtotal}</td>
									<td className="px-4 py-2 text-center">{laporan.ppn}</td>
									<td className="px-4 py-2 text-center">
										{laporan.grand_total}
									</td>
									<td className="px-4 py-2 text-center">{laporan.kepada}</td>
									<td className="px-4 py-2 text-center">
										<button
											className="bg-blue-500 text-white px-3 py-1 rounded"
											onClick={() =>
												(window.location.href = `/pages/invoiceDMS/invoice/${laporan._id}`)
											}
										>
											Lihat
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{/* Pagination */}
					<div className="flex justify-between items-center mt-4 px-6">
						<div>
							Rows per page:
							<select
								value={rowsPerPage}
								onChange={handleRowsPerPage}
								className="ml-2 border border-gray-300 p-1 rounded"
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={25}>25</option>
							</select>
						</div>
						<div className="flex items-center gap-4">
							<button
								disabled={page === 0}
								onClick={() => handleChangePage(page - 1)}
								className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
							>
								Previous
							</button>
							<span>
								Page {page + 1} of {totalPages}
							</span>
							<button
								disabled={page + 1 >= totalPages}
								onClick={() => handleChangePage(page + 1)}
								className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
							>
								Next
							</button>
						</div>
					</div>

					{/* Modal */}
					{showModal && (
						<div
							className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${showModal ? "block" : "hidden"}`}
						>
							<div className="bg-white p-6 rounded-lg w-96">
								<h2 className="text-xl font-semibold mb-4">
									Tambah Laporan Penjualan
								</h2>
								<form onSubmit={handleSubmit}>
									<div className="space-y-4">
										<div className="box items-end gap-0">
											<h3 className="font-medium text-red-500 whitespace-nowrap">
												*Tanggal
											</h3>
											<input
												type="date"
												className="w-full border border-gray-300 p-2 rounded-md"
												name="tanggal"
												value={formData.tanggal}
												onChange={handleInputChange}
												required
											/>
										</div>
										<input
											type="text"
											className="w-full border border-gray-300 p-2 rounded-md"
											placeholder="No. Invoice"
											name="no_invoice"
											value={formData.no_invoice}
											onChange={handleInputChange}
											required
										/>
										<div className="box items-end gap-0">
											<h3 className="font-medium text-red-500 whitespace-nowrap">
												*Tanggal Jatuh Tempo
											</h3>
											<input
												type="date"
												className="w-full border border-gray-300 p-2 rounded-md"
												name="tgl_jatuhTempo"
												value={formData.tgl_jatuhTempo}
												onChange={handleInputChange}
												required
											/>
										</div>

										<div className="space-y-4">
											<h3 className="font-medium">Item</h3>
											{formData.item.map((item, index) => (
												<div className="flex space-x-4" key={index}>
													<select
														className="w-1/2 border border-gray-300 p-2 rounded-md"
														name={`item-${index}-id`}
														value={item._id}
														onChange={(e) =>
															handleItemChange(index, "_id", e.target.value)
														}
														required
													>
														<option value="">Pilih Barang</option>
														{katalogData.data?.map((barang) => (
															<option key={barang?._id} value={barang?._id}>
																{barang?.nama_barang}
															</option>
														))}
													</select>
													<input
														type="number"
														className="w-1/4 border border-gray-300 p-2 rounded-md"
														name={`item-${index}-qty`}
														value={item.qty}
														onChange={(e) =>
															handleItemChange(
																index,
																"qty",
																Number(e.target.value),
															)
														}
														required
													/>
													<button
														type="button"
														className="text-red-500"
														onClick={() => handleRemoveItem(index)}
													>
														Hapus
													</button>
												</div>
											))}
											<button
												type="button"
												className="mt-2 text-blue-500"
												onClick={handleAddItem}
											>
												Tambah Item
											</button>
										</div>
										<div className="box items-end gap-1">
											<h3 className="font-medium text-red-500 whitespace-nowrap">
												*PPN (0-1) contoh: 0,1
											</h3>
											<input
												type="number"
												className="w-full border border-gray-300 p-2 rounded-md placeholder-shown:italic"
												placeholder="0.1"
												name="ppn"
												value={formData.ppn}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														ppn: parseFloat(e.target.value),
													}))
												}
												required
											/>
										</div>
										<div className="box items-end gap-1">
											<h3 className="font-medium text-red-500 whitespace-nowrap">
												*Jenis Outlet
											</h3>
											<select
												className="w-full border border-gray-300 p-2 rounded-m"
												name="basicOutlet"
												value={formData.basicOutlet}
												onChange={handleInputChange}
												required
											>
												<option value="">Pilih Outlet</option>
												<option value="negeri">Negeri</option>
												<option value="swasta">Swasta</option>
											</select>
										</div>

										<textarea
											className="w-full border border-gray-300 p-2 rounded-md"
											placeholder="Kepada"
											name="kepada"
											value={formData.kepada}
											onChange={handleInputChange}
											rows="4"
											required
										></textarea>
									</div>

									<div className="mt-4 flex justify-end space-x-4">
										<button
											type="button"
											className="bg-red-500 text-white px-4 py-2 rounded-md"
											onClick={() => setShowModal(false)}
										>
											Cancel
										</button>
										<button
											type="submit"
											className="bg-blue-500 text-white px-4 py-2 rounded-md"
										>
											Submit
										</button>
									</div>
								</form>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};
