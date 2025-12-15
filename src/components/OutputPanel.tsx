import { Terminal, Clock, XCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CodeExecutionResult } from '@/services/types';
import { cn } from '@/lib/utils';

interface OutputPanelProps {
  result: CodeExecutionResult | null;
  isExecuting: boolean;
  onClear: () => void;
}

export function OutputPanel({ result, isExecuting, onClear }: OutputPanelProps) {
  const hasError = result?.error;
  const hasOutput = result?.output;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-terminal-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Output</span>
          {result && (
            <div className="flex items-center gap-1.5">
              {hasError ? (
                <XCircle className="h-3.5 w-3.5 text-destructive" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{result.executionTime.toFixed(2)}ms</span>
              </div>
            </div>
          )}
        </div>
        {result && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Output content */}
      <div className="flex-1 overflow-auto p-4 scrollbar-thin">
        {isExecuting ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">Running code...</span>
          </div>
        ) : result ? (
          <div className="space-y-2">
            {hasOutput && (
              <pre
                className={cn(
                  'font-mono text-sm whitespace-pre-wrap',
                  hasError ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {result.output}
              </pre>
            )}
            {hasError && (
              <pre className="font-mono text-sm text-destructive whitespace-pre-wrap">
                {result.error}
              </pre>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Run your code to see the output here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
