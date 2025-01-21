'use client';

import { useState } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";
import { addKatalogBarang } from "../service/katalog_barang.service";

export const TambahKatalogBarang = () => {
  // State for form fields
  const [kodeBarang, setKodeBarang] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [satuan, setSatuan] = useState("");
  const [harga, setHarga] = useState("");
  const [stokAwal, setStokAwal] = useState("");
  const [masuk, setMasuk] = useState("");
  const [keluar, setKeluar] = useState("");
  const [stokAkhir, setStokAkhir] = useState("");

  // State for error and loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const newKatalogBarang = {
      kode_barang: kodeBarang,
      nama_barang: namaBarang,
      satuan,
      harga: Number(harga),
      stok_awal: Number(stokAwal),
      masuk: Number(masuk),
      keluar: Number(keluar),
      stok_akhir: Number(stokAkhir),
    };

    try {
      await addKatalogBarang(newKatalogBarang);
      setKodeBarang("");
      setNamaBarang("");
      setSatuan("");
      setHarga("");
      setStokAwal("");
      setMasuk("");
      setKeluar("");
      setStokAkhir("");
    } catch {
      setError("Terjadi kesalahan saat menambahkan katalog barang");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Tambah Katalog Barang
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Kode Barang"
              variant="outlined"
              value={kodeBarang}
              onChange={(e) => setKodeBarang(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nama Barang"
              variant="outlined"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Satuan"
              variant="outlined"
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Harga"
              variant="outlined"
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stok Awal"
              variant="outlined"
              type="number"
              value={stokAwal}
              onChange={(e) => setStokAwal(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Masuk"
              variant="outlined"
              type="number"
              value={masuk}
              onChange={(e) => setMasuk(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Keluar"
              variant="outlined"
              type="number"
              value={keluar}
              onChange={(e) => setKeluar(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stok Akhir"
              variant="outlined"
              type="number"
              value={stokAkhir}
              onChange={(e) => setStokAkhir(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? "Menambah..." : "Tambah Katalog Barang"}
            </Button>
          </Grid>
        </Grid>
        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}
      </form>
    </div>
  );
};
