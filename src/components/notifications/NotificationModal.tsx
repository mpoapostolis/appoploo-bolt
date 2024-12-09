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
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl">
                        <Bell className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center font-medium">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
                          Notifications
                        </Dialog.Title>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Stay updated with your fleet
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => markAllAsRead()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Mark all as read
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedType('all')}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          selectedType === 'all'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSelectedType('unread')}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          selectedType === 'unread'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        Unread {unreadCount > 0 && (
                          <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                  <AnimatePresence>
                    {!notifications ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-8 text-center"
                      >
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mx-auto h-8 w-8 rounded-full border-2 border-gray-200 border-t-blue-500"
                        />
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                      </motion.div>
                    ) : filteredNotifications.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8 text-center"
                      >
                        <Bell className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                          No notifications
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {searchQuery
                            ? 'Try adjusting your search or filters'
                            : `You're all caught up!`}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredNotifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleNotificationClick(notification)}
                            className={`group p-6 cursor-pointer transition-all ${
                              getNotificationStyle(notification.type)
                            } ${
                              notification.read
                                ? 'opacity-75'
                                : 'opacity-100 shadow-lg'
                            } hover:opacity-100 hover:shadow-xl`}
                          >
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className={`p-2.5 rounded-xl ${
                                  notification.type === 'error' ? 'bg-red-100 dark:bg-red-500/20' :
                                  notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-500/20' :
                                  notification.type === 'success' ? 'bg-green-100 dark:bg-green-500/20' :
                                  'bg-blue-100 dark:bg-blue-500/20'
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                      {notification.text}
                                    </p>
                                    {notification.tracker_id && (
                                      <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        Fleet {notification.tracker_id}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <time className="text-xs text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
                                      {format(new Date(notification.created), 'MMM d, h:mm a')}
                                    </time>
                                    {!notification.read && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white shadow-sm">
                                        New
                                      </span>
                                    )}
                                  </div>
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