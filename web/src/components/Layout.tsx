import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Code, Users, Trophy, User, LogOut } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function Layout({ children, user, currentPage, onNavigate, onLogout }: LayoutProps) {
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Code className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Duel
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate?.('dashboard')}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={currentPage === 'problems' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate?.('problems')}
                className="gap-2"
              >
                <Code className="h-4 w-4" />
                Problems
              </Button>
              <Button
                variant={currentPage === 'duel' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate?.('duel')}
                className="gap-2"
              >
                <Trophy className="h-4 w-4" />
                Duel
              </Button>
              <Button
                variant={currentPage === 'pair-programming' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate?.('pair-programming')}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Pair Program
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex">
              <Trophy className="h-3 w-3 mr-1" />
              Rating: {user.rating || 1200}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('profile')}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user.username}</span>
            </Button>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
