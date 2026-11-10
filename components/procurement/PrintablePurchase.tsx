/* ── Component: A4 demand/receipt; React escapes supplier and item text before printing ── */
"use client";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { RawRecord, RawCatalog } from "@/types/procurement";
import { taka, amount, units, methods } from "./shared";
export default function PrintablePurchase({
  record,
  catalog,
  related,
  printedBy,
}: {
  record: RawRecord;
  catalog: RawCatalog;
  related: RawRecord[];
  printedBy: string;
}) {
  const d = record.data,
    s =
      d.supplierSnapshot ||
      catalog.suppliers.find((s) => s.id === d.supplierId),
    demand = record.kind === "demand",
    payments = related.filter((r) =>
      ["payment", "payment_void"].includes(r.kind),
    ),
    paid = -payments.reduce((sum, r) => sum + (r.data.effect || 0), 0),
    credit = related
      .filter((r) => r.kind === "supplier_return")
      .reduce((sum, r) => sum + r.data.amount, 0),
    total = d.total === null ? null : d.total - (demand ? 0 : credit);
  return (
    <main className="raw-print-page">
      <div className="raw-print-toolbar">
        <Link href="/procurement">
          <ArrowLeft size={16} />
          ক্রয় ও স্টোরে ফিরুন
        </Link>
        <button onClick={() => window.print()}>
          <Printer size={17} />
          প্রিন্ট / Save as PDF
        </button>
      </div>
      <article>
        <header>
          <div>
            <h1>ALPINE RESTAURANT</h1>
            <p>Chowhatta, Sylhet-3100</p>
          </div>
          <div>
            <h2>{demand ? "চাহিদাপত্র" : "মাল গ্রহণ ও ক্রয় বিল"}</h2>
            <strong>{record.no}</strong>
            <p>তারিখ: {record.date}</p>
          </div>
        </header>
        {demand && d.status !== "approved" && (
          <div className="raw-print-watermark">
            {d.status === "draft" ? "খসড়া — অনুমোদিত নয়" : "চাহিদা বন্ধ হয়েছে"}
          </div>
        )}
        <section className="raw-print-meta">
          <div>
            <strong>ব্যাপারী: {s?.name}</strong>
            <p>
              {s?.contact}
              {s?.phone ? " · " + s.phone : ""}
            </p>
            <p>{s?.address}</p>
            <p>পণ্যের ধরন: {s?.kinds.join(", ")}</p>
          </div>
          <div>
            {d.neededBy && <p>মাল লাগবে: {d.neededBy}</p>}
            {d.invoice && <p>ব্যাপারীর বিল: {d.invoice}</p>}
            <p>প্রস্তুতকারী: {record.actor}</p>
            {d.approvedBy && <p>অনুমোদনকারী: {d.approvedBy}</p>}
            {d.locationId && (
              <p>
                মাল রাখা হয়েছে:{" "}
                {catalog.locations.find((l) => l.id === d.locationId)?.name}
              </p>
            )}
          </div>
        </section>
        <table>
          <thead>
            <tr>
              <th>ক্রম</th>
              <th>পণ্যের নাম</th>
              <th>{demand ? "চাহিদা" : "গ্রহণ করা"}</th>
              <th>প্রতি এককের দর</th>
              <th>টাকা</th>
            </tr>
          </thead>
          <tbody>
            {d.lines.map((l: any, i: number) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{l.name}</td>
                <td>
                  {amount(l.quantity)} {units[l.unit]}
                </td>
                <td>{l.rate === null ? "—" : taka(l.rate)}</td>
                <td>{l.total === null ? "—" : taka(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <section className="raw-print-total">
          {d.extra > 0 && (
            <p>
              অতিরিক্ত চার্জ <strong>{taka(d.extra)}</strong>
            </p>
          )}
          {d.discount > 0 && (
            <p>
              ছাড় <strong>{taka(d.discount)}</strong>
            </p>
          )}
          {credit > 0 && !demand && (
            <p>
              মাল ফেরতে বিল কমেছে <strong>{taka(credit)}</strong>
            </p>
          )}
          <p>
            {demand ? "আনুমানিক মোট" : "নিট বিল"}
            <strong>{total === null ? "দর নিশ্চিত হয়নি" : taka(total)}</strong>
          </p>
          <p>
            এই {demand ? "চাহিদায়" : "বিলে"} সংযুক্ত নিট পেমেন্ট / অগ্রিম
            <strong>{taka(paid)}</strong>
          </p>
          {total !== null && (
            <p>
              {demand
                ? "আনুমানিক পার্থক্য"
                : "বিল ও সংযুক্ত পেমেন্টের পার্থক্য"}
              <strong>{taka(total - paid)}</strong>
            </p>
          )}
        </section>
        <p className="raw-print-note">
          {demand
            ? "চাহিদার মূল্য আনুমানিক। বাস্তবে মাল গ্রহণ ও চূড়ান্ত বিলের পরে পাওনা নির্ধারিত হবে।"
            : "এই বিলে সংযুক্ত পেমেন্ট দেখানো হয়েছে। সাধারণ খাতার অগ্রিম ও সব বিল মিলিয়ে সম্পূর্ণ পাওনা ব্যাপারীর লেজারে দেখুন।"}
        </p>
        {d.note && (
          <p>
            <strong>নির্দেশনা / মন্তব্য:</strong> {d.note}
          </p>
        )}
        {payments.length > 0 && (
          <>
            <h3>এই ফরমের সংযুক্ত পেমেন্ট ইতিহাস</h3>
            <table>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>ধরন / মাধ্যম</th>
                  <th>Transaction ID / রেফারেন্স</th>
                  <th>টাকা</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{p.date}</td>
                    <td>
                      {p.kind === "payment_void"
                        ? "বাতিলের সমন্বয়"
                        : methods[p.data.method] +
                          (p.data.direction === "in" ? " · ফেরত পাওয়া" : "")}
                    </td>
                    <td>{p.data.reference || p.no}</td>
                    <td>{taka(-(p.data.effect || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <footer>
          <div>প্রস্তুতকারীর স্বাক্ষর</div>
          <div>অনুমোদনকারীর স্বাক্ষর</div>
          <div>ব্যাপারী / গ্রহণকারীর স্বাক্ষর</div>
        </footer>
        <p className="raw-print-bottom">
          প্রিন্টকারী: {printedBy} · ALPINE · ক্রয় ও স্টোরের স্বতন্ত্র হিসাব
        </p>
      </article>
      <style jsx>{`
        .raw-print-page {
          background: #fff;
          color: #17231e;
          min-height: 100vh;
          padding: 25px;
          font-family: Arial, "Noto Sans Bengali", sans-serif;
        }
        .raw-print-toolbar {
          max-width: 900px;
          margin: 0 auto 25px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .raw-print-toolbar a,
        .raw-print-toolbar button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #006f50;
          color: white;
          padding: 11px 16px;
          border: 0;
          border-radius: 7px;
          text-decoration: none;
          cursor: pointer;
        }
        .raw-print-page article {
          max-width: 900px;
          margin: auto;
        }
        .raw-print-page header {
          display: flex;
          justify-content: space-between;
          gap: 25px;
          border-bottom: 3px solid #096b50;
          padding-bottom: 15px;
        }
        .raw-print-page h1 {
          font-size: 24px;
          letter-spacing: 1px;
          margin: 0 0 8px;
          color: #07573f;
        }
        .raw-print-page h2 {
          font-size: 21px;
          margin: 0 0 8px;
        }
        .raw-print-page h3 {
          font-size: 16px;
          margin-top: 22px;
        }
        .raw-print-page p {
          font-size: 12px;
          line-height: 1.8;
          margin: 4px 0;
        }
        .raw-print-meta {
          display: flex;
          justify-content: space-between;
          gap: 25px;
          margin: 20px 0;
        }
        .raw-print-page table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .raw-print-page th,
        .raw-print-page td {
          border: 1px solid #aebcb5;
          padding: 10px 8px;
          text-align: left;
          color: #17231e;
          background: white;
        }
        .raw-print-page th {
          background: #e8f2ed;
        }
        .raw-print-page tr {
          break-inside: avoid;
        }
        .raw-print-total {
          width: 70%;
          margin: 18px 0 18px auto;
        }
        .raw-print-total p {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #d8e1dc;
          padding: 7px 0;
        }
        .raw-print-note {
          background: #f1f5f2;
          padding: 12px;
          border-left: 3px solid #116744;
        }
        .raw-print-page footer {
          display: flex;
          justify-content: space-between;
          gap: 30px;
          margin-top: 70px;
          font-size: 12px;
        }
        .raw-print-page footer div {
          border-top: 1px solid #7c8c83;
          padding-top: 8px;
          flex: 1;
          text-align: center;
        }
        .raw-print-bottom {
          margin-top: 25px !important;
          color: #69766e;
        }
        .raw-print-watermark {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          color: #9d3c3c;
          padding: 15px;
          border: 1px dashed #b88585;
          margin-top: 15px;
        }
        @page {
          size: A4;
          margin: 14mm;
        }
        @media print {
          .raw-print-page {
            padding: 0;
            min-height: 0;
          }
          .raw-print-toolbar {
            display: none;
          }
          .raw-print-page header {
            break-inside: avoid;
          }
          .raw-print-page thead {
            display: table-header-group;
          }
          .raw-print-total,
          .raw-print-meta,
          .raw-print-page footer {
            break-inside: avoid;
          }
          .raw-print-page table {
            min-width: 0 !important;
          }
          .raw-print-page article {
            max-width: none;
          }
        }
      `}</style>
    </main>
  );
}
