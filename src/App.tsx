import { useState, useEffect } from "react";
import { useStore, RouteConfig } from "./store";
import ServerBar from "./components/ServerBar";
import RouteList from "./components/RouteList";
import RouteModal from "./components/RouteModal";
import ImportModal from "./components/ImportModal";

function App() {
  const { fetchRoutes, exportRoutes, theme } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteConfig | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const openAdd = () => {
    setEditingRoute(null);
    setModalOpen(true);
  };

  const openEdit = (route: RouteConfig) => {
    setEditingRoute(route);
    setModalOpen(true);
  };

  const handleExport = async () => {
    const json = await exportRoutes();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ditto-routes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <ServerBar />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            Mock Routes
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportOpen(true)}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-sm font-semibold hover:bg-zinc-700 transition-colors"
            >
              Import
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-sm font-semibold hover:bg-zinc-700 transition-colors"
            >
              Export
            </button>
            <button
              onClick={openAdd}
              className="px-4 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
            >
              + Add Route
            </button>
          </div>
        </div>

        <RouteList onEdit={openEdit} />
      </main>

      {modalOpen && (
        <RouteModal route={editingRoute} onClose={() => setModalOpen(false)} />
      )}
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}

export default App;
