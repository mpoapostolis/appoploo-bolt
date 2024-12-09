import { Moon, Sun, LogOut, Ship } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFleetStore } from '../store/fleetStore';
import NotificationBell from './notifications/NotificationBell';
import { pb } from '../lib/pocketbase';
import toast from 'react-hot-toast';

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useFleetStore();

  const handleLogout = () => {
    try {
      pb.authStore.clear();
      localStorage.removeItem('appoploo-auth');
      window.location.href = '/';
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
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
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-br from-sky-500 to-blue-600 
                         bg-clip-text text-transparent">
                Appoploo
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fleet Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationBell />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 
                       text-gray-600 dark:text-gray-400 transition-all duration-200
                       hover:bg-gray-200 dark:hover:bg-gray-700 
                       border border-gray-200/50 dark:border-gray-600/50
                       shadow-sm hover:shadow-md"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600
                       text-white transition-all duration-200
                       shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30
                       border border-white/20"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}