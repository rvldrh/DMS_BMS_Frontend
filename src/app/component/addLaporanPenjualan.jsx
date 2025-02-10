"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
	TextField,
	Button,
	Grid,
	Typography,
	IconButton,
	Select,
	MenuItem,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { addLaporanPenjualan } from "../service/laporan_penjualan.service";
import { fetchKatalogBarang } from "../service/katalog_barang.service";

export const LaporanPenjualanForm = () => {
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

		console.log("Data sebelum dikirim:", formData.item); // Debugging

		// Pastikan tidak ada item yang kosong atau undefined
		const validItems = formData.item.filter((item) => item._id && item.qty > 0);

		if (validItems.length === 0) {
			alert(
				"Harap tambahkan setidaknya satu item dengan ID dan jumlah yang valid.",
			);
			return;
		}

		try {
			const finalData = {
				tanggal: formData.tanggal,
				no_invoice: formData.no_invoice,
				tgl_jatuhTempo: formData.tgl_jatuhTempo,
				item: validItems.map((item) => ({
					_id: item._id, // Pastikan tidak undefined
					qty: Number(item.qty), // Pastikan qty adalah angka
				})),
				ppn: parseFloat(formData.ppn), // Konversi ke angka jika perlu
				kepada: formData.kepada,
			};

			console.log("Data yang dikirim:", finalData); // Debugging

			const response = await addLaporanPenjualan(finalData);
			console.log("Laporan Penjualan added:", response);
			alert("Laporan Penjualan added successfully!");

			// Reset form setelah berhasil submit
			setFormData({
				tanggal: "",
				no_invoice: "",
				tgl_jatuhTempo: "",
				item: [{ _id: "", qty: 0 }],
				ppn: 0,
				kepada: "",
			});
		} catch (error) {
			console.error("Error submitting form:", error);
			alert("Error adding Laporan Penjualan.");
		}
	};

	if (!isClient) {
		return null;
	}

	if (isLoading) return <Typography>Loading...</Typography>;
	if (error) return <Typography color="error">Error loading data</Typography>;

	return (
		<form onSubmit={handleSubmit}>
			<Typography variant="h5" gutterBottom>
				Tambah Laporan Penjualan
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Tanggal"
						type="date"
						name="tanggal"
						value={formData.tanggal}
						onChange={handleInputChange}
						InputLabelProps={{ shrink: true }}
						fullWidth
						required
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="No Invoice"
						name="no_invoice"
						value={formData.no_invoice}
						onChange={handleInputChange}
						fullWidth
						required
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Tanggal Jatuh Tempo"
						type="date"
						name="tgl_jatuhTempo"
						value={formData.tgl_jatuhTempo}
						onChange={handleInputChange}
						InputLabelProps={{ shrink: true }}
						fullWidth
						required
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6">Item</Typography>
					{formData.item.map((item, index) => (
						<Grid container spacing={2} key={index} alignItems="center">
							<Grid item xs={4}>
								<Select
									name={`item-${index}-id`}
									value={item._id}
									onChange={(e) =>
										handleItemChange(index, "_id", e.target.value)
									}
									displayEmpty
									fullWidth
								>
									<MenuItem value="" disabled>
										Pilih Barang
									</MenuItem>
									{data?.data?.map((barang) => (
										<MenuItem key={barang?._id} value={barang?._id}>
											{barang?.nama_barang}
										</MenuItem>
									))}
								</Select>
							</Grid>
							<Grid item xs={3}>
								<TextField
									label="Qty"
									type="number"
									name={`item-${index}-qty`}
									value={item.qty}
									onChange={(e) =>
										handleItemChange(index, "qty", Number(e.target.value))
									}
									fullWidth
									required
								/>
							</Grid>
							<Grid item xs={2}>
								<IconButton onClick={() => handleRemoveItem(index)}>
									<DeleteIcon />
								</IconButton>
							</Grid>
						</Grid>
					))}
					<Button
						startIcon={<AddIcon />}
						onClick={handleAddItem}
						variant="outlined"
						color="primary"
						style={{ marginTop: 10 }}
					>
						Tambah Item
					</Button>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="PPN (0-1) ex: 0.1"
						type="number"
						name="ppn"
						value={formData.ppn}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								ppn: parseFloat(e.target.value),
							}))
						}
						fullWidth
						required
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						label="Kepada *fill with address too"
						name="kepada"
						value={formData.kepada}
						onChange={handleInputChange}
						fullWidth
						multiline
						rows={4}
						required
					/>
				</Grid>
			</Grid>
			<Button
				type="submit"
				variant="contained"
				color="primary"
				style={{ marginTop: 20 }}
			>
				Submit
			</Button>
		</form>
	);
};
