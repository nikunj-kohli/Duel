import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "./CodeEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Trophy, Clock, Play, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { PROBLEMS } from "@/data/problems";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DuelProps {
  onBack: () => void;
  user: any;
}

export function Duel({ onBack, user }: DuelProps) {
  const [problem] = useState(PROBLEMS[0]);
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(problem.templates[language]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [teams, setTeams] = useState({
    team1: [
      { id: user.id, username: user.username, ready: true },
      { id: "2", username: "alice_coder", ready: false },
    ],
    team2: [
      { id: "3", username: "bob_dev", ready: true },
      { id: "4", username: "charlie_hacker", ready: false },
    ]
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running...");
    try {
      const testInput = problem.testCases[0]?.input || "";
      let executableCode = code;
      if (language === "java") {
        executableCode = `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution solution = new Solution();
        System.out.println("OK");
    }
}`;
      }
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code: executableCode, input: testInput, timeLimit: 5000, memoryLimit: 256 })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setOutput(result.output || '(No output)');
      } else {
        setOutput(`Error: ${result.error || result.stderr || 'Execution failed'}`);
      }
    } catch (e: any) {
      setOutput(`Failed to connect: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    setOutput('Running test cases...');
    try {
      const testCases = problem.testCases;
      let passedCount = 0;
      for (let i = 0; i < testCases.length; i++) {
        const testInput = testCases[i].input;
        let executableCode = code;
        if (language === 'java') {
          executableCode = `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution solution = new Solution();
        System.out.println("OK");
    }
}`;
        }
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, code: executableCode, input: testInput, timeLimit: 5000, memoryLimit: 256 })
        });
        const result = await response.json();
        const actualOutput = result.output?.trim() || '';
        const expectedOutput = testCases[i].expectedOutput.trim();
        const passed = actualOutput === expectedOutput;
        if (passed) passedCount++;
      }
      setSubmissionResult({
        allPassed: passedCount === testCases.length,
        passedCount,
        totalCount: testCases.length,
      });
    } catch (e: any) {
      setOutput(`Submission failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
              </div>
            </Card>
            <Badge variant="destructive" className="text-lg px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              DUEL MODE
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Teams */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-blue-600">Team 1</h3>
                <div className="space-y-2">
                  {teams.team1.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <span className={member.id === user.id ? "font-bold" : ""}>{member.username}</span>
                      <Badge variant={member.ready ? "success" : "secondary"}>{member.ready ? "Ready" : "Waiting"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Team 2</h3>
                <div className="space-y-2">
                  {teams.team2.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{member.username}</span>
                      <Badge variant={member.ready ? "success" : "secondary"}>{member.ready ? "Ready" : "Waiting"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problem & Editor */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{problem.title}</CardTitle>
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
            <CardContent>
              <div className="h-[600px] border rounded">
                <CodeEditor
                  language={language}
                  value={code}
                  onChange={setCode}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" variant="outline" onClick={handleRun} disabled={isRunning || isSubmitting}>
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>Submit Solution</>
                  )}
                </Button>
              </div>
              {submissionResult && (
                <div className={`mt-3 px-3 py-2 rounded border ${submissionResult.allPassed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {submissionResult.allPassed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm font-medium">
                        {submissionResult.allPassed ? 'Accepted' : 'Wrong Answer'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{submissionResult.passedCount}/{submissionResult.totalCount} passed</span>
                  </div>
                </div>
              )}
              <div className="mt-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32 border rounded p-3">
                      <pre className="text-sm font-mono whitespace-pre-wrap">{output || 'Run to see output...'}</pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
