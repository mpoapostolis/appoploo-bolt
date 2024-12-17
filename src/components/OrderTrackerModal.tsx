import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { pb } from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderTrackerModal({
  isOpen,
  onClose,
}: OrderTrackerModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        user_id: pb.authStore.model?.id,
        quantity: parseInt(formData.get("quantity") as string),
        postal_code: formData.get("postalCode"),
        address: formData.get("address"),
        phone: formData.get("phone"),
        additional: formData.get("message"),
      };

      // Create the order
      await pb.collection("orders").create(data);

      // Notify purchase
      await fetch("/api/notify-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail: pb.authStore.model?.email,
          vesselNumbers: parseInt(formData.get("quantity") as string), // Using order ID as vessel number
          planId: "basic_plan",
          msg: formData.get("message"),
        }),
      });

      toast.success("Order request sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to submit order request");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Order a Tracker
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              required
              defaultValue={pb.authStore.model?.phone}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              required
              defaultValue={pb.authStore.model?.address}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              required
              defaultValue={pb.authStore.model?.postalCode}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              required
              defaultValue={1}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Message
            </label>
            <textarea
              name="message"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-br from-sky-500 to-blue-600 
                     text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit Order Request"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
