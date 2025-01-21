"use client";

import { useState, useEffect } from "react";
import { TextField, Button, Grid, Typography, IconButton } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { addLaporanPenjualan } from "../service/laporan_penjualan.service";

export const LaporanPenjualanForm = () => {
  const [formData, setFormData] = useState({
    tanggal: "",
    no_invoice: "",
    tgl_jatuhTempo: "",
    item: [{ _id: "", qty: 0, jumlahh: 0 }],
    subtotal: 0,
    ppn: 0,
    grand_total: 0,
    kepada: "",  
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = formData.item.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData((prev) => ({ ...prev, item: updatedItems }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      item: [...prev.item, { _id: "", qty: 0, jumlahh: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.item.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, item: updatedItems }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const subtotal = formData.item.reduce(
        (acc, curr) => acc + curr.jumlahh,
        0
      );
      const grand_total = subtotal + subtotal * formData.ppn;

      if (formData.ppn < 0 || formData.ppn > 1) {
        alert("PPN harus antara 0 dan 1.");
        return;
      }

      const finalData = {
        ...formData,
        subtotal,
        grand_total,
      };

      const response = await addLaporanPenjualan(finalData);
      console.log("Laporan Penjualan added:", response);
      alert("Laporan Penjualan added successfully!");
      setFormData({
        tanggal: "",
        no_invoice: "",
        tgl_jatuhTempo: "",
        item: [{ _id: "", qty: 0, jumlahh: 0 }],
        subtotal: 0,
        ppn: 0,
        grand_total: 0,
        kepada: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error adding Laporan Penjualan.");
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Tambah Laporan Penjualan
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tanggal"
            type="date"
            name="tanggal"
            value={formData.tanggal}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="No Invoice"
            name="no_invoice"
            value={formData.no_invoice}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tanggal Jatuh Tempo"
            type="date"
            name="tgl_jatuhTempo"
            value={formData.tgl_jatuhTempo}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Item</Typography>
          {formData.item.map((item, index) => (
            <Grid container spacing={2} key={index}>
              <Grid item xs={4}>
                <TextField
                  label="ID Barang"
                  name={`item-${index}-id`}
                  value={item._id}
                  onChange={(e) =>
                    handleItemChange(index, "_id", e.target.value)
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Qty"
                  type="number"
                  name={`item-${index}-qty`}
                  value={item.qty}
                  onChange={(e) =>
                    handleItemChange(index, "qty", Number(e.target.value))
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Jumlah"
                  type="number" 
                  name={`item-${index}-jumlahh`}
                  value={item.jumlahh}
                  onChange={(e) =>
                    handleItemChange(index, "jumlahh", Number(e.target.value))
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => handleRemoveItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            variant="outlined"
            color="primary"
            style={{ marginTop: 10 }}
          >
            Tambah Item
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="PPN (0-1) ex: 0,1"
            type="number"
            name="ppn"
            value={formData.ppn}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                ppn: Number(e.target.value),
              }))
            }
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Kepada *fill with address too"
            name="kepada"
            value={formData.kepada}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={4}
            required
          />
        </Grid>
      </Grid>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        style={{ marginTop: 20 }}
      >
        Submit
      </Button>
    </form>
  );
};
