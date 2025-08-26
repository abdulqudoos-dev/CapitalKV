"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.42, 0, 0.58, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1], delay: 0.2 },
  },
};

const featureVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.42, 0, 0.58, 1],
      delay: 0.4 + i * 0.1,
    },
  }),
};

const features = [
  "CapitalKV+",
  "Exclusive Business Network",
  "Exclusive Behind the Scenes Information and Discussions",
  "Priority Email Support",
];

const Club = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [error, setError] = useState(null);

  // Simulate user authentication check
  const [user, setUser] = useState({
    id: null,
    email: null,
    isAuthenticated: false,
    hasActiveSubscription: false,
  });

  // Handle subscription/join button click
  const handleJoinChat = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      if (!user.isAuthenticated) {
        // Redirect to login or show login modal
        setError("Please log in to join CapitalKV+");
        setIsLoading(false);
        return;
      }

      // Check if user already has active subscription
      if (user.hasActiveSubscription) {
        // Redirect to chat or dashboard
        window.location.href = "/dashboard/chat";
        return;
      }

      // Create subscription/payment intent
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Get from secure storage
        },
        body: JSON.stringify({
          planId: "capitalkv-plus",
          priceId: "price_capitalkv_plus_monthly",
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // Handle different payment providers (Stripe, PayPal, etc.)
      if (data.paymentProvider === "stripe") {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else if (data.paymentProvider === "paypal") {
        // Handle PayPal integration
        window.location.href = data.paypalUrl;
      }

      setSubscriptionStatus("processing");
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication
  const handleAuthentication = async () => {
    // This would typically redirect to your auth provider
    // or open a modal for login/signup
    window.location.href = "/auth/login?redirect=/chat";
  };

  // Check subscription status on component mount
  React.useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch("/api/user/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            id: userData.id,
            email: userData.email,
            isAuthenticated: true,
            hasActiveSubscription:
              userData.subscriptions?.some(
                (sub) =>
                  sub.planId === "capitalkv-plus" && sub.status === "active"
              ) || false,
          });
        }
      } catch (err) {
        console.error("Failed to check user status:", err);
      }
    };

    checkUserStatus();
  }, []);

  // Handle subscription webhook updates
  React.useEffect(() => {
    const handleSubscriptionUpdate = (event) => {
      if (event.data.userId === user.id) {
        setUser((prev) => ({
          ...prev,
          hasActiveSubscription: event.data.status === "active",
        }));

        if (event.data.status === "active") {
          setSubscriptionStatus("active");
          // Redirect to chat after successful subscription
          setTimeout(() => {
            window.location.href = "/dashboard/chat";
          }, 2000);
        }
      }
    };

    // Listen for real-time subscription updates (WebSocket, Server-Sent Events, etc.)
    window.addEventListener("subscriptionUpdate", handleSubscriptionUpdate);

    return () => {
      window.removeEventListener(
        "subscriptionUpdate",
        handleSubscriptionUpdate
      );
    };
  }, [user.id]);

  const getButtonText = () => {
    if (isLoading) return "Processing...";
    if (user.hasActiveSubscription) return "✧ Enter Chat";
    if (!user.isAuthenticated) return "✧ Sign Up to Join";
    return "✧ Join the Chat";
  };

  const getButtonAction = () => {
    if (user.hasActiveSubscription) {
      return () => (window.location.href = "/dashboard/chat");
    }
    if (!user.isAuthenticated) {
      return handleAuthentication;
    }
    return handleJoinChat;
  };

  return (
    <section className="relative bg-[#030209] flex items-center justify-center py-6 sm:py-8 md:py-12 lg:py-16 xl:py-24 px-2 sm:px-4 md:px-8 overflow-x-hidden">
      {/* Top black fade */}
      <div
        className="pointer-events-none absolute left-0 top-0 w-full h-12 sm:h-16 md:h-20 lg:h-24 z-30"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)",
        }}
      />
      {/* Bottom black fade */}
      <div
        className="pointer-events-none absolute left-0 bottom-0 w-full h-12 sm:h-16 md:h-20 lg:h-24 z-30"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-6 sm:mb-8 md:mb-12 px-2 sm:px-0"
        >
          <motion.h1
            variants={containerVariants}
            className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold bg-gradient-to-t from-white to-neutral-600 bg-clip-text text-transparent leading-tight mb-3 sm:mb-4 md:mb-6"
          >
            CapitalKV+
          </motion.h1>
          <motion.p
            variants={containerVariants}
            className="text-white/80 text-xs xs:text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed px-2 sm:px-4"
          >
            Welcome to CapitalKV+ - your gateway to an elite virtual
            experience. We have curated a perfect environment for intellectual
            exchanges in our exceptional chat rooms, guaranteeing tasteful
            discussions among a community of distinguished members.
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative mx-auto w-full max-w-4xl rounded-2xl border border-[#5959E7] backdrop-blur-md shadow-[inset_0_0_25px_1px_rgba(57,59,148,0.5)] overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row">
            {/* Left Section - Pricing */}
            <div className="flex-1 p-4 xs:p-6 sm:p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/20 min-w-0">
              <div className="text-center md:text-left">
                <h2 className="text-lg xs:text-xl sm:text-2xl md:text-4xl font-semibold bg-gradient-to-t from-white to-neutral-600 bg-clip-text text-transparent leading-tight mb-1 xs:mb-2">
                  CapitalKV+
                </h2>
                <p className="text-white/70 text-xs xs:text-sm sm:text-base mb-4 sm:mb-6">
                  Experience Superior Communication
                </p>

                <div className="flex flex-wrap items-baseline justify-center md:justify-start mb-4 sm:mb-6 gap-x-2 gap-y-1">
                  <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-semibold bg-gradient-to-t from-white to-neutral-600 bg-clip-text text-transparent leading-tight">
                    €499.99
                  </span>
                  <span className="text-white/60 text-xs xs:text-sm sm:text-base ml-1">
                    Per month
                  </span>
                </div>

                {/* Status Messages */}
                {error && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                    <p className="text-red-400 text-xs sm:text-sm">{error}</p>
                  </div>
                )}

                {subscriptionStatus === "processing" && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <p className="text-blue-400 text-xs sm:text-sm">
                      Processing your subscription...
                    </p>
                  </div>
                )}

                {subscriptionStatus === "active" && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                    <p className="text-green-400 text-xs sm:text-sm">
                      Welcome to CapitalKV+! Redirecting to chat...
                    </p>
                  </div>
                )}

                {user.hasActiveSubscription && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                    <p className="text-green-400 text-xs sm:text-sm">
                      ✓ Active Subscription
                    </p>
                  </div>
                )}

                <Button
                  onClick={getButtonAction()}
                  disabled={isLoading}
                  className={`w-full font-bold px-4 xs:px-6 sm:px-8 py-2 xs:py-3 rounded-full border-2 transition-all duration-200 flex items-center justify-center gap-2 text-base xs:text-lg sm:text-xl md:text-2xl ${
                    user.hasActiveSubscription
                      ? "bg-gradient-to-b from-green-500 to-emerald-900 border border-emerald-600"
                      : "bg-gradient-to-b from-fuchsia-500 to-purple-900 border border-purple-600"
                  } text-white ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{ minHeight: "3rem" }}
                >
                  {isLoading && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {getButtonText()}
                </Button>

                {/* Additional Info */}
              </div>
            </div>

            {/* Right Section - Features */}
            <div className="flex-1 p-4 xs:p-6 sm:p-8 md:p-10 min-w-0">
              <ul className="space-y-3 xs:space-y-4 sm:space-y-5">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    custom={index}
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex items-center text-white/90"
                  >
                    <span className="flex items-center justify-center w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-white mr-2 xs:mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-black" />
                    </span>
                    <span className="text-xs xs:text-sm sm:text-base leading-relaxed">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Club;
