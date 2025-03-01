'use client'

import React from "react";
import { HomeIcon, InboxIcon, ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { MenuItem } from "./menuIcon";

export const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 w-64 bg-white h-full border-r z-10">
      <div className="flex items-center justify-center h-14 border-b">
        <div className="text-lg font-semibold">DMS PT.Berlian Muda Sukses</div>
      </div>
      <div className="overflow-y-auto overflow-x-hidden flex-grow">
        <ul className="flex flex-col py-4 space-y-1">
          <li className="px-5">
            <div className="flex flex-row items-center h-8">
              <div className="text-sm font-light tracking-wide text-gray-500">Menu</div>
            </div>
          </li>
          <li>
            <MenuItem
              href="/"
              icon={<HomeIcon className="w-5 h-5" />}
              label="KatalogBarang"
              className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
            />
          </li>
          <li>
            <MenuItem
              href="/"
              icon={<InboxIcon className="w-5 h-5" />}
              label="laporanPenjualan"
              className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
            />
          </li>
          <li>
            <MenuItem
              href="/"
              icon={<ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />}
              label="Barang Keluar"
              className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
            />
          </li>
          <li>
            <MenuItem
              href="/"
              icon={<ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />}
              label="Barang Masuk"
              className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
            />
          </li>
        </ul>
      </div>
    </div>
  );
};
