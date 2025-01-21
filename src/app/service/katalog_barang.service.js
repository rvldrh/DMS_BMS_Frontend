import axios from "axios";
import { API_URL, headers } from "../utils";

// Fungsi untuk fetch data Katalog Barang
export const fetchKatalogBarang = async () => {
  try {
    const response = await axios.get(`${API_URL}katalog_barang`, {
      headers: headers, // Header prmintaan
      withCredentials: true, // Menggunakan credentials
    });
    return response.data; // Mengembalikan data dari response
  } catch (error) {
    const axiosError = error;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch katalog barang"
    );
  }
};

// Fungsi untuk mendapatkan Katalog Barang berdasarkan ID
export const getKatalogBarangById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}katalog_barang/${id}`, {
      headers: headers,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const axiosError = error;
    console.error("Error fetching katalog barang by ID:", axiosError.message || error);
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch katalog barang by ID"
    );
  }
};

// Fungsi untuk menambah Katalog Barang baru
export const addKatalogBarang = async (data) => {
  try {
    const response = await axios.post(`${API_URL}katalog_barang`, data, {
      headers: headers,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const axiosError = error;
    console.error("Error adding katalog barang:", axiosError.response?.data || axiosError.message);
    throw new Error(
      axiosError.response?.data?.message || "Failed to add katalog barang"
    );
  }
};

// Fungsi untuk memperbarui data Katalog Barang
export const updateKatalogBarang = async (id, data) => {
  if (typeof id !== "string") {
    throw new Error("ID harus berupa string");
  }

  try {
    const response = await axios.put<KatalogBarang>(`${API_URL}katalog_barang/${id}`, data, {
      headers: headers,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const axiosError = error;
    console.error(
      "Error updating katalog barang:",
      axiosError.response?.data || axiosError.message
    );
    throw new Error(
      axiosError.response?.data?.message || "Failed to update katalog barang"
    );
  }
};

// Fungsi untuk menghapus data Katalog Barang berdasarkan ID
export const deleteKatalogBarang = async (id) => {
  try {
    await axios.delete(`${API_URL}katalog_barang/${id}`, {
      headers: headers,
      withCredentials: true,
    });
  } catch (error) {
    const axiosError = error;
    console.error("Error deleting katalog barang:", axiosError.response?.data || axiosError.message);
    throw new Error(
      axiosError.response?.data?.message || "Failed to delete katalog barang"
    );
  }
};
