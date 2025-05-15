import { DetailPembelian } from "@/app/component/detailPembelian";
import React from "react";
import { getLaporanPembelianById } from "@/app/service/laporan_pembelian.service";

const page = async ({ params }) => {
	const { id } = await params;
	const detailPembelianData = await getLaporanPembelianById(id);
	return (
		<>
			<DetailPembelian id={detailPembelianData} />
		</>
	);
};

export default page;
