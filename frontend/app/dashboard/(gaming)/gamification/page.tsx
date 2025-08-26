"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Ticket, Trophy } from "lucide-react";

const totalStamps = 45;
const stampsPerLevel = 15;
const earnedStamps = 33;

const currentLevel =
  earnedStamps <= 15 ? 1 : earnedStamps <= 30 ? 2 : 3;

const coupons = [
  { id: 1, name: "Free Shipping", unlocked: currentLevel === 3 },
  { id: 2, name: "5% Off Next Order", unlocked: currentLevel === 3 },
  { id: 3, name: "10% Off Next Order", unlocked: currentLevel === 3 },
  { id: 4, name: "15% Off Next Order", unlocked: currentLevel === 3 },
];

const getStamps = (earned: number) =>
  Array.from({ length: totalStamps }, (_, i) => ({
    id: i + 1,
    active: i < earned,
  }));

export default function LoyaltyCentre() {
  const stamps = getStamps(earnedStamps);

  const levelDescriptions = {
    1: "Level 1: 5% off on select orders",
    2: "Level 2: 10% off + discount perks",
    3: "Level 3: Premium coupons unlocked!",
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Centre</h1>
        <p className="text-muted-foreground mt-2">
          Collect stamps with each purchase, unlock rewards & climb levels!
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Level {currentLevel}</CardTitle>
            <CardDescription>{levelDescriptions[currentLevel]}</CardDescription>
          </div>
          <Trophy className="w-6 h-6 text-yellow-500 mt-2 sm:mt-0" />
        </CardHeader>
        <CardContent>
          <Progress value={(earnedStamps / totalStamps) * 100} />
          <p className="text-sm text-muted-foreground mt-2">
            {earnedStamps} of {totalStamps} stamps collected
          </p>
        </CardContent>
      </Card>

      {/* Stars by Level */}
      <div className="space-y-6">
        {[1, 2, 3].map((level) => (
          <div key={level}>
            <h3 className="text-base font-semibold mb-2">Level {level} Stamps</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {stamps
                .slice((level - 1) * stampsPerLevel, level * stampsPerLevel)
                .map((stamp) => (
                  <div
                    key={stamp.id}
                    className={`rounded-lg border p-4 flex items-center justify-center transition duration-200 ${
                      stamp.active
                        ? "border-green-500 bg-green-100"
                        : "border-gray-300 bg-white/10 backdrop-blur-sm"
                    }`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        stamp.active ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Coupons */}
      {currentLevel === 3 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Unlocked Coupons</CardTitle>
            <CardDescription>
              You've unlocked exclusive coupons by reaching Level 3!
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {coupons.map((coupon) => (
              <Card
                key={coupon.id}
                className={`text-center p-4 border backdrop-blur-sm transition ${
                  coupon.unlocked
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white/10 text-gray-400"
                }`}
              >
                <Ticket
                  className={`mx-auto mb-2 ${
                    coupon.unlocked ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <p className="text-sm font-medium">{coupon.name}</p>
                <Badge
                  variant="outline"
                  className={`mt-2 ${
                    coupon.unlocked ? "" : "border-gray-400 text-gray-400"
                  }`}
                >
                  {coupon.unlocked ? "Unlocked" : "Locked"}
                </Badge>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

