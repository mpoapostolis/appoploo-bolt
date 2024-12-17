import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useFleetStore } from "../store/fleetStore";
import { VesselMap } from "../components/Map";
import Header from "../components/Header";
import { motion } from "framer-motion";

function App() {
  const { isDarkMode } = useFleetStore();

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

        <main className="h-full w-full pt-16">
          <VesselMap />
        </main>
      </div>
    </div>
  );
}

export default App;
