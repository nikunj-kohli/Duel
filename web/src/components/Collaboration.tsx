import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "./CodeEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Radio, Loader2, Play } from "lucide-react";
import { PROBLEMS } from "@/data/problems";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CollaborationProps {
  onBack: () => void;
  user: any;
}

export function Collaboration({ onBack, user }: CollaborationProps) {
  const [problem] = useState(PROBLEMS[0]);
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(problem.templates[language]);
  const [participants] = useState([
    { id: user.id, username: user.username, isActive: true },
    { id: "2", username: "alice_coder", isActive: false },
    { id: "3", username: "bob_dev", isActive: false },
  ]);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge variant="default" className="text-lg px-4 py-2">
            <Radio className="h-4 w-4 mr-2" />
            Live Collaboration
          </Badge>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {/* Participants */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {participants.map(p => (
                  <div key={p.id} className={`flex items-center justify-between p-2 border rounded ${p.isActive ? 'bg-primary/10' : ''}`}>
                    <span className={p.id === user.id ? "font-bold" : ""}>{p.username}</span>
                    {p.isActive && <Badge variant="success">Typing...</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Problem & Editor */}
          <Card className="md:col-span-3">
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
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">{problem.description.substring(0, 200)}...</p>
              </div>
              <div className="h-[600px] border rounded">
                <CodeEditor
                  language={language}
                  value={code}
                  onChange={setCode}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" variant="outline" onClick={handleRun} disabled={isRunning}>
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
                <Button className="flex-1" variant="outline">Share Session</Button>
              </div>
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
