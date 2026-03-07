import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store";

export default function ServerBar() {
  const { serverRunning, port, setPort, startServer, stopServer } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localIps, setLocalIps] = useState<string[]>([]);

  useEffect(() => {
    invoke<string[]>("get_local_ips").then(setLocalIps).catch(() => {});
  }, []);

  const toggle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (serverRunning) {
        await stopServer();
      } else {
        await startServer();
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-cyan-400 tracking-tight">ditto</span>
        <span className="text-xs text-zinc-500 font-mono mt-1">REST mock server</span>
      </div>

      <div className="flex items-center gap-4">
        {error && (
          <span className="text-xs text-red-400 max-w-xs truncate">{error}</span>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">PORT</span>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
            disabled={serverRunning}
            className="w-20 px-2 py-1 text-sm font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-100 disabled:opacity-50 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${serverRunning ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-zinc-600"}`}
          />
          <span className={`text-xs font-medium ${serverRunning ? "text-emerald-400" : "text-zinc-500"}`}>
            {serverRunning ? "Running" : "Stopped"}
          </span>
        </div>

        {serverRunning && localIps.length > 0 && (
          <div className="flex flex-col gap-0.5 border-l border-zinc-700 pl-4">
            {localIps.map((ip) => (
              <span key={ip} className="font-mono text-xs text-zinc-400">
                http://<span className="text-cyan-400">{ip}</span>:{port}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={toggle}
          disabled={loading}
          className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-50 ${
            serverRunning
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40"
              : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/40"
          }`}
        >
          {loading ? "..." : serverRunning ? "Stop" : "Start"}
        </button>
      </div>
    </header>
  );
}
