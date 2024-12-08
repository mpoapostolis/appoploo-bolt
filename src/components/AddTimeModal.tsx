import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, Clock, Ship, Check, Package, Cpu, Anchor } from "lucide-react";
import { useFleetStore } from "../store/fleetStore";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useFleets } from "../hooks/useFleets";
import { createPortal } from "react-dom";
import type { Fleet } from "../types/fleet";

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
          trackerIds: selectedTrackers,
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
      <div
        className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                    bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl 
                    max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="bg-white dark:bg-gray-800 rounded-t-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/20">
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
                         transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Side - Vessel Selection */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Ship className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                        <span className="font-medium text-gray-900 dark:text-white">Select Vessels</span>
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 
                                     rounded-full text-xs font-medium">
                          {selectedTrackers.length} selected
                        </span>
                      </div>
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 
                                 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      >
                        {selectedTrackers.length === fleets.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[calc(100vh-20rem)] 
                                  md:max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 
                                  dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      {fleets.map((fleet: Fleet) => (
                        <motion.div
                          key={fleet.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`group p-4 rounded-xl border-2 transition-all cursor-pointer 
                                    hover:shadow-lg hover:shadow-indigo-500/5
                                    ${
                                      selectedTrackers.includes(fleet.id)
                                        ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700'
                                    }`}
                          onClick={() => {
                            setSelectedTrackers((prev) =>
                              prev.includes(fleet.id)
                                ? prev.filter((id) => id !== fleet.id)
                                : [...prev, fleet.id]
                            );
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center 
                                          justify-center mt-0.5 transition-all duration-200
                                          ${selectedTrackers.includes(fleet.id)
                                            ? 'border-indigo-500 bg-indigo-500 shadow-sm'
                                            : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'
                                          }`}
                            >
                              {selectedTrackers.includes(fleet.id) && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                  {fleet.name}
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>Expires: {fleet.subscriptionEnd 
                                    ? new Date(fleet.subscriptionEnd).toLocaleDateString()
                                    : 'Not Available'
                                  }</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                    ${fleet.subscriptionStatus === 'active'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                      : fleet.subscriptionStatus === 'expired'
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                    }`}
                                  >
                                    {fleet.subscriptionStatus}
                                  </span>
                                  {fleet.currentPlan && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {fleet.currentPlan}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - Plans & Summary */}
                  <div className="space-y-6">
                    {/* Plans */}
                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span>Choose Duration</span>
                      </h3>
                      <div className="space-y-2">
                        {SUBSCRIPTION_PLANS.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`w-full p-3 rounded-lg border-2 transition-all relative
                                      ${selectedPlan === plan.id 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-200'
                                      }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{plan.name}</div>
                                <div className="text-sm text-gray-500">{plan.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">€{plan.basePrice}</div>
                                <div className="text-sm text-gray-500">per vessel</div>
                              </div>
                            </div>
                            {plan.id === 'yearly' && (
                              <div className="absolute -top-2 -right-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                Best Value
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Volume Discounts */}
                    {selectedTrackers.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Volume Discount</h4>
                        <div className="text-xs text-gray-500 space-y-1">
                          {VOLUME_DISCOUNTS.map((tier) => (
                            <div key={tier.min} className={`flex justify-between ${
                              selectedTrackers.length >= tier.min ? 'text-green-600 dark:text-green-400' : ''
                            }`}>
                              <span>{tier.min}+ vessels</span>
                              <span>{tier.discount}% off</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="space-y-3 mt-auto">
                      <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Package className="h-5 w-5 text-blue-500" />
                        <span>Summary</span>
                      </h3>
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Selected Vessels</span>
                          <span className="font-medium">{selectedTrackers.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration</span>
                          <span className="font-medium">{currentPlan?.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-medium">€{calculateTotal.subtotal.toFixed(2)}</span>
                        </div>
                        {volumeDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Volume Discount ({volumeDiscount}%)</span>
                            <span>-€{calculateTotal.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>€{calculateTotal.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleRenewSubscription}
                        disabled={selectedTrackers.length === 0 || isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 
                                 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-400 
                                 disabled:to-gray-400 text-white rounded-lg font-medium
                                 transition-all duration-300 shadow-lg hover:shadow-blue-500/25
                                 disabled:shadow-none flex items-center justify-center space-x-2
                                 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent 
                                    -translate-x-full group-hover:translate-x-full transition-transform 
                                    duration-500 ease-out" />
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5" />
                            <span>Proceed to Payment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.getElementById('modal-root') as HTMLElement
  );
}
