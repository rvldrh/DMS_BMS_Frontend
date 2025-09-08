"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLaporan, addLaporan, updateLaporan } from "@/app/service/laporanAC.service";
import { Moon, Sun, Pencil } from "lucide-react";
import { addHasilToLaporan } from "@/app/service/laporanAC.service";
import imageCompression from 'browser-image-compression';

export const DaftarJadwalAC = () => {
    const queryClient = useQueryClient();

    const [darkMode, setDarkMode] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedRuangan, setSelectedRuangan] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedTeknisi, setSelectedTeknisi] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLaporan, setSelectedLaporan] = useState(null);
    const [newHasil, setNewHasil] = useState("");
    const [openEditHasilModal, setOpenEditHasilModal] = useState(false);


    const [formData, setFormData] = useState({
        tanggalPengerjaan: "", // akan diisi otomatis di handleSubmit
        ruangan: "",
        status: "",
        hasil: "",
        teknisi: "",
        fotoAwal: null,
        fotoPengerjaan: null,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const toggleTheme = () => setDarkMode(!darkMode);

    const { data = [], isLoading } = useQuery({
        queryKey: ["laporan-ac"],
        queryFn: getAllLaporan,
    });

    const uniqueMonths = [...new Set(data.map(d => new Date(d.tanggalPengerjaan).getMonth() + 1))];
    const uniqueYears = [...new Set(data.map(d => new Date(d.tanggalPengerjaan).getFullYear()))];
    const uniqueRooms = [...new Set(data.map(d => d.ruangan))].filter(Boolean);
    const uniqueStatuses = [...new Set(data.map(d => d.status))].filter(Boolean);
    const uniqueTeknisis = [...new Set(data.map(d => d.teknisi))].filter(Boolean);

    const filteredData = data.filter((item) => {
        const date = new Date(item.tanggalPengerjaan);
        return (
            (!selectedMonth || date.getMonth() + 1 === Number(selectedMonth)) &&
            (!selectedYear || date.getFullYear() === Number(selectedYear)) &&
            (!selectedRuangan || item.ruangan === selectedRuangan) &&
            (!selectedStatus || item.status === selectedStatus) &&
            (!selectedTeknisi || item.teknisi === selectedTeknisi)
        );
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const mutationAdd = useMutation({
        mutationFn: addLaporan,
        onSuccess: () => {
            queryClient.invalidateQueries(["laporan-ac"]);
            setOpenModal(false);
            resetForm();
        },
        onError: () => alert("Gagal menambahkan laporan"),
    });

    const mutationUpdate = useMutation({
        mutationFn: ({ id, formData }) => updateLaporan(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries(["laporan-ac"]);
            setOpenModal(false);
            setEditId(null);
            resetForm();
        },
        onError: (err) => {
            console.error("Error updating laporan:", err);
            alert("Gagal memperbarui laporan");
        },
    });

    const mutationAddHasil = useMutation({
        mutationFn: ({ id, hasil }) => addHasilToLaporan(id, hasil),
        onSuccess: () => {
            queryClient.invalidateQueries(["laporan-ac"]);
            setOpenEditHasilModal(false);
            setNewHasil("");
            setSelectedLaporan(null);
        },
        onError: () => {
            alert("Gagal menambahkan hasil");
        },
    });

    const handleChange = async (event) => {
        const { name, files } = event.target;
        const file = files[0];
    
        if (file) {
            console.log('Original file:', file);
            console.log('Original size:', file.size / 1024 / 1024, 'MB');
    
            // Definisikan opsi kompresi
            const options = {
                maxSizeMB: 1,           // Maksimum ukuran 1 MB
                maxWidthOrHeight: 1024, // Maksimum lebar atau tinggi 1024px
                useWebWorker: true,
            };
    
            try {
                // Lakukan kompresi
                const compressedFile = await imageCompression(file, options);
    
                console.log('Compressed file:', compressedFile);
                console.log('Compressed size:', compressedFile.size / 1024 / 1024, 'MB');
    
                // Update state dengan file yang sudah dikompres
                setFormData(prev => ({
                    ...prev,
                    [name]: compressedFile
                }));
            } catch (error) {
                console.error('Error saat kompresi gambar:', error);
                // Lanjutkan dengan file asli jika kompresi gagal
                setFormData(prev => ({
                    ...prev,
                    [name]: file
                }));
            }
        }
    };


    const handleSubmit = async () => {
        const form = new FormData();

        // Auto-generate tanggal jika sedang tambah data
        if (!editId) {
            const today = new Date();
            const formatted = today.toISOString().split("T")[0]; // YYYY-MM-DD
            form.append("tanggalPengerjaan", formatted);
        }

        Object.entries(formData).forEach(([key, value]) => {
            if (value instanceof File) form.append(key, value);
            else if (typeof value === "string") form.append(key, value.trim());
            else if (value !== null) form.append(key, String(value));
        });

        setIsSubmitting(true);
        try {
            if (editId) await mutationUpdate.mutateAsync({ id: editId, formData: form });
            else await mutationAdd.mutateAsync(form);
        } finally {
            setIsSubmitting(false);
        }
    };


    const resetForm = () => {
        setFormData({
            tanggalPengerjaan: "", // tetap kosong
            ruangan: "",
            status: "",
            hasil: "",
            teknisi: "",
            fotoAwal: null,
            fotoPengerjaan: null,
        });
    };


    const dropdownStyle = `${darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"} p-2 rounded-md`;

    return (
        <div className={darkMode ? "bg-black text-white min-h-screen p-6" : "bg-white text-black min-h-screen p-6"}>
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold">Jadwal Pengerjaan AC</h2>
                    <button onClick={toggleTheme} className="p-2 bg-blue-500 text-white rounded-full">
                        {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-blue-700" />}
                    </button>
                </div>

                <div className="flex flex-wrap gap-4 mb-4">
                    <select className={dropdownStyle} onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }} value={selectedMonth}>
                        <option value="">Semua Bulan</option>
                        {uniqueMonths.map((m) => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString("id-ID", { month: "long" })}</option>)}
                    </select>
                    <select className={dropdownStyle} onChange={e => { setSelectedYear(e.target.value); setCurrentPage(1); }} value={selectedYear}>
                        <option value="">Semua Tahun</option>
                        {uniqueYears.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select className={dropdownStyle} onChange={e => { setSelectedRuangan(e.target.value); setCurrentPage(1); }} value={selectedRuangan}>
                        <option value="">Semua Ruangan</option>
                        {uniqueRooms.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select className={dropdownStyle} onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }} value={selectedStatus}>
                        <option value="">Semua Status</option>
                        {uniqueStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className={dropdownStyle} onChange={e => { setSelectedTeknisi(e.target.value); setCurrentPage(1); }} value={selectedTeknisi}>
                        <option value="">Semua Teknisi</option>
                        {uniqueTeknisis.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <button onClick={() => { resetForm(); setEditId(null); setOpenModal(true); }} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">Tambah Jadwal</button>

                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200">
                                <thead className={`${darkMode ? "bg-blue-700" : "bg-blue-300"}`}>
                                    <tr>
                                        <th className="border px-4 py-2">No</th>
                                        <th className="border px-4 py-2">Tanggal</th>
                                        <th className="border px-4 py-2">Ruangan</th>
                                        <th className="border px-4 py-2">Status</th>
                                        <th className="border px-4 py-2">Hasil</th>
                                        <th className="border px-4 py-2">Teknisi</th>
                                        <th className="border px-4 py-2">Foto Awal</th>
                                        <th className="border px-4 py-2">Foto Pengerjaan</th>
                                        {/* <th className="border px-4 py-2">Aksi</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((item, index) => (
                                        <tr key={item._id} className="hover:bg-blue-100 dark:hover:bg-blue-800">
                                            <td className="border px-4 py-2">{startIndex + index + 1}</td>
                                            <td className="border px-4 py-2">{new Date(item.tanggalPengerjaan).toLocaleDateString("id-ID")}</td>
                                            <td className="border px-4 py-2">{item.ruangan}</td>
                                            <td className="border px-4 py-2">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-sm font-semibold
                                                    ${item.status === "Pembersihan"
                                                            ? "bg-green-100 text-green-700"
                                                            : item.status === "Kerusakan"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>

                                            </td>
                                            <td className="border px-4 py-2">
                                                <ul className="list-disc list-inside space-y-1">
                                                    {Array.isArray(item.hasil) && item.hasil.length > 0 ? (
                                                        item.hasil.map((h, i) => (
                                                            <li key={i}>
                                                                {h}
                                                                {" - "}
                                                                <span className="text-xs text-gray-500 italic">
                                                                    {i === 0
                                                                        ? new Date(item.createdAt).toLocaleString("id-ID", {
                                                                            day: "numeric",
                                                                            month: "long",
                                                                            year: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })
                                                                        : new Date(item.updatedAt).toLocaleString("id-ID", {
                                                                            day: "numeric",
                                                                            month: "long",
                                                                            year: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                </span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="italic text-gray-400">Belum ada hasil</li>
                                                    )}
                                                </ul>

                                                {item.lastAddedHasil && (
                                                    <p className="text-xs text-gray-500 mt-1 italic">
                                                        Last update:{" "}
                                                        {new Date(item.lastAddedHasil).toLocaleString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                )}

                                                {item.status === "Kerusakan" &&
                                                    Array.isArray(item.hasil) &&
                                                    item.hasil.length < 2 && (
                                                        <button
                                                            onClick={() => handleEditHasil(item)}
                                                            className="text-sm text-blue-600 bg-blue-100 p-1 rounded-md hover:text-blue-800 hover:bg-blue-200 transition-colors duration-300"
                                                        >
                                                            Edit Hasil
                                                        </button>
                                                    )}
                                            </td>


                                            <td className="border px-4 py-2">{item.teknisi}</td>
                                            <td className="border px-4 py-2 text-center">{item.fotoAwal ? <img src={item.fotoAwal} className="w-20 h-20 object-cover rounded" /> : "-"}</td>
                                            <td className="border px-4 py-2 text-center">{item.fotoPengerjaan ? <img src={item.fotoPengerjaan} className="w-20 h-20 object-cover rounded" /> : "-"}</td>
                                            {/* <td className="border px-4 py-2 text-center">
                                                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Pencil className="w-4 h-4" /> Edit
                                                    </button>
                                                </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between mt-4">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="px-4 py-2 bg-blue-500 text-white rounded-md" disabled={currentPage === 1}>Previous</button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="px-4 py-2 bg-blue-500 text-white rounded-md" disabled={currentPage === totalPages}>Next</button>
                        </div>
                    </>
                )}
            </div>

            {openModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 dark:text-gray-300"
                            onClick={() => {
                                setOpenModal(false);
                                setEditId(null);
                                resetForm();
                            }}
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                            {editId ? "Edit Jadwal" : "Tambah Jadwal"}
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-700 dark:text-gray-300">Ruangan</label>
                                <input
                                    type="text"
                                    name="ruangan"
                                    value={formData.ruangan}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-700 dark:text-gray-300">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                >
                                    <option value="">-- Pilih Status --</option>
                                    <option value="Pembersihan">Pembersihan</option>
                                    <option value="Kerusakan">Kerusakan</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-700 dark:text-gray-300">
                                    {formData.status === "Kerusakan" ? "Letak Kerusakan" : "Hasil"}
                                </label>
                                <textarea
                                    name="hasil"
                                    value={formData.hasil}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                />
                            </div>


                            <div>
                                <label className="text-sm text-gray-700 dark:text-gray-300">Teknisi</label>
                                <select
                                    name="teknisi"
                                    value={formData.teknisi}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                >
                                    <option value="">-- Pilih Teknisi --</option>
                                    <option value="Didik">Didik</option>
                                    <option value="Eko">Eko</option>
                                </select>
                            </div>


                            <div>
                                <label className="text-sm text-gray-700 dark:text-gray-300">Foto Awal</label>
                                <input
                                    type="file"
                                    name="fotoAwal"
                                    accept="image/"
                                    capture="environment"
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded text-black dark:bg-gray-800 dark:text-white dark:border-gray-700 file:dark:text-white"
                                    />
                            </div>

                            <div>
                                <label className="text-sm text-gray-700 dark:text-gray-300">Foto Pengerjaan</label>
                                <input
                                    type="file"
                                    name="fotoPengerjaan"
                                    accept="image/"
                                    capture="environment"
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded text-black dark:bg-gray-800 dark:text-white dark:border-gray-700 file:dark:text-white"
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-2 rounded ${isSubmitting
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500"
                                    } text-white flex items-center justify-center gap-2`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    editId ? "Update" : "Simpan"
                                )}
                            </button>

                        </div>
                    </div>
                </div>
            )}
            {openEditHasilModal && selectedLaporan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 dark:text-gray-300"
                            onClick={() => {
                                setOpenEditHasilModal(false);
                                setSelectedLaporan(null);
                                setNewHasil("");
                            }}
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
                            Tambahkan Hasil ke Laporan
                        </h2>
                        <div className="space-y-3">
                            <textarea
                                className="w-full px-3 py-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                placeholder="Isi hasil baru..."
                                value={newHasil}
                                onChange={(e) => setNewHasil(e.target.value)}
                            />

                            <button
                                onClick={() =>
                                    mutationAddHasil.mutate({
                                        id: selectedLaporan._id,
                                        hasil: newHasil,
                                    })
                                }
                                disabled={newHasil.trim() === ""}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Simpan Hasil
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};
