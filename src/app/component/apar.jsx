"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApar, addApar } from "@/app/service/apar.service";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	CircularProgress,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 5;

export const ListAPAR = () => {
	const queryClient = useQueryClient();
	const { data: apars, isLoading } = useQuery({
		queryKey: ["apars"],
		queryFn: getApar,
	});

	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = apars ? Math.ceil(apars.data.length / ITEMS_PER_PAGE) : 1;
	const [openAdd, setOpenAdd] = useState(false);
	const [newApar, setNewApar] = useState({
		jenis: "",
		nama_pemilik: "",
		tanggal_refill: "",
		tanggal_exp: "",
	});

	const addAparMutation = useMutation({
		mutationFn: async (formData) => {
			return await addApar(formData);
		},
		onSuccess: () => {
			toast.success("APAR berhasil ditambahkan!");
			queryClient.invalidateQueries(["apars"]);
			setOpenAdd(false);
		},
		onError: () => {
			toast.error("Gagal menambahkan APAR!");
		},
	});

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage((prev) => prev + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewApar({ ...newApar, [name]: value });
	};

	const handleSubmit = async () => {
		if (!newApar.jenis || !newApar.nama_pemilik) {
			toast.error("Harap isi semua field!");
			return;
		}
		addAparMutation.mutate(newApar);
	};

	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedData = apars?.data?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	return (
		<div className="container mx-auto p-6">
			<Typography variant="h4" gutterBottom align="center">
				Daftar APAR
			</Typography>

			<Button
				variant="contained"
				color="primary"
				onClick={() => setOpenAdd(true)}
				sx={{ marginBottom: 2 }}
			>
				Tambah APAR
			</Button>

			{isLoading ? (
				<div className="flex justify-center py-6">
					<CircularProgress />
				</div>
			) : (
				<TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, marginTop: 2 }}>
					<Table>
						<TableHead>
							<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
								<TableCell>No</TableCell>
								<TableCell>Jenis APAR</TableCell>
								<TableCell>Nama Pemilik</TableCell>
								<TableCell>Tanggal Refill</TableCell>
								<TableCell>Tanggal Expired</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedData?.map((apar, index) => (
								<TableRow key={apar._id} hover>
									<TableCell>{startIndex + index + 1}</TableCell>
									<TableCell>{apar.jenis}</TableCell>
									<TableCell>{apar.nama_pemilik}</TableCell>
									<TableCell>{new Date(apar.tanggal_refill).toLocaleDateString()}</TableCell>
									<TableCell>{new Date(apar.tanggal_exp).toLocaleDateString()}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			<div className="flex justify-between mt-4">
				<Button onClick={handlePrevPage} disabled={currentPage === 1}>
					Previous
				</Button>
				<Typography>
					Page {currentPage} of {totalPages}
				</Typography>
				<Button onClick={handleNextPage} disabled={currentPage === totalPages}>
					Next
				</Button>
			</div>

			{/* Modal Tambah APAR */}
			<Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
				<DialogTitle>Tambah APAR Baru</DialogTitle>
				<DialogContent>
					<TextField fullWidth margin="dense" label="Jenis APAR" name="jenis" value={newApar.jenis} onChange={handleChange} />
					<TextField fullWidth margin="dense" label="Nama Pemilik" name="nama_pemilik" value={newApar.nama_pemilik} onChange={handleChange} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenAdd(false)} color="secondary">Batal</Button>
					<Button onClick={handleSubmit} color="primary" variant="contained">Simpan</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};