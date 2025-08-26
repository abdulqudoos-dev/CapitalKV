"use client";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayment } from "@/hooks/use-payment";
import { useUser } from "@/hooks/use-user";
import React from "react";

const ChatGuard = ({ children }: { children: React.ReactNode }) => {
  const { subscriptions } = usePayment();
  const subscriptionsIds = subscriptions?.map((sub: any) => sub.plan_id);
  const isChatSubscrition = subscriptionsIds?.includes("prod_Rdm3KZLrcc1ees");
  const { user } = useUser();
  
  if (!isChatSubscrition && !user?.is_admin_user) {
    return (
      <div className="h-full w-full flex justify-center items-center">

      <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Access Denied</CardTitle>
        <CardDescription >
          Subscribe CapitalKV+ Chat plan to unlock that
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center">
          This subscription doesn't have access for this features please subscribe to CapitalKV+ plan to access this feature.
        </p>
      </CardFooter>
    </Card>
    </div>

    )
  } else {
    return children;
  }
};

export default ChatGuard;
