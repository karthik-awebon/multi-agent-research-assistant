'use client';

import { FormEvent, useState } from 'react';
import { APP_CONFIG } from '../constants';
import { logger } from '../utils/logger';

interface ResearchFormProps {
  onSessionStart: (sessionId: string) => void;
}

export function ResearchForm({ onSessionStart }: ResearchFormProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(APP_CONFIG.ENDPOINTS.RESEARCH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const { sessionId } = await res.json();
      logger.info({ sessionId }, 'Research session started');
      onSessionStart(sessionId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ err }, 'Failed to start research session');
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What would you like to research?"
          disabled={loading}
          className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Starting…' : 'Research'}
        </button>
      </div>
      {error && (
        <p className="text-rose-400 text-xs">{error}</p>
      )}
    </form>
  );
}
