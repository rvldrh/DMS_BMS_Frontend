import axios from "axios";
import { API_URL, headers } from "../utils";

export const getLaporanPenjualan = async () => {
  try {
    const response = await axios.get(
      `${API_URL}laporan_penjualan`,
      { headers }
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
    return response.data;
  } catch (error) {
    console.error("Error adding laporan_penjualan penjualan:", error);
    throw error;
  }
}

export const getLaporanPenjualanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}laporan_penjualan/${id}`, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan_penjualan penjualan by ID:", error);
    throw error;
  }
};