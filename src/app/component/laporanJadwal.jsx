"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllLaporan,
  updateLaporanRemark,
  addLaporan,
  updateLaporan,
  getDeletedLaporanJadwal,
} from "@/app/service/laporanJadwal.service";
import { Moon, Sun, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 20;

export const LaporanJadwal = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [editableLaporanId, setEditableLaporanId] = useState(null);
  const [editedRemark, setEditedRemark] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoadingM, setIsLoading] = useState(false);
  const [newData, setNewData] = useState({
    outlet: "",
    kpdm: "",
    topik_pembahasan: "",
    tanggal: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLaporanId, setEditLaporanId] = useState(null);

  const queryClient = useQueryClient();

  // Query untuk laporan aktif
  const { data: laporanData, isLoading } = useQuery({
    queryKey: ["laporan-jadwal"],
    queryFn: getAllLaporan,
  });

  // Query untuk laporan yang dihapus
  const { data: deletedLaporanData, isLoading: isLoadingDeleted } = useQuery({
    queryKey: ["laporan-jadwal-deleted"],
    queryFn: getDeletedLaporanJadwal,
  });

  console.log(deletedLaporanData)

  const mutationRemark = useMutation({
    mutationFn: ({ id, remark }) => updateLaporanRemark(id, remark),
    onSuccess: () => {
      queryClient.invalidateQueries(["laporan-jadwal"]);
      setEditableLaporanId(null);
      setEditedRemark("");
      toast.success("Remark berhasil disimpan!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Gagal update remark.";
      toast.error(message);
    },
  });

  const mutationCreate = useMutation({
    mutationFn: addLaporan,
    onSuccess: () => {
      queryClient.invalidateQueries(["laporan-jadwal"]);
      setShowModal(false);
      setNewData({ outlet: "", kpdm: "", topik_pembahasan: "", tanggal: "" });
      toast.success("Laporan berhasil ditambahkan!");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan laporan.");
      setIsLoading(false);
    },
    onMutate: () => {
      setIsLoading(true);
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: ({ id, data }) => updateLaporan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["laporan-jadwal"]);
      setShowModal(false);
      setNewData({ outlet: "", kpdm: "", topik_pembahasan: "", tanggal: "" });
      setIsEditMode(false);
      setEditLaporanId(null);
      toast.success("Laporan berhasil diperbarui!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui laporan.");
    },
  });

  const handleSave = () => {
    const { outlet, kpdm, topik_pembahasan, tanggal } = newData;

    if (!outlet || !kpdm || !topik_pembahasan || !tanggal) {
      toast.error("Semua field harus diisi!");
      return;
    }

    if (isEditMode) {
      mutationUpdate.mutate({ id: editLaporanId, data: newData });
    } else {
      mutationCreate.mutate(newData);
    }
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const totalPages = laporanData?.data
    ? Math.ceil(laporanData.data.length / ITEMS_PER_PAGE)
    : 1;

  const paginatedData = laporanData?.data?.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const paginatedDeletedData = deletedLaporanData?.data || [];

  const handleRemarkChange = (laporanId, currentRemark) => {
    setEditableLaporanId(laporanId);
    setEditedRemark(currentRemark || "");
  };

  const saveRemark = (laporanId) => {
    if (!editedRemark.trim()) {
      toast.error("Remark tidak boleh kosong!");
      return;
    }
    mutationRemark.mutate({ id: laporanId, remark: editedRemark });
  };

  return (
    <div
      className={`${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      } min-h-screen p-6 duration-300`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-center flex-1 -ml-12">
            Laporan Jadwal Mingguan
          </h2>
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

        <div className="flex justify-between py-2">
          <div className="flex space-x-2 mb-4">
            <h2 className="text-xl font-semibold">Samsul</h2>
            <h2 className="text-xl font-medium">Malang</h2>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
          >
            Tambah Laporan
          </button>
        </div>

        <div className="bg-red-100 text-red-800 p-3 rounded-md mt-4 mb-4 text-center">
          <p>
            <strong>Peringatan:</strong> Remark wajib diisi pada hari yang sesuai
            dengan tanggal laporan. Jika sudah lewat tanggal, remark tidak dapat
            diedit lagi.
          </p>
          <p className="mt-2">
            Jika ada masalah, silakan hubungi via WhatsApp di nomor{" "}
            <a
              href="tel:+6289639038020"
              className="text-blue-600 hover:underline"
            >
              089639038020
            </a>
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead
                  className={`transition-colors duration-300 ${
                    darkMode ? "bg-blue-700" : "bg-blue-300"
                  }`}
                >
                  <tr>
                    <th className="border px-4 py-2">Hari</th>
                    <th className="border px-4 py-2">Tanggal</th>
                    <th className="border px-4 py-2">Outlet</th>
                    <th className="border px-4 py-2">KPDM</th>
                    <th className="border px-4 py-2">Topik Pembahasan</th>
                    <th className="border px-4 py-2">Remark</th>
                    <th className="border px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData?.map((laporan) => (
                    <tr
                      key={laporan._id}
                      className="hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                    >
                      <td className="border px-4 py-2">
                        {new Date(laporan.tanggal).toLocaleDateString("id-ID", {
                          weekday: "long",
                        })}
                      </td>
                      <td className="border px-4 py-2">
                        {new Date(laporan.tanggal).toLocaleDateString()}
                      </td>
                      <td className="border px-4 py-2">{laporan.outlet}</td>
                      <td className="border px-4 py-2">{laporan.kpdm}</td>
                      <td className="border px-4 py-2">
                        {laporan.topik_pembahasan}
                      </td>
                      <td
                        className={`border px-4 py-2 font-medium transition-colors duration-300 ${
                          laporan.isRemarkUpdated
                            ? darkMode
                              ? "bg-blue-400/80 text-white"
                              : "bg-blue-100 text-black"
                            : ""
                        }`}
                      >
                        {laporan.isRemarkUpdated ? (
                          <span className="block px-2 py-1">
                            {laporan.remark || "-"}
                          </span>
                        ) : editableLaporanId === laporan._id ? (
                          <div className="flex flex-col gap-1">
                            <div className negativa="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedRemark}
                                onChange={(e) => setEditedRemark(e.target.value)}
                                className="flex-1 border px-2 py-1 rounded text-black dark:text-white dark:bg-gray-800 dark:border-gray-600"
                              />
                              <button
                                onClick={() => saveRemark(laporan._id)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                disabled={mutationRemark.isLoading}
                              >
                                {mutationRemark.isLoading
                                  ? "Menyimpan..."
                                  : "Simpan"}
                              </button>
                              <button
                                onClick={() => setEditableLaporanId(null)}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Batalkan"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                            <p className="text-sm text-red-500">
                              Hanya bisa diedit sekali, tidak bisa diubah
                              setelahnya.
                            </p>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              handleRemarkChange(laporan._id, laporan.remark)
                            }
                            className={`cursor-pointer underline transition-colors ${
                              darkMode
                                ? "text-white hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-800"
                            }`}
                          >
                            {laporan.remark || "Klik untuk isi remark"}
                          </div>
                        )}
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => {
                            setNewData({
                              outlet: laporan.outlet,
                              kpdm: laporan.kpdm,
                              topik_pembahasan: laporan.topik_pembahasan,
                              tanggal: laporan.tanggal?.substring(0, 10) || "",
                            });
                            setEditLaporanId(laporan._id);
                            setIsEditMode(true);
                            setShowModal(true);
                          }}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Tabel untuk laporan yang dihapus */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Laporan yang Pernah Dikerjakan
          </h2>
          {isLoadingDeleted ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-gray-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-400 opacity-70">
                <thead
                  className={`transition-colors duration-300 ${
                    darkMode ? "bg-gray-600" : "bg-gray-300"
                  }`}
                >
                  <tr>
                    <th className="border px-4 py-2">Hari</th>
                    <th className="border px-4 py-2">Tanggal</th>
                    <th className="border px-4 py-2">Outlet</th>
                    <th className="border px-4 py-2">KPDM</th>
                    <th className="border px-4 py-2">Topik Pembahasan</th>
                    <th className="border px-4 py-2">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeletedData.length > 0 ? (
                    paginatedDeletedData.map((laporan) => (
                      <tr
                        key={laporan._id}
                        className="bg-gray-100 dark:bg-gray-700 transition-colors"
                      >
                        <td className="border px-4 py-2">
                          {new Date(laporan.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                          })}
                        </td>
                        <td className="border px-4 py-2">
                          {new Date(laporan.tanggal).toLocaleDateString()}
                        </td>
                        <td className="border px-4 py-2">{laporan.outlet}</td>
                        <td className="border px-4 py-2">{laporan.kpdm}</td>
                        <td className="border px-4 py-2">
                          {laporan.topik_pembahasan}
                        </td>
                        <td className="border px-4 py-2">
                          {laporan.remark || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="border px-4 py-2 text-center text-gray-500"
                      >
                        Tidak ada laporan yang dihapus.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditMode(false);
                    setEditLaporanId(null);
                    setNewData({
                      outlet: "",
                      kpdm: "",
                      topik_pembahasan: "",
                      tanggal: "",
                    });
                  }}
                >
                  <X />
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                  {isEditMode ? "Edit Laporan" : "Tambah Laporan"}
                </h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Outlet"
                    value={newData.outlet}
                    onChange={(e) =>
                      setNewData({ ...newData, outlet: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={mutationCreate.isLoading || mutationUpdate.isLoading}
                  />
                  <input
                    type="text"
                    placeholder="KPDM"
                    value={newData.kpdm}
                    onChange={(e) =>
                      setNewData({ ...newData, kpdm: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={mutationCreate.isLoading || mutationUpdate.isLoading}
                  />
                  <input
                    type="text"
                    placeholder="Topik"
                    value={newData.topik_pembahasan}
                    onChange={(e) =>
                      setNewData({ ...newData, topik_pembahasan: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={mutationCreate.isLoading || mutationUpdate.isLoading}
                  />
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-600 dark:text-gray-300">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={newData.tanggal || ""}
                      onChange={(e) =>
                        setNewData({ ...newData, tanggal: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
                      disabled={mutationCreate.isLoading || mutationUpdate.isLoading}
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
                    disabled={mutationCreate.isLoading || mutationUpdate.isLoading}
                  >
                    {isLoadingM || mutationCreate.isLoading || mutationUpdate.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>{isEditMode ? "Memperbarui..." : "Menyimpan..."}</span>
                      </div>
                    ) : (
                      <span>{isEditMode ? "Update" : "Simpan"}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};