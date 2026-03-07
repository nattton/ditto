import { useState, useRef } from "react";
import { useStore, RouteConfig } from "../store";

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-amber-400",
  PATCH: "text-orange-400",
  DELETE: "text-red-400",
  ANY: "text-violet-300",
};

interface Props {
  onClose: () => void;
}

export default function ImportModal({ onClose }: Props) {
  const { importRoutes } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<RouteConfig[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const routes: RouteConfig[] = Array.isArray(data)
          ? data
          : Object.values(data);
        if (!routes.every((r) => r.id && r.method && r.path)) {
          throw new Error("Invalid route format");
        }
        setParsed(routes);
        setSelected(new Set(routes.map((r) => r.id)));
        setError(null);
      } catch {
        setError("Invalid JSON file — expected an array of routes.");
        setParsed(null);
      }
    };
    reader.readAsText(file);
  };

  const toggleAll = () => {
    if (!parsed) return;
    if (selected.size === parsed.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(parsed.map((r) => r.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    if (!parsed) return;
    const toImport = parsed.filter((r) => selected.has(r.id));
    if (toImport.length === 0) return;
    setImporting(true);
    try {
      await importRoutes(toImport);
      onClose();
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-base font-semibold text-zinc-100">
            Import Routes
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* File picker */}
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-cyan-500/60 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-sm text-zinc-500">
              Click to choose a{" "}
              <span className="text-cyan-400 font-mono">.json</span> file
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {parsed && parsed.length > 0 && (
            <div className="space-y-2">
              {/* Select all row */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={selected.size === parsed.length}
                    onChange={toggleAll}
                    className="accent-cyan-500 w-3.5 h-3.5"
                  />
                  Select all ({parsed.length})
                </label>
                <span className="text-xs text-zinc-600">
                  {selected.size} selected
                </span>
              </div>

              <div className="rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-900 text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="px-3 py-2 text-left w-8"></th>
                      <th className="px-3 py-2 text-left">Method</th>
                      <th className="px-3 py-2 text-left">Path</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {parsed.map((route) => (
                      <tr
                        key={route.id}
                        onClick={() => toggleOne(route.id)}
                        className={`cursor-pointer transition-colors ${
                          selected.has(route.id)
                            ? "bg-zinc-900"
                            : "bg-zinc-950 opacity-40"
                        } hover:bg-zinc-800`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selected.has(route.id)}
                            onChange={() => toggleOne(route.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="accent-cyan-500 w-3.5 h-3.5"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`font-mono text-xs font-bold ${METHOD_COLORS[route.method] ?? "text-zinc-300"}`}
                          >
                            {route.method}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-zinc-100">
                          {route.path}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-zinc-400">
                          {route.status_code}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {(route.tags ?? []).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!parsed || selected.size === 0 || importing}
            className="px-4 py-2 text-sm rounded bg-cyan-500 text-zinc-950 font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing
              ? "Importing…"
              : `Import ${selected.size > 0 ? `(${selected.size})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
