"use client";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayment } from "@/hooks/use-payment";
import React from "react";

const GamingGuard = ({ children }: { children: React.ReactNode }) => {
  const { subscriptions } = usePayment();
  const subscriptionsIds = subscriptions?.map((sub: any) => sub.plan_id);
  const isGamingSubscrition = subscriptionsIds?.includes("prod_Rdm2MmZsfuqc5G");

  // if (!isGamingSubscrition) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center p-8">
  //     <Card className="w-full max-w-lg">
  //       <CardHeader>
  //         <CardTitle>Access Denied</CardTitle>
  //         <CardDescription >
  //           Subscribe Gaminification and Security plan to unlock that
  //         </CardDescription>
  //       </CardHeader>
  //       {/* <CardContent className="space-y-4">
  //         <p className="text-center">
  //           Stay protected with AI-based tools, real-time threat detection, and compliance monitoring.
  //         </p>
  //         <Button
  //           onClick={handlePayment}
  //           className="w-full"
  //           disabled={paymentInProgress}
  //         >
  //           {paymentInProgress ? "Processing Payment..." : "Unlock for €249.99"}
  //         </Button>
  //       </CardContent> */}
  //       <CardFooter>
  //         <p className="text-sm text-muted-foreground text-center">
  //           This subscription doesn't have access for this features please subscribe Gaminification and Security plan to access this feature.
  //         </p>
  //       </CardFooter>
  //     </Card>
  //   </div>
  //   )
  // } else {
    return children;
  // }
};

export default GamingGuard;
