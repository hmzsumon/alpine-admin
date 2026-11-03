/* ── Component: AssignmentPicker ─────────────────────────────────────── */
"use client";
const stations = ["Main Kitchen", "BBQ", "Drinks"];
export default function AssignmentPicker({ selectedStations, tables, onStations, onTables }: { selectedStations: string[]; tables: string[]; onStations: (s: string[]) => void; onTables: (s: string[]) => void }) {
  const toggle = (values: string[], value: string) => values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
  return <div className="staff-assignments">
    <fieldset><legend>কিচেন স্টেশন — অপারেটরের দায়িত্ব</legend><div className="assignment-options">{stations.map((station) => <label key={station}><input type="checkbox" checked={selectedStations.includes(station)} onChange={() => onStations(toggle(selectedStations, station))} />{station}</label>)}</div></fieldset>
    <fieldset><legend>ওয়েটারের নির্ধারিত টেবিল</legend><p>নতুন ওয়েটারকে টেবিল দিন। খালি থাকলে কোনো টেবিল বরাদ্দ থাকবে না।</p><div className="assignment-tools"><button type="button" className="secondary" onClick={() => onTables(Array.from({ length: 24 }, (_, i) => `T-${String(i + 1).padStart(2, "0")}`))}>সব টেবিল</button><button type="button" className="secondary" onClick={() => onTables([])}>সব সরান</button></div><div className="assignment-options table-options">{Array.from({ length: 24 }, (_, i) => `T-${String(i + 1).padStart(2, "0")}`).map((table) => <label key={table}><input type="checkbox" checked={tables.includes(table)} onChange={() => onTables(toggle(tables, table))} />{table}</label>)}</div></fieldset>
  </div>;
}
