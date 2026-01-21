import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, TrendingUp, Trophy, Target, Zap } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              🎮 Duel - Logic Arena
            </h1>
            <p className="text-muted-foreground mt-2">Welcome back, {user?.username}! Ready for your next challenge?</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate('profile')}>
            Profile
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Problems Solved
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.problemsSolved}/{stats.totalProblems}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.problemsSolved / stats.totalProblems) * 100)}% complete
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                {stats.streak} days
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Keep it up! 🔥
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-500/20 hover:border-red-500/40 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Global Rank
              </CardTitle>
              <Trophy className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-500">
                #{stats.rank}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3" /> Top 20%
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Win Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                68%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Above average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary"
              onClick={() => onNavigate('problems')}
            >
              <CardHeader>
                <div className="text-4xl mb-2">💻</div>
                <CardTitle>Solve Problems</CardTitle>
                <CardDescription>Practice coding challenges</CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-red-500"
              onClick={() => onNavigate('duel')}
            >
              <CardHeader>
                <div className="text-4xl mb-2">⚔️</div>
                <CardTitle>Code Duel</CardTitle>
                <CardDescription>1v1 competitive coding</CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-500"
              onClick={() => onNavigate('pair-programming')}
            >
              <CardHeader>
                <div className="text-4xl mb-2">👥</div>
                <CardTitle>Pair Programming</CardTitle>
                <CardDescription>Live code sharing with audio/video</CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-yellow-500"
              onClick={() => alert('Feature coming soon!')}
            >
              <CardHeader>
                <div className="text-4xl mb-2">🏆</div>
                <CardTitle>Tournaments</CardTitle>
                <CardDescription>Join coding competitions</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Submissions</CardTitle>
              <CardDescription>Track your progress and learn from your mistakes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {activity.status === 'Accepted' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-semibold">{activity.problem}</div>
                        <div className="text-sm text-muted-foreground">{activity.time}</div>
                      </div>
                    </div>
                    <Badge 
                      variant={activity.status === 'Accepted' ? 'success' : 'destructive'}
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
