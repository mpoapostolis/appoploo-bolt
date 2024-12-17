import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertCircle, Filter, CheckCircle, AlertTriangle, Info, Search, MoreVertical, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '../ui/switch';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function NotificationModal({ isOpen, setIsOpen }: NotificationModalProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'unread'>('all');
  const [selectedFleet, setSelectedFleet] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const filteredNotifications = [...(notifications || [])]
    .sort((a, b) => {
      // First sort by read status (unread first)
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      // Then sort by date (newest first)
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    })
    .filter(notification => {
      const matchesType = selectedType === 'all' || (selectedType === 'unread' && !notification.read);
      const matchesFleet = !selectedFleet || notification.tracker_id === selectedFleet;
      const matchesSearch = !searchQuery || notification.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesFleet && matchesSearch;
    });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const fleets = Array.from(new Set(notifications?.map(n => n.tracker_id).filter(Boolean) || []));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-500/10 border-l-4 border-l-red-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-l-yellow-500';
      case 'success':
        return 'bg-green-50 dark:bg-green-500/10 border-l-4 border-l-green-500';
      default:
        return 'bg-blue-50 dark:bg-blue-500/10 border-l-4 border-l-blue-500';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Add any additional click handling here
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-[9999]" 
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full sm:max-w-2xl h-full sm:h-auto transform 
                                   sm:rounded-2xl bg-white/90 dark:bg-gray-800/90 shadow-2xl 
                                   transition-all backdrop-blur-xl border-0 sm:border 
                                   sm:border-gray-200/50 sm:dark:border-gray-700/50">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50
                            bg-gradient-to-br from-sky-500/10 to-blue-600/10 
                            dark:from-sky-500/20 dark:to-blue-600/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-sky-500 to-blue-600 
                                  rounded-xl shadow-lg shadow-sky-500/20 border border-white/20">
                        <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-[10px] sm:text-xs 
                                       bg-gradient-to-br from-red-500 to-rose-600
                                       text-white rounded-full flex items-center justify-center 
                                       font-medium border border-white/20 shadow-lg">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div>
                        <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                          Notifications
                        </Dialog.Title>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                          Stay updated with your fleet
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {unreadCount > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => markAllAsRead()}
                          className="hidden sm:block px-4 py-2 text-sm font-medium rounded-lg
                                 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 
                                 dark:hover:bg-gray-700 transition-all duration-200
                                 text-gray-700 dark:text-gray-200 hover:text-sky-600 
                                 dark:hover:text-sky-400 border border-gray-200/50 
                                 dark:border-gray-600/50"
                        >
                          Mark all as read
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-500 dark:text-gray-400 transition-all duration-200 
                               rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 
                               dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-600/50"
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md
                                  bg-gray-100 dark:bg-gray-800">
                        <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200/50 
                               dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 
                               text-sm text-gray-900 dark:text-white placeholder-gray-500 
                               dark:placeholder-gray-400 focus:outline-none focus:ring-2 
                               focus:ring-sky-500/50 dark:focus:ring-sky-400/50
                               backdrop-blur-sm transition-all"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedType('all')}
                        className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium 
                                transition-all duration-200
                                ${selectedType === 'all'
                                  ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 border border-white/20'
                                  : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50'
                                }`}
                      >
                        All Notifications
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedType('unread')}
                        className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium 
                                transition-all duration-200
                                ${selectedType === 'unread'
                                  ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 border border-white/20'
                                  : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50'
                                }`}
                      >
                        Unread 
                        {unreadCount > 0 && (
                          <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-[10px] sm:text-xs border border-white/20">
                            {unreadCount}
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Mobile Mark All as Read */}
                {unreadCount > 0 && (
                  <div className="sm:hidden p-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => markAllAsRead()}
                      className="w-full px-4 py-2.5 text-sm font-medium rounded-lg
                             bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 
                             dark:hover:bg-gray-700 transition-all duration-200
                             text-gray-700 dark:text-gray-200 hover:text-sky-600 
                             dark:hover:text-sky-400 border border-gray-200/50 
                             dark:border-gray-600/50"
                    >
                      Mark all as read
                    </motion.button>
                  </div>
                )}

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-[calc(100vh-280px)] sm:max-h-[60vh]">
                  <AnimatePresence>
                    {!notifications ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6 sm:p-8 text-center"
                      >
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mx-auto h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-gray-200/50 
                                 border-t-sky-500 shadow-lg"
                        />
                        <p className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Loading notifications...
                        </p>
                      </motion.div>
                    ) : filteredNotifications.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8 sm:p-12 text-center"
                      >
                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br 
                                    from-sky-500/10 to-blue-600/10 dark:from-sky-500/20 
                                    dark:to-blue-600/20 flex items-center justify-center
                                    border border-sky-500/20 shadow-lg shadow-sky-500/10">
                          <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-sky-500 dark:text-sky-400" />
                        </div>
                        <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                          No notifications
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {searchQuery
                            ? 'Try adjusting your search or filters'
                            : `You're all caught up! Check back later for updates.`}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        {filteredNotifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleNotificationClick(notification)}
                            className={`group p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200
                                    backdrop-blur-sm
                                    ${notification.read
                                      ? 'bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50'
                                      : 'bg-gradient-to-br from-sky-500/5 to-blue-600/5 dark:from-sky-500/10 dark:to-blue-600/10 border-sky-500/50 dark:border-sky-500/30'
                                    } hover:shadow-lg hover:scale-[1.01]`}
                          >
                            <div className="flex gap-3 sm:gap-4">
                              <div className="flex-shrink-0">
                                <div className={`p-2 sm:p-2.5 rounded-xl shadow-sm ${
                                  getNotificationStyle(notification.type)
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm sm:text-base ${
                                  notification.read 
                                    ? 'text-gray-600 dark:text-gray-300' 
                                    : 'text-gray-900 dark:text-white font-medium'
                                }`}>
                                  {notification.text}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(notification.created), 'MMM d, h:mm a')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}