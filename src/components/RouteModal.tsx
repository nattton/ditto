import { useState, useEffect, KeyboardEvent } from "react";
import { useStore, RouteConfig, HttpMethod } from "../store";

const METHODS: HttpMethod[] = ["ANY", "GET", "POST", "PUT", "PATCH", "DELETE"];

interface HeaderRow {
  key: string;
  value: string;
}

interface Props {
  route: RouteConfig | null;
  onClose: () => void;
}

export default function RouteModal({ route, onClose }: Props) {
  const { addRoute, removeRoute } = useStore();

  const [method, setMethod] = useState<HttpMethod>("GET");
  const [path, setPath] = useState("/");
  const [statusCode, setStatusCode] = useState(200);
  const [responseBody, setResponseBody] = useState('{\n  "message": "ok"\n}');
  const [headerRows, setHeaderRows] = useState<HeaderRow[]>([
    { key: "Content-Type", value: "application/json" },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [delayMs, setDelayMs] = useState(0);

  useEffect(() => {
    if (route) {
      setMethod(route.method as HttpMethod);
      setPath(route.path);
      setStatusCode(route.status_code);
      setResponseBody(route.response_body);
      setHeaderRows(
        Object.entries(route.headers).map(([key, value]) => ({ key, value })),
      );
      setTags(route.tags ?? []);
      setDelayMs(route.delay_ms ?? 0);
    }
  }, [route]);

  const commitTag = () => {
    const trimmed = tagInput.trim().replace(/,+$/, "").trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTag();
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (t: string) =>
    setTags((prev) => prev.filter((x) => x !== t));

  const addHeaderRow = () =>
    setHeaderRows((prev) => [...prev, { key: "", value: "" }]);

  const removeHeaderRow = (i: number) =>
    setHeaderRows((prev) => prev.filter((_, idx) => idx !== i));

  const updateHeaderRow = (i: number, field: "key" | "value", val: string) =>
    setHeaderRows((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)),
    );

  const save = async () => {
    const headers: Record<string, string> = {};
    for (const { key, value } of headerRows) {
      if (key.trim()) headers[key.trim()] = value;
    }

    const newRoute: RouteConfig = {
      id: route?.id ?? crypto.randomUUID(),
      method,
      path,
      status_code: statusCode,
      response_body: responseBody,
      headers,
      enabled: route?.enabled ?? true,
      tags,
      delay_ms: delayMs,
    };

    if (route) {
      await removeRoute(route.id);
    }
    await addRoute(newRoute);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">
            {route ? "Edit Route" : "Add Route"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Method + Path */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-sm focus:outline-none focus:border-cyan-500"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-zinc-500">Path</label>
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/api/users"
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-sm font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex flex-col gap-1 w-24">
              <label className="text-xs text-zinc-500">Status</label>
              <input
                type="number"
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-sm font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex flex-col gap-1 w-28">
              <label className="text-xs text-zinc-500">Delay (ms)</label>
              <input
                type="number"
                min={0}
                value={delayMs}
                onChange={(e) =>
                  setDelayMs(Math.max(0, Number(e.target.value)))
                }
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-sm font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Response Body */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Response Body</label>
            <textarea
              value={responseBody}
              onChange={(e) => setResponseBody(e.target.value)}
              rows={6}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-sm font-mono resize-none focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-500">Tags</label>
            <div className="flex flex-wrap gap-1.5 min-h-[2rem] px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded focus-within:border-cyan-500">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-medium"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-violet-400 hover:text-red-400 leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={commitTag}
                placeholder={
                  tags.length === 0 ? "Add tags… (Enter or comma)" : ""
                }
                className="flex-1 min-w-[8rem] bg-transparent text-zinc-100 text-xs outline-none placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Headers */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-500">Headers</label>
              <button
                onClick={addHeaderRow}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                + Add
              </button>
            </div>
            {headerRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={row.key}
                  onChange={(e) => updateHeaderRow(i, "key", e.target.value)}
                  placeholder="Key"
                  className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
                <input
                  value={row.value}
                  onChange={(e) => updateHeaderRow(i, "value", e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => removeHeaderRow(i)}
                  className="text-zinc-600 hover:text-red-400 text-lg leading-none px-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 text-sm rounded bg-cyan-500 text-zinc-950 font-semibold hover:bg-cyan-400 transition-colors"
          >
            {route ? "Save Changes" : "Add Route"}
          </button>
        </div>
      </div>
    </div>
  );
}
