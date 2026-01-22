import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "./CodeEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Trophy, Clock, Play, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { PROBLEMS } from "@/data/problems";

interface DuelProps {
  onBack: () => void;
  user: any;
}

export function Duel({ onBack, user }: DuelProps) {
  const [problem] = useState(PROBLEMS[0]);
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(problem.templates[language]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [friends, setFriends] = useState<any[]>([]);
  const [teams, setTeams] = useState({
    team1: [{ id: user.id, username: user.username, ready: true }],
    team2: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [user.id]);

  const loadFriends = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/users/friends/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToTeam = (team: 'team1' | 'team2', friend: any) => {
    setTeams(prev => {
      const teamMembers = prev[team];
      // Check if already in any team
      const inTeam1 = prev.team1.some(m => m.id === friend.id);
      const inTeam2 = prev.team2.some(m => m.id === friend.id);
      if (inTeam1 || inTeam2) return prev;
      
      return {
        ...prev,
        [team]: [...teamMembers, { ...friend, ready: false }]
      };
    });
  };

  const removeFromTeam = (team: 'team1' | 'team2', friendId: string) => {
    setTeams(prev => ({
      ...prev,
      [team]: prev[team].filter(m => m.id !== friendId)
    }));
  };

  const toggleReady = (team: 'team1' | 'team2', friendId: string) => {
    setTeams(prev => ({
      ...prev,
      [team]: prev[team].map(m => 
        m.id === friendId ? { ...m, ready: !m.ready } : m
      )
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading friends...</p>
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Friends Yet</h2>
              <p className="text-muted-foreground mb-6">
                You need to add friends before you can duel. Go to your profile to add friends!
              </p>
              <Button onClick={() => window.location.href = '/profile'}>
                Go to Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent">
              Code Duel
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Card className="border-2 border-red-500/20 bg-red-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-red-600 dark:text-red-500" />
                  <div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatTime(timeLeft)}</div>
                    <div className="text-xs text-muted-foreground">Time Remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Badge variant="destructive" className="text-base px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              DUEL MODE
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Teams Sidebar */}
          <Card className="lg:col-span-1 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                Teams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team 1 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-blue-600 dark:text-blue-500">Team 1</h3>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-500">
                    {teams.team1.filter(m => m.ready).length}/{teams.team1.length} Ready
                  </Badge>
                </div>
                <div className="space-y-2">
                  {teams.team1.map(member => (
                    <div 
                      key={member.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        member.id === user.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          member.id === user.id ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <span className="font-semibold text-sm">
                            {member.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`font-medium ${member.id === user.id ? 'text-primary' : ''}`}>
                            {member.username}
                            {member.id === user.id && <span className="ml-2 text-xs">(You)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.id !== user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromTeam('team1', member.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Badge 
                          variant={member.ready ? "success" : "secondary"} 
                          className="gap-1 cursor-pointer"
                          onClick={() => member.id !== user.id && toggleReady('team1', member.id)}
                        >
                          {member.ready ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Ready
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Waiting
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add friends to team 1 */}
                <div className="mt-2 space-y-1">
                  {friends
                    .filter(f => !teams.team1.some(m => m.id === f.id) && !teams.team2.some(m => m.id === f.id))
                    .map(friend => (
                      <Button
                        key={friend.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => addToTeam('team1', friend)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Add {friend.username}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Team 2 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-red-600 dark:text-red-500">Team 2</h3>
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-500">
                    {teams.team2.filter(m => m.ready).length}/{teams.team2.length} Ready
                  </Badge>
                </div>
                <div className="space-y-2">
                  {teams.team2.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
                  ) : (
                    teams.team2.map(member => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-3 rounded-lg border-2 border-border hover:border-red-500/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="font-semibold text-sm">
                              {member.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{member.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromTeam('team2', member.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Badge 
                            variant={member.ready ? "success" : "secondary"} 
                            className="gap-1 cursor-pointer"
                            onClick={() => toggleReady('team2', member.id)}
                          >
                            {member.ready ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                Ready
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Waiting
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* Add friends to team 2 */}
                <div className="mt-2 space-y-1">
                  {friends
                    .filter(f => !teams.team1.some(m => m.id === f.id) && !teams.team2.some(m => m.id === f.id))
                    .map(friend => (
                      <Button
                        key={friend.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => addToTeam('team2', friend)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Add {friend.username}
                      </Button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problem & Editor */}
          <Card className="lg:col-span-2 border-2">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">{problem.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">{problem.difficulty}</Badge>
                    <Badge variant="outline">{problem.category}</Badge>
                  </div>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[500px] border-2 rounded-lg overflow-hidden">
                <CodeEditor
                  language={language}
                  value={code}
                  onChange={setCode}
                />
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Run Code
                </Button>
                <Button className="flex-1" variant="default" size="lg">
                  <Trophy className="h-4 w-4 mr-2" />
                  Submit Solution
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
