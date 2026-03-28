import { useEffect, useRef, useState } from "react";
import { RequestLog, useStore } from "../store";

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  PATCH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  ANY: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function StatusBadge({ code }: { code: number }) {
  const cls =
    code >= 500
      ? "text-red-400"
      : code >= 400
        ? "text-amber-400"
        : code >= 300
          ? "text-blue-400"
          : "text-emerald-400";
  return (
    <span className={`font-mono text-xs font-semibold ${cls}`}>{code}</span>
  );
}

function CopyBodyButton({ body }: { body: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    let text = body;
    try {
      text = JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      // use raw body
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title='Copy body'
      className='flex items-center gap-1 text-[10px] text-zinc-500 hover:text-cyan-400 transition-colors'
    >
      {copied ? (
        <>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='w-3 h-3 text-emerald-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2.5}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M5 13l4 4L19 7'
            />
          </svg>
          <span className='text-emerald-400'>Copied</span>
        </>
      ) : (
        <>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='w-3 h-3'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <rect x='9' y='9' width='13' height='13' rx='2' ry='2' />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'
            />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function LogRow({ log }: { log: RequestLog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border-b border-zinc-800/60 transition-colors ${log.matched ? "hover:bg-zinc-900" : "hover:bg-zinc-900 opacity-70"}`}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className='w-full flex items-center gap-3 px-4 py-2.5 text-left'
      >
        {/* Time */}
        <span className='text-xs font-mono text-zinc-600 w-16 shrink-0'>
          {formatTime(log.timestamp_ms)}
        </span>

        {/* Method badge */}
        <span
          className={`inline-block px-1.5 py-0.5 rounded border text-xs font-bold font-mono shrink-0 w-16 text-center ${METHOD_STYLES[log.method] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"}`}
        >
          {log.method}
        </span>

        {/* Path */}
        <span className='flex-1 font-mono text-xs text-zinc-200 truncate'>
          {log.path}
        </span>

        {/* Status */}
        <StatusBadge code={log.status_code} />

        {/* Duration */}
        <span className='text-xs font-mono text-zinc-500 w-16 text-right shrink-0'>
          {log.duration_ms}ms
        </span>

        {/* Matched indicator */}
        <span
          className={`text-xs w-16 text-right shrink-0 ${log.matched ? "text-emerald-500" : "text-red-400"}`}
        >
          {log.matched ? "matched" : "404"}
        </span>

        {/* Chevron */}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className={`w-3 h-3 text-zinc-600 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {expanded && (
        <div className='px-4 pb-3 pt-1 bg-zinc-900/50 text-xs font-mono space-y-3'>
          {/* Meta */}
          <div className='space-y-1.5'>
            <div className='flex gap-2'>
              <span className='text-zinc-500 w-24 shrink-0'>Timestamp</span>
              <span className='text-zinc-300'>
                {new Date(log.timestamp_ms).toISOString()}
              </span>
            </div>
            <div className='flex gap-2'>
              <span className='text-zinc-500 w-24 shrink-0'>Method</span>
              <span className='text-zinc-300'>{log.method}</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-zinc-500 w-24 shrink-0'>Path</span>
              <span className='text-zinc-300'>{log.path}</span>
            </div>
            {log.query && (
              <div className='flex gap-2'>
                <span className='text-zinc-500 w-24 shrink-0'>Query</span>
                <span className='text-zinc-300'>{log.query}</span>
              </div>
            )}
            <div className='flex gap-2'>
              <span className='text-zinc-500 w-24 shrink-0'>Status</span>
              <StatusBadge code={log.status_code} />
            </div>
            <div className='flex gap-2'>
              <span className='text-zinc-500 w-24 shrink-0'>Duration</span>
              <span className='text-zinc-300'>{log.duration_ms}ms</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-zinc-500 w-24 shrink-0'>Matched</span>
              <span
                className={log.matched ? "text-emerald-400" : "text-red-400"}
              >
                {log.matched
                  ? `Yes (route: ${log.route_id})`
                  : "No — no route matched"}
              </span>
            </div>
          </div>

          {/* Request Headers */}
          {Object.keys(log.request_headers).length > 0 && (
            <div>
              <p className='text-zinc-500 mb-1 uppercase tracking-wider text-[10px]'>
                Request Headers
              </p>
              <div className='rounded bg-zinc-800 border border-zinc-700 px-3 py-2 space-y-0.5'>
                {Object.entries(log.request_headers).map(([k, v]) => (
                  <div key={k} className='flex gap-2'>
                    <span className='text-cyan-500 shrink-0'>{k}:</span>
                    <span className='text-zinc-300 break-all'>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body */}
          <div>
            <div className='flex items-center justify-between mb-1'>
              <p className='text-zinc-500 uppercase tracking-wider text-[10px]'>
                Request Body
              </p>
              {log.request_body && <CopyBodyButton body={log.request_body} />}
            </div>
            {log.request_body ? (
              <pre className='rounded bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-300 whitespace-pre-wrap break-all overflow-x-auto max-h-48'>
                {(() => {
                  try {
                    return JSON.stringify(
                      JSON.parse(log.request_body),
                      null,
                      2,
                    );
                  } catch {
                    return log.request_body;
                  }
                })()}
              </pre>
            ) : (
              <span className='text-zinc-700 italic'>empty</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export default function RequestLogPanel({ onClose }: Props) {
  const { requestLogs, fetchRequestLogs, clearRequestLogs, serverRunning } =
    useStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchRequestLogs();
    intervalRef.current = setInterval(fetchRequestLogs, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className='fixed inset-0 z-40 flex justify-end'>
      {/* Backdrop */}
      <div className='flex-1 bg-black/40' onClick={onClose} />

      {/* Panel */}
      <div className='w-[640px] max-w-full bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900 shrink-0'>
          <div className='flex items-center gap-3'>
            <h2 className='text-sm font-semibold text-zinc-100'>Request Log</h2>
            <span className='text-xs text-zinc-500 font-mono'>
              {requestLogs.length} request{requestLogs.length !== 1 ? "s" : ""}
            </span>
            {serverRunning && (
              <span className='flex items-center gap-1 text-xs text-emerald-400'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                live
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={clearRequestLogs}
              className='px-3 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors'
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className='text-zinc-500 hover:text-zinc-300 text-xl leading-none ml-1'
            >
              ×
            </button>
          </div>
        </div>

        {/* Column headers */}
        {requestLogs.length > 0 && (
          <div className='flex items-center gap-3 px-4 py-2 bg-zinc-900/60 border-b border-zinc-800 text-zinc-600 text-xs uppercase tracking-wider shrink-0'>
            <span className='w-16 shrink-0'>Time</span>
            <span className='w-16 shrink-0'>Method</span>
            <span className='flex-1'>Path</span>
            <span className='w-10 text-right shrink-0'>Status</span>
            <span className='w-16 text-right shrink-0'>Duration</span>
            <span className='w-16 text-right shrink-0'>Match</span>
            <span className='w-3 shrink-0' />
          </div>
        )}

        {/* Log list */}
        <div className='flex-1 overflow-y-auto'>
          {requestLogs.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 text-zinc-600'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='w-10 h-10 mb-3 text-zinc-700'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z'
                />
              </svg>
              <p className='text-sm font-medium'>No requests yet</p>
              <p className='text-xs mt-1 text-zinc-700'>
                {serverRunning
                  ? "Incoming requests will appear here automatically"
                  : "Start the server to begin capturing requests"}
              </p>
            </div>
          ) : (
            <div>
              {requestLogs.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
