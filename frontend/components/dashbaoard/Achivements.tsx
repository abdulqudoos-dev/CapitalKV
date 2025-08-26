"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Award,
  Trophy,
  Target,
  Zap,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";

// Mock data (replace with actual data fetched from MongoDB)
const userData = {
  name: "John Doe",
  points: 1250,
  level: 5,
  badges: [
    { id: 1, name: "Campaign Master", icon: <Trophy className="w-6 h-6" /> },
    { id: 2, name: "Engagement Guru", icon: <Users className="w-6 h-6" /> },
    {
      id: 3,
      name: "Conversion King",
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ],
  recentAchievements: [
    {
      id: 1,
      name: "Ran 10 successful campaigns",
      points: 100,
      date: "2023-06-15",
    },
    { id: 2, name: "Reached 1000 followers", points: 50, date: "2023-06-10" },
    {
      id: 3,
      name: "Achieved 15% conversion rate",
      points: 200,
      date: "2023-06-05",
    },
  ],
};

const leaderboardData = [
  { rank: 1, name: "Alice Smith", points: 2500 },
  { rank: 2, name: "Bob Johnson", points: 2250 },
  { rank: 3, name: "Charlie Brown", points: 2100 },
  { rank: 4, name: "David Lee", points: 1900 },
  { rank: 5, name: "John Doe", points: 1250 },
];

const pointHistoryData = [
  { name: "Jan", points: 400 },
  { name: "Feb", points: 300 },
  { name: "Mar", points: 200 },
  { name: "Apr", points: 278 },
  { name: "May", points: 189 },
  { name: "Jun", points: 239 },
];

export function GamificationPopup() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Star className="h-6 w-6" />
          <span className="sr-only">Open Gamification</span>
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Gamification Achievements</DialogTitle>
          <DialogDescription>
            Track your progress and achievements
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="history">Point History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Points
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userData.points}</div>
                    <p className="text-xs text-muted-foreground">
                      Level {userData.level}
                    </p>
                    <Progress value={75} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Badges Earned
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userData.badges.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Out of 10 total badges
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Leaderboard Rank
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">#5</div>
                    <p className="text-xs text-muted-foreground">Top 10%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Recent Achievement
                    </CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-md font-medium">
                      {userData.recentAchievements[0].name}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{userData.recentAchievements[0].points} points
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                  <CardDescription>
                    Your latest milestones and rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Achievement</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userData.recentAchievements.map((achievement) => (
                        <TableRow key={achievement.id}>
                          <TableCell>{achievement.name}</TableCell>
                          <TableCell>+{achievement.points}</TableCell>
                          <TableCell>{achievement.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userData.badges.map((badge) => (
                  <Card key={badge.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {badge.icon}
                        {badge.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        You've earned this badge for your exceptional
                        performance!
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>
                    See how you rank among other users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboardData.map((user) => (
                        <TableRow
                          key={user.rank}
                          className={
                            user.name === userData.name ? "font-bold" : ""
                          }
                        >
                          <TableCell>{user.rank}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Point History</CardTitle>
                  <CardDescription>
                    Your point accumulation over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pointHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="points" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
