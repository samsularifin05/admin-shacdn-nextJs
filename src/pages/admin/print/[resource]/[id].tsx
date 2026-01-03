import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintPage() {
  const router = useRouter();
  const { resource, id } = router.query;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resource && id) {
      fetch(`/api/${resource}/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);

          // Auto trigger print after data is rendered
          setTimeout(() => {
            window.print();
            // Close window after print/cancel
            window.onafterprint = () => {
              if (window.top === window.self) {
                window.close();
              }
            };
          }, 1500);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [resource, id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-white font-mono">
        <p>DATA TIDAK DITEMUKAN</p>
      </div>
    );
  }

  return (
    <div className="print-receipt-container font-mono text-black">
      <div className="receipt-box">
        <div className="text-center space-y-0.5 mb-2 border-b border-black pb-1">
          <h1 className="text-[14px] font-bold uppercase">STRUK PENJUALAN</h1>
          <p className="text-[10px] uppercase font-bold">Admin NextJS Store</p>
          <p className="text-[9px]">Jl. Raya Semplak No. 123, Bogor</p>
          <p className="text-[9px]">WA: 0812-3456-7890</p>
        </div>

        <div className="space-y-0.5 text-[9px]">
          <div className="flex justify-between">
            <span>
              NO: {data.transactionCode || data.kodeBarang || `#${data.id}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              TGL:{" "}
              {new Date(data.createdAt || Date.now()).toLocaleString("id-ID", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
          {data.customerName && (
            <div className="flex justify-between">
              <span>CUST: {data.customerName}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-black my-1" />

        <div className="space-y-1">
          <div className="space-y-0.5">
            <p className="font-bold uppercase text-[10px]">
              {data.namaBarang || "Detail Item"}
            </p>
            {Object.entries(data).map(([key, value]) => {
              if (
                [
                  "id",
                  "createdAt",
                  "updatedAt",
                  "transactionCode",
                  "namaBarang",
                  "customerName",
                  "totalAmount",
                ].includes(key)
              )
                return null;
              if (value === null || value === undefined || value === "")
                return null;
              if (typeof value === "object") return null;

              return (
                <div key={key} className="flex justify-between text-[9px]">
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, " $1")}:
                  </span>
                  <span className="text-right">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-dashed border-black my-1" />

        <div className="space-y-0.5 font-bold">
          <div className="flex justify-between text-[11px]">
            <span>TOTAL</span>
            <span>
              Rp{" "}
              {data.totalAmount?.toLocaleString("id-ID") ||
                (data.harga ? data.harga.toLocaleString("id-ID") : "0")}
            </span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span>PEMBAYARAN</span>
            <span>TUNAI</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black my-2" />

        <div className="text-center space-y-0.5 text-[9px] italic">
          <p>TERIMA KASIH</p>
          <p>Barang tidak dapat ditukar</p>
        </div>

        <div className="mt-4 no-print flex justify-center pb-5">
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="gap-1 h-7 text-[10px]"
          >
            <Printer className="h-3 w-3" />
            Cetak Lagi
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: 58mm auto;
          }
          .no-print {
            display: none !important;
          }
          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .print-receipt-container {
            background: white !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
          }
          .receipt-box {
            width: 58mm !important;
            box-shadow: none !important;
            padding: 5mm !important;
            margin: 0 auto !important;
            background: white !important;
          }
        }

        .print-receipt-container {
          min-height: 100vh;
          background: #f0f0f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 20px;
        }

        .receipt-box {
          width: 58mm;
          background: white;
          padding: 8mm;
          box-sizing: border-box;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
