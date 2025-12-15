import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OutputPanel } from './components/OutputPanel';

describe('OutputPanel', () => {
    it('displays output when provided', () => {
        const result = { output: 'Hello World', executionTime: 10 };
        render(
            <OutputPanel
                result={result}
                isExecuting={false}
                onClear={() => { }}
            />
        );
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
});
