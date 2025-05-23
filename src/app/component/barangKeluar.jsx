"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
	getBarangKeluar,
	addBarangKeluar,
} from "@/app/service/barang_keluar.service";
import { Spinner } from "./spinner";
import { fetchKatalogBarang } from "@/app/service/katalog_barang.service";

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

	const [search, setSearch] = useState("");
	const [filterDate, setFilterDate] = useState("");

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const { data, isLoading: isKatalogLoading } = useQuery({
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

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleOpenModal = () => setOpenModal(true);
	const handleCloseModal = () => setOpenModal(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({ ...prevData, [name]: value }));
	};

	const handleSubmit = async () => {
		setFormLoading(true);
		try {
			await addBarangKeluar({
				tanggal: formData.tanggal,
				kode_barang: formData.kode_barang,
				nama_barang: formData.nama_barang,
				qty_keluar: formData.qty_keluar,
				keterangan: formData.keterangan,
			});
			handleCloseModal();
			setFormData({
				tanggal: "",
				kode_barang: "",
				nama_barang: "",
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

	// Filtering
	const filteredBarangKeluar = barangKeluar.filter((item) => {
		const matchesSearch =
			item.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
			item.kode_barang.toLowerCase().includes(search.toLowerCase());

		const matchesDate = filterDate ? item.tanggal === filterDate : true;

		return matchesSearch && matchesDate;
	});

	const paginatedData = filteredBarangKeluar.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	return (
		<div className="container mx-auto my-4 p-4">
			<div className="flex flex-wrap justify-between items-center mb-4 gap-2">
				<div className="flex flex-wrap gap-2">
					<div className="flex flex-col w-full sm:w-[200px]">
						<h3 className="font-medium text-xs mb-1">
							Search by Nama / Kode Barang
						</h3>
						<input
							type="text"
							placeholder="Cari nama/kode barang..."
							className="px-4 py-2 border border-gray-300 rounded-md"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<div className="flex flex-col w-full sm:w-[200px]">
						<h3 className="font-medium text-xs mb-1">Search by Tanggal</h3>
						<input
							type="date"
							className="px-4 py-2 border border-gray-300 rounded-md"
							value={filterDate}
							onChange={(e) => setFilterDate(e.target.value)}
						/>
					</div>
				</div>
				{/* <button
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
					onClick={handleOpenModal}
				>
					Tambah Barang Keluar
				</button> */}
			</div>

			<div className="overflow-x-auto bg-white shadow-md rounded-lg">
				<table className="min-w-full table-auto">
					<thead className="bg-gray-100">
						<tr>
							<th className="px-4 py-2 border text-center">Tanggal</th>
							<th className="px-4 py-2 border text-center">Kode Barang</th>
							<th className="px-4 py-2 border text-center">Nama Barang</th>
							<th className="px-4 py-2 border text-center">Jumlah Keluar</th>
							<th className="px-4 py-2 border text-center">Harga Keluar</th>
							<th className="px-4 py-2 border text-center">Keterangan</th>
						</tr>
					</thead>
					<tbody>
						{paginatedData.map((item) => (
							<tr key={item._id} className="odd:bg-gray-50">
								<td className="px-4 py-2 border text-center">{item.tanggal}</td>
								<td className="px-4 py-2 border text-center">{item.kode_barang}</td>
								<td className="px-4 py-2 border text-center">{item.nama_barang}</td>
								<td className="px-4 py-2 border text-center">{item.qty_keluar}</td>
								<td className="px-4 py-2 border text-center">
									{Number.isFinite(item?.harga_satuan)
										? `Rp ${Math.floor(item.harga_satuan).toLocaleString("id-ID")}`
										: "Rp 0"}
								</td>
								<td className="px-4 py-2 border">{item.keterangan}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex justify-between items-center mt-4">
				<div className="flex items-center">
					<label htmlFor="rows-per-page" className="mr-2 text-gray-700">
						Rows per page:
					</label>
					<select
						id="rows-per-page"
						value={rowsPerPage}
						onChange={handleChangeRowsPerPage}
						className="px-4 py-2 border border-gray-300 rounded-md"
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={25}>25</option>
					</select>
				</div>
				<div className="flex items-center">
					<button
						onClick={(e) => handleChangePage(e, page - 1)}
						disabled={page === 0}
						className="px-3 py-1 bg-gray-300 rounded-lg mr-2 hover:bg-gray-400"
					>
						Previous
					</button>
					<span className="px-3 py-1">{page + 1}</span>
					<button
						onClick={(e) => handleChangePage(e, page + 1)}
						disabled={
							page >= Math.ceil(filteredBarangKeluar.length / rowsPerPage) - 1
						}
						className="px-3 py-1 bg-gray-300 rounded-lg ml-2 hover:bg-gray-400"
					>
						Next
					</button>
				</div>
			</div>

			{/* Modal */}
		</div>
	);
};
