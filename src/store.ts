import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "ANY";

export interface RouteConfig {
  id: string;
  method: HttpMethod;
  path: string;
  status_code: number;
  response_body: string;
  headers: Record<string, string>;
  enabled: boolean;
  tags: string[];
  delay_ms: number;
}

export interface RequestLog {
  id: number;
  timestamp_ms: number;
  method: string;
  path: string;
  status_code: number;
  matched: boolean;
  route_id: string | null;
  duration_ms: number;
}

interface DittoStore {
  routes: RouteConfig[];
  serverRunning: boolean;
  port: number;
  theme: "dark" | "light";
  requestLogs: RequestLog[];
  toggleTheme: () => void;
  fetchRoutes: () => Promise<void>;
  addRoute: (route: RouteConfig) => Promise<void>;
  removeRoute: (id: string) => Promise<void>;
  toggleRoute: (id: string) => Promise<void>;
  duplicateRoute: (id: string) => Promise<void>;
  exportRoutes: () => Promise<string>;
  importRoutes: (routes: RouteConfig[]) => Promise<void>;
  startServer: () => Promise<void>;
  stopServer: () => Promise<void>;
  setPort: (port: number) => void;
  fetchRequestLogs: () => Promise<void>;
  clearRequestLogs: () => Promise<void>;
}

export const useStore = create<DittoStore>((set, get) => ({
  routes: [],
  serverRunning: false,
  port: Number(localStorage.getItem("port") ?? 8080),
  theme: (localStorage.getItem("theme") as "dark" | "light") ?? "dark",
  requestLogs: [],

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    set({ theme: next });
  },
  fetchRoutes: async () => {
    const routes = await invoke<RouteConfig[]>("get_routes");
    set({ routes });
  },

  addRoute: async (route) => {
    await invoke("add_route", { route });
    get().fetchRoutes();
  },

  removeRoute: async (id) => {
    await invoke("remove_route", { id });
    get().fetchRoutes();
  },

  toggleRoute: async (id) => {
    const { routes } = get();
    const target = routes.find((r) => r.id === id);
    if (!target) return;

    const newEnabled = !target.enabled;
    const updates: RouteConfig[] = [];

    // If enabling, disable others with the same path AND conflicting method
    // (same method, or either side is ANY) so only one wins per effective method+path
    if (newEnabled) {
      for (const r of routes) {
        if (
          r.id !== id &&
          r.path === target.path &&
          r.enabled &&
          (r.method === target.method ||
            r.method === "ANY" ||
            target.method === "ANY")
        ) {
          updates.push({ ...r, enabled: false });
        }
      }
    }

    updates.push({ ...target, enabled: newEnabled });

    for (const r of updates) {
      await invoke("add_route", { route: r });
    }
    get().fetchRoutes();
  },

  exportRoutes: async () => {
    return await invoke<string>("export_routes");
  },

  duplicateRoute: async (id) => {
    const { routes } = get();
    const target = routes.find((r) => r.id === id);
    if (!target) return;
    const copy: RouteConfig = {
      ...target,
      id: crypto.randomUUID(),
      enabled: false,
    };
    await invoke("add_route", { route: copy });
    get().fetchRoutes();
  },

  importRoutes: async (routes) => {
    await invoke("import_routes", { routes });
    get().fetchRoutes();
  },

  startServer: async () => {
    await invoke("start_server", { port: get().port });
    set({ serverRunning: true });
  },

  stopServer: async () => {
    await invoke("stop_server");
    set({ serverRunning: false });
  },

  setPort: (port) => {
    localStorage.setItem("port", String(port));
    set({ port });
  },

  fetchRequestLogs: async () => {
    const requestLogs = await invoke<RequestLog[]>("get_request_logs");
    set({ requestLogs });
  },

  clearRequestLogs: async () => {
    await invoke("clear_request_logs");
    set({ requestLogs: [] });
  },
}));
