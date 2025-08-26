"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { usePayment } from "@/hooks/use-payment";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

function safeParse<T>(str: string | null | undefined, fallback: T) {
  try {
    if (!str) return fallback;
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

const enterprise = {
  name: "Enterprise",
  enterprise: true,
  features: [
    { name: "Access to exclusive VC fund deals" },
    { name: "Franchise ownership opportunities" },
    { name: "Retail products at your store" },
    { name: "Talk directly with our team" },
    { name: "Premium 24/7 support" },
  ],
  current: false,
};

const free = {
  name: "Free",
  price: 0,
  features: [
    { name: "Limited Investment Listings Requests" },
    { name: "10% commision rate" },
    { name: "Email support" },
    { name: "Basic templates" },
    { name: "Limited functionality" },
  ],
};

const PricingPlans = () => {
  const [period, setPeriod] = useState<"month" | "year">("month");
  const router = useRouter();
  const { plans, subscriptions, setReload, unSubscribe } = usePayment();
  const [loadings, setLoadings] = useState<any>([]);
  // Combine all plans
  const allPlans = useMemo(() => {
    const plansWithExtras = [
      ...(plans as any[])?.filter((plan) => plan.active),
      { ...enterprise, interval: "month" },
      { ...enterprise, interval: "year" },
    ];
    return plansWithExtras;
  }, [plans]);

  const handlePlanSelect = (
    planId: string,
    interval: string,
    isEnterprise: boolean
  ) => {
    if (isEnterprise) {
      router.push("/dashboard/support");
      return;
    }
    const anyArray: any[] = [];
    let plans = safeParse(Cookies.get("selected_plans"), anyArray);

    if (!plans.includes(planId)) {
      plans.push(planId);
      Cookies.set("interval", interval);
      Cookies.set("selected_plans", JSON.stringify(plans));
    }
          router.push("/cart");
  };

  const handleUnSubscribe = async (subscription_id: string) => {
    try {
      setLoadings([...loadings, { subscription_id }]);
      const response = await unSubscribe({ subscription_id });
      if (response.success) {
        toast({
          title: "Unsubscribed Successfully",
          variant: "default",
        });
        setReload((prev: any) => !prev);
        return;
      } else {
        toast({
          title: "Failed to Unsubscribe",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadings(() =>
        loadings?.filter((cur: any) => cur?.subscription_id == subscription_id)
      );
    }
  };

  const renderPlanCard = (plan: any) => {
    const isActiveSubscription = subscriptions?.find(
      (subs: any) => subs.plan_id === plan.id
    );
    const isLoading = loadings?.find(
      (cur: any) => cur?.subscription_id === isActiveSubscription?.subscription_id
    );
    return (
      <Card
        key={plan.name}
        className={`relative overflow-hidden ${
          plan.active ? "border-2 border-purple-500" : "border border-gray-200"
        }`}
      >
        {isActiveSubscription && (
          <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
            Current Plan
          </div>
        )}
        <CardHeader>
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <div className="mt-2">
            {plan.enterprise ? (
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">Contact Sales</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.interval}</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {plan.features.map((feature: any, i: number) => (
              <li key={i} className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
          <Button
            className={"w-full mt-6 px-4 py-2 rounded-lg"}
            variant={isLoading ? "disabled" : "default"}
            disabled={isLoading}
            onClick={() => {
              if (isActiveSubscription) {
                handleUnSubscribe(isActiveSubscription.subscription_id);
              } else {
                handlePlanSelect(plan.id, plan.interval, plan.enterprise);
              }
            }}
          >
            {isLoading
              ? "processing..."
              : plan.enterprise
              ? "Contact Us"
              : isActiveSubscription
              ? "Unsubscribe Plan"
              : "Select Plan"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-transparent">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Manage Subscription
      </h2>

      <div className="flex justify-center items-center gap-4 mb-8">
        <div className="flex items-center space-x-8 bg-black rounded-full p-1">
          <button
            className={`px-6 py-2 rounded-full transition-all ${
              period === "month"
                ? "bg-purple-500 shadow-sm"
                : "hover:bg-gray-200"
            }`}
            onClick={() => setPeriod("month")}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 rounded-full transition-all ${
              period === "year"
                ? "bg-purple-500 shadow-sm"
                : "hover:bg-gray-200"
            }`}
            onClick={() => setPeriod("year")}
          >
            Annual
          </button>
        </div>
        {period === "year" && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            Save 5%
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlans
          ?.filter((plan) => plan.interval === period)
          ?.map((plan) => renderPlanCard(plan))}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Prices shown in EU. Taxes may apply.</p>
        <p className="mt-2">
          Need help choosing a plan?{" "}
          <a
            href="/dashboard/support"
            className="text-blue-500 hover:underline"
          >
            Contact Sales
          </a>
        </p>
      </div>
    </div>
  );
};

export default PricingPlans;
