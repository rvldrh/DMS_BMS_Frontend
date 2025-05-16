"use client";

import React from "react";
import {
	HomeIcon,
	InboxIcon,
	ArrowRightEndOnRectangleIcon,
	ArrowRightStartOnRectangleIcon,
	CreditCardIcon,

} from "@heroicons/react/24/outline";
import { MenuItem } from "./menuIcon";
import Image from "next/image";

export const Sidebar = () => {

	const Logo = "/img/bms.png";

	return (
		<div>
			<aside className="fixed top-0 left-0 w-64 bg-white h-full border-r z-10">
				<div className="flex items-center justify-center h-24 border-b p-6">
					<Image
						src={Logo}
						alt="Company Logo"
						className="mr-4"
						width={72}
						height={72}
					/>
				</div>
				<div className="overflow-y-auto overflow-x-hidden flex-grow">
					<ul className="flex flex-col py-4 space-y-1">
						<li className="px-5">
							<div className="flex flex-row items-center h-8">
								<div className="text-sm font-light tracking-wide text-gray-500">
									Menu
								</div>
							</div>
						</li>
						<li>
							<MenuItem
								href="/pages/invoiceDMS/katalogBarang"
								icon={<HomeIcon className="w-5 h-5" />}
								label="Katalog Barang"
								className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
							/>
						</li>
						<li>
							<MenuItem
								href="/pages/invoiceDMS/laporanPembelian"
								icon={<CreditCardIcon className="w-5 h-5" />}
								label="laporan Pembelian"
								className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
							/>
						</li>
						<li>
							<MenuItem
								href="/pages/invoiceDMS/laporanPenjualan"
								icon={<InboxIcon className="w-5 h-5" />}
								label="laporan Penjualan"
								className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
							/>
						</li>
						<li>
							<MenuItem
								href="/pages/invoiceDMS/barangMasuk"
								icon={<ArrowRightEndOnRectangleIcon className="w-5 h-5" />}
								label="Barang Masuk"
								className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
							/>
						</li>
						<li>
							<MenuItem
								href="/pages/invoiceDMS/barangKeluar"
								icon={<ArrowRightStartOnRectangleIcon className="w-5 h-5" />}
								label="Barang Keluar"
								className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
							/>
						</li>
					</ul>
				</div>
			</aside>
		</div>
	);
};
