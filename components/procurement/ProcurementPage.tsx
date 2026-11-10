/* ── Component: Bengali step-by-step independent purchasing and raw-store workspace ── */
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Warehouse,
  Truck,
  Wallet,
  Users,
  PackagePlus,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useProcurement } from "@/hooks/useProcurement";
import { SupplierForm, ProductForm, LocationForm } from "./CatalogForms";
import { DemandForm, ReceiptForm, FinanceForm } from "./PurchaseForms";
import { StockForm, ClosingForm, TransferForm } from "./StockForms";
import SupplierLedger from "./SupplierLedger";
import RecordDetails from "./RecordDetails";
import SupplierList from "./SupplierList";
import DemandList from "./DemandList";
import ReceiptList from "./ReceiptList";
import PaymentList from "./PaymentList";
import StockPanel from "./StockPanel";
import CatalogPanel from "./CatalogPanel";
import HistoryPanel from "./HistoryPanel";
import { RawDialog, taka, DateNote, Save, formData } from "./shared";
const steps = [
  ["suppliers", "১. ব্যাপারী"],
  ["demands", "২. চাহিদা"],
  ["receipts", "৩. মাল গ্রহণ"],
  ["payments", "৪. পেমেন্ট"],
  ["stock", "৫. স্টোর ও কিচেন"],
  ["settings", "পণ্য ও স্থান"],
  ["history", "রিপোর্ট / ইতিহাস"],
];
const titles: Record<string, string> = {
  supplier: "ব্যাপারীর তথ্য",
  product: "পণ্যের তথ্য",
  location: "স্টোর / ফ্রিজ / কিচেন",
  demand: "চাহিদা তৈরি",
  receipt: "মাল গ্রহণ ও ক্রয় বিল",
  payment: "পেমেন্ট / অগ্রিম",
  adjustment: "পাওনা সমন্বয়",
  opening: "শুরুর বাস্তব স্টক",
  transfer: "মাল পাঠান",
  process: "কাটা / প্রসেসিং",
  cook: "রান্না তৈরি",
  consume: "ব্যবহার / পরিবেশন / নষ্ট",
  supplier_return: "ব্যাপারীকে মাল ফেরত",
  closing: "কাঁচামালের দৈনিক ক্লোজিং",
  ledger: "ব্যাপারীর পুরো হিসাব",
  details: "রেকর্ডের বিস্তারিত",
  accept: "মাল বুঝে পেয়েছি",
  resolve: "অমিল / অবশিষ্টের নিষ্পত্তি",
  demand_close: "চাহিদা বন্ধ করুন",
};
export default function ProcurementPage() {
  const [dialog, setDialog] = useState<any>(),
    [tab, setTab] = useState("suppliers"),
    [search, setSearch] = useState("");
  const { can } = useAuth(),
    raw = useProcurement(!!dialog);
  const { data, busy, command } = raw;
  const close = () => setDialog(undefined),
    open = (type: string, extra: any = {}) => {
      if (!busy) setDialog({ type, ...extra });
    },
    details = (id: string) => open("details", { id });
  if (!can("procurement:read"))
    return (
      <section className="panel raw-pad">
        ক্রয় ও স্টোর দেখার অনুমতি প্রয়োজন।
      </section>
    );
  if (!data)
    return (
      <section className="panel raw-pad">
        <h3>ক্রয় ও স্টোর</h3>
        <p>{raw.error || "স্বতন্ত্র হিসাব লোড হচ্ছে…"}</p>
        <button className="secondary" onClick={() => void raw.refresh()}>
          <RefreshCw size={15} />
          আবার চেষ্টা করুন
        </button>
      </section>
    );
  const manage = can("procurement:manage"),
    pay = can("procurement:pay"),
    operate = can("procurement:operate"),
    due = data.totals
      .filter((s) => s.balance > 0)
      .reduce((sum, s) => sum + s.balance, 0),
    advance = -data.totals
      .filter((s) => s.balance < 0)
      .reduce((sum, s) => sum + s.balance, 0);
  const panelProps = {
    data,
    search,
    manage,
    pay,
    operate,
    canClose: can("procurement:close"),
    busy,
    command,
    open,
    details,
  };
  return (
    <div className="raw-workspace">
      <div className="raw-intro">
        <div>
          <span className="raw-kicker">
            <Warehouse size={16} />
            স্বতন্ত্র ক্রয় ও কাঁচামাল
          </span>
          <p>
            এখানকার হিসাব শুধু অ্যাডমিনে। ওয়েটারের অর্ডার বা প্রস্তুত খাবারের
            স্টক নিজে থেকে বদলাবে না।
          </p>
        </div>
        <div className="resource-actions">
          <Link className="secondary" href="/guide/raw-procurement">
            উদাহরণসহ ব্যবহার শিখুন
          </Link>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => void raw.refresh()}
          >
            <RefreshCw size={15} />
            রিফ্রেশ
          </button>
        </div>
      </div>
      <div className="raw-summary">
        <div>
          <Users size={18} />
          <small>ব্যাপারী</small>
          <strong>
            {data.catalog.suppliers.length.toLocaleString("bn-BD")}
          </strong>
        </div>
        <div>
          <Wallet size={18} />
          <small>ব্যাপারীরা মোট পাবেন</small>
          <strong>{taka(due)}</strong>
        </div>
        <div>
          <PackagePlus size={18} />
          <small>অগ্রিম জমা আছে</small>
          <strong>{taka(advance)}</strong>
        </div>
        <div>
          <Truck size={18} />
          <small>মাল গ্রহণ / নিষ্পত্তি বাকি</small>
          <strong>{data.pending.length.toLocaleString("bn-BD")}</strong>
        </div>
      </div>
      <details
        className="raw-help raw-start"
        open={!data.catalog.suppliers.length}
      >
        <summary>প্রথমবার কীভাবে শুরু করবেন?</summary>
        <ol>
          <li>ব্যাপারী যোগ করুন—নাম, ফোন, কী মাল দেন ও আগের বাকি।</li>
          <li>
            চাহিদা তৈরি → অনুমোদন → প্রিন্ট দিন। সরাসরি কেনা হলে চাহিদা ছাড়াও
            মাল গ্রহণ করা যাবে।
          </li>
          <li>বাস্তবে পাওয়া পরিমাণ ও আসল দাম দিয়ে মাল গ্রহণ করুন।</li>
          <li>
            টাকা দেওয়ার সময় পেমেন্ট/অগ্রিম লিখুন। ব্যাপারীর খাতায় বাকি দেখুন।
          </li>
          <li>
            স্টোর থেকে মাল পাঠান, প্রাপ্তি নিশ্চিত করুন; কাটা/রান্নার পরে পিস ও
            অবশিষ্ট লিখুন।
          </li>
        </ol>
      </details>
      <nav className="raw-tabs" aria-label="ক্রয় ও স্টোরের ধাপ">
        {steps.map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => {
              setTab(id);
              setSearch("");
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {raw.error && (
        <p className="raw-message raw-error" role="alert">
          {raw.error}
        </p>
      )}
      {raw.notice && (
        <p className="raw-message" role="status">
          {raw.notice}
        </p>
      )}
      {!["history", "settings"].includes(tab) && (
        <input
          className="raw-search"
          aria-label="নাম / ব্যাচ খুঁজুন"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            tab === "stock"
              ? "পণ্য বা ব্যাচ খুঁজুন…"
              : "ব্যাপারীর নাম / ফোন খুঁজুন…"
          }
        />
      )}
      {tab === "suppliers" && <SupplierList {...panelProps} />}
      {tab === "demands" && <DemandList {...panelProps} />}
      {tab === "receipts" && <ReceiptList {...panelProps} />}
      {tab === "payments" && <PaymentList {...panelProps} />}
      {tab === "stock" && <StockPanel {...panelProps} />}
      {tab === "settings" && <CatalogPanel {...panelProps} />}
      {tab === "history" && <HistoryPanel data={data} details={details} />}
      {dialog && (
        <RawDialog
          title={titles[dialog.type] || "বিস্তারিত"}
          busy={busy}
          close={close}
        >
          {raw.error && (
            <p className="form-error" role="alert">
              {raw.error}
            </p>
          )}
          {dialog.type === "supplier" && (
            <SupplierForm
              item={dialog.item}
              command={command}
              busy={busy}
              done={close}
            />
          )}
          {dialog.type === "product" && (
            <ProductForm
              item={dialog.item}
              command={command}
              busy={busy}
              done={close}
            />
          )}
          {dialog.type === "location" && (
            <LocationForm
              item={dialog.item}
              command={command}
              busy={busy}
              done={close}
            />
          )}
          {dialog.type === "demand" && (
            <DemandForm
              data={data}
              command={command}
              busy={busy}
              done={close}
            />
          )}
          {dialog.type === "receipt" && (
            <ReceiptForm
              data={data}
              command={command}
              busy={busy}
              done={close}
              canPay={pay}
              initialDemand={dialog.record}
            />
          )}
          {["payment", "adjustment"].includes(dialog.type) && (
            <FinanceForm
              data={data}
              command={command}
              busy={busy}
              done={close}
              mode={dialog.type}
              supplier={dialog.supplier}
              initialDemand={dialog.demand}
              initialReceipt={dialog.receipt}
            />
          )}
          {[
            "opening",
            "transfer",
            "process",
            "cook",
            "consume",
            "supplier_return",
          ].includes(dialog.type) && (
            <StockForm
              data={data}
              command={command}
              busy={busy}
              done={close}
              mode={dialog.type}
              balanceId={dialog.balanceId}
            />
          )}
          {dialog.type === "closing" && (
            <ClosingForm
              data={data}
              command={command}
              busy={busy}
              done={close}
            />
          )}
          {["accept", "resolve"].includes(dialog.type) && (
            <TransferForm
              data={data}
              record={dialog.record}
              mode={dialog.type}
              command={command}
              busy={busy}
              done={close}
            />
          )}
          {dialog.type === "ledger" && (
            <SupplierLedger id={dialog.id} details={details} />
          )}
          {dialog.type === "details" && (
            <RecordDetails
              id={dialog.id}
              data={data}
              command={command}
              busy={busy}
              canPay={pay}
              done={close}
            />
          )}
          {dialog.type === "demand_close" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await command("demand_close", {
                    ...formData(e.currentTarget),
                    id: dialog.record._id,
                  })
                )
                  close();
              }}
            >
              <p className="raw-help">
                এই চাহিদায় নতুন মাল নেওয়া বন্ধ হবে। আগের বিল, পেমেন্ট ও স্টক
                থাকবে।
              </p>
              <DateNote date={data.date} noteRequired />
              <Save busy={busy} label="চাহিদা বন্ধ করুন" />
            </form>
          )}
        </RawDialog>
      )}
    </div>
  );
}
