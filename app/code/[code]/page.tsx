"use client";

import { use, useEffect, useState } from "react";

export default function StatsPage({ params }: any) {
  // ✅ unwrap params (React 19 API)
  const { code } = use(params);

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;

    async function load() {
      try {
        const res = await fetch(`/api/links/${code}`);

        if (!res.ok) {
          const body = await res.text();
          setError(body || "Failed to load stats");
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      }
    }

    load();
  }, [code]);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading stats...</div>;

  return (
    <div>
      <h1>Stats for code: {code}</h1>
      <p>Clicks: {data.clicks}</p>
      <p>Created: {new Date(data.created_at).toLocaleString()}</p>
      <p>
        Last Clicked:{" "}
        {data.last_clicked
          ? new Date(data.last_clicked).toLocaleString()
          : "Never"}
      </p>
    </div>
  );
}
