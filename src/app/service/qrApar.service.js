import axios from "axios";
import { API_URL, headers } from "../utils";

const BASE_URL = `${API_URL}qr_apar`;

export const fetchQrAparById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`, { headers, withCredentials: true });
  return res.data.data;
};

export const fetchAllQrApar = async () => {
  const res = await axios.get(BASE_URL, { headers, withCredentials: true });
  return res.data;
};

export const postQrApar = async (data) => {
  const res = await axios.post(BASE_URL, data, {
    headers: { ...headers, "Content-Type": "application/json" },
    withCredentials: true,
  });
  return res.data;
};
