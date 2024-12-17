import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ship, UserCircle, Moon, Sun, LogOut, CreditCard } from "lucide-react";
import { useFleetStore } from "../store/fleetStore";
import NotificationBell from "./notifications/NotificationBell";
import { pb } from "../lib/pocketbase";
import toast from "react-hot-toast";
import ProfileModal from "./ProfileModal";
import { AddTimeModal } from "./AddTimeModal";

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useFleetStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isManagePlanModalOpen, setIsManagePlanModalOpen] = useState(false);
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 
                             shadow-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50
                                 transition-colors duration-200"
                      >
                        <UserCircle className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsManagePlanModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50
                                 transition-colors duration-200"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Manage Plan</span>
                      </button>

                      <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50
                                 transition-colors duration-200"
                      >
                        {isDarkMode ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                        <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg
                                 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10
                                 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4" />
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
      </AnimatePresence>
    </header>
  );
}
