import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationModal from './NotificationModal';

export default function NotificationBell() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { notifications } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                 text-gray-600 dark:text-gray-300 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-xs 
                     rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <NotificationModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen}
      />
    </>
  );
}