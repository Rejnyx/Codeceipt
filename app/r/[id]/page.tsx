import { notFound } from "next/navigation";
import Link from "next/link";
import { getReceipt } from "@/lib/store";
import { getSampleReceipt } from "@/lib/sample-receipts";
import { ReceiptDoc } from "@/components/receipt-doc";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = (await getReceipt(id)) ?? getSampleReceipt(id);
  if (!receipt) notFound();

  return (
    <main style={{ paddingTop: 28, minHeight: "100vh" }}>
      <div className="wrap" style={{ maxWidth: 760, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-ghost btn-sm">
            ← Home
          </Link>
          <span style={{ flex: 1 }} />
          <Link href="/" className="btn btn-ghost btn-sm">
            Verify another
          </Link>
        </div>
      </div>
      <ReceiptDoc data={receipt} />
    </main>
  );
}
