import { Menu } from '@headlessui/react';
import { Filter, ChevronDown } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export default function FleetFilters() {
  const { sortKey, setSortKey } = useFleetStore();

  const sortOptions = [
    { label: 'Last Updated', key: 'updated' },
    { label: 'Battery Level', key: 'battery' },
    { label: 'Speed', key: 'speed' },
  ];

  return (
    <Menu as="div" className="relative w-full">
      <Menu.Button className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 
                             rounded-lg border border-gray-200 dark:border-gray-700 
                             hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm text-gray-700 dark:text-gray-200">Sort & Filter</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      </Menu.Button>

      <Menu.Items className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg 
                           border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Sort by
          </div>
          {sortOptions.map((option) => (
            <Menu.Item key={option.key}>
              {({ active }) => (
                <button
                  onClick={() => setSortKey(option.key)}
                  className={`${
                    active || sortKey === option.key
                      ? 'bg-primary/5 dark:bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-300'
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                >
                  {option.label}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
}