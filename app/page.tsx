"use client";

import { useState, useEffect } from "react";

type LinkItem = {
  code: string;
  url: string;
  clicks: number | null;
  last_clicked: string | null;
  created_at: string;
};

export default function HomePage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Record<string, boolean>>({}); // per-code loading

  // Fetch all links on load
  async function fetchLinks() {
    try {
      const res = await fetch("/api/links");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setLinks(data);
    } catch (err: any) {
      console.error("Failed to fetch links:", err);
      setError("Failed to load links.");
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  // Create link with user code
  async function createLink(e: any) {
    e.preventDefault();
    setError("");

    if (!url || !code) {
      setError("URL and code are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, code }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setError(err.error || `Error ${res.status}`);
        return;
      }

      // success
      setUrl("");
      setCode("");
      // reload list (could also push newly created item to state)
      await fetchLinks();
    } catch (err: any) {
      console.error("Create failed:", err);
      setError("Failed to create link.");
    } finally {
      setLoading(false);
    }
  }

  // Delete link (improved)
  async function deleteLink(codeToDelete: string) {
    const confirmDelete = confirm(
      `Delete short link "${codeToDelete}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    // set per-item loading
    setDeleting((d) => ({ ...d, [codeToDelete]: true }));
    setError("");

    try {
      const res = await fetch(`/api/links/${encodeURIComponent(codeToDelete)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // try to read JSON error
        const body = await res.text();
        console.error("Delete failed:", res.status, body);
        setError(
          body || `Failed to delete (status ${res.status}). Please try again.`
        );
        return;
      }

      // Optimistic update: remove the deleted item from the list
      setLinks((prev) => prev.filter((l) => l.code !== codeToDelete));
    } catch (err: any) {
      console.error("Delete request failed:", err);
      setError("Failed to delete link.");
    } finally {
      setDeleting((d) => {
        const copy = { ...d };
        delete copy[codeToDelete];
        return copy;
      });
    }
  }

  // Copy full short URL
  const copyUrl = (code: string) => {
    const fullUrl = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    alert("Copied: " + fullUrl);
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">TinyLink Dashboard</h1>

      {/* Form */}
      <form onSubmit={createLink} className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Enter custom code (6-8 alphanumeric)"
          className="w-full border px-3 py-2 rounded"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <input
          type="url"
          placeholder="Enter long URL"
          className="w-full border px-3 py-2 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Creating..." : "Create Short URL"}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Code</th>
              <th className="p-2 text-left">Original URL</th>
              <th className="p-2 text-left">Clicks</th>
              <th className="p-2 text-left">Last clicked</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {links.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-600">
                  No links yet.
                </td>
              </tr>
            )}

            {links.map((link) => (
              <tr key={link.code} className="border-b">
                <td className="p-2 align-top">
                  <a
                    href={`/${link.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {link.code}
                  </a>
                </td>

                <td className="p-2 max-w-[300px] truncate">{link.url}</td>

                <td className="p-2 align-top">{link.clicks ?? 0}</td>

                <td className="p-2 align-top">
                  {link.last_clicked
                    ? new Date(link.last_clicked).toLocaleString()
                    : "—"}
                </td>

                <td className="p-2 align-top flex gap-2">
                  <button
                    onClick={() => copyUrl(link.code)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    Copy
                  </button>

                  <button
                    onClick={() => deleteLink(link.code)}
                    disabled={!!deleting[link.code]}
                    className={`px-2 py-1 rounded ${
                      deleting[link.code]
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {deleting[link.code] ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
 