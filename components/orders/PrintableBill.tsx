/* ── Component: receipt preview and browser printing; never changes payment or order state ── */
"use client";
import Link from "next/link";
import { ArrowLeft, Printer, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Order } from "@/types";
import { orderLabel, paidOrder, total } from "@/utils/format";
import "./printable-bill.css";
const amount = (value: number) => value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = (value: string) => new Date(value).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" });
export default function PrintableBill({ order, printedBy, previewAt }: { order: Order; printedBy: string; previewAt: string }) {
  const router = useRouter();
  const paid = paidOrder(order), cancelled = order.status === "Cancelled";
  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  return <main className="bill-preview-page">
    <nav className="bill-preview-toolbar" aria-label="বিল প্রিভিউ">
      <Link href="/orders"><ArrowLeft size={17} />অর্ডারে ফিরুন</Link>
      <button type="button" onClick={() => router.refresh()}><RefreshCw size={16} />রিফ্রেশ</button>
      <button type="button" className="bill-print-button" onClick={() => window.print()}><Printer size={17} />প্রিন্ট / PDF</button>
    </nav>
    <p className="bill-preview-help">বিলের প্রিভিউ · প্রিন্টে ক্যাশ কাউন্টারের প্রিন্টার ও 80mm কাগজ বাছুন। Headers and footers বন্ধ রাখুন। প্রিন্ট করলে পেমেন্টের অবস্থা বদলাবে না।</p>
    <article className="bill-receipt" aria-label="কাস্টমারের বিল">
      <header><h1>ALPINE</h1><h2>RESTAURANT</h2><p>Chowhatta, Sylhet-3100</p><h3>কাস্টমারের বিল</h3></header>
      <div className="bill-status">{cancelled ? "বাতিল অর্ডার — আদায়যোগ্য নয়" : paid ? "পরিশোধিত" : "অপরিশোধিত বিল"}</div>
      <dl className="bill-meta">
        <div><dt>{order.orderType === "takeaway" ? "পার্সেল" : "টেবিল"}</dt><dd>{orderLabel(order)}</dd></div>
        <div><dt>বিল রেফারেন্স</dt><dd>{order.id}</dd></div>
        <div><dt>অর্ডারের সময়</dt><dd>{date(order.createdAt)}</dd></div>
        <div><dt>ওয়েটার</dt><dd>{order.waiter}</dd></div>
        {order.customerName && <div><dt>কাস্টমার</dt><dd>{order.customerName}</dd></div>}
        {order.customerPhone && <div><dt>মোবাইল</dt><dd>{order.customerPhone}</dd></div>}
      </dl>
      <table className="bill-items"><thead><tr><th>খাবার / পরিমাণ × দর</th><th>টাকা</th></tr></thead>
        <tbody>{order.items.map((item, index) => <tr key={index}><td><strong>{item.nameBn || item.name}</strong><small>{item.quantity} × {amount(item.price)}{item.fulfillment === "parcel" ? " · পার্সেল" : ""}</small></td><td>{amount(item.quantity * item.price)}</td></tr>)}</tbody>
      </table>
      <div className="bill-totals"><p><span>খাবারের মোট</span><span>{amount(subtotal)}</span></p>
        {!!order.packingCharge && <p><span>প্যাকিং চার্জ</span><span>{amount(order.packingCharge)}</span></p>}
        <p className="bill-grand-total"><strong>সর্বমোট (৳)</strong><strong>{amount(total(order))}</strong></p>
      </div>
      {paid && <div className="bill-payment">পেমেন্ট গ্রহণ করা হয়েছে{order.paidAt && <p>{date(order.paidAt)}</p>}</div>}
      <footer><p>প্রিভিউ প্রস্তুতকারী: {printedBy}</p><p>{date(previewAt)}</p><strong>ধন্যবাদ। আবার আসবেন।</strong></footer>
    </article>
  </main>;
}
