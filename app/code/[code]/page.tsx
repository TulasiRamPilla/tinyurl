"use client";

import { use, useEffect, useState } from "react";

export default function StatsPage(props: { params: Promise<{ code: string }> }) {
  // ⭐ Unwrap params safely (React 19 / Next 16)
  const { code } = use(props.params);

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/links/${code}`);

        if (!res.ok) {
          setError("Not found");
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Error loading stats");
      }
    }

    load();
  }, [code]);

  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!data) return <p className="p-4">Loading...</p>;

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stats for: {data.code}</h1>

      <div className="space-y-2">
        <p><strong>Original URL:</strong> {data.url}</p>
        <p><strong>Total Clicks:</strong> {data.clicks}</p>
        <p><strong>Last Clicked:</strong> {data.last_clicked || "Never"}</p>
        <p><strong>Created:</strong> {data.created_at}</p>
      </div>
    </main>
  );
}
