"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApar, addApar } from "@/app/service/apar.service";
import { toast } from "react-hot-toast";
import { Moon, Sun } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export const ListAPAR = () => {
	const queryClient = useQueryClient();
	const { data: apars, isLoading } = useQuery({
		queryKey: ["apars"],
		queryFn: getApar,
	});

	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = apars ? Math.ceil(apars.data.length / ITEMS_PER_PAGE) : 1;
	const [openAdd, setOpenAdd] = useState(false);
	const [darkMode, setDarkMode] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState("");
	const [selectedYear, setSelectedYear] = useState("");
	const [newApar, setNewApar] = useState({
		jenis: "",
		outlet: "",
		marketing: "",
		tanggal_exp: "",
	});

	useEffect(() => {
		const storedTheme = localStorage.getItem("theme");
		setDarkMode(storedTheme === "dark");
	}, []);

	const toggleTheme = () => {
		setDarkMode((prev) => !prev);
		localStorage.setItem("theme", !darkMode ? "dark" : "light");
	};

	const handleFilterChange = () => {
		setCurrentPage(1);
	};

	const filteredData = apars?.data?.filter((apar) => {
		const aparDate = new Date(apar.tanggal_exp);
		const aparMonth = aparDate.getMonth() + 1;
		const aparYear = aparDate.getFullYear();
		return (
			(selectedMonth === "" || aparMonth === parseInt(selectedMonth)) &&
			(selectedYear === "" || aparYear === parseInt(selectedYear))
		);
	});

	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedData = filteredData?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

	return (
		<div className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} min-h-screen p-6`}>
			<div className="max-w-5xl mx-auto">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-3xl font-bold">Daftar APAR</h2>
					<button onClick={toggleTheme} className="p-2 bg-blue-500 text-white rounded-full">
						{darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-blue-700" />}
					</button>
				</div>
				<div className="flex gap-4 mb-4">
					<select
						className={`${darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"} p-2 rounded-md`}
						onChange={(e) => { setSelectedMonth(e.target.value); handleFilterChange(); }}
						value={selectedMonth}
					>
						<option value="">Pilih Bulan</option>
						{Array.from({ length: 12 }, (_, i) => (
							<option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
						))}
					</select>
					<select
						className={`${darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"} p-2 rounded-md`}
						onChange={(e) => { setSelectedYear(e.target.value); handleFilterChange(); }}
						value={selectedYear}
					>
						<option value="">Pilih Tahun</option>
						{Array.from({ length: 10 }, (_, i) => (
							<option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
						))}
					</select>
				</div>
				{isLoading ? (
					<div className="flex justify-center py-6">
						<div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
					</div>
				) : (
					<>
						<table className="w-full border border-gray-200">
							<thead className={`${darkMode ? "bg-blue-700" : "bg-blue-300"}`}>
								<tr>
									<th className="border px-4 py-2">No</th>
									<th className="border px-4 py-2">Jenis APAR</th>
									<th className="border px-4 py-2">Nama Pemilik</th>
									<th className="border px-4 py-2">Marketing</th>
									<th className="border px-4 py-2">Tanggal Expired</th>
								</tr>
							</thead>
							<tbody>
								{paginatedData?.map((apar, index) => (
									<tr key={apar._id} className="hover:bg-blue-100 dark:hover:bg-blue-800">
										<td className="border px-4 py-2">{startIndex + index + 1}</td>
										<td className="border px-4 py-2">{apar.jenis}</td>
										<td className="border px-4 py-2">{apar.outlet}</td>
										<td className="border px-4 py-2">{apar.marketing}</td>
										<td className="border px-4 py-2">{new Date(apar.tanggal_exp).toLocaleDateString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</>
				)}
			</div>
		</div>
	);
};