import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ language, value, onChange, readOnly = false }: CodeEditorProps) {
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');

  return (
    <div className="h-full flex flex-col border bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <span className="text-sm font-medium text-muted-foreground">
          Language: {language.toUpperCase()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
          className="h-8"
        >
          {theme === 'vs-dark' ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              Light
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </>
          )}
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={value}
          theme={theme}
          onChange={(val) => onChange(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly,
            automaticLayout: true,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
