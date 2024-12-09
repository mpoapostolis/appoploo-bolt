import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, Clock, Ship, Check, Package, Cpu, Anchor } from "lucide-react";
import { useFleetStore } from "../store/fleetStore";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useFleets } from "../hooks/useFleets";
import { createPortal } from "react-dom";
import type { Fleet } from "../types/fleet";
import { formatDistanceToNow, format, addDays, isBefore } from "date-fns";

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
  },
  {
    id: "yearly",
    name: "12 Months",
    description: "Yearly subscription",
    basePrice: 100,
    duration: "12 months",
  },
];

interface AddTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTimeModal({ isOpen, onClose }: AddTimeModalProps) {
  const { fleets } = useFleets();

  const [expiringVesselIds, setExpiringVesselIds] = useState<string[]>([]);
  const [expiredVesselIds, setExpiredVesselIds] = useState<string[]>([]);
  const [selectedTrackers, setSelectedTrackers] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("yearly");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    const in30Days = addDays(now, 30);

    const expiring: string[] = [];
    const expired: string[] = [];

    fleets.forEach((fleet) => {
      if (fleet.subscriptionEnds) {
        const endDate = new Date(fleet.subscriptionEnds);
        if (isBefore(endDate, now)) {
          expired.push(fleet.id);
        } else if (isBefore(endDate, in30Days)) {
          expiring.push(fleet.id);
        }
      }
    });

