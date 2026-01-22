import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, TrendingUp, Trophy, Target, Zap, Code, Users, Sword, Award } from "lucide-react";

interface DashboardProps {
  onNavigate: (page: string) => void;
  user?: any;
}

export function Dashboard({ onNavigate, user }: DashboardProps) {
  const stats = {
    problemsSolved: 42,
    totalProblems: 150,
    streak: 7,
    rank: 1247,
    recentActivity: [
      { problem: 'Two Sum', status: 'Accepted', time: '2 hours ago' },
      { problem: 'Add Two Numbers', status: 'Accepted', time: '5 hours ago' },
      { problem: 'Longest Substring', status: 'Wrong Answer', time: '1 day ago' },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Welcome back, {user?.username || 'Coder'}! 👋
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to level up your coding skills? Choose your next challenge below.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Problems Solved
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-primary mb-1">
                {stats.problemsSolved}/{stats.totalProblems}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(stats.problemsSolved / stats.totalProblems) * 100}%` }}
                  />
                </div>
                <span>{Math.round((stats.problemsSolved / stats.totalProblems) * 100)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-yellow-500/50 transition-all hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
              <div className="p-2 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 mb-1">
                {stats.streak} days
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-yellow-600">🔥</span> Keep the fire burning!
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-red-500/50 transition-all hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Global Rank
              </CardTitle>
              <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <Trophy className="h-5 w-5 text-red-600 dark:text-red-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-red-600 dark:text-red-500 mb-1">
                #{stats.rank}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" /> Top 20% worldwide
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-green-500/50 transition-all hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Win Rate
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-green-600 dark:text-green-500 mb-1">
                68%
              </div>
              <p className="text-xs text-muted-foreground">Above average performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Quick Actions</h2>
            <p className="text-sm text-muted-foreground hidden md:block">Choose your coding adventure</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="cursor-pointer group relative overflow-hidden border-2 hover:border-primary transition-all hover:shadow-2xl hover:scale-105"
              onClick={() => onNavigate('problems')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                  <Code className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Solve Problems</CardTitle>
                <CardDescription>Practice coding challenges and improve your skills</CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer group relative overflow-hidden border-2 hover:border-red-500 transition-all hover:shadow-2xl hover:scale-105"
              onClick={() => onNavigate('duel')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center mb-4 transition-colors">
                  <Sword className="h-7 w-7 text-red-600 dark:text-red-500" />
                </div>
                <CardTitle className="text-xl">Code Duel</CardTitle>
                <CardDescription>1v1 competitive coding battles</CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer group relative overflow-hidden border-2 hover:border-blue-500 transition-all hover:shadow-2xl hover:scale-105"
              onClick={() => onNavigate('pair-programming')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center mb-4 transition-colors">
                  <Users className="h-7 w-7 text-blue-600 dark:text-blue-500" />
                </div>
                <CardTitle className="text-xl">Pair Programming</CardTitle>
                <CardDescription>Live collaboration with friends</CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer group relative overflow-hidden border-2 hover:border-yellow-500 transition-all hover:shadow-2xl hover:scale-105"
              onClick={() => alert('Feature coming soon!')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 flex items-center justify-center mb-4 transition-colors">
                  <Award className="h-7 w-7 text-yellow-600 dark:text-yellow-500" />
                </div>
                <CardTitle className="text-xl">Tournaments</CardTitle>
                <CardDescription>Join competitive coding events</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Your Recent Submissions</CardTitle>
              <CardDescription>Track your progress and learn from your mistakes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity.map((activity, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${activity.status === 'Accepted' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {activity.status === 'Accepted' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{activity.problem}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={activity.status === 'Accepted' ? 'success' : 'destructive'}
                      className="text-sm px-3 py-1"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
