import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  AlertCircle,
  Filter,
  CheckCircle,
  AlertTriangle,
  Info,
  Search,
  MoreVertical,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { useNotifications } from "../../hooks/useNotifications";
import { useFleets } from "../../hooks/useFleets";

interface NotificationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function NotificationModal({
  isOpen,
  setIsOpen,
}: NotificationModalProps) {
  const [selectedType, setSelectedType] = useState<"all" | "unread">("all");
  const [selectedFleet, setSelectedFleet] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { fleets } = useFleets();

  // Create a map of fleet IDs to fleet names for quick lookup
  const fleetMap = new Map(fleets.map((fleet) => [fleet.id, fleet.name]));

  const filteredNotifications = [...(notifications || [])]
    .sort((a, b) => {
      // First sort by read status (unread first)
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      // Then sort by date (newest first)
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    })
    .filter((notification) => {
      const matchesType =
        selectedType === "all" ||
        (selectedType === "unread" && !notification.read);
      const matchesFleet =
        !selectedFleet || notification.tracker_id === selectedFleet;
      const matchesSearch =
        !searchQuery ||
        notification.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesFleet && matchesSearch;
    });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  // Get unique fleet IDs from notifications and map them to names
  const uniqueFleets = Array.from(
    new Set(notifications?.map((n) => n.tracker_id).filter(Boolean) || [])
  ).map((fleetId) => ({
    id: fleetId,
    name: fleetMap.get(fleetId) || fleetId,
  }));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 dark:bg-red-500/10 border-l-4 border-l-red-500";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-l-yellow-500";
      case "success":
        return "bg-green-50 dark:bg-green-500/10 border-l-4 border-l-green-500";
      default:
        return "bg-blue-50 dark:bg-blue-500/10 border-l-4 border-l-blue-500";
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
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
          <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2"
                  >
                    <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Stay updated with your fleet
                      </p>
                    </div>
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-xl">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedType("all")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedType === "all"
                            ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                            : "hover:bg-white dark:hover:bg-gray-800"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSelectedType("unread")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedType === "unread"
                            ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                            : "hover:bg-white dark:hover:bg-gray-800"
                        }`}
                      >
                        Unread
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative">
                        <select
                          value={selectedFleet || ""}
                          onChange={(e) =>
                            setSelectedFleet(
                              e.target.value === "" ? null : e.target.value
                            )
                          }
                          className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 pr-8 transition-colors"
                        >
                          <option value="">All Trackers</option>
                          {uniqueFleets.map((fleet) => (
                            <option key={fleet.id} value={fleet.id}>
                              {fleet.name}
                            </option>
                          ))}
                        </select>
                        <Filter className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Notifications list */}
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                    <AnimatePresence>
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group hover:shadow-md ${
                            !notification.read
                              ? "bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-500/20"
                              : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50"
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          {!notification.read && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                          )}
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div
                                className={`p-2 rounded-lg transition-colors ${
                                  !notification.read
                                    ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm transition-colors ${
                                  !notification.read
                                    ? "font-medium text-gray-900 dark:text-white"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {notification.text}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
                                    !notification.read
                                      ? "bg-blue-500/5 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  {format(
                                    new Date(notification.created),
                                    "MMM d, yyyy HH:mm"
                                  )}
                                </span>
                                {notification.tracker_id && (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
                                      !notification.read
                                        ? "bg-blue-500/5 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    <Bell className="w-3.5 h-3.5" />
                                    {fleetMap.get(notification.tracker_id) ||
                                      notification.tracker_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredNotifications.length === 0 && (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                          <Bell className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          No notifications
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedType === "unread"
                            ? "No unread notifications"
                            : "You're all caught up!"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
