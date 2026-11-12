/* ── Component: PrinterManagement ────────────────────────────────────────────── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";

import KotQueue from "@/components/printers/KotQueue";

/* ────────── imports ────────── */
import { useAuth } from "@/providers/AuthProvider";
import { useAdminContext } from "@/context/AdminContext";
import { Check, Printer } from "lucide-react";

export default function PrinterManagement() {
  const { can } = useAuth();
  /* ────────── workspace state ────────── */
  const { data, setNotice, busy, save, kitchens, stationName } = useAdminContext();

  return (
    <>
      <div className="info-note">
        Rongta RP330 · 80mm · Ethernet · ESC/POS. Save your actual printer IP
        addresses below. The API print worker sends separate station KOTs when
        enabled. Saving settings does not send a test print.
      </div>
      <div className="printer-grid">
        {data.printers.map((p) => (
          <form
            className="panel printer-card"
            key={p.id}
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const ip = String(form.get("ip")).trim();
              if (
                ip &&
                !/^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(
                  ip
                )
              ) {
                setNotice("Enter a valid IPv4 address");
                return;
              }
              const enabled = form.get("enabled") === "on";
              if (enabled && !ip) {
                setNotice("Configure an IP address before enabling");
                return;
              }
              if (
                await save({
                  ...data,
                  printers: data.printers.map((item) =>
                    item.id === p.id ? { ...p, ip, enabled, station: String(form.get("station")) } : item
                  ),
                })
              )
                setNotice(
                  "Printer settings saved. Physical connection not tested."
                );
            }}
          >
            <div className="panel-title">
              <span className="station-icon green">
                <Printer size={24} />
              </span>
              <span className="badge Cancelled">Not tested</span>
            </div>
            <h3>{p.name}</h3>
            <p>
              {p.floor} · {stationName(p.station)}
            </p>
            <label>কিচেন / কাউন্টার<SearchableSelect name="station" defaultValue={p.station}>{kitchens.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}<option value="Cash Counter">Cash Counter</option>{!kitchens.some((k) => k.id === p.station) && p.station !== "Cash Counter" && <option value={p.station}>{p.station} (ডিলিট করা কিচেন)</option>}</SearchableSelect></label>
            <label>
              Printer IP address
              <input
                name="ip"
                defaultValue={p.ip}
                placeholder="e.g. 192.168.1.201"
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={p.enabled}
              />{" "}
              Enable routing configuration
            </label>
            <button
              disabled={busy || !can("printers:manage")}
              className="secondary"
              type="submit"
            >
              <Check size={15} /> Save configuration
            </button>
          </form>
        ))}
      </div>
      <KotQueue />
    </>
  );
}
