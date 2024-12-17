import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ship, UserCircle, Moon, Sun, LogOut, CreditCard, Plus, Settings } from "lucide-react";
import { useFleetStore } from "../store/fleetStore";
import NotificationBell from "./notifications/NotificationBell";
import { pb } from "../lib/pocketbase";
import toast from "react-hot-toast";
import ProfileModal from "./ProfileModal";
import { AddTimeModal } from "./AddTimeModal";
import OrderTrackerModal from "./OrderTrackerModal";

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useFleetStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isManagePlanModalOpen, setIsManagePlanModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    try {
      pb.authStore.clear();
      localStorage.removeItem("appoploo-auth");
      window.location.href = "/";
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="h-16 bg-white/90 dark:bg-gray-800/90 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl">
        <div className="h-full w-full px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl
                       shadow-lg shadow-sky-500/20 border border-white/20"
            >
              <Ship className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1
                className="text-xl md:text-2xl font-bold bg-gradient-to-br from-sky-500 to-blue-600 
                         bg-clip-text text-transparent"
              >
                Appoploo
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fleet Management
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationBell />

            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 
                       text-gray-600 dark:text-gray-400 transition-all duration-200"
              >
                <UserCircle className="h-5 w-5" />
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-gray-800 
                             shadow-xl border border-gray-200/50 dark:border-gray-700/50 
                             backdrop-blur-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsOrderModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                                 bg-gradient-to-br from-sky-500/10 to-blue-600/10 dark:from-sky-500/20 dark:to-blue-600/20
                                 text-sky-700 dark:text-sky-300 hover:from-sky-500/20 hover:to-blue-600/20
                                 dark:hover:from-sky-500/30 dark:hover:to-blue-600/30
                                 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span className="font-medium">Order New Tracker</span>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-sky-500/20 dark:bg-sky-500/30 
                                    flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    </div>

                    <div className="p-2 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50
                                 transition-all duration-200 group"
                      >
                        <Settings className="h-4 w-4 group-hover:rotate-45 transition-transform" />
                        <span>Profile Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsManagePlanModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50
                                 transition-all duration-200 group"
                      >
                        <CreditCard className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span>Manage Plan</span>
                      </button>

                      <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50
                                 transition-all duration-200 group"
                      >
                        {isDarkMode ? (
                          <Sun className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                        ) : (
                          <Moon className="h-4 w-4 group-hover:-rotate-90 transition-transform" />
                        )}
                        <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                      </button>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg
                                 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10
                                 transition-all duration-200 group"
                      >
                        <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isProfileModalOpen && (
          <ProfileModal
            key="profile-modal"
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}
        {isManagePlanModalOpen && (
          <AddTimeModal
            key="add-time-modal"
            isOpen={isManagePlanModalOpen}
            onClose={() => setIsManagePlanModalOpen(false)}
          />
        )}
        {isOrderModalOpen && (
          <OrderTrackerModal
            key="order-modal"
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
