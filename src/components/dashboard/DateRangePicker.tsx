import { useState } from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import { Menu } from "@headlessui/react";
import { useFleetStore } from "../../store/fleetStore";

export default function DateRangePicker() {
  const { dateRange, setDateRange } = useFleetStore();
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: "Last 24 hours", days: 1 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
  ];

  const handlePresetClick = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange(start, end);
    setIsOpen(false);
  };

  const clearDateRange = () => {
    setDateRange(null, null);
    setIsOpen(false);
  };

  return (
    <Menu as="div" className="relative w-full">
      <Menu.Button
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 
                             rounded-lg border border-gray-200 dark:border-gray-700 
                             hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {dateRange.start && dateRange.end
              ? `${format(dateRange.start, "MMM d, yyyy")} - ${format(
                  dateRange.end,
                  "MMM d, yyyy"
                )}`
              : "Select date range"}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      </Menu.Button>

      <Menu.Items
        className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg 
                           border border-gray-200 dark:border-gray-700 shadow-lg divide-y 
                           divide-gray-100 dark:divide-gray-700"
      >
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-medium text-primary">
            Quick select
          </div>
          {presets.map((preset) => (
            <Menu.Item key={preset.days}>
              {({ active }) => (
                <button
                  onClick={() => handlePresetClick(preset.days)}
                  className={`${
                    active
                      ? "bg-primary/5 dark:bg-primary/10 text-primary"
                      : "text-gray-700 dark:text-gray-300"
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                >
                  {preset.label}
                </button>
              )}
            </Menu.Item>
          ))}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={clearDateRange}
                className={`${
                  active
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300"
                } group flex w-full items-center rounded-md px-3 py-2 text-sm 
                  border-t border-gray-200 dark:border-gray-700 mt-2`}
              >
                Clear selection
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
