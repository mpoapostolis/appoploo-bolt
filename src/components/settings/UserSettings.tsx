import { useState } from 'react';
import { Save, Bell, Battery, Wifi, Navigation } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import toast from 'react-hot-toast';

export default function UserSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Thresholds
        </h2>

        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4" />
                Battery Level Alert (%)
              </div>
              <span className="text-sm text-gray-500">{localSettings.batteryThreshold}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={localSettings.batteryThreshold}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                batteryThreshold: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Speed Change Alert (knots)
              </div>
              <span className="text-sm text-gray-500">±{localSettings.speedThreshold} knots</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={localSettings.speedThreshold}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                speedThreshold: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Update Interval Alert
              </div>
              <span className="text-sm text-gray-500">{localSettings.updateThreshold} minutes</span>
            </label>
            <input
              type="range"
              min="1"
              max="60"
              value={localSettings.updateThreshold}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                updateThreshold: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
            />
          </div>
        </div>

        <div className="pt-4 border-t dark:border-gray-700">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}