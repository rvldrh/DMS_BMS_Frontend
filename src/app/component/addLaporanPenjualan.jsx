"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { addLaporanPenjualan } from "../service/laporan_penjualan.service";
import { fetchKatalogBarang } from "../service/katalog_barang.service";

export const LaporanPenjualanFormModal = ({ isOpen, onClose }) => {
	const [formData, setFormData] = useState({
		tanggal: "",
		no_invoice: "",
		tgl_jatuhTempo: "",
		item: [{ _id: "", qty: 0 }],
		ppn: 0,
		kepada: "",
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["katalogBarang"],
		queryFn: fetchKatalogBarang,
		refetchInterval: 3000,
	});

	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

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
			item: [...prev.item, { _id: "", qty: 0 }],
		}));
	};

	const handleRemoveItem = (index) => {
		const updatedItems = formData.item.filter((_, i) => i !== index);
		setFormData((prev) => ({ ...prev, item: updatedItems }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		console.log("Data sebelum dikirim:", formData.item);

		const validItems = formData.item.filter((item) => item._id && item.qty > 0);

		if (validItems.length === 0) {
			alert(
				"Harap tambahkan setidaknya satu item dengan ID dan jumlah yang valid.",
			);
			return;
		}

		try {
			const katalogBarang = await fetchKatalogBarang();

			let subtotal = 0;
			const updatedItems = validItems.map((item) => {
				const barang = katalogBarang.data.find((b) => b._id === item._id);
				if (!barang) {
					throw new Error(`Barang dengan ID ${item._id} tidak ditemukan.`);
				}

				const jumlah = barang.harga * item.qty;
				subtotal += jumlah;

				return {
					_id: item._id,
					qty: item.qty,
					jumlah: jumlah,
				};
			});

			const ppnValue = subtotal * parseFloat(formData.ppn);
			const grand_total = subtotal + ppnValue;

			const finalData = {
				tanggal: formData.tanggal,
				no_invoice: formData.no_invoice,
				tgl_jatuhTempo: formData.tgl_jatuhTempo,
				item: updatedItems,
				ppn: parseFloat(formData.ppn),
				subtotal: subtotal,
				grand_total: grand_total,
				kepada: formData.kepada,
			};

			const response = await addLaporanPenjualan(finalData);
			console.log("Laporan Penjualan added:", response);
			alert("Laporan Penjualan added successfully!");

			// Reset form after submission
			setFormData({
				tanggal: "",
				no_invoice: "",
				tgl_jatuhTempo: "",
				item: [{ _id: "", qty: 0 }],
				ppn: 0,
				kepada: "",
			});

			onClose(); // Close modal after successful submission
		} catch (error) {
			console.error("Error submitting form:", error);
			alert("Error adding Laporan Penjualan.");
		}
	};

	if (!isClient) {
		return null;
	}

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading data</div>;

	return (
		<div
			className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${isOpen ? "block" : "hidden"}`}
		>
			<div className="bg-white p-6 rounded-lg w-96">
				<h2 className="text-xl font-semibold mb-4">Tambah Laporan Penjualan</h2>
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
										{data?.data?.map((barang) => (
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
											handleItemChange(index, "qty", Number(e.target.value))
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
							onClick={onClose}
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
	);
};
