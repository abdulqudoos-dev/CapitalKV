import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Gamification() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
          Gamification
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">Audience Growth</Badge>
              <Badge variant="secondary">Engagement Master</Badge>
              <Badge variant="secondary">Conversion Pro</Badge>
              <Badge variant="secondary">AI Innovator</Badge>
              <Badge variant="secondary">Data Wizard</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside">
                <li>Company A - 1500 pts</li>
                <li>Company B - 1350 pts</li>
                <li>Company C - 1200 pts</li>
                <li>Company D - 1050 pts</li>
                <li>Company E - 900 pts</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">1,250</p>
              <p className="text-sm text-gray-500">Points earned this month</p>
              <div className="mt-4">
                <p className="text-sm font-semibold">Recent Achievements:</p>
                <ul className="list-disc list-inside text-sm">
                  <li>Completed 5 successful campaigns</li>
                  <li>Increased engagement rate by 25%</li>
                  <li>Achieved 95% customer satisfaction</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
