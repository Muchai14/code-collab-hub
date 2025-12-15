import type { CodeExecutionResult, Language } from './types';

let pyodideInstance: unknown = null;
let pyodideLoading = false;
let pyodideLoadPromise: Promise<unknown> | null = null;

/**
 * Load Pyodide for Python execution
 */
async function loadPyodide(): Promise<unknown> {
  if (pyodideInstance) return pyodideInstance;

  if (pyodideLoading && pyodideLoadPromise) {
    return pyodideLoadPromise;
  }

  pyodideLoading = true;

  pyodideLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
    script.async = true;

    script.onload = async () => {
      try {
        // @ts-expect-error - Pyodide is loaded globally
        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        });
        pyodideInstance = pyodide;
        resolve(pyodide);
      } catch (error) {
        reject(error);
      }
    };

    script.onerror = () => reject(new Error('Failed to load Pyodide'));
    document.head.appendChild(script);
  });

  return pyodideLoadPromise;
}

/**
 * Execute JavaScript code safely
 */
function executeJavaScript(code: string): CodeExecutionResult {
  const startTime = performance.now();
  const logs: string[] = [];

  // Helper to safely format arguments
  const formatArg = (arg: unknown): string => {
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  };

  // Create a custom console to capture output
  const customConsole = {
    log: (...args: unknown[]) => {
      const formatted = args.map(formatArg).join(' ');
      logs.push(formatted);
      console.log('[User Code]', ...args); // Mirror to real console
    },
    error: (...args: unknown[]) => {
      const formatted = args.map(formatArg).join(' ');
      logs.push(`Error: ${formatted}`);
      console.error('[User Code]', ...args);
    },
    warn: (...args: unknown[]) => {
      const formatted = args.map(formatArg).join(' ');
      logs.push(`Warning: ${formatted}`);
      console.warn('[User Code]', ...args);
    },
    info: (...args: unknown[]) => {
      const formatted = args.map(formatArg).join(' ');
      logs.push(formatted);
      console.info('[User Code]', ...args);
    },
  };

  try {
    // Wrap code in a function that takes console as argument
    // We use new Function instead of eval for better scope isolation
    // The code behaves as if it's inside a function body
    const fn = new Function('console', code);

    fn(customConsole);

    const executionTime = performance.now() - startTime;

    return {
      output: logs.join('\n') || 'Code executed successfully (no output)',
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    return {
      output: logs.join('\n'),
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    };
  }
}

/**
 * Execute Python code using Pyodide
 */
async function executePython(code: string): Promise<CodeExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = (await loadPyodide()) as {
      runPython: (code: string) => unknown;
      runPythonAsync: (code: string) => Promise<unknown>;
    };

    // Redirect stdout to capture print statements
    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
    `);

    // Run the user's code
    await pyodide.runPythonAsync(code);

    // Get the output
    const stdout = pyodide.runPython('sys.stdout.getvalue()') as string;
    const stderr = pyodide.runPython('sys.stderr.getvalue()') as string;

    // Reset stdout/stderr
    pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);

    const executionTime = performance.now() - startTime;

    if (stderr) {
      return {
        output: stdout,
        error: stderr,
        executionTime,
      };
    }

    return {
      output: stdout || 'Code executed successfully (no output)',
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    return {
      output: '',
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    };
  }
}

/**
 * Execute code based on language
 */
export async function executeCode(
  code: string,
  language: Language
): Promise<CodeExecutionResult> {
  if (language === 'python') {
    return executePython(code);
  }
  return executeJavaScript(code);
}

/**
 * Preload Pyodide for faster execution
 */
export function preloadPyodide(): void {
  loadPyodide().catch(console.error);
}
