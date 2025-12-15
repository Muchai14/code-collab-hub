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

  // Create a custom console to capture output
  const customConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(String).join(' '));
    },
    error: (...args: unknown[]) => {
      logs.push(`Error: ${args.map(String).join(' ')}`);
    },
    warn: (...args: unknown[]) => {
      logs.push(`Warning: ${args.map(String).join(' ')}`);
    },
    info: (...args: unknown[]) => {
      logs.push(args.map(String).join(' '));
    },
  };

  try {
    // Create a sandboxed function
    const sandboxedCode = `
      (function(console) {
        ${code}
      })
    `;

    // eslint-disable-next-line no-eval
    const fn = eval(sandboxedCode);
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
