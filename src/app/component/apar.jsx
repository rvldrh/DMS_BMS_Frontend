"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApar, addApar } from "@/app/service/apar.service";
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
		outlet: "",
		marketing: "",
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
		if (!newApar.jenis || !newApar.outlet || !newApar.marketing || !newApar.tanggal_exp) {
			toast.error("Harap isi semua field!");
			return;
		}
		addAparMutation.mutate(newApar);
	};

	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedData = apars?.data?.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    console.log(newApar)
	return (
		<div className="max-w-5xl mx-auto p-4">
			<h2 className="text-2xl font-semibold text-center mb-4">Daftar APAR</h2>

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
				<div className="overflow-x-auto">
					<table className="min-w-full border border-gray-200">
						<thead className="bg-gray-100">
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
								<tr key={apar._id} className="hover:bg-gray-50">
									<td className="border px-4 py-2">{startIndex + index + 1}</td>
									<td className="border px-4 py-2">{apar.jenis}</td>
									<td className="border px-4 py-2">{apar.outlet}</td>
									<td className="border px-4 py-2">{apar.marketing}</td>
									<td className="border px-4 py-2">{new Date(apar.tanggal_exp).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<div className="flex justify-between mt-4">
				<button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50">Previous</button>
				<span>Page {currentPage} of {totalPages}</span>
				<button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50">Next</button>
			</div>

			{/* Modal Tambah APAR */}
			{openAdd && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h3 className="text-xl font-semibold mb-4">Tambah APAR Baru</h3>
						<input className="w-full p-2 border rounded mb-2" type="text" name="jenis" placeholder="Jenis APAR" value={newApar.jenis} onChange={handleChange} />
						<input className="w-full p-2 border rounded mb-2" type="text" name="outlet" placeholder="Outlet" value={newApar.outlet} onChange={handleChange} />
						<input className="w-full p-2 border rounded mb-2" type="text" name="marketing" placeholder="Marketing" value={newApar.marketing} onChange={handleChange} />
						<input className="w-full p-2 border rounded mb-2" type="date" name="tanggal_exp" value={newApar.tanggal_exp} onChange={handleChange} />
						<div className="flex justify-end mt-4">
							<button onClick={() => setOpenAdd(false)} className="bg-gray-400 px-4 py-2 rounded mr-2">Batal</button>
							<button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Simpan</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
