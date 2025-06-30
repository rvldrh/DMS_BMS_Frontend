"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLaporan, addLaporan, updateLaporan } from "@/app/service/laporanAC.service";
import { Moon, Sun, Pencil } from "lucide-react";

export const JadwalACReadOnly = () => {
    const queryClient = useQueryClient();

    const [darkMode, setDarkMode] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedRuangan, setSelectedRuangan] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedTeknisi, setSelectedTeknisi] = useState("");
    const [editId, setEditId] = useState(null);
    const [modalImage, setModalImage] = useState(null);

    const [formData, setFormData] = useState({
        tanggalPengerjaan: "",
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

    const resetForm = () => {
        setFormData({ tanggalPengerjaan: "", ruangan: "", status: "", hasil: "", teknisi: "", fotoAwal: null, fotoPengerjaan: null });
    };

    const openModal = (url) => setModalImage(url);
    const closeModal = () => setModalImage(null);


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
                                            </td>

                                            <td className="border px-4 py-2">{item.teknisi}</td>
                                            <td className="border px-4 py-2 text-center">
                                                {item.fotoAwal ? (
                                                    <div className="relative group w-20 h-20 mx-auto">
                                                        <img src={item.fotoAwal} className="w-full h-full object-cover rounded transition duration-300 group-hover:opacity-80" />
                                                        <button
                                                            onClick={() => openModal(item.fotoAwal)}
                                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-semibold rounded opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            Lihat Foto
                                                        </button>
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="border px-4 py-2 text-center">
                                                {item.fotoPengerjaan ? (
                                                    <div className="relative group w-20 h-20 mx-auto">
                                                        <img src={item.fotoPengerjaan} className="w-full h-full object-cover rounded transition duration-300 group-hover:opacity-80" />
                                                        <button
                                                            onClick={() => openModal(item.fotoPengerjaan)}
                                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-semibold rounded opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            Lihat Foto
                                                        </button>
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

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
            {modalImage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="relative max-w-3xl max-h-[90vh] overflow-auto">
                        <img src={modalImage} className="rounded max-h-[90vh]" />
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded shadow hover:bg-gray-200"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
