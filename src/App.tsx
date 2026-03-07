import { useState, useEffect } from "react";
import { useStore, RouteConfig } from "./store";
import ServerBar from "./components/ServerBar";
import RouteList from "./components/RouteList";
import RouteModal from "./components/RouteModal";

function App() {
  const { fetchRoutes } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteConfig | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const openAdd = () => {
    setEditingRoute(null);
    setModalOpen(true);
  };

  const openEdit = (route: RouteConfig) => {
    setEditingRoute(route);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <ServerBar />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            Mock Routes
          </h2>
          <button
            onClick={openAdd}
            className="px-4 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
          >
            + Add Route
          </button>
        </div>

        <RouteList onEdit={openEdit} />
      </main>

      {modalOpen && (
        <RouteModal route={editingRoute} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
