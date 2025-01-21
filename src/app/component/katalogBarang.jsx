'use client'

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { fetchKatalogBarang, addKatalogBarang, updateKatalogBarang, deleteKatalogBarang } from "../service/katalog_barang.service";
import { Spinner } from "./spinner";

export const KatalogBarangList = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [kodeBarang, setKodeBarang] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [satuan, setSatuan] = useState("");
  const [harga, setHarga] = useState("");
  const [stokAwal, setStokAwal] = useState("");

  const [errorMessage, setErrorMessage] = useState(null);

  // State untuk konfirmasi delete
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const {
    data: katalogBarangData,
    error: katalogBarangError,
    isLoading: katalogBarangLoading
  } = useQuery({
    queryKey: ["katalogBarang"],
    queryFn: fetchKatalogBarang,
    refetchInterval: 3000
  });

  const { mutateAsync: addBarang, isPending: isAdding } = useMutation(
    {
      mutationFn: addKatalogBarang,

      onError: (error) => {
        console.error("Error adding Katalog Barang:", error.message);
        setErrorMessage(error.response?.data?.message || error.message);
      },

      onSuccess: () => {
        handleCloseModal();
        setErrorMessage(null);
      },
    }
  );

  const { mutateAsync: updateBarang, isPending: isUpdating } = useMutation(
    {
      mutationFn: (data) => updateKatalogBarang(data.id, data.data),

      onError: (error) => {
        console.error("Error updating Katalog Barang:", error.message);
        setErrorMessage(error.response?.data?.message || error.message);
      },

      onSuccess: () => {
        handleCloseModal();
        setErrorMessage(null);
      },
    }
  );

  const { mutateAsync: deleteBarang } = useMutation(
    {
      mutationFn: deleteKatalogBarang,

      onError: (error) => {
        console.error("Error deleting Katalog Barang:", error.message);
        setErrorMessage(error.response?.data?.message || error.message);
      },

      onSuccess: () => {
        setErrorMessage(null);
      },
    }
  );

  const handleOpenModal = (barang) => {
    setSelectedId(barang?._id || null);
    setKodeBarang(barang?.kode_barang || "");
    setNamaBarang(barang?.nama_barang || "");
    setSatuan(barang?.satuan || "");
    setHarga(barang?.harga || "");
    setStokAwal(barang?.stok_awal || "");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedId(null);
    setKodeBarang("");
    setNamaBarang("");
    setSatuan("");
    setHarga("");
    setStokAwal("");
    setErrorMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const barangData = {
      kode_barang: kodeBarang,
      nama_barang: namaBarang,
      satuan,
      harga: Number(harga),
      stok_awal: Number(stokAwal),
    };

    if (selectedId) {
      await updateBarang({ id: selectedId, data: barangData });
    } else {
      await addBarang(barangData);
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteId(null);
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteBarang(deleteId);
      handleCloseDeleteDialog();
    }
  };

  if (katalogBarangLoading) {
    return <Spinner />;
  }

  if (katalogBarangError instanceof Error) {
    return <div>Error: {katalogBarangError.message}</div>;
  }

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Kode Barang</TableCell>
              <TableCell>Nama Barang</TableCell>
              <TableCell>Satuan</TableCell>
              <TableCell>Harga</TableCell>
              <TableCell>Stok Awal</TableCell>
              <TableCell>Masuk</TableCell>
              <TableCell>Keluar</TableCell>
              <TableCell>Stok Akhir</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {katalogBarangData?.data?.map((item, index) => (
              <TableRow key={item._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.kode_barang}</TableCell>
                <TableCell>{item.nama_barang}</TableCell>
                <TableCell>{item.satuan}</TableCell>
                <TableCell>{item.harga}</TableCell>
                <TableCell>{item.stok_awal}</TableCell>
                <TableCell>{item.masuk}</TableCell>
                <TableCell>{item.keluar}</TableCell>
                <TableCell>{item.stok_akhir}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="primary" onClick={() => handleOpenModal(item)}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleOpenDeleteDialog(item._id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
          Tambah Katalog Barang
        </Button>
      </Box>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="secondary">
            Batal
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            maxWidth: "600px",
            margin: "100px auto",
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {selectedId ? "Edit Katalog Barang" : "Tambah Katalog Barang"}
          </Typography>
          {errorMessage && (
            <Typography color="error" gutterBottom>
              {errorMessage}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kode Barang"
                  variant="outlined"
                  value={kodeBarang}
                  onChange={(e) => setKodeBarang(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nama Barang"
                  variant="outlined"
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Satuan"
                  variant="outlined"
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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
              <Grid item xs={12} sx={{ textAlign: "right" }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCloseModal}
                  style={{ marginRight: "10px" }}
                >
                  Batal
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isAdding || isUpdating}
                >
                  Simpan
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
    </div>
  );
};