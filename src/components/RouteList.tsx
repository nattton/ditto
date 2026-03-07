import { useStore, RouteConfig, HttpMethod } from "../store";

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  PATCH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface Props {
  onEdit: (route: RouteConfig) => void;
}

export default function RouteList({ onEdit }: Props) {
  const { routes, removeRoute, serverRunning, port } = useStore();

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
        <div className="text-5xl mb-4">🎭</div>
        <p className="text-lg font-medium">No mock routes yet</p>
        <p className="text-sm mt-1">Click "+ Add Route" to create your first mock</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-900 text-zinc-500 text-xs uppercase tracking-wider">
            <th className="px-4 py-3 text-left">Method</th>
            <th className="px-4 py-3 text-left">Path</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">URL</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {routes.map((route) => (
            <tr key={route.id} className="bg-zinc-950 hover:bg-zinc-900 transition-colors">
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded border text-xs font-bold font-mono ${METHOD_STYLES[route.method as HttpMethod] ?? "bg-zinc-700 text-zinc-300"}`}
                >
                  {route.method}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-zinc-100">{route.path}</td>
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
                    http://127.0.0.1:{port}{route.path}
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
  );
}
