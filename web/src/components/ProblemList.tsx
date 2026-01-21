import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Search, Filter } from "lucide-react";
import { useState } from "react";
import { PROBLEMS } from "@/data/problems";

export function ProblemList({ onSelectProblem }: { onSelectProblem: (id: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = Array.from(new Set(PROBLEMS.map(p => p.category)));
  
  const filteredProblems = PROBLEMS.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         problem.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === "all" || problem.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getDifficultyVariant = (difficulty: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'destructive';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 dark:text-green-500';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-500';
      case 'Hard': return 'text-red-600 dark:text-red-500';
      default: return 'text-muted-foreground';
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Problems
          </h1>
          <p className="text-muted-foreground">Solve coding challenges and improve your skills</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          {filteredProblems.map((problem) => (
            <Card
              key={problem.id}
              onClick={() => onSelectProblem(problem.id)}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary group"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {problem.title}
                        </h3>
                        <Badge variant={getDifficultyVariant(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                        <Badge variant="outline">{problem.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {problem.acceptance}% acceptance rate
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-2xl font-bold ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Difficulty</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
