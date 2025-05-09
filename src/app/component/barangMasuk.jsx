"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getBarangMasuk,
	addBarangMasuk,
} from "@/app/service/barang_masuk.service";
import { fetchKatalogBarang } from "@/app/service/katalog_barang.service";
import { Spinner } from "./spinner";

export const BarangMasukTable = () => {
	const [barangMasuk, setBarangMasuk] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openModal, setOpenModal] = useState(false);
	const [formData, setFormData] = useState({
		tanggal: "",
		kode_barang: "",
		nama_barang: "",
		qty_masuk: 0,
		keterangan: "",
	});
	const [formLoading, setFormLoading] = useState(false);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [searchKeyword, setSearchKeyword] = useState("");
	const [filterDate, setFilterDate] = useState("");

	const {
		data: katalogData,
		isLoading: katalogLoading,
		error: katalogError,
	} = useQuery({
		queryKey: ["katalogBarang"],
		queryFn: fetchKatalogBarang,
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await getBarangMasuk();
				setBarangMasuk(res.data);
			} catch {
				setError("Gagal mengambil data barang masuk");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async () => {
		setFormLoading(true);
		try {
			await addBarangMasuk(formData);
			setFormData({
				tanggal: "",
				kode_barang: "",
				nama_barang: "",
				qty_masuk: 0,
				keterangan: "",
			});
			setOpenModal(false);
			const res = await getBarangMasuk();
			setBarangMasuk(res.data);
		} catch {
			setError("Gagal menambahkan barang masuk");
		} finally {
			setFormLoading(false);
		}
	};

	const filteredData = barangMasuk.filter((item) => {
		const keyword = searchKeyword.toLowerCase();
		const matchesKeyword =
			item.nama_barang.toLowerCase().includes(keyword) ||
			item.kode_barang.toLowerCase().includes(keyword);

		const isSameDate = filterDate
			? new Date(item.tanggal).toISOString().slice(0, 10) === filterDate
			: true;

		return matchesKeyword && isSameDate;
	});

	const paginated = filteredData.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	if (loading || katalogLoading) return <Spinner />;
	if (error || katalogError) return <p>{error || katalogError.message}</p>;

	return (
		<div className="container mx-auto my-4 p-4">
			{/* Header Section */}
			<div className="flex flex-wrap justify-between items-center mb-4 gap-2">
				<div className="flex flex-wrap gap-2">
					<div className="flex flex-col w-full sm:w-[200px]">
						<h3 className="font-medium text-xs mb-1">
							Search by Nama / Kode Barang
						</h3>
						<input
							type="text"
							placeholder="Cari nama atau kode barang..."
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-md"
						/>
					</div>
					<div className="flex flex-col w-full sm:w-[200px]">
						<h3 className="font-medium text-xs mb-1">Search by Tanggal</h3>
						<input
							type="date"
							value={filterDate}
							onChange={(e) => setFilterDate(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-md"
						/>
					</div>
				</div>
				<button
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
					onClick={() => setOpenModal(true)}
				>
					Tambah Barang Masuk
				</button>
			</div>

			{/* Table */}
			<div className="overflow-x-auto bg-white shadow-md rounded-lg">
				<table className="min-w-full table-auto">
					<thead className="bg-gray-100">
						<tr>
							<th className="px-4 py-2 border">Tanggal</th>
							<th className="px-4 py-2 border">Kode Barang</th>
							<th className="px-4 py-2 border">Nama Barang</th>
							<th className="px-4 py-2 border">Jumlah Masuk</th>
							<th className="px-4 py-2 border">Keterangan</th>
						</tr>
					</thead>
					<tbody>
						{paginated.map((item) => (
							<tr key={item._id} className="odd:bg-gray-50">
								<td className="px-4 py-2 border">{item.tanggal}</td>
								<td className="px-4 py-2 border">{item.kode_barang}</td>
								<td className="px-4 py-2 border">{item.nama_barang}</td>
								<td className="px-4 py-2 border">{item.qty_masuk}</td>
								<td className="px-4 py-2 border">{item.keterangan}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex justify-between items-center mt-4">
				<div className="flex items-center">
					<label htmlFor="rows-per-page" className="mr-2 text-gray-700">
						Rows per page:
					</label>
					<select
						id="rows-per-page"
						value={rowsPerPage}
						onChange={(e) => {
							setRowsPerPage(parseInt(e.target.value));
							setPage(0);
						}}
						className="px-4 py-2 border border-gray-300 rounded-md"
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
					</select>
				</div>
				<div className="flex items-center">
					<button
						onClick={() => setPage(page - 1)}
						disabled={page === 0}
						className="px-3 py-1 bg-gray-300 rounded-lg mr-2 hover:bg-gray-400"
					>
						Previous
					</button>
					<span className="px-3 py-1">{page + 1}</span>
					<button
						onClick={() => setPage(page + 1)}
						disabled={page >= Math.ceil(filteredData.length / rowsPerPage) - 1}
						className="px-3 py-1 bg-gray-300 rounded-lg ml-2 hover:bg-gray-400"
					>
						Next
					</button>
				</div>
			</div>

			{/* Modal */}
			<div
				className={`fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 ${openModal ? "block" : "hidden"}`}
				onClick={() => setOpenModal(false)}
			>
				<div
					className="bg-white p-6 rounded-lg w-11/12 md:w-1/3"
					onClick={(e) => e.stopPropagation()}
				>
					<h2 className="text-2xl mb-4">Tambah Barang Masuk</h2>
					<input
						type="date"
						name="tanggal"
						value={formData.tanggal}
						onChange={handleChange}
						className="w-full mb-4 p-2 border border-gray-300 rounded-md"
					/>
					<select
						name="kode_barang"
						value={formData.kode_barang}
						onChange={(e) => {
							const kode_barang = e.target.value;
							const nama_barang = katalogData?.data?.find(
								(barang) => barang.kode_barang === kode_barang,
							)?.nama_barang;
							setFormData((prevData) => ({
								...prevData,
								kode_barang,
								nama_barang,
							}));
						}}
						className="w-full mb-4 p-2 border border-gray-300 rounded-md"
					>
						<option value="">Pilih Barang</option>
						{katalogData?.data?.map((barang) => (
							<option key={barang._id} value={barang.kode_barang}>
								{barang.nama_barang}
							</option>
						))}
					</select>
					<input
						type="number"
						name="qty_masuk"
						value={formData.qty_masuk}
						onChange={handleChange}
						className="w-full mb-4 p-2 border border-gray-300 rounded-md"
						placeholder="Jumlah Masuk"
					/>
					<input
						type="text"
						name="keterangan"
						value={formData.keterangan}
						onChange={handleChange}
						className="w-full mb-4 p-2 border border-gray-300 rounded-md"
						placeholder="Keterangan"
					/>
					<div className="flex justify-end">
						<button
							className="px-4 py-2 bg-gray-300 rounded-lg mr-2"
							onClick={() => setOpenModal(false)}
						>
							Batal
						</button>
						<button
							className="px-4 py-2 bg-blue-500 text-white rounded-lg"
							onClick={handleSubmit}
							disabled={formLoading}
						>
							{formLoading ? "Loading..." : "Simpan"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
