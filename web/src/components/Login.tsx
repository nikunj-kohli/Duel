import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Code, Mail, Lock, Github, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoginProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.5,
    },
  }),
};

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with actual API call
      const mockUser = {
        id: "1",
        username: email.split('@')[0] || 'user',
        email: email,
        fullName: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        rating: Math.floor(Math.random() * 1000) + 1000,
        friends: [],
        platforms: {
          leetcode: "",
          codeforces: "",
          codechef: ""
        }
      };
      
      onLogin(mockUser);
    } catch (err) {
      setError("Failed to sign in. Please check your credentials and try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
              <Code className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-white/90 mt-2">
              Sign in to continue your coding journey
            </CardDescription>
          </div>
        <CardContent className="p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-800/50"
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div 
              className="space-y-1.5"
              variants={itemVariants}
              custom={1}
            >
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 text-base"
                  disabled={isLoading}
                  required
                />
              </div>
            </motion.div>

            <motion.div 
              className="space-y-1.5"
              variants={itemVariants}
              custom={2}
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                  onClick={() => {/* Handle forgot password */}}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 text-base"
                  disabled={isLoading}
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} custom={3}>
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign in'}
              </Button>
            </motion.div>
          </form>
        </CardContent>

        <div className="px-6 pb-6">
          <motion.div 
            className="relative mb-6"
            variants={itemVariants}
            custom={4}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            custom={5}
          >
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 dark:border-gray-700"
              onClick={() => {
                const githubAuthUrl = import.meta.env.VITE_GITHUB_AUTH_URL ?? 'https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:5173/auth/github/callback';
                window.location.href = githubAuthUrl;
              }}
              disabled={isLoading}
            >
              <Github className="mr-2 h-5 w-5" />
              <span className="font-medium">GitHub</span>
            </Button>
          </motion.div>
        </div>

        <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-gray-800">
          <motion.p 
            className="text-center text-sm text-gray-600 dark:text-gray-400 w-full"
            variants={itemVariants}
            custom={6}
          >
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-medium text-primary hover:text-primary/90 transition-colors"
              disabled={isLoading}
            >
              Sign up
            </button>
          </motion.p>
        </CardFooter>
      </Card>
    </motion.div>
    </div>
  );
}
