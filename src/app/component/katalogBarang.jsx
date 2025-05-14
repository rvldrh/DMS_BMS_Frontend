"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
	fetchKatalogBarang,
	addKatalogBarang,
	updateKatalogBarang,
	deleteKatalogBarang,
} from "@/app/service/katalog_barang.service";
import { Spinner } from "./spinner";

export const KatalogBarangList = () => {
	const [openModal, setOpenModal] = useState(false);
	const [selectedId, setSelectedId] = useState(null);
	const [kodeBarang, setKodeBarang] = useState("");
	const [namaBarang, setNamaBarang] = useState("");
	const [satuan, setSatuan] = useState("");
	const [harga, setHarga] = useState("");
	const [stokAwal, setStokAwal] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deletingId, setDeletingId] = useState(null);

	const {
		data: katalogBarangData,
		error: katalogBarangError,
		isLoading: katalogBarangLoading,
	} = useQuery({
		queryKey: ["katalogBarang"],
		queryFn: fetchKatalogBarang,
		refetchInterval: 3000,
	});

	const { mutateAsync: addBarang } = useMutation({
		mutationFn: addKatalogBarang,
		onSuccess: () => handleCloseModal(),
	});

	const { mutateAsync: updateBarang } = useMutation({
		mutationFn: (data) => updateKatalogBarang(data.id, data.data),
		onSuccess: () => handleCloseModal(),
	});

	const { mutateAsync: deleteBarang } = useMutation({
		mutationFn: deleteKatalogBarang,
	});

	const handleOpenModal = (barang) => {
		setSelectedId(barang?._id || null);
		setKodeBarang(barang?.kode_barang || "");
		setNamaBarang(barang?.nama_barang || "");
		setSatuan(barang?.satuan || "");
		setHarga(barang?.harga || "");
		setStokAwal(barang?.stok_awal || "");
		setOpenModal(true);
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		setSelectedId(null);
		setKodeBarang("");
		setNamaBarang("");
		setSatuan("");
		setHarga("");
		setStokAwal("");
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);
		const barangData = {
			kode_barang: kodeBarang,
			nama_barang: namaBarang,
			satuan,
			harga: Number(harga),
			stok_awal: Number(stokAwal),
		};
		try {
			if (selectedId) {
				await updateBarang({ id: selectedId, data: barangData });
			} else {
				await addBarang(barangData);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id) => {
		setDeletingId(id);
		try {
			await deleteBarang(id);
		} finally {
			setDeletingId(null);
		}
	};

	const filteredData = katalogBarangData?.data?.filter(
		(item) =>
			item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	if (katalogBarangLoading) return <Spinner />;
	if (katalogBarangError instanceof Error)
		return (
			<div className="text-red-500">Error: {katalogBarangError.message}</div>
		);

	return (
		<div className="relative p-4">
			<div className="flex flex-wrap justify-between items-center mb-4 gap-2 ">
				<div className="flex flex-col w-full sm:w-[200px]">
					<h3 className="font-medium text-xs mb-1">
						Search by Nama / Kode Barang
					</h3>
					<input
						type="text"
						className="border px-3 py-2 rounded w-64"
						placeholder="Cari kode/nama barang"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<button
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
					onClick={() => handleOpenModal()}
				>
					Tambah Katalog Barang
				</button>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full border text-sm">
					<thead className="bg-gray-100">
						<tr>
							<th className="border px-3 py-2">No</th>
							<th className="border px-3 py-2">Kode Barang</th>
							<th className="border px-3 py-2">Nama Barang</th>
							<th className="border px-3 py-2">Satuan</th>
							<th className="border px-3 py-2">Harga</th>
							<th className="border px-3 py-2">Stok Awal</th>
							<th className="border px-3 py-2">Masuk</th>
							<th className="border px-3 py-2">Keluar</th>
							<th className="border px-3 py-2">Stok Akhir</th>
							<th className="border px-3 py-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredData?.map((item, index) => (
							<tr key={item._id} className="odd:bg-white even:bg-gray-50">
								<td className="border px-3 py-2 text-center">{index + 1}</td>
								<td className="border px-3 py-2">{item.kode_barang}</td>
								<td className="border px-3 py-2">{item.nama_barang}</td>
								<td className="border px-3 py-2">{item.satuan}</td>
								<td className="border px-3 py-2">
									{item.harga.toLocaleString("id-ID")}
								</td>
								<td className="border px-3 py-2">{item.stok_awal}</td>
								<td className="border px-3 py-2">{item.masuk}</td>
								<td className="border px-3 py-2">{item.keluar}</td>
								<td className="border px-3 py-2">
									{item.stok_awal + item.masuk - item.keluar}
								</td>
								<td className="border px-3 py-2 space-x-2">
									<button
										onClick={() => handleOpenModal(item)}
										className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
									>
										Edit
									</button>
									<button
										onClick={() => handleDelete(item._id)}
										disabled={deletingId === item._id}
										className={`px-2 py-1 text-white rounded ${
											deletingId === item._id
												? "bg-red-400 cursor-not-allowed"
												: "bg-red-600 hover:bg-red-700"
										}`}
									>
										{deletingId === item._id ? "Menghapus..." : "Hapus"}
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{openModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
						<h2 className="text-xl font-bold mb-4">
							{selectedId ? "Edit" : "Tambah"} Katalog Barang
						</h2>
						<form onSubmit={handleSubmit} className="space-y-4">
							<input
								type="text"
								className="w-full border px-3 py-2 rounded"
								placeholder="Kode Barang"
								value={kodeBarang}
								onChange={(e) => setKodeBarang(e.target.value)}
								required
							/>
							<input
								type="text"
								className="w-full border px-3 py-2 rounded"
								placeholder="Nama Barang"
								value={namaBarang}
								onChange={(e) => setNamaBarang(e.target.value)}
								required
							/>
							<input
								type="text"
								className="w-full border px-3 py-2 rounded"
								placeholder="Satuan"
								value={satuan}
								onChange={(e) => setSatuan(e.target.value)}
								required
							/>
							<input
								type="number"
								className="w-full border px-3 py-2 rounded"
								placeholder="Harga"
								value={harga}
								onChange={(e) => setHarga(e.target.value)}
								required
							/>
							<input
								type="number"
								className="w-full border px-3 py-2 rounded"
								placeholder="Stok Awal"
								value={stokAwal}
								onChange={(e) => setStokAwal(e.target.value)}
								required
							/>
							<div className="flex justify-end space-x-2">
								<button
									type="button"
									onClick={handleCloseModal}
									className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
								>
									Batal
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Menyimpan..." : "Simpan"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};
