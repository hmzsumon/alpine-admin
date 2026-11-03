/* ── Component: OverviewDashboard ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { ChevronRight } from "lucide-react";
import OrderTable from "@/components/orders/OrderTable";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import SalesPerformanceChart from "@/components/dashboard/SalesPerformanceChart";
import KitchenStationSummary from "@/components/dashboard/KitchenStationSummary";
import MenuReadinessSummary from "@/components/dashboard/MenuReadinessSummary";

export default function OverviewDashboard() {
  /* ────────── workspace state ────────── */
  const { data, busy, navigate, status } = useAdminContext();

  return (
    <>
      <DashboardMetrics />
      <section className="chart-grid">
        <SalesPerformanceChart />
        <KitchenStationSummary />
      </section>
      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>
              Recent orders{" "}
              <span className="count-pill">{data.orders.length}</span>
            </h3>
            <p>A little overview of what’s cooking</p>
          </div>
          <button className="text-button" onClick={() => navigate("Orders")}>
            View all orders <ChevronRight size={16} />
          </button>
        </div>
        <OrderTable
          orders={data.orders.slice(0, 5)}
          onStatus={status}
          busy={busy}
        />
      </section>
      <MenuReadinessSummary />
    </>
  );
}
