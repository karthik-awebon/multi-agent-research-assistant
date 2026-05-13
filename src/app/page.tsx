import { ExecutionGraph } from '../components/ExecutionGraph';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-slate-900 text-slate-100 flex flex-col items-center">
      <header className="w-full max-w-6xl mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Multi-Agent Execution Engine
        </h1>
        <p className="text-slate-400">
          Real-time execution tree visualization with Human-in-the-loop (HITL) fences.
        </p>
      </header>
      
      <section className="w-full max-w-6xl h-full flex-1">
        <ExecutionGraph />
      </section>
    </main>
  );
}