    setExpiringVesselIds(expiring);
    setExpiredVesselIds(expired);
    setSelectedTrackers([...expired, ...expiring]);
  }, [fleets]);

  const getVesselStatus = (fleet: Fleet) => {
    if (expiredVesselIds.includes(fleet.id)) {
      return 'expired';
    }
    if (expiringVesselIds.includes(fleet.id)) {
      return 'expiring';
    }
    return 'active';
  };

  const getStatusStyles = (status: 'expired' | 'expiring' | 'active') => {
    switch (status) {
      case 'expired':
        return {
          border: 'border-red-500/50 dark:border-red-500/30',
          bg: 'bg-red-500/5 dark:bg-red-500/10',
          text: 'text-red-500 dark:text-red-400'
        };
      case 'expiring':
        return {
          border: 'border-amber-500/50 dark:border-amber-500/30',
          bg: 'bg-amber-500/5 dark:bg-amber-500/10',
          text: 'text-amber-500 dark:text-amber-400'
        };
      default:
        return {
          border: 'border-gray-200 dark:border-gray-700',
          bg: '',
          text: 'text-gray-500 dark:text-gray-400'
        };
    }
  };

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan);
  
  // Calculate total amount
  const calculateTotal = useMemo(() => {
    if (!currentPlan || selectedTrackers.length === 0) return { total: 0 };
    const total = currentPlan.basePrice * selectedTrackers.length;
    return { total };
  }, [currentPlan, selectedTrackers.length]);

  const sortedFleets = useMemo(() => {
    return [...fleets].sort((a, b) => {
      const aStatus = getVesselStatus(a);
      const bStatus = getVesselStatus(b);
      
      // Custom sort order: expired -> expiring -> active
      const statusOrder = {
        expired: 0,
        expiring: 1,
        active: 2
      };
      
      // First sort by status
      const statusDiff = statusOrder[aStatus] - statusOrder[bStatus];
      if (statusDiff !== 0) return statusDiff;
      
      // If same status, sort by subscription end date
      if (a.subscriptionEnds && b.subscriptionEnds) {
        return new Date(a.subscriptionEnds).getTime() - new Date(b.subscriptionEnds).getTime();
      }
      
      // If one doesn't have subscription end date, put it last
      if (a.subscriptionEnds) return -1;
      if (b.subscriptionEnds) return 1;
      
      // If neither has subscription end date, sort by name
      return a.name.localeCompare(b.name);
    });
  }, [fleets, getVesselStatus]);

  const selectableVesselIds = useMemo(() => {
    return [...expiredVesselIds, ...expiringVesselIds];
  }, [expiredVesselIds, expiringVesselIds]);

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
    if (selectedTrackers.length === selectableVesselIds.length) {
      setSelectedTrackers([]);
    } else {
      setSelectedTrackers(selectableVesselIds);
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
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {expiredVesselIds.length > 0 && (
                        <span className="text-red-500 dark:text-red-400">
                          {expiredVesselIds.length} vessel{expiredVesselIds.length === 1 ? '' : 's'} expired
                        </span>
                      )}
                      {expiredVesselIds.length > 0 && expiringVesselIds.length > 0 && (
                        <span className="mx-2">•</span>
                      )}
                      {expiringVesselIds.length > 0 && (
                        <span className="text-amber-500 dark:text-amber-400">
                          {expiringVesselIds.length} vessel{expiringVesselIds.length === 1 ? '' : 's'} expiring in 30 days
                        </span>
                      )}
                    </div>
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
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <button
                              type="button"
                              onClick={handleSelectAll}
                              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors"
                            >
                              {selectedTrackers.length === selectableVesselIds.length && selectableVesselIds.length > 0
                                ? "Deselect All"
                                : "Select All"}
                            </button>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                              ({selectedTrackers.length} of {selectableVesselIds.length} selected)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-y-auto min-h-0 pr-2">
                        <div className="grid gap-3">
                          {sortedFleets.map((fleet: Fleet) => {
                            const status = getVesselStatus(fleet);
                            const styles = getStatusStyles(status);
                            const isSelectable = status === 'expired' || status === 'expiring';

                            return (
                              <motion.div
                                key={fleet.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => {
                                  if (!isSelectable) return;
                                  
                                  if (selectedTrackers.includes(fleet.id)) {
                                    setSelectedTrackers(prev => prev.filter(id => id !== fleet.id));
                                  } else {
                                    setSelectedTrackers(prev => [...prev, fleet.id]);
                                  }
                                }}
                                className={`group p-4 rounded-xl border transition-all
                                        ${isSelectable ? 'cursor-pointer hover:shadow-md dark:hover:shadow-black/20' : 'cursor-default'}
                                        ${
                                          selectedTrackers.includes(fleet.id)
                                            ? "border-primary/50 dark:border-primary/30 bg-primary/5 dark:bg-primary/10"
                                            : `${styles.border} ${styles.bg}`
                                        }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
                                      <Ship className={`h-5 w-5 ${isSelectable ? styles.text : 'text-gray-400 dark:text-gray-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {fleet.name}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          IMEI: {fleet.IMEI}
                                        </p>
                                        {fleet.subscriptionEnds && (
                                          <>
                                            <span className="text-xs text-gray-400">•</span>
                                            <p className={`text-xs ${styles.text}`}>
                                              {status === 'expired' ? 'Expired ' : 'Expires '}
                                              {formatDistanceToNow(new Date(fleet.subscriptionEnds), { addSuffix: true })}
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelectable && (
                                    <div className={`w-5 h-5 rounded-md border-2 transition-all
                                                ${
                                                  selectedTrackers.includes(fleet.id)
                                                    ? "bg-primary border-primary text-white"
                                                    : "border-gray-300 dark:border-gray-600"
                                                }`}
                                    >
                                      {selectedTrackers.includes(fleet.id) && (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Plan Selection */}
                    <div className="lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select Plan
                          </h3>
                          <div className="mt-3 space-y-3">
                            {SUBSCRIPTION_PLANS.map((plan) => (
                              <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`w-full p-4 rounded-xl border transition-all
                                        ${
                                          selectedPlan === plan.id
                                            ? "border-primary/50 dark:border-primary/30 bg-primary/5 dark:bg-primary/10"
                                            : "border-gray-200 dark:border-gray-700 hover:border-primary/30"
                                        }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {plan.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {plan.description}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                                      €{plan.basePrice}
                                    </span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      per vessel
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gray-50/80 dark:bg-gray-900/50 rounded-xl p-4">
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Summary
                          </h3>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Total
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                €{calculateTotal.total}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleRenewSubscription}
                          disabled={selectedTrackers.length === 0 || isLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                                   bg-primary text-white rounded-xl font-medium transition-all 
                                   hover:bg-primary/90 active:scale-95 disabled:opacity-50 
                                   disabled:pointer-events-none"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" />
                              Proceed to Payment
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
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
