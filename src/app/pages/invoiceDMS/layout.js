'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/app/component/sidebar'

export default function RootLayout({ children }) {
  const pathname = usePathname()

  const hideSidebarRoutes = ['/katalog-barang'] // Tambahkan route yang ingin full-page

  const isSidebarHidden = hideSidebarRoutes.includes(pathname)

  return (
      <div className="flex min-h-screen">
        {!isSidebarHidden && <Sidebar />}
        <div className={`flex-1 ${isSidebarHidden ? '' : 'ml-64'}`}>
          {children}
        </div>
      </div>
  )
}
