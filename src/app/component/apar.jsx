"use client";

import { useQuery } from "@tanstack/react-query";
import { getApar } from "@/app/service/apar.service"; // Ambil dari service yang Anda buat
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

export const ListAPAR = () => {
  const { data: apars, isLoading } = useQuery({
    queryKey: ["apars"],
    queryFn: getApar, // Ambil data menggunakan service yang sudah ada
  });

  return (
    <div className="container mx-auto p-6">
      <Typography variant="h4" gutterBottom align="center">
        Daftar APAR
      </Typography>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>No</TableCell>
                <TableCell>Jenis APAR</TableCell>
                <TableCell>Nama Pemilik</TableCell>
                <TableCell>Tanggal Refill</TableCell>
                <TableCell>Tanggal Expired</TableCell>
                <TableCell>Foto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apars?.map((apar, index) => (
                <TableRow key={apar._id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{apar.jenis}</TableCell>
                  <TableCell>{apar.nama_pemilik}</TableCell>
                  <TableCell>{new Date(apar.tanggal_refill).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(apar.tanggal_exp).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <img
                      src={apar.foto} 
                      alt={apar.jenis}
                      width="100"
                      height="100"
                      style={{ borderRadius: "8px", objectFit: "cover" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
