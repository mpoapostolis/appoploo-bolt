import { useState, useRef, useEffect } from "react";
import { Check, X, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { pb } from "../lib/pocketbase";
import { useFleets } from "../hooks/useFleets";

interface EditableVesselNameProps {
  initialName: string;
  vesselId: string;
  className?: string;
}

export function EditableVesselName({ initialName, vesselId, className = "" }: EditableVesselNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useFleets(); // Get the mutate function to refresh the fleet list

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      await pb.collection('trackers').update(vesselId, { name });
      setIsEditing(false);
      mutate(); // Refresh the fleet list
      toast.success("Vessel name updated successfully");
    } catch (error) {
      toast.error("Failed to update vessel name");
      setName(initialName); // Reset to original name on error
    }
  };

  const handleCancel = () => {
    setName(initialName);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-lg font-bold text-gray-900 dark:text-white bg-transparent 
                   border-b border-gray-300 dark:border-gray-600 focus:outline-none 
                   focus:border-primary dark:focus:border-primary px-0"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <button
          onClick={handleSave}
          className="p-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 
                   text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/20 
                   dark:hover:bg-emerald-500/30 transition-colors"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 rounded-lg bg-red-500/10 dark:bg-red-500/20 
                   text-red-500 dark:text-red-400 hover:bg-red-500/20 
                   dark:hover:bg-red-500/30 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 group">
      <h2 className={className}>{name}</h2>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 
                 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 
                 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
