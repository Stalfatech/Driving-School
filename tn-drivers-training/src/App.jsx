import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="bg-background-light dark:bg-background-dark 
                    text-slate-900 dark:text-slate-100 
                    antialiased flex h-screen">

      {/* Sidebar */}
      <Sidebar />

      {/* Page Content Area */}
      <div className="flex-1 overflow-y-auto">
        <AppRoutes />
      </div>

    </div>
  );
}

export default App;
