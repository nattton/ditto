import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store";

function CopyIpButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title={`Copy ${url}`}
      className="ml-1 p-0.5 rounded text-zinc-600 hover:text-cyan-400 transition-colors"
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
          />
        </svg>
      )}
    </button>
  );
}

export default function ServerBar() {
  const {
    serverRunning,
    port,
    setPort,
    startServer,
    stopServer,
    theme,
    toggleTheme,
  } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localIps, setLocalIps] = useState<string[]>([]);

  useEffect(() => {
    const fetchIps = () => {
      invoke<string[]>("get_local_ips")
        .then(setLocalIps)
        .catch(() => {});
    };
    fetchIps();
    const interval = setInterval(fetchIps, 5000);
    return () => clearInterval(interval);
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
        <span className="text-2xl font-bold text-cyan-400 tracking-tight">
          ditto
        </span>
        <span className="text-xs text-zinc-500 font-mono mt-1">
          REST mock server
        </span>
      </div>

      <div className="flex items-center gap-4">
        {error && (
          <span className="text-xs text-red-400 max-w-xs truncate">
            {error}
          </span>
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
          <span
            className={`text-xs font-medium ${serverRunning ? "text-emerald-400" : "text-zinc-500"}`}
          >
            {serverRunning ? "Running" : "Stopped"}
          </span>
        </div>

        {serverRunning && localIps.length > 0 && (
          <div className="flex flex-col gap-0.5 border-l border-zinc-700 pl-4">
            {localIps.map((ip) => {
              const url = `http://${ip}:${port}`;
              return (
                <span
                  key={ip}
                  className="flex items-center font-mono text-xs text-zinc-400"
                >
                  http://<span className="text-cyan-400">{ip}</span>:{port}
                  <CopyIpButton url={url} />
                </span>
              );
            })}
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

        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          {theme === "dark" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
