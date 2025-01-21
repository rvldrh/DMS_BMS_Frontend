import axios from "axios";
import { API_URL, headers } from "../utils";

export const getLaporanPembelian = async () => {
  try {
    const response = await axios.get(
      `${API_URL}laporan`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan pembelian:", error);
    throw error;
  }
};

export const addLaporanPembelian = async (data) => {
  try {
    const response = await axios.post(`${API_URL}laporan`, data, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding laporan pembelian:", error);
    throw error;
  }
};