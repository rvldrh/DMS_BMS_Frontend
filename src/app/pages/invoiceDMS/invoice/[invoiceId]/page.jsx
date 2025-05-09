import { InvoiceComponent } from "@/app/component/invoiceComponent";
import { getLaporanPenjualanById } from "@/app/service/laporan_penjualan.service";

// Define the expected type for the component's params

// Use async/await correctly in server-side components (with `await` for params)
const InvoicePage = async ({ params }) => {
  const { invoiceId } = await params; // Await the params object

  // Fetch invoice data using invoiceId
  const invoiceData = await getLaporanPenjualanById(invoiceId);

  return (
    <>
      {/* Pass the invoice data to InvoiceComponent */}
      <InvoiceComponent invoiceId={invoiceData} />
    </>
  );
};

export default InvoicePage;
