"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link"; // Import Link for navigation
import { usePayment } from "@/hooks/use-payment";
import { useEffect, useMemo } from "react";
import { Plan, PlanFeature } from "@/schema/Plan";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import { useAffiliate } from "@/hooks/use-affiliate";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function safeParse<T>(str: string | null | undefined, fallback: T) {
  try {
    if (!str) return fallback;
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

// Wrap the Card component with motion
const MotionCard = motion(Card);

export default function PricingPlans() {
  const { plans } = usePayment();
  const router = useRouter();
  const { setAffilateLink } = useAffiliate();
  const params = useParams();
  const [affiliateId, subscriptionId] = (params as any)?.slugs || [];

  const filterdPlans = useMemo(() => {
    if (subscriptionId && subscriptionId.startsWith("prod")) {
      return plans?.filter(
        (plan) =>
          plan.interval === "month" && plan.active && plan.id == subscriptionId
      );
    }
    return plans?.filter((plan) => plan.interval === "month" && plan.active);
  }, [plans, subscriptionId]);

  useEffect(() => {
    if (affiliateId) {
      setAffilateLink(affiliateId);
    }
  }, [affiliateId]);

  const handlePlanSelect = (planId: string) => {
    const anyArray: any[] = [];
    let plans = safeParse(Cookies.get("selected_plans"), anyArray);

    if (!plans.includes(planId)) {
      if (
        planId === "prod_RKmbTUf8GVWRbZ" ||
        planId === "prod_RKmcvDUQOPIrFO"
      ) {
        plans = plans.filter(
          (plan: string) =>
            plan !== "prod_RKmbTUf8GVWRbZ" && plan !== "prod_RKmcvDUQOPIrFO"
        );
      }
      plans.push(planId);
      Cookies.set("selected_plans", JSON.stringify(plans));
    }
            router.push("/cart");
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="px-4 md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 bg-[radial-gradient(100%_100%_at_top_left,white,white,rgba(140,65,255,0.6))] text-transparent bg-clip-text"
        >
          Shop Our Products & Plans
        </motion.h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* First row of cards */}
          {filterdPlans?.reverse()?.map((plan: Plan, index: number) => (
            <MotionCard
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: 0.1 }}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">€{plan.price}/month</p>
                <ul className="mt-4 space-y-2">
                  {plan.features?.map((feature: PlanFeature, index: number) => (
                    <li className="flex items-center" key={index}>
                      <Check className="mr-2 h-4 w-4" />
                      {feature.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  className="w-full mt-8"
                >
                  Select
                </Button>
              </CardFooter>
            </MotionCard>
          ))}

          {!subscriptionId?.startsWith("prod") && (
            <MotionCard
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: 0.2 }}
            >
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  Contact for pricing or VC Fund Investments
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Custom campaigns
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    API access
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Custom integrations
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Premium 24/7 support
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full mt-8">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </CardFooter>
            </MotionCard>
          )}
        </div>
      </div>
    </section>
  );
}
