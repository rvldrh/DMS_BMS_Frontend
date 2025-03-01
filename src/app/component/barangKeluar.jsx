"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	CircularProgress,
	MenuItem,
	FormControl,
	InputLabel,
	Select,
} from "@mui/material";
import {
	getBarangKeluar,
	addBarangKeluar,
} from "../service/barang_keluar.service";
import { Spinner } from "./spinner";
import { fetchKatalogBarang } from "../service/katalog_barang.service";

export const BarangKeluarTable = () => {
	const [barangKeluar, setBarangKeluar] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openModal, setOpenModal] = useState(false);
	const [formData, setFormData] = useState({
		tanggal: "",
		kode_barang: "",
		nama_barang: "",
		qty_keluar: 0,
		keterangan: "",
	});
	const [formLoading, setFormLoading] = useState(false);

	const {
		data,
		isLoading,
		error: katalogError,
	} = useQuery({
		queryKey: ["katalogBarang"],
		queryFn: fetchKatalogBarang,
		refetchInterval: 3000,
	});

	useEffect(() => {
		const fetchBarangKeluar = async () => {
			try {
				const { data } = await getBarangKeluar();
				setBarangKeluar(data);
			} catch {
				setError("Gagal mengambil data barang keluar");
			} finally {
				setLoading(false);
			}
		};

		fetchBarangKeluar();
	}, []);

	const handleOpenModal = () => setOpenModal(true);
	const handleCloseModal = () => setOpenModal(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleSubmit = async () => {
		setFormLoading(true);
		console.log(formData);
		try {
			await addBarangKeluar({
				tanggal: formData.tanggal,
				kode_barang: formData.kode_barang,
				nama_barang: formData.nama_barang, // Sini
				qty_keluar: formData.qty_keluar,
				keterangan: formData.keterangan,
			});
			handleCloseModal();
			setFormData({
				tanggal: "",
				kode_barang: "",
				nama_barang: "", // Sini
				qty_keluar: 0,
				keterangan: "",
			});
			const { data } = await getBarangKeluar();
			setBarangKeluar(data);
		} catch {
			setError("Gagal menambahkan barang keluar");
		} finally {
			setFormLoading(false);
		}
	};

	if (loading) return <Spinner />;
	if (error) return <p>{error}</p>;

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Tanggal</TableCell>
							<TableCell>Kode Barang</TableCell>
							<TableCell>Nama Barang</TableCell>
							<TableCell>Jumlah Keluar</TableCell>
							<TableCell>Keterangan</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{barangKeluar.map((item) => (
							<TableRow key={item._id}>
								<TableCell>{item.tanggal}</TableCell>
								<TableCell>{item.kode_barang}</TableCell>
								<TableCell>{item.nama_barang}</TableCell>
								<TableCell>{item.qty_keluar}</TableCell>
								<TableCell>{item.keterangan}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Box mt={2}>
				<Button variant="contained" color="primary" onClick={handleOpenModal}>
					Tambah Barang Keluar
				</Button>
			</Box>

			{/* Modal for adding new Barang Keluar */}
			<Dialog open={openModal} onClose={handleCloseModal}>
				<DialogTitle>Tambah Barang Keluar</DialogTitle>
				<DialogContent>
					<TextField
						label="Tanggal"
						name="tanggal"
						value={formData.tanggal}
						onChange={handleChange}
						fullWidth
						margin="normal"
					/>
					<FormControl fullWidth>
						<InputLabel id="katalog-barang-label">Katalog Barang</InputLabel>
						<Select
							labelId="katalog-barang-label"
							id="katalog-barang"
							value={formData.kode_barang}
							name="kode_barang"
							onChange={(e) => {
								const kode_barang = e.target.value;
								const nama_barang = data?.data?.find(
									(barang) => barang._id === kode_barang,
								)?.nama_barang;
								setFormData((prevData) => ({
									...prevData,
									kode_barang: kode_barang,
									nama_barang: nama_barang, // Sini
								}));
							}}
						>
							{data?.data?.map((barang) => (
								<MenuItem key={barang._id} value={barang.kode_barang}>
									{barang.nama_barang}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						label="Jumlah Keluar"
						name="qty_keluar"
						type="number"
						value={formData.qty_keluar}
						onChange={handleChange}
						fullWidth
						margin="normal"
					/>
					<TextField
						label="Keterangan"
						name="keterangan"
						value={formData.keterangan}
						onChange={handleChange}
						fullWidth
						margin="normal"
					/>
					{/* Tambahkan dropdown katalog barang */}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseModal} color="primary">
						Batal
					</Button>
					<Button onClick={handleSubmit} color="primary" disabled={formLoading}>
						{formLoading ? <CircularProgress size={24} /> : "Simpan"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
