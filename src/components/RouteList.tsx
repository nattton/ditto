import { useState } from "react";
import { useStore, RouteConfig, HttpMethod } from "../store";

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  PATCH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  ANY: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

interface Props {
  onEdit: (route: RouteConfig) => void;
}

export default function RouteList({ onEdit }: Props) {
  const { routes, removeRoute, toggleRoute, serverRunning, port } = useStore();
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = Array.from(new Set(routes.flatMap((r) => r.tags ?? [])));

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const filtered = routes.filter((r) => {
    const matchesPath = r.path.toLowerCase().includes(search.toLowerCase());
    const matchesTags =
      activeTags.length === 0 ||
      activeTags.every((t) => (r.tags ?? []).includes(t));
    return matchesPath && matchesTags;
  });

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
        <div className="text-5xl mb-4">🎭</div>
        <p className="text-lg font-medium">No mock routes yet</p>
        <p className="text-sm mt-1">
          Click "+ Add Route" to create your first mock
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter routes by path..."
          className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                activeTags.includes(tag)
                  ? "bg-violet-500/30 text-violet-200 border-violet-500/60"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-violet-500/40 hover:text-violet-300"
              }`}
            >
              #{tag}
            </button>
          ))}
          {activeTags.length > 0 && (
            <button
              onClick={() => setActiveTags([])}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-zinc-700 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              clear
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
          <p className="text-sm">
            No routes match{" "}
            <span className="font-mono text-zinc-500">"{search}"</span>
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Enabled</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Path</th>
                <th className="px-4 py-3 text-left">Tags</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">URL</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((route) => (
                <tr
                  key={route.id}
                  className={`bg-zinc-950 hover:bg-zinc-900 transition-colors ${!route.enabled ? "opacity-40" : ""}`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRoute(route.id)}
                      title={route.enabled ? "Disable route" : "Enable route"}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        route.enabled ? "bg-cyan-500" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          route.enabled ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded border text-xs font-bold font-mono ${METHOD_STYLES[route.method as HttpMethod] ?? "bg-zinc-700 text-zinc-300"}`}
                    >
                      {route.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-100">
                    {route.path}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(route.tags ?? []).map((t) => (
                        <span
                          key={t}
                          className="inline-block px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        route.status_code >= 500
                          ? "text-red-400"
                          : route.status_code >= 400
                            ? "text-amber-400"
                            : route.status_code >= 300
                              ? "text-blue-400"
                              : "text-emerald-400"
                      }`}
                    >
                      {route.status_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                    {serverRunning ? (
                      <span className="text-zinc-400">
                        http://127.0.0.1:{port}
                        {route.path}
                      </span>
                    ) : (
                      <span className="text-zinc-700">server stopped</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(route)}
                        className="px-3 py-1 text-xs rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeRoute(route.id)}
                        className="px-3 py-1 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
