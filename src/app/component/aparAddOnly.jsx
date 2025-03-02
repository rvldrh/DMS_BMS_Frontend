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

	const addAparMutation = useMutation({
		mutationFn: async (formData) => await addApar(formData),
		onSuccess: () => {
			toast.success("APAR berhasil ditambahkan!");
			setNewApar({ jenis: "", outlet: "", marketing: "", tanggal_exp: "" });
			setShowModal(true);
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

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-10">
			<div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-3xl">
				<h2 className="text-2xl font-bold mb-6 text-center">Tambah APAR</h2>
				<p className="text-lg font-bold">Jenis APAR</p>
				<input
					type="text"
					name="jenis"
					placeholder=" *Contoh: DCP 3Kg, Co2 3.5kg, Gas cair 2.5kg"
					value={newApar.jenis}
					onChange={handleChange}
					className="w-full p-3 border mb-2 rounded-md"
				/>
				<p className="text-lg font-bold">Outlet</p>
				<input
					type="text"
					name="outlet"
					placeholder=" *Contoh: RSSA JL. Jaksa Agung Suprapto"
					value={newApar.outlet}
					onChange={handleChange}
					className="w-full p-3 border mb-2 rounded-md"
				/>
				<p className="font-bold text-sm mb-4 text-red-500">
					*Inputkan nama outlet serta alamat outlet
				</p>
				<p className="text-lg font-bold">Marketing</p>
				<input
					type="text"
					name="marketing"
					placeholder=" *Siapa penginput data APAR ini"
					value={newApar.marketing}
					onChange={handleChange}
					className="w-full p-3 border mb-2 rounded-md"
				/>
				<p className="text-lg font-bold">Tanggal Exp</p>
				<input
					type="date"
					name="tanggal_exp"
					value={newApar.tanggal_exp}
					onChange={handleChange}
					className="w-full p-3 border mb-1 rounded-md"
				/>
				<p className="font-bold text-sm mb-4 text-red-500">
					*Inputkan data tanggal Exp dari APAR yang anda input
				</p>
				<div className="flex justify-end">
					<button
						onClick={handleSubmit}
						className="bg-blue-500 text-white px-6 py-3 rounded-md"
					>
						Simpan
					</button>
				</div>
			</div>
			{showModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm animate-fadeIn">
					<div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md text-center border">
						<h2 className="text-2xl font-bold mb-4 text-green-700">
							Berhasil!
						</h2>
						<p className="text-gray-900">
							Data APAR telah berhasil ditambahkan.
						</p>
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
