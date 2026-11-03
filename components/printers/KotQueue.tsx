/* ── Component: KotQueue ────────────────────────────────────────────── */
"use client";
/* ────────── imports ────────── */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
type Ticket = {
  id: string;
  orderId: string;
  table: string;
  station: string;
  kind: string;
  status: string;
  reprints: number;
  error?: string;
  createdAt: string;
};
/* ────────── persistent queue and explicit duplicate-safe recovery ────────── */
export default function KotQueue() {
  const { can } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/kot", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setTickets(result.tickets);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to read KOT queue"
      );
    }
  }, []);
  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 5000);
    return () => clearInterval(timer);
  }, [load]);
  async function retry(ticket: Ticket) {
    const possibleDuplicate = ["sent", "uncertain"].includes(ticket.status);
    if (
      possibleDuplicate &&
      !window.confirm(
        "This ticket may already be on paper. Check the station printer first. Reprint with a REPRINT label?"
      )
    )
      return;
    setBusy(ticket.id);
    setNotice("");
    try {
      const response = await fetch(
        "/api/kot/" + encodeURIComponent(ticket.id) + "/retry",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmDuplicateRisk: possibleDuplicate }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Retry failed");
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="panel" style={{ marginTop: 24 }}>
      <div className="panel-title">
        <div>
          <h3>KOT delivery queue</h3>
          <p>
            Separate station tickets · Last 100 jobs · Sent means submitted, not
            verified on paper
          </p>
        </div>
        <button className="secondary" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      {notice && (
        <p role="status" className="info-note" style={{ margin: 16 }}>
          {notice}
        </p>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Table / Order</th>
              <th>Station</th>
              <th>Kind</th>
              <th>Delivery</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <strong>{ticket.table}</strong>
                  <small className="item-note">{ticket.orderId}</small>
                </td>
                <td>{ticket.station}</td>
                <td>
                  {ticket.kind}
                  {ticket.reprints ? " · REPRINT " + ticket.reprints : ""}
                </td>
                <td>
                  <span
                    className={
                      "badge " +
                      (ticket.status === "sent"
                        ? "Ready"
                        : ticket.status === "queued"
                        ? "New"
                        : "Preparing")
                    }
                  >
                    {ticket.status}
                  </span>
                  {ticket.error && (
                    <small className="item-note">{ticket.error}</small>
                  )}
                </td>
                <td>
                  <a
                    className="text-button"
                    target="_blank"
                    rel="noreferrer"
                    href={
                      "/api/kot/" + encodeURIComponent(ticket.id) + "/preview"
                    }
                  >
                    Preview
                  </a>
                  {can("printers:manage") &&
                    !["queued", "sending", "cancelled"].includes(
                      ticket.status
                    ) && (
                      <button
                        className="secondary"
                        style={{ marginLeft: 12 }}
                        disabled={!!busy}
                        onClick={() => void retry(ticket)}
                      >
                        {busy === ticket.id
                          ? "Queueing…"
                          : ["sent", "uncertain"].includes(ticket.status)
                          ? "Reprint"
                          : "Retry"}
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!tickets.length && (
          <p className="empty">
            No KOT tickets yet. Send an order from Alpine Waiter.
          </p>
        )}
      </div>
    </section>
  );
}
