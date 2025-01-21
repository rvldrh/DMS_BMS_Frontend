'use client';

import { useState } from "react";
import { TextField, Button, Grid } from "@mui/material";
import { addBarangKeluar } from "../service/barang_keluar.service";

export const AddBarangKeluarForm = () => {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0], // Default to today's date
    kode_barang: "",
    nama_barang: "",
    qty_keluar: 0,
    keterangan: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addBarangKeluar(formData);
      alert("Barang keluar berhasil ditambahkan");
      setFormData({
        tanggal: new Date().toISOString().split("T")[0],
        kode_barang: "",
        nama_barang: "",
        qty_keluar: 0,
        keterangan: "",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Tanggal"
            type="date"
            name="tanggal"
            value={formData.tanggal}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Kode Barang"
            name="kode_barang"
            value={formData.kode_barang}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Nama Barang"
            name="nama_barang"
            value={formData.nama_barang}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Qty Keluar"
            type="number"
            name="qty_keluar"
            value={formData.qty_keluar}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Keterangan"
            name="keterangan"
            value={formData.keterangan}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </Grid>
        {error && (
          <Grid item xs={12}>
            <div style={{ color: "red" }}>{error}</div>
          </Grid>
        )}
      </Grid>
    </form>
  );
};
