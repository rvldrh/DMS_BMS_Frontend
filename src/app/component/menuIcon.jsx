'use client'

import Link from "next/link";


export const MenuItem = ({ href, icon, label, badge }) => {
  return (
    <Link
      href={href}
      className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
    >
      <span className="inline-flex justify-center items-center ml-4">{icon}</span>
      <span className="ml-2 text-sm tracking-wide truncate">{label}</span>
      {badge && (
        <span
          className={`px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-${badge.color}-500 bg-${badge.color}-50 rounded-full`}
        >
          {badge.text}
        </span>
      )}
    </Link>
  );
};