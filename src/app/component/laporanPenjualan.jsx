"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import {
  getLaporanPenjualan,
} from "../service/laporan_penjualan.service";
import { Spinner } from "./spinner";

export const LaporanPenjualanTable = () => {
  const [laporanPenjualan, setLaporanPenjualan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchLaporanPenjualan = async () => {
      setLoading(true);
      try {
        const data = await getLaporanPenjualan();
        setLaporanPenjualan(data);
      } catch {
        setError("Failed to fetch laporan penjualan.");
      } finally {
        setLoading(false);
      }
    };
    fetchLaporanPenjualan();
  }, []);


  const handleChangePage = (
    event,
    newPage
  ) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>No. Invoice</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>PPN</TableCell>
                  <TableCell>Grand Total</TableCell>
                  <TableCell>Kepada</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {laporanPenjualan?.data
                  ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((laporan) => (
                    <TableRow key={laporan._id}>
                      <TableCell>{laporan.tanggal}</TableCell>
                      <TableCell>{laporan.no_invoice}</TableCell>
                      <TableCell>{laporan.subtotal}</TableCell>
                      <TableCell>{laporan.ppn}</TableCell>
                      <TableCell>{laporan.grand_total}</TableCell>
                      <TableCell>{laporan.kepada}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => window.location.href = `/pages/invoiceDMS/invoice/${laporan._id}`}
                        >
                          Lihat Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination controls */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={laporanPenjualan?.data?.length || 0} // Default to 0 if undefined
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </div>
  );
};