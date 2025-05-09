import axios from "axios";
import { API_URL, headers } from "../utils";
import { toast } from "react-toastify"; // Import toast from react-toastify

export const getLaporanPenjualan = async () => {
  try {
    const response = await axios.get(`${API_URL}laporan_penjualan`, {
      headers,
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    toast.error("Gagal mengambil laporan penjualan"); // Show toast on error
    throw error;
  }
};

export const addLaporanPenjualan = async (data) => {
  try {
    const response = await axios.post(`${API_URL}laporan_penjualan`, data, {
      headers: headers,
    });

    // Check if the request was successful
    if (response.status === 201) {
      toast.success("Laporan Penjualan berhasil dibuat!"); // Success toast
      return response.data;
    } else {
      toast.error(`Request failed with status ${response.status}`);

    }
  } catch (error) {
    toast.error(error.message);


    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message === "Insufficient stock for item") {
        toast.error("Stok barang tidak mencukupi untuk pemesanan"); // Insufficient stock error toast
      }

      if (error.response?.data?.message === "Missing or invalid required fields") {
        toast.error("Data tidak lengkap atau tidak valid"); // Invalid data error toast
      }
    }

    throw error;
  }
};

export const getLaporanPenjualanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}laporan_penjualan/${id}`, {
      headers: headers,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan_penjualan by ID:", error);
    toast.error("Gagal mengambil laporan penjualan berdasarkan ID"); // Error toast
    throw error;
  }
};
