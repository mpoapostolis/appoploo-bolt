import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Menu } from "lucide-react";
import { useFleetStore } from "../store/fleetStore";
import VesselMap from "../components/Map";
import VesselDetails from "../components/VesselDetails";
import Header from "../components/Header";
import VesselList from "../components/dashboard/VesselList";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const { isDarkMode, isSidebarOpen, toggleSidebar } = useFleetStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="h-full w-full bg-gray-50 dark:bg-gray-900">
        <Toaster
          position="top-right"
          toastOptions={{
            className: "glass-panel !bg-white dark:!bg-gray-800",
            duration: 5000,
          }}
        />
        <Header />

        <main className="h-full w-full pt-16 flex flex-col md:flex-row relative">
          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="md:hidden fixed bottom-6 right-6 z-50 p-3.5 bg-primary text-white rounded-full shadow-lg"
          >
            <Menu className="h-6 w-6" />
          </motion.button>

          {/* Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleSidebar}
                className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <div
            className={`fixed md:relative w-80 lg:w-96 h-full bg-white dark:bg-gray-800 border-r 
                        border-gray-200 dark:border-gray-700 shadow-xl md:shadow-none z-50 md:z-0
                        transition-transform duration-300 ease-in-out
                        ${
                          isSidebarOpen || window.innerWidth >= 768
                            ? "translate-x-0"
                            : "-translate-x-full"
                        }`}
          >
            <div className="h-full overflow-y-auto p-4">
              <VesselList />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative">
            <VesselMap />
            <VesselDetails />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
