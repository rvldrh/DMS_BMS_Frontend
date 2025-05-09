"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getLaporanPembelian,
	addLaporanPembelian,
} from "../service/laporan_pembelian.service";
import { fetchKatalogBarang } from "../service/katalog_barang.service";
import { Spinner } from "./spinner";

export const LaporanPembelian = () => {
	const queryClient = useQueryClient();
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
		barang: [{ _id: "", vol: 0 }],
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
	});

	const {
		data: katalogBarang,
		isLoading: katalogLoading,
		error: katalogError,
	} = useQuery({
		queryKey: ["katalogBarang"],
		queryFn: fetchKatalogBarang,
		refetchInterval: 3000,
	});

	const mutation = useMutation({
		mutationFn: addLaporanPembelian,
		onSuccess: async () => {
			setFormData({
				tgl_transaksi: "",
				supplier: "",
				barang: [{ _id: "", vol: 0 }],
				ongkir: 0,
				discount: 0,
				status: "",
				tgl_pelunasan: "",
				keterangan: "",
			});
			await queryClient.invalidateQueries(["laporanPembelian"]);
			setOpenModal(false);
		},
		onError: () => {
			setErrorMessage("Gagal menambahkan laporan pembelian");
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
		updatedItems[index][field] = value;
		setFormData((prevData) => ({
			...prevData,
			barang: updatedItems,
		}));
	};

	const handleAddItem = () => {
		setFormData((prevData) => ({
			...prevData,
			barang: [...prevData.barang, { _id: "", vol: 1 }],
		}));
	};

	const handleRemoveItem = (index) => {
		const updatedItems = formData.barang.filter((_, i) => i !== index);
		setFormData((prevData) => ({
			...prevData,
			barang: updatedItems,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const payload = {
			...formData,
			discount: formData.discount || 0,
			ongkir: formData.ongkir || 0,
		};
		mutation.mutate(payload);
	};

	const filteredData = useMemo(() => {
		if (!laporanPembelian) return [];

		return laporanPembelian
			.filter(
				(item) =>
					item.supplier.toLowerCase().includes(keyword.toLowerCase()) ||
					item.keterangan?.toLowerCase().includes(keyword.toLowerCase()),
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
	if (isError || katalogError)
		return <p>{error?.message || katalogError?.message}</p>;

	return (
		<div className="container mx-auto my-4 p-4">
			<div className="flex flex-wrap justify-between items-start gap-4 mb-4">
				<div className="flex flex-wrap gap-4 w-full md:w-4/5">
					<div className="flex flex-col w-full sm:w-[250px]">
						<h3 className="font-medium text-xs mb-1">
							Cari Supplier/Keterangan
						</h3>
						<input
							type="text"
							placeholder="Cari supplier/keterangan..."
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
							className="border p-2 rounded-md w-full"
						/>
					</div>
					<div className="flex flex-col w-full sm:w-[200px]">
						<h3 className="font-medium text-xs mb-1">
							Search by Tanggal Transaksi
						</h3>
						<input
							type="date"
							value={filterTglTransaksi}
							onChange={(e) => setFilterTglTransaksi(e.target.value)}
							className="border p-2 rounded-md w-full"
						/>
					</div>
					<div className="flex flex-col w-full sm:w-[200px]">
						<h3 className="font-medium text-xs mb-1">
							Search by Tanggal Pelunasan
						</h3>
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
							<th className="px-4 py-2 border">Tanggal Transaksi</th>
							<th className="px-4 py-2 border">Supplier</th>
							<th className="px-4 py-2 border">Grand Total</th>
							<th className="px-4 py-2 border">Status</th>
							<th className="px-4 py-2 border">Pelunasan</th>
							<th className="px-4 py-2 border">Keterangan</th>
						</tr>
					</thead>
					<tbody>
						{paginatedData.map((item) => (
							<tr key={item._id} className="odd:bg-gray-50">
								<td className="px-4 py-2 border">{item.tgl_transaksi}</td>
								<td className="px-4 py-2 border">{item.supplier}</td>
								<td className="px-4 py-2 border">{item.grand_total}</td>
								<td className="px-4 py-2 border">{item.status}</td>
								<td className="px-4 py-2 border">{item.tgl_pelunasan}</td>
								<td className="px-4 py-2 border">{item.keterangan}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex justify-end items-center mt-4">
				{/* Pagination Controls */}
				<div className="flex items-center gap-2">
					<button
						disabled={currentPage === 1}
						onClick={() => setCurrentPage((prev) => prev - 1)}
						className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
					>
						Prev
					</button>
					<span>
						Page {currentPage} of {totalPages}
					</span>
					<button
						disabled={currentPage === totalPages}
						onClick={() => setCurrentPage((prev) => prev + 1)}
						className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>

			<div
				className={`fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 ${
					openModal ? "block" : "hidden"
				}`}
				onClick={() => setOpenModal(false)}
			>
				<div
					className="bg-white p-6 rounded-lg w-1/3"
					onClick={(e) => e.stopPropagation()}
				>
					<h2 className="text-2xl mb-4">Tambah Laporan Pembelian</h2>
					<form onSubmit={handleSubmit}>
						<div className="mb-0">
							<h3 className="font-medium text-red-500 whitespace-nowrap">
								*Tanggal Transaksi
							</h3>
							<input
								type="date"
								name="tgl_transaksi"
								value={formData.tgl_transaksi}
								onChange={handleChange}
								className="w-full mb-4 p-2 border border-gray-300 rounded-md"
								required
							/>
						</div>
						<input
							type="text"
							name="supplier"
							value={formData.supplier}
							onChange={handleChange}
							className="w-full mb-4 p-2 border border-gray-300 rounded-md"
							placeholder="Supplier"
							required
						/>
						<div className="mb-2">
							<h3 className="font-medium text-red-500 whitespace-nowrap">
								*Ongkir
							</h3>
							<input
								type="number"
								name="ongkir"
								value={formData.ongkir}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										ongkir:
											e.target.value === "" ? 0 : parseFloat(e.target.value),
									}))
								}
								className="w-full p-2 border border-gray-300 rounded-md"
								placeholder="Ongkir"
							/>
						</div>
						<div className="mb-0">
							<h3 className="font-medium text-red-500 whitespace-nowrap">
								*Discount (0-1) contoh: 0,1
							</h3>
							<input
								type="number"
								name="discount"
								step="0.01"
								value={formData.discount}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										discount:
											e.target.value === "" ? 0 : parseFloat(e.target.value),
									}))
								}
								className="w-full mb-4 p-2 border border-gray-300 rounded-md"
								placeholder="Discount"
							/>
						</div>
						<input
							type="text"
							name="status"
							value={formData.status}
							onChange={handleChange}
							className="w-full mb-4 p-2 border border-gray-300 rounded-md"
							placeholder="Status"
						/>
						<div className="mb-0">
							<h3 className="font-medium text-red-500 whitespace-nowrap">
								*Tanggal Pelunasan
							</h3>
							<input
								type="date"
								name="tgl_pelunasan"
								value={formData.tgl_pelunasan}
								onChange={handleChange}
								className="w-full mb-4 p-2 border border-gray-300 rounded-md"
							/>
						</div>
						<input
							type="text"
							name="keterangan"
							value={formData.keterangan}
							onChange={handleChange}
							className="w-full mb-4 p-2 border border-gray-300 rounded-md"
							placeholder="Keterangan"
						/>

						{/* Items */}
						<div className="space-y-4">
							<h3 className="font-medium">Item</h3>
							{formData.barang.map((item, index) => (
								<div className="flex space-x-4" key={index}>
									<select
										className="w-1/2 border border-gray-300 p-2 rounded-md"
										value={item._id}
										onChange={(e) =>
											handleItemChange(index, "_id", e.target.value)
										}
										required
									>
										<option value="">Pilih Barang</option>
										{katalogBarang?.data?.map((barang) => (
											<option key={barang._id} value={barang._id}>
												{barang.nama_barang}
											</option>
										))}
									</select>
									<input
										type="number"
										className="w-1/4 border border-gray-300 p-2 rounded-md"
										value={item.vol}
										onChange={(e) =>
											handleItemChange(index, "vol", Number(e.target.value))
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

						{errorMessage && (
							<p className="text-red-500 mt-2">{errorMessage}</p>
						)}

						<div className="flex justify-end mt-6">
							<button
								type="button"
								className="px-4 py-2 bg-gray-300 rounded-lg mr-2"
								onClick={() => setOpenModal(false)}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 min-w-[100px]"
								disabled={formLoading || mutation.isLoading}
							>
								{mutation.isLoading ? (
									<span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
								) : (
									"Submit"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
