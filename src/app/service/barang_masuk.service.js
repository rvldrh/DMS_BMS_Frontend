import axios from "axios";
import { API_URL, headers } from "../utils";

export const getBarangMasuk = async () => {
  try {
    const response = await axios.get(`${API_URL}barang_masuk`, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching barang masuk:", error);
    throw error;
  }
};

export const addBarangMasuk = async (data) => {
  try {
    const response = await axios.post(`${API_URL}barang_masuk`, data, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding barang masuk:", error);
    throw error;
  }
};