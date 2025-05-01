import axios from "axios";
import { API_URL, headers } from "../utils"; // pastikan `API_URL` diakhiri dengan slash `/`

const BASE_URL = 'http://localhost:8008/api/laporan_jadwal';

// ✅ Ambil semua laporan
export const getAllLaporan = async () => {
  try {
    const res = await axios.get(BASE_URL, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching laporan:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Ambil laporan berdasarkan ID
export const getLaporanById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/${id}`, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching laporan by ID:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Tambah laporan baru
export const addLaporan = async (data) => {
  try {
    const res = await axios.post(BASE_URL, data, {
      headers: {
        ...headers,
        "Content-Type": "application/json",

      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    error.response?.data 
    throw error;
  }
};

// ✅ Update laporan
export const updateLaporan = async (id, data) => {
  try {
    const res = await axios.put(`${BASE_URL}/${id}`, data, {
      headers: {
        ...headers,
        "Content-Type": "application/json", // Jika ada file
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    error.response?.data 
    throw error;
  }
};

// ✅ Hapus laporan
export const deleteLaporan = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/delete/${id}`, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting laporan:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update remark laporan (hanya sekali)
export const updateLaporanRemark = async (id, remark) => {
    try {
      const res = await axios.put(`${BASE_URL}/remark/${id}`, { remark }, {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      error.response?.data
      throw error;
    }
  };
  