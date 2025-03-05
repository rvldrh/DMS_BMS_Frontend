"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLaporanMarketing,
  addLaporanMarketing,
  updateLaporanMarketing,
} from "@/app/service/laporan_marketing.service";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { toast } from "react-hot-toast";

export default function LaporanMarketingPage() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  const queryClient = useQueryClient();

  // Fetch Data Laporan dengan Pagination
  const { data, isLoading } = useQuery({
    queryKey: ["laporanMarketing", page],
    queryFn: async () => {
      const response = await getLaporanMarketing();
      return response.slice((page - 1) * limit, page * limit);
    },
  });

  const addMutation = useMutation({
    mutationFn: addLaporanMarketing,
    onSuccess: () => {
      toast.success("Laporan berhasil ditambahkan!");
      queryClient.invalidateQueries(["laporanMarketing"]);
      setOpenForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateLaporanMarketing(id, data),
    onSuccess: () => {
      toast.success("Laporan berhasil diperbarui!");
      queryClient.invalidateQueries(["laporanMarketing"]);
      setOpenForm(false);
    },
  });

  const [form, setForm] = useState({
    hari: "",
    marketing: "",
    rencana: "",
    tujuan: "",
    remark: "",
  });

  const handleOpenForm = (laporan = null) => {
    setSelectedLaporan(laporan);
    setForm(
      laporan || { hari: "", marketing: "", rencana: "", tujuan: "", remark: "" }
    );
    setOpenForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (selectedLaporan) {
      updateMutation.mutate({ id: selectedLaporan._id, data: form });
    } else {
      addMutation.mutate(form);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Laporan Marketing</h1>
        <Button variant="contained" onClick={() => handleOpenForm()}>Tambah Laporan</Button>
      </div>

      {/* TABEL LAPORAN */}
      <div className="border rounded-lg shadow-md">
        {isLoading ? (
          <div className="flex justify-center my-4">
            <CircularProgress />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow className="bg-gray-200">
                <TableCell>No</TableCell>
                <TableCell>Hari</TableCell>
                <TableCell>Marketing</TableCell>
                <TableCell>Rencana</TableCell>
                <TableCell>Tujuan</TableCell>
                <TableCell>Remark</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((laporan, index) => (
                <TableRow key={laporan._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{laporan.hari}</TableCell>
                  <TableCell>{laporan.marketing}</TableCell>
                  <TableCell>{laporan.rencana}</TableCell>
                  <TableCell>{laporan.tujuan}</TableCell>
                  <TableCell>{laporan.remark}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleOpenForm(laporan)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
        <span>Halaman {page}</span>
        <Button disabled={page * limit >= (data?.length || 0)} onClick={() => setPage(page + 1)}>Berikutnya</Button>
      </div>

      {/* MODAL FORM */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{selectedLaporan ? "Edit Laporan" : "Tambah Laporan"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Hari" name="hari" value={form.hari} onChange={handleChange} />
          <TextField fullWidth margin="dense" label="Marketing" name="marketing" value={form.marketing} onChange={handleChange} />
          <TextField fullWidth margin="dense" label="Rencana" name="rencana" value={form.rencana} onChange={handleChange} />
          <TextField fullWidth margin="dense" label="Tujuan" name="tujuan" value={form.tujuan} onChange={handleChange} />
          <TextField fullWidth margin="dense" label="Remark" name="remark" value={form.remark} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSubmit}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
