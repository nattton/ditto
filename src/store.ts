import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RouteConfig {
  id: string;
  method: HttpMethod;
  path: string;
  status_code: number;
  response_body: string;
  headers: Record<string, string>;
}

interface DittoStore {
  routes: RouteConfig[];
  serverRunning: boolean;
  port: number;
  fetchRoutes: () => Promise<void>;
  addRoute: (route: RouteConfig) => Promise<void>;
  removeRoute: (id: string) => Promise<void>;
  startServer: () => Promise<void>;
  stopServer: () => Promise<void>;
  setPort: (port: number) => void;
}

export const useStore = create<DittoStore>((set, get) => ({
  routes: [],
  serverRunning: false,
  port: 8080,

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

  startServer: async () => {
    await invoke("start_server", { port: get().port });
    set({ serverRunning: true });
  },

  stopServer: async () => {
    await invoke("stop_server");
    set({ serverRunning: false });
  },

  setPort: (port) => set({ port }),
}));
