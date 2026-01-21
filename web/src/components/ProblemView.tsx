import { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { PROBLEMS, Problem } from "@/data/problems";

interface ProblemViewProps {
  problemId: string;
  onBack: () => void;
}

export function ProblemView({ problemId, onBack }: ProblemViewProps) {
  const problem = PROBLEMS.find(p => p.id === problemId);
  
  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <p>Problem not found</p>
            <Button onClick={onBack} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState(problem.templates[language]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(problem.templates[newLang as keyof typeof problem.templates]);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      const testInput = input.trim() || problem.testCases[0]?.input || '';
      let executableCode = code;
      
      if (language === 'java') {
        // Create a generic wrapper based on problem ID
        if (problem.id === '1') {
          // Two Sum - array and target
          if (testInput) {
            const lines = testInput.split('\n');
            executableCode = `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] numsStr = sc.nextLine().split("\\\\s+");
        int[] nums = new int[numsStr.length];
        for (int i = 0; i < numsStr.length; i++) {
            nums[i] = Integer.parseInt(numsStr[i]);
        }
        int target = sc.nextInt();
        
        Solution solution = new Solution();
        int[] result = solution.twoSum(nums, target);
        System.out.println("[" + result[0] + "," + result[1] + "]");
    }
}`;
          } else {
            executableCode = `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solution.twoSum(nums, target);
        System.out.println("[" + result[0] + "," + result[1] + "]");
    }
}`;
          }
        } else if (problem.id === '2') {
          // Add Two Numbers - two linked lists
          if (testInput) {
            const lines = testInput.trim().split('\n');
            executableCode = `
import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

${code}

public class Main {
    public static ListNode arrayToList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for (int i = 1; i < arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }
    
    public static void printList(ListNode head) {
        List<Integer> result = new ArrayList<>();
        while (head != null) {
            result.add(head.val);
            head = head.next;
        }
        System.out.println(result.toString().replaceAll("[\\\\[\\\\],]", ""));
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] line1 = sc.nextLine().trim().split("\\\\s+");
        String[] line2 = sc.nextLine().trim().split("\\\\s+");
        
        int[] arr1 = new int[line1.length];
        int[] arr2 = new int[line2.length];
        for (int i = 0; i < line1.length; i++) arr1[i] = Integer.parseInt(line1[i]);
        for (int i = 0; i < line2.length; i++) arr2[i] = Integer.parseInt(line2[i]);
        
        ListNode l1 = arrayToList(arr1);
        ListNode l2 = arrayToList(arr2);
        
        Solution solution = new Solution();
        ListNode result = solution.addTwoNumbers(l1, l2);
        printList(result);
    }
}`;
          } else {
            executableCode = `
import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

${code}

public class Main {
    public static ListNode arrayToList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for (int i = 1; i < arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }
    
    public static void printList(ListNode head) {
        List<Integer> result = new ArrayList<>();
        while (head != null) {
            result.add(head.val);
            head = head.next;
        }
        System.out.println(result.toString().replaceAll("[\\\\[\\\\],]", ""));
    }
    
    public static void main(String[] args) {
        ListNode l1 = arrayToList(new int[]{2, 4, 3});
        ListNode l2 = arrayToList(new int[]{5, 6, 4});
        Solution solution = new Solution();
        ListNode result = solution.addTwoNumbers(l1, l2);
        printList(result);
    }
}`;
          }
        } else {
          // Generic handler for other problems - just pass input as-is
          executableCode = `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution solution = new Solution();
        // Input handling depends on problem
        System.out.println("Default execution");
    }
}`;
        }
      }
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code: executableCode,
          input: testInput,
          timeLimit: 5000,
          memoryLimit: 256
        })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setOutput(result.output || '(No output)');
      } else {
        setOutput(`Error: ${result.error || result.stderr || 'Execution failed'}\n\nStderr: ${result.stderr || 'None'}`);
      }
    } catch (error: any) {
      setOutput(`Failed to connect to server: ${error.message}\n\nMake sure backend is running on port 3002`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    setOutput('Running all test cases...\n\n');
    
    try {
      const testCases = problem.testCases;
      const results = [];
      let passedCount = 0;
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        let executableCode = code;
        if (language === 'java') {
          if (problem.id === '1') {
            // Two Sum
            executableCode = `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            String line = sc.nextLine();
            String[] numsStr = line.trim().split("\\\\s+");
            int[] nums = new int[numsStr.length];
            for (int i = 0; i < numsStr.length; i++) {
                nums[i] = Integer.parseInt(numsStr[i]);
            }
            int target = sc.nextInt();
            
            Solution solution = new Solution();
            int[] result = solution.twoSum(nums, target);
            System.out.println("[" + result[0] + "," + result[1] + "]");
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
        }
    }
}`;
          } else if (problem.id === '2') {
            // Add Two Numbers
            executableCode = `
import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

${code}

public class Main {
    public static ListNode arrayToList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for (int i = 1; i < arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }
    
    public static void printList(ListNode head) {
        List<Integer> result = new ArrayList<>();
        while (head != null) {
            result.add(head.val);
            head = head.next;
        }
        System.out.println(result.toString().replaceAll("[\\\\[\\\\],]", ""));
    }
    
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            String[] line1 = sc.nextLine().trim().split("\\\\s+");
            String[] line2 = sc.nextLine().trim().split("\\\\s+");
            
            int[] arr1 = new int[line1.length];
            int[] arr2 = new int[line2.length];
            for (int i = 0; i < line1.length; i++) arr1[i] = Integer.parseInt(line1[i]);
            for (int i = 0; i < line2.length; i++) arr2[i] = Integer.parseInt(line2[i]);
            
            ListNode l1 = arrayToList(arr1);
            ListNode l2 = arrayToList(arr2);
            
            Solution solution = new Solution();
            ListNode result = solution.addTwoNumbers(l1, l2);
            printList(result);
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`;
          }
        }
        
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            code: executableCode,
            input: testCase.input,
            timeLimit: 5000,
            memoryLimit: 256
          })
        });
        
        const result = await response.json();
        
        const actualOutput = result.output?.trim() || '';
        const expectedOutput = testCase.expectedOutput.trim();
        const passed = actualOutput === expectedOutput;
        
        if (passed) passedCount++;
        
        results.push({
          testCaseNumber: i + 1,
          input: testCase.input,
          expectedOutput,
          actualOutput,
          passed,
          error: result.error
        });
        
        setOutput(prev => 
          prev + `Test Case ${i + 1}: ${passed ? '✅ PASSED' : '❌ FAILED'}\n` +
          (passed ? '' : `  Expected: ${expectedOutput}\n  Got: ${actualOutput || '(no output)'}\n`) +
          (result.error ? `  Error: ${result.error}\n` : '') +
          (result.stderr ? `  Stderr: ${result.stderr}\n` : '') + '\n'
        );
      }
      
      const allPassed = passedCount === testCases.length;
      setSubmissionResult({
        allPassed,
        passedCount,
        totalCount: testCases.length,
        results
      });
      
      setOutput(prev => 
        prev + '\n' + '='.repeat(50) + '\n' +
        (allPassed 
          ? `🎉 SUCCESS! All ${testCases.length} test cases passed!\n` 
          : `⚠️  ${passedCount}/${testCases.length} test cases passed\n`)
      );
      
    } catch (error: any) {
      setOutput(`Submission failed: ${error.message}\n\nMake sure backend is running on port 3002`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyVariant = (difficulty: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Panel - Problem Description */}
      <div className="w-[40%] border-r bg-muted/20 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Button>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{problem.title}</h1>
                <Badge variant={getDifficultyVariant(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line leading-relaxed">{problem.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {problem.examples.map((example: any, idx: number) => (
                  <div key={idx} className="bg-muted p-4 rounded-lg space-y-2">
                    <div><strong className="text-primary">Input:</strong> <code className="bg-background px-2 py-1 rounded">{example.input}</code></div>
                    <div><strong className="text-primary">Output:</strong> <code className="bg-background px-2 py-1 rounded">{example.output}</code></div>
                    {example.explanation && <div><strong className="text-primary">Explanation:</strong> {example.explanation}</div>}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {problem.constraints.map((constraint: string, idx: number) => (
                    <li key={idx} className="text-sm">{constraint}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {problem.inputFormat && (
              <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20">
                <CardHeader>
                  <CardTitle className="text-blue-600 dark:text-blue-400">📝 Input Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{problem.inputFormat.description}</p>
                  <pre className="bg-background p-3 rounded text-sm overflow-x-auto">
                    {problem.inputFormat.examples.join('\n')}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-card p-4 flex items-center justify-between">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              variant="outline"
            >
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
            <Button 
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 min-h-0">
          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
          />
        </div>

        {/* Input/Output Section */}
        <div className="h-[250px] border-t bg-card flex flex-col">
          {/* Submission Result Banner */}
          {submissionResult && (
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              submissionResult.allPassed 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-2">
                {submissionResult.allPassed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                )}
                <span className={`font-semibold ${
                  submissionResult.allPassed 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  {submissionResult.allPassed ? '🎉 Accepted' : '❌ Wrong Answer'}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {submissionResult.passedCount}/{submissionResult.totalCount} test cases passed
              </span>
            </div>
          )}
          
          <div className="flex-1 grid grid-cols-2 gap-4 p-4 min-h-0">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={problem.testCases[0]?.input || "Enter input..."}
                className="flex-1 font-mono text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {problem.inputFormat ? problem.inputFormat.description : "Leave empty for default test case"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Output</label>
              <ScrollArea className="flex-1 border rounded-md bg-muted p-3">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {output || 'Click "Run Code" to see output...'}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
