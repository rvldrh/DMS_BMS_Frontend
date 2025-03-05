import axios from "axios";
import { API_URL, headers } from "../utils";

export const getApar = async () => {
  try {
    const response = await axios.get(`${API_URL}apar`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching apar:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addApar = async (data) => {
  try {
    const response = await axios.post(`${API_URL}apar`, data, {
      headers: {
        "Content-Type": "multipart/form-data", // Override content type
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error adding apar:",
      error.response?.data || error.message
    );
    throw error;
  }
};
