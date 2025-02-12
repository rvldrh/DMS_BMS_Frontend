import axios from "axios";
import { API_URL, headers } from "../utils";

export const getLaporanPenjualan = async () => {
  try {
    const response = await axios.get(
      `${API_URL}laporan_penjualan`,
      { 
        headers,
        withCredentials: true
       }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan_penjualan penjualan:", error);
    throw error;
  }
};

export const addLaporanPenjualan = async (data) => {
  try {
    const response = await axios.post(`${API_URL}laporan_penjualan`, data, {
      headers: headers,
    });
    
    // Perubahan kode:
    // Cek apakah request berhasil
    if (response.status === 201) {
      console.log("Laporan Penjualan created successfully:", response.data);
      return response.data;
    } else {
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Error adding laporan_penjualan penjualan:", error);
    if (axios.isAxiosError(error)) {
      if (error.response.data.message === "Missing or invalid required fields") {
        throw new Error("Data tidak lengkap atau tidak valid");
      }
    }
    throw error;
  }
};



export const getLaporanPenjualanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}laporan_penjualan/${id}`, {
      headers: headers,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan_penjualan penjualan by ID:", error);
    throw error;
  }
};