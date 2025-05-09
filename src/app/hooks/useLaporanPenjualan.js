import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getLaporanPenjualan, addLaporanPenjualan } from "../service/laporan_penjualan.service";

export const useLaporanPenjualan = () => {
	return useQuery({
		queryKey: ["laporanPenjualan"],
		queryFn: getLaporanPenjualan,
	});
};

export const useAddLaporanPenjualan = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: addLaporanPenjualan,
		onSuccess: () => {
			queryClient.invalidateQueries(["laporanPenjualan"]);
		},
	});
};
