"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addApar } from "@/app/service/apar.service";
import { toast } from "react-hot-toast";

export const AddAPAR = () => {
	const [newApar, setNewApar] = useState({
		jenis: "",
		outlet: "",
		marketing: "",
		tanggal_exp: "",
	});

	const [showModal, setShowModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const addAparMutation = useMutation({
		mutationFn: async (formData) => await addApar(formData),
		onSuccess: () => {
			toast.success("APAR berhasil ditambahkan!");
			setNewApar({ jenis: "", outlet: "", marketing: "", tanggal_exp: "" });
			setShowModal(true);
			setIsLoading(false);
		},
		onMutate: () => {
			setIsLoading(true);
		},
		onError: () => {
			toast.error("Gagal menambahkan APAR!");
			setIsLoading(false);
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

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-10">
			<div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-3xl border border-gray-300">
				<h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
					Tambah APAR
				</h2>

				<label className="text-lg font-bold text-gray-800">Jenis APAR</label>
				<input
					type="text"
					name="jenis"
					placeholder="*Contoh: DCP 3Kg, Co2 3.5kg, Gas cair 2.5kg"
					value={newApar.jenis}
					onChange={handleChange}
					className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-600 bg-gray-100"
				/>

				<label className="text-lg font-bold text-gray-800 mt-4">Outlet</label>
				<input
					type="text"
					name="outlet"
					placeholder="*Contoh: RSSA JL. Jaksa Agung Suprapto"
					value={newApar.outlet}
					onChange={handleChange}
					className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-600 bg-gray-100"
				/>
				<p className="font-bold text-sm text-red-600 mt-1">
					*Inputkan nama outlet serta alamat outlet
				</p>

				<label className="text-lg font-bold text-gray-800 mt-4">Marketing</label>
				<input
					type="text"
					name="marketing"
					placeholder="*Siapa penginput data APAR ini"
					value={newApar.marketing}
					onChange={handleChange}
					className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-600 bg-gray-100"
				/>

				<label className="text-lg font-bold text-gray-800 mt-4">Tanggal Exp</label>
				<input
					type="date"
					name="tanggal_exp"
					value={newApar.tanggal_exp}
					onChange={handleChange}
					className="w-full p-3 border rounded-md text-gray-900 bg-gray-100"
				/>
				<p className="font-bold text-sm text-red-600 mt-1">
					*Inputkan data tanggal Exp dari APAR yang anda input
				</p>

				<div className="flex justify-end mt-4">
					<button
						onClick={handleSubmit}
						className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition flex items-center"
						disabled={isLoading}
					>
						{isLoading && (
							<span className="animate-spin border-4 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
						)}
						Simpan
					</button>
				</div>
			</div>

			{showModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
					<div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md text-center transform scale-95 transition-all duration-300 ease-in-out">
						<h2 className="text-2xl font-bold mb-4 text-green-600">Berhasil!</h2>
						<p className="text-gray-700">Data APAR telah berhasil ditambahkan.</p>
						<button
							onClick={() => setShowModal(false)}
							className="mt-6 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition"
						>
							OK
						</button>
					</div>
				</div>
			)}
		</div>
	);
};