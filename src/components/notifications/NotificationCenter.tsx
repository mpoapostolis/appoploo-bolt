import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertCircle, Info, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import { useState } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { useFleetStore } from '../../store/fleetStore';
import { Menu } from '@headlessui/react';

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Info className="h-5 w-5 text-primary-500" />;
  }
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | string>('all');
  const { notifications, clearNotification } = useNotificationStore();
  const { fleets, selectedFleetId } = useFleetStore();
  
  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.vesselId === filter
  );

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 
                   hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors relative"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs 
                       rounded-full flex items-center justify-center font-medium"
          >
            {notifications.length}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-96 max-h-[80vh] glass-panel rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700">
                      <Filter className="h-4 w-4" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-lg">
                      <div className="py-1">
                        <Menu.Item>
                          <button
                            onClick={() => setFilter('all')}
                            className={`${
                              filter === 'all' ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : ''
                            } flex w-full items-center px-4 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-800`}
                          >
                            All Notifications
                          </button>
                        </Menu.Item>
                        {fleets.map((fleet) => (
                          <Menu.Item key={fleet.id}>
                            <button
                              onClick={() => setFilter(fleet.id)}
                              className={`${
                                filter === fleet.id ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : ''
                              } flex w-full items-center px-4 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-800`}
                            >
                              {fleet.name}
                            </button>
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Menu>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-surface-400 mx-auto mb-4" />
                    <p className="text-surface-500">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-200 dark:divide-surface-700">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 hover:bg-surface-100 dark:hover:bg-surface-800/50"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <NotificationIcon type={notification.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
                              {notification.message}
                            </p>
                            <p className="mt-2 text-xs text-surface-500">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={() => clearNotification(notification.id)}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}