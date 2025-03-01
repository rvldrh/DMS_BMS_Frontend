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

	const addAparMutation = useMutation({
		mutationFn: async (formData) => await addApar(formData),
		onSuccess: () => {
			toast.success("APAR berhasil ditambahkan!");
			queryClient.invalidateQueries(["apars"]);
			setOpenAdd(false);
		},
		onError: () => {
			toast.error("Gagal menambahkan APAR!");
		},
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewApar({ ...newApar, [name]: value });
	};

	const handleSubmit = () => {
		if (
			!newApar.jenis ||
			!newApar.outlet ||
			!newApar.marketing ||
			!newApar.tanggal_exp
		) {
			toast.error("Harap isi semua field!");
			return;
		}
		addAparMutation.mutate(newApar);
	};

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

	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedData = apars?.data?.slice(
		startIndex,
		startIndex + ITEMS_PER_PAGE,
	);

	return (
		<div
			className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} min-h-screen p-6`}
		>
			<div className="max-w-5xl mx-auto">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-3xl font-bold">Daftar APAR</h2>
					<button
						onClick={toggleTheme}
						className="p-2 bg-blue-500 text-white rounded-full"
					>
						{darkMode ? (
							<Sun className="w-6 h-6 text-yellow-400" />
						) : (
							<Moon className="w-6 h-6 text-blue-700" />
						)}
					</button>
				</div>

				<button
					onClick={() => setOpenAdd(true)}
					className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
				>
					Tambah APAR
				</button>

				{isLoading ? (
					<div className="flex justify-center py-6">
						<div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full border border-gray-200">
								<thead
									className={`${darkMode ? "bg-blue-700" : "bg-blue-300"}`}
								>
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
										<tr
											key={apar._id}
											className="hover:bg-blue-100 dark:hover:bg-blue-800"
										>
											<td className="border px-4 py-2">
												{startIndex + index + 1}
											</td>
											<td className="border px-4 py-2">{apar.jenis}</td>
											<td className="border px-4 py-2">{apar.outlet}</td>
											<td className="border px-4 py-2">{apar.marketing}</td>
											<td className="border px-4 py-2">
												{new Date(apar.tanggal_exp).toLocaleDateString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="flex justify-between mt-4">
							<button
								onClick={handlePrevPage}
								disabled={currentPage === 1}
								className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
							>
								Previous
							</button>
							<span>
								Page {currentPage} of {totalPages}
							</span>
							<button
								onClick={handleNextPage}
								disabled={currentPage === totalPages}
								className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
							>
								Next
							</button>
						</div>
					</>
				)}
			</div>
			{openAdd && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-xl font-bold mb-4">Tambah APAR</h2>
						<input
							type="text"
							name="jenis"
							placeholder="Jenis APAR"
							onChange={handleChange}
							className="w-full p-2 border mb-2"
						/>
						<input
							type="text"
							name="outlet"
							placeholder="Nama Pemilik"
							onChange={handleChange}
							className="w-full p-2 border mb-2"
						/>
						<input
							type="text"
							name="marketing"
							placeholder="Marketing"
							onChange={handleChange}
							className="w-full p-2 border mb-2"
						/>
						<input
							type="date"
							name="tanggal_exp"
							onChange={handleChange}
							className="w-full p-2 border mb-4"
						/>
						<div className="flex justify-between">
							<button
								onClick={() => setOpenAdd(false)}
								className="bg-gray-500 text-white px-4 py-2 rounded-md"
							>
								Batal
							</button>
							<button
								onClick={handleSubmit}
								className="bg-blue-500 text-white px-4 py-2 rounded-md"
							>
								Simpan
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
