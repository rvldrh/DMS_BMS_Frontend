import axios from "axios";
import { API_URL, headers } from "../utils";

export const getLaporanPembelian = async () => {
  try {
    const response = await axios.get(
      `${API_URL}laporan`,
      { 
        headers,
        withCredentials: true
       }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching laporan pembelian:", error);
    throw error;
  }
};

export const addLaporanPembelian = async (data) => {
  try {
    const response = await axios.post(`${API_URL}laporan`, data, {
      headers: headers,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error adding laporan pembelian:", error);
    throw error;
  }
};

export const getLaporanPembelianById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}laporan/${id}`, {
      headers: headers,
      withCredentials: true
    });
    return response.data;
  }
  catch (error){
    console.error(error.message)
    throw error
  }
  }