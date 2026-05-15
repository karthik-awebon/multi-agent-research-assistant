'use client';

import { useState } from 'react';
import { ExecutionGraph } from '../components/ExecutionGraph';
import { ResearchForm } from '../components/ResearchForm';
import { useExecutionStore } from '../store/execution-store';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const reset = useExecutionStore((s) => s.reset);

  const handleSessionStart = (id: string) => {
    reset();
    setSessionId(id);
  };

  const handleReset = () => {
    reset();
    setSessionId(null);
  };

  return (
    <main className="min-h-screen p-8 bg-slate-900 text-slate-100 flex flex-col items-center">
      <header className="w-full max-w-6xl mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Multi-Agent Research Assistant
            </h1>
            <p className="text-slate-400">
              Real-time execution graph with Human-in-the-loop approval fences.
            </p>
          </div>
          {sessionId && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-3 py-2 rounded-lg transition-colors"
            >
              New Research
            </button>
          )}
        </div>
        {!sessionId && (
          <ResearchForm onSessionStart={handleSessionStart} />
        )}
        {sessionId && (
          <p className="text-xs text-slate-500 font-mono">
            Session: {sessionId}
          </p>
        )}
      </header>

      {sessionId && (
        <section className="w-full max-w-6xl flex-1">
          <ExecutionGraph sessionId={sessionId} />
        </section>
      )}

      {!sessionId && (
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
          Enter a research query above to begin.
        </div>
      )}
    </main>
  );
}
