import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, Clock, Ship, Check, Package, Cpu, Anchor } from "lucide-react";
import { useFleetStore } from "../store/fleetStore";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useFleets } from "../hooks/useFleets";
import { createPortal } from "react-dom";
import type { Fleet } from "../types/fleet";
import { formatDistanceToNow, format } from "date-fns";

const stripePromise = loadStripe(
  "pk_test_51IOqNtHsw5wcdFbBgddIAIJIkUDc5z9MbSFSv9b4jDOzX2XVWRrUzkYncHjWUPghObLa3zKgq9uTsNPxKDrz4Tmu00CcHKLgWN"
);

const SUBSCRIPTION_PLANS = [
  {
    id: "monthly",
    name: "1 Month",
    description: "Monthly subscription",
    basePrice: 10,
    duration: "1 month",
    discount: 0,
  },
  {
    id: "yearly",
    name: "12 Months",
    description: "Save €20 per vessel",
    basePrice: 100,
    duration: "12 months",
    discount: 0,
  },
];

// Volume discount tiers
const VOLUME_DISCOUNTS = [
  { min: 5, discount: 10 }, // 10% off for 5+ vessels
  { min: 10, discount: 15 }, // 15% off for 10+ vessels
  { min: 20, discount: 20 }, // 20% off for 20+ vessels
];

interface AddTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTimeModal({ isOpen, onClose }: AddTimeModalProps) {
  const { fleets } = useFleets();

  const [selectedTrackers, setSelectedTrackers] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("yearly");
  const [isLoading, setIsLoading] = useState(false);

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan);
  
  // Calculate volume discount
  const volumeDiscount = useMemo(() => {
    const count = selectedTrackers.length;
    const tier = VOLUME_DISCOUNTS
      .slice()
      .reverse()
      .find(t => count >= t.min);
    return tier?.discount || 0;
  }, [selectedTrackers.length]);

  // Calculate total amount with discounts
  const calculateTotal = useMemo(() => {
    if (!currentPlan || selectedTrackers.length === 0) return { subtotal: 0, discount: 0, total: 0 };

    const subtotal = currentPlan.basePrice * selectedTrackers.length;
    const discountAmount = (subtotal * volumeDiscount) / 100;
    const total = subtotal - discountAmount;

    return {
      subtotal,
      discount: discountAmount,
      total,
    };
  }, [currentPlan, selectedTrackers.length, volumeDiscount]);

  const handleRenewSubscription = async () => {
    if (!currentPlan || selectedTrackers.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: currentPlan.id,
          vesselIds: selectedTrackers,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedTrackers.length === fleets.length) {
      setSelectedTrackers([]);
    } else {
      setSelectedTrackers(fleets.map(fleet => fleet.id));
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          >
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
                          flex flex-col max-h-[90vh] md:max-h-[85vh]">
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 
                            border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl 
                               shadow-lg shadow-primary/20 ring-1 ring-white/10">
                    <Anchor className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Manage Vessels
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Extend subscription for your fleet
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 
                           transition-all duration-200 rounded-lg hover:bg-gray-100 
                           dark:hover:bg-gray-700 active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 lg:overflow-hidden overflow-y-auto">
                <div className="h-full p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Left Side - Vessel Selection */}
                    <div className="lg:col-span-2 flex flex-col h-[40vh] lg:h-[70vh]">
                      <div className="flex-shrink-0 flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/50 
                                    p-4 rounded-xl backdrop-blur-sm mb-4">
                        <div className="flex items-center gap-3">
                          <Ship className="h-5 w-5 text-primary" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            Select Vessels
                          </span>
                          <span className="px-2.5 py-1 bg-primary/10 dark:bg-primary/20 text-primary 
                                       rounded-full text-xs font-medium">
                            {selectedTrackers.length} selected
                          </span>
                        </div>
                        <button
                          onClick={handleSelectAll}
                          className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 
                                   dark:hover:bg-primary/20 rounded-lg transition-all duration-200 
                                   active:scale-95"
                        >
                          {selectedTrackers.length === fleets.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className=" overflow-y-auto min-h-0 pr-2">
                        <div className="grid gap-3">
                          {fleets.map((fleet: Fleet) => (
                            <motion.div
                              key={fleet.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => {
                                if (selectedTrackers.includes(fleet.id)) {
                                  setSelectedTrackers(prev => prev.filter(id => id !== fleet.id));
                                } else {
                                  setSelectedTrackers(prev => [...prev, fleet.id]);
                                }
                              }}
                              className={`group p-4 rounded-xl border transition-all cursor-pointer 
                                      hover:shadow-md dark:hover:shadow-black/20
                                      ${
                                        selectedTrackers.includes(fleet.id)
                                          ? "border-primary/50 dark:border-primary/30 bg-primary/5 dark:bg-primary/10"
                                          : "border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/20"
                                      }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className={`p-2 rounded-lg transition-colors duration-200
                                              ${
                                                selectedTrackers.includes(fleet.id)
                                                  ? "bg-primary/10 dark:bg-primary/20"
                                                  : "bg-gray-100 dark:bg-gray-800"
                                              }`}>
                                    <Ship className={`h-5 w-5 ${
                                      selectedTrackers.includes(fleet.id)
                                        ? "text-primary"
                                        : "text-gray-500 dark:text-gray-400"
                                    }`} />
                                  </div>
                                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {fleet.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Subscription ends:{' '}
                                      {fleet.subscriptionEnds
                                        ? format(new Date(fleet.subscriptionEnds), 'PPP')
                                        : 'No active subscription'}
                                    </span>
                                  </div>
                                </div>
                                <div className={`p-2 rounded-lg transition-colors
                                            ${
                                              selectedTrackers.includes(fleet.id)
                                                ? "bg-primary/10 dark:bg-primary/20"
                                                : "bg-gray-100 dark:bg-gray-800"
                                            }`}>
                                  <Check className={`h-5 w-5 transition-all ${
                                    selectedTrackers.includes(fleet.id)
                                      ? "opacity-100 text-primary"
                                      : "opacity-0 text-gray-400"
                                  }`} />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Plan Selection & Summary */}
                    <div className="space-y-6">
                      {/* Plan Selection */}
                      <div className="bg-gray-50/80 dark:bg-gray-900/50 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            Select Plan
                          </span>
                        </div>
                        <div className="grid gap-3">
                          {SUBSCRIPTION_PLANS.map((plan) => (
                            <button
                              key={plan.id}
                              onClick={() => setSelectedPlan(plan.id)}
                              className={`p-4 rounded-xl border transition-all text-left
                                      ${
                                        selectedPlan === plan.id
                                          ? "border-primary/50 dark:border-primary/30 bg-primary/5 dark:bg-primary/10"
                                          : "border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/20"
                                      }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {plan.name}
                                </span>
                                <span className="text-sm font-medium text-primary">
                                  €{plan.basePrice}/vessel
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {plan.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="bg-gray-50/80 dark:bg-gray-900/50 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            Summary
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              €{calculateTotal.subtotal}
                            </span>
                          </div>
                          {calculateTotal.discount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Volume Discount ({volumeDiscount}%)
                              </span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                -€{calculateTotal.discount}
                              </span>
                            </div>
                          )}
                          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">Total</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                €{calculateTotal.total}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={handleRenewSubscription}
                        disabled={isLoading || selectedTrackers.length === 0}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white 
                                 font-medium rounded-xl transition-all duration-200 
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 active:scale-[0.98] relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform 
                                    duration-1000"></div>
                        <span className="flex items-center justify-center gap-2">
                          {isLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-5 w-5" />
                              Proceed to Payment
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') as HTMLElement
  );
}
