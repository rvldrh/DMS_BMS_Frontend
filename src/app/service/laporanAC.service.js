import axios from "axios";
import { API_URL, headers } from "../utils";

const BASE_URL = `${API_URL}laporan_AC`;

export const getAllLaporan = async () => {
  try {
    const res = await axios.get(BASE_URL, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching laporan:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// Ambil laporan berdasarkan ID
export const getLaporanById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/${id}`, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching laporan by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Tambah laporan baru (dengan foto)
export const addLaporan = async (formData) => {
  try {
    const res = await axios.post(BASE_URL, formData, {
        // headers: {
        //   ...headers,
        //   "Content-Type": "multipart/form-data",
        // },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error adding laporan:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Update hanya field hasil
export const updateLaporan = async (id, formData) => {
  try {
    const isFormData = formData instanceof FormData;

    const res = await axios.patch(`${BASE_URL}/${id}`, formData, {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error updating laporan:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// Hapus laporan
export const deleteLaporan = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/${id}`, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error deleting laporan:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addHasilToLaporan = async (id, hasil) => {
  try {
    const res = await axios.put(`${BASE_URL}/${id}/hasil`, { hasil }, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error adding hasil to laporan:", error.response?.data || error.message);
    throw error;
  }
};
