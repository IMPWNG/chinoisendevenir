"use client";

import { useEffect, useState } from "react";
import { adminClockLines } from "../lib/adminClocks";

export default function AdminClocks() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mb-5 overflow-x-auto text-sm leading-6 text-slate-300" aria-label="Heures">
      {adminClockLines(now).map((line) => (
        <p key={line.offset} className="whitespace-nowrap">
          <span className="font-semibold tabular-nums text-white">{line.time}</span>
          <span> {line.label}</span>
        </p>
      ))}
    </div>
  );
}
