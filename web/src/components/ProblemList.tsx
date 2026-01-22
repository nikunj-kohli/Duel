import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Search, Filter, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { PROBLEMS } from "@/data/problems";

interface ProblemListProps {
  onSelectProblem: (id: string) => void;
  onBack?: () => void;
}

export function ProblemList({ onSelectProblem, onBack }: ProblemListProps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                Problems
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Solve coding challenges and improve your skills</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 border-2 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search problems by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-2 h-12 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 h-12 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredProblems.length} of {PROBLEMS.length} problems</span>
          </div>
        </Card>

        {/* Problems Grid */}
        <div className="grid gap-4">
          {filteredProblems.length === 0 ? (
            <Card className="p-12 text-center border-2">
              <p className="text-lg text-muted-foreground">No problems found matching your criteria</p>
            </Card>
          ) : (
            filteredProblems.map((problem) => (
              <Card
                key={problem.id}
                onClick={() => onSelectProblem(problem.id)}
                className="cursor-pointer group border-2 hover:border-primary transition-all hover:shadow-xl hover:scale-[1.01]"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                            {problem.title}
                          </h3>
                          <Badge variant={getDifficultyVariant(problem.difficulty)} className="text-xs px-2 py-1">
                            {problem.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {problem.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{problem.acceptance}% acceptance rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Start →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
