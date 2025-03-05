import axios from "axios";
import { API_URL, headers } from "../utils";

export const getLaporanMarketing = async () => {
    try {
        const response = await axios.get(`${API_URL}laporan_marketing`, {
            headers,
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error(
            "Error fetching laporan marketing:",
            error.response?.data || error.message
        );
        throw error;
    }
};

export const addLaporanMarketing = async (data) => {
    try {
        const response = await axios.post(`${API_URL}laporan_marketing`, data, {
            headers,
            withCredentials: true,
        }); 
        return response.data;    
    } catch (error) {
        console.error("Error adding laporan marketing:", error);
        throw error;
    }
};

export const updateLaporanMarketing = async (id, data) => {
    try {
        const response = await axios.patch(`${API_URL}laporan_marketing/${id}`, data, {
            headers,
            withCredentials: true,
        });
        return response.data;    
    } catch (error) {
        console.error("Error updating laporan marketing:", error);
        throw error;
    }
};










