import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, Filter, Search, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../hooks/useNotifications';
import { useFleets } from '../../hooks/useFleets';

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'error':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

export default function NotificationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { fleets } = useFleets();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFleet, setSelectedFleet] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = selectedType === 'all' || notification.type === selectedType;
      const matchesFleet = selectedFleet === 'all' || notification.tracker_id === selectedFleet;
      const matchesSearch = notification.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesFleet && matchesSearch;
    });
  }, [notifications, selectedType, selectedFleet, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl 
                       shadow-2xl flex flex-col overflow-hidden border border-gray-200/50 
                       dark:border-gray-700/50 relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Notifications
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </motion.button>
                </div>

                {/* Search and Filters */}
                <div className="mt-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search notifications..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl
                               border-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm
                               border-none focus:ring-2 focus:ring-primary flex-1"
                    >
                      <option value="all">All Types</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="success">Success</option>
                    </select>

                    <select
                      value={selectedFleet}
                      onChange={(e) => setSelectedFleet(e.target.value)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm
                               border-none focus:ring-2 focus:ring-primary flex-1"
                    >
                      <option value="all">All Fleets</option>
                      {fleets?.map(fleet => (
                        <option key={fleet.id} value={fleet.id}>{fleet.name}</option>
                      ))}
                    </select>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => markAllAsRead()}
                      className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary
                               rounded-lg text-sm font-medium hover:bg-primary/20 
                               dark:hover:bg-primary/30 transition-colors
                               flex items-center space-x-2 whitespace-nowrap"
                    >
                      <Check className="h-4 w-4" />
                      <span>Mark all read</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <Bell className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${
                        notification.read
                          ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50'
                          : 'bg-white dark:bg-gray-800 border-primary/20'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {notification.text}
                          </p>
                          <div className="mt-1.5 flex items-center space-x-2">
                            {notification.expand?.tracker_id && (
                              <span className="text-xs font-medium text-primary">
                                {notification.expand.tracker_id.name}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(notification.created), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        {!notification.read && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAsRead(notification.id)}
                            className="flex-shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 
                                     rounded-full transition-colors"
                          >
                            <Check className="h-4 w-4 text-primary" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}