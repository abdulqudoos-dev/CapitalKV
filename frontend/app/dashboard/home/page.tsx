"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowRight, Smartphone, Book, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import HomeIcon from "@/assets/homeicon.svg";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePayment } from "@/hooks/use-payment";

const SUBSCRIPTION_API = "/api/subscription-status"; // Replace with your real endpoint

const MainDash = () => {
  const { user, loading } = useUser();
  const [subscriptions, setSubscriptions] = useState({
    canAddApp: false,
    canAddCampaign: false,
  });

  const { subscriptions: subs } = usePayment();
  const subscriptionsIds = subs?.map((sub: any) => sub.plan_id);
  const CapitalKVExclusive = subscriptionsIds?.includes(
    "prod_Rdm2MmZsfuqc5G"
  );

  /*  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await axios.get(SUBSCRIPTION_API, {
          headers: { Authorization: `Bearer ${user?.token}` }, // Assuming `user.token` is available
        });

        // Example response:
        // { active: true, plans: ["developer", "marketing"] }

        const { active, plans } = response.data;

        if (active) {
          setSubscriptions({
            canAddApp: plans.includes("developer"),
            canAddCampaign: plans.includes("starter" || "pro" || "enterprise" ),
          });
        }
      } catch (error) {
        console.error("Failed to fetch subscription status:", error);
        setSubscriptions({ canAddApp: false, canAddCampaign: false });
      }
    };

    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user]);
*/
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-3">
      <ScrollArea>
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold">
              Hello,{" "}
              <span className="text-purple-400">
                {user?.first_name +" " + user?.last_name || "User"}!
              </span>
            </h1>
            <p className="text-white">
            Unlock powerful digital tools—purchase products easily, Observe latest funds securely, 
            and access CapitalKV+ elite chat group, all from one easy-to-use dashboard.            
            </p>
            {/* {subscriptions?.canAddApp && (  */}
           {/* { {CapitalKVExclusive && ( */}
              <Link href="/dashboard/shop">
                {" "}
                <Button className="mx-1 mt-3">Latest Products</Button>
              </Link>
           {/* { { )} (  */}
             <Link href="/cart">
                {" "}
                <Button className="mx-1 mt-3">Shopping Card</Button>
              </Link>

            {/* )} */}
            {/*  {subscriptions.canAddApp &&  ( */}
          {/*  {CapitalKVExclusive && (

            <Link href="/dashboard/funds">
              {" "}
              <Button className="mx-1 mt-3">Latest Investment Funds</Button>
            </Link>
            )}

            {/* )} */}
          </div>
          <div className="hidden md:block">
            <Image src={HomeIcon} className="w-96 h-96" alt="Home Icon" />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Get Started Card */}
          <Link href="/docs#features-overview" target="_blank">
            <Card className="group backdrop-blur-sm bg-neutral-700/30 border-none shadow-lg hover:bg-neutral-700/50 transition duration-200">
              <CardHeader>
                <h2 className="text-xl font-semibold">Get Started</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We offer a complete set of tools to support virtually any
                  business model.
                </p>
                <button className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                  View features
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </Link>

          {/* Documentation Card */}
          <Link href="/docs#getting-started" target="_blank">
            <Card className="group backdrop-blur-sm bg-neutral-700/30 border-none shadow-lg hover:bg-neutral-700/50 transition duration-200">
              <CardHeader>
                <h2 className="text-xl font-semibold">Documentation</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                Browse the documentation for solutions first. If your issue isn’t covered, 
                reach out to support from the dashboard.
                </p>
                <button className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                  View Docs
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </Link>

          {/* Pricing Card */}
          <Link href="/dashboard/subscription">
            {/* target="_blank" can be added to open in another page*/}
            <Card className="backdrop-blur-sm bg-neutral-700/30 border-none shadow-lg hover:bg-neutral-700/50 transition duration-200">
              <CardHeader>
                <h2 className="text-xl font-semibold">Pricing</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  See the pricing of all services available and availability by
                  region.
                </p>
                <button className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                  View pricing
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MainDash;
