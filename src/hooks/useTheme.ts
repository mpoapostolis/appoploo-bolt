import { useFleetStore } from "@/store/fleetStore";

export const useTheme = () => {
  const isDarkTheme = useFleetStore((state) => state.isDarkMode);
  
  return {
    isDarkTheme,
  };
};
