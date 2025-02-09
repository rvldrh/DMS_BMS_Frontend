import axios from "axios";
import { API_URL, headers } from "../utils";

export const getBarangKeluar = async () => {
  try {
    const response = await axios.get(`${API_URL}barang_keluar`, {
      headers: headers,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching barang keluar:", error);
    throw error;
  }
};

export const addBarangKeluar = async (data) => {
  try {
    const response = await axios.post(`${API_URL}barang_keluar`, data, {
      headers: headers,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error adding barang keluar:", error);
    throw error;
  }
};