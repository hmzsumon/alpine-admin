/* ── Component: SalesPerformanceChart ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { money } from "@/utils/format";

export default function SalesPerformanceChart() {
  /* ────────── workspace state ────────── */
  const { chart } = useAdminContext();

  return (
    <article className="panel sales-panel">
      <div className="panel-title">
        <div>
          <h3>Sales performance</h3>
          <p>Paid order revenue over the last 7 days</p>
        </div>
        <span className="legend">
          <i /> Revenue
        </span>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chart}
            margin={{ top: 20, right: 12, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#13bd91" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#13bd91" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#2b2b3e"
              vertical={false}
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8a8a9e", fontSize: 12 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8a8a9e", fontSize: 11 }}
              width={56}
              tickFormatter={(v) => `৳${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#242437",
                border: "1px solid #37374c",
                borderRadius: 10,
              }}
              formatter={(v) => money(Number(v))}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#19c99c"
              strokeWidth={2.5}
              fill="url(#sales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <TrendingUp size={16} /> Your sales story starts with your first paid
        order.
      </div>
    </article>
  );
}
