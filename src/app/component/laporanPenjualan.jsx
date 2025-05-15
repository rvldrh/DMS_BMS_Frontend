"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getLaporanPenjualan,
	addLaporanPenjualan,
} from "../service/laporan_penjualan.service";
import { fetchKatalogBarang } from "../service/katalog_barang.service";
import { Spinner } from "./spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const LaporanPenjualanTable = () => {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [showModal, setShowModal] = useState(false);
	const [filterMonth, setFilterMonth] = useState("");
	const [formLoading, setFormLoading] = useState(false);
	const [searchKepada, setSearchKepada] = useState("");

	const { data: katalogData, isLoading: loadingKatalog } = useQuery({
		queryKey: ["katalogBarang"],
		queryFn: fetchKatalogBarang,
	});

	const {
		data: laporanData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["laporanPenjualan"],
		queryFn: getLaporanPenjualan,
	});

	const [formData, setFormData] = useState({
		tanggal: "",
		no_invoice: "",
		tgl_jatuhTempo: "",
		item: [{ _id: "", qty: 0 }],
		ppn: 0.11,
		kepada: "",
		basicOutlet: "",
	});

	const mutation = useMutation({
		mutationFn: async (formData) => {
			const validItems = formData.item.filter(
				(item) => item._id && item.qty > 0,
			);
			if (validItems.length === 0) {
				throw new Error("Harap masukkan item yang valid.");
			}

			let subtotal = 0;
			const updatedItems = validItems.map((item) => {
				const barang = katalogData?.data?.find((b) => b._id === item._id);
				if (!barang) {
					throw new Error(`Barang dengan ID ${item._id} tidak ditemukan.`);
				}

				if (item.qty > barang.stok_akhir) {
					throw new Error("Stok barang tidak mencukupi.");
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

			return await addLaporanPenjualan(finalData);
		},
		onSuccess: () => {
			toast.success("Laporan penjualan berhasil ditambahkan!");
			setShowModal(false);
			setFormData({
				tanggal: "",
				no_invoice: "",
				tgl_jatuhTempo: "",
				item: [{ _id: "", qty: 0 }],
				ppn: 0.11,
				kepada: "",
				basicOutlet: "",
			});
			queryClient.invalidateQueries(["laporanPenjualan"]);
			setFormLoading(false);
			setShowModal(false);
		},
		onError: (error) => {
			console.error("Mutation error:", error.message);
			setFormLoading(false);
			toast.error(error.message);
		},
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

	const handleSubmit = (event) => {
		event.preventDefault();
		setFormLoading(true);
		mutation.mutate(formData);
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
							className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
							onClick={() => setShowModal(true)}
						>
							Add Laporan Penjualan
						</button>
					</div>

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
									<td className="px-4 py-2 text-center">
										{Number.isFinite(laporan?.subtotal)
											? `Rp ${Math.floor(laporan.subtotal).toLocaleString("id-ID")}`
											: "Rp 0"}
									</td>
									<td className="px-4 py-2 text-center">
										{Number.isFinite(laporan?.ppn)
											? `${(laporan.ppn * 100).toLocaleString("id-ID")}%`
											: "11%"}
									</td>
									<td className="px-4 py-2 text-center">
                  {Number.isFinite(laporan?.grand_total)
											? `Rp ${Math.floor(laporan.grand_total).toLocaleString("id-ID")}`
											: "Rp 0"}
									</td>
									<td className="px-4 py-2 text-center">{laporan.kepada}</td>
									<td className="px-4 py-2 text-center">
										<button
											className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
											onClick={() =>
												(window.location.href = `/pages/invoiceDMS/invoice/${laporan._id}`)
											}
										>
											Lihat Invoice
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

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
								className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-200"
							>
								Previous
							</button>
							<span>
								Page {page + 1} of {totalPages}
							</span>
							<button
								disabled={page + 1 >= totalPages}
								onClick={() => handleChangePage(page + 1)}
								className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-200"
							>
								Next
							</button>
						</div>
					</div>

					{showModal && (
						<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
							<div className="bg-white p-6 rounded-lg w-full max-w-md sm:max-w-lg max-h-[80vh] overflow-y-auto">
								<h2 className="text-xl font-semibold mb-4">
									Tambah Laporan Penjualan
								</h2>
								<form onSubmit={handleSubmit}>
									<div className="space-y-4">
										<div className="flex flex-col">
											<label className="font-medium text-red-500 mb-1">
												*Tanggal
											</label>
											<input
												type="date"
												className="border border-gray-300 p-2 rounded-md"
												name="tanggal"
												value={formData.tanggal}
												onChange={handleInputChange}
												required
											/>
										</div>
										<div className="flex flex-col">
											<label className="font-medium text-red-500 mb-1">
												*No. Invoice
											</label>
											<input
												type="text"
												className="border border-gray-300 p-2 rounded-md"
												placeholder="No. Invoice"
												name="no_invoice"
												value={formData.no_invoice}
												onChange={handleInputChange}
												required
											/>
										</div>
										<div className="flex flex-col">
											<label className="font-medium text-red-500 mb-1">
												*Tanggal Jatuh Tempo
											</label>
											<input
												type="date"
												className="border border-gray-300 p-2 rounded-md"
												name="tgl_jatuhTempo"
												value={formData.tgl_jatuhTempo}
												onChange={handleInputChange}
												required
											/>
										</div>

										<div className="space-y-4">
											<h3 className="font-medium">Item</h3>
											{formData.item.map((item, index) => (
												<div
													className="flex space-x-4 items-center"
													key={index}
												>
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
														{katalogData?.data?.map((barang) => (
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
														min="1"
													/>
													<button
														type="button"
														className="text-red-500 hover:text-red-700"
														onClick={() => handleRemoveItem(index)}
													>
														Hapus
													</button>
												</div>
											))}
											<button
												type="button"
												className="mt-2 text-blue-500 hover:text-blue-700"
												onClick={handleAddItem}
											>
												Tambah Item
											</button>
										</div>
										<div className="flex flex-col">
											<label className="font-medium text-red-500 mb-1">
												*Jenis Outlet
											</label>
											<select
												className="border border-gray-300 p-2 rounded-md"
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
										<div className="flex flex-col">
											<label className="font-medium text-red-500 mb-1">
												*Kepada
											</label>
											<textarea
												className="border border-gray-300 p-2 rounded-md"
												placeholder="Kepada"
												name="kepada"
												value={formData.kepada}
												onChange={handleInputChange}
												rows="4"
												required
											></textarea>
										</div>
									</div>

									<div className="mt-6 flex justify-end space-x-4">
										<button
											type="button"
											className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
											onClick={() => setShowModal(false)}
											disabled={mutation.isLoading}
										>
											Cancel
										</button>
										<button
											type="submit"
											className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center min-w-[120px]"
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
				</>
			)}
		</div>
	);
};
