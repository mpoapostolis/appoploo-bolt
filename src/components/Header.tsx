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
      window.location.href = '/'; // This will trigger a page reload and redirect to login
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="h-full w-full px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl"
            >
              <Ship className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Appoploo
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <NotificationBell />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                       text-gray-600 dark:text-gray-400 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                       text-gray-600 dark:text-gray-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}