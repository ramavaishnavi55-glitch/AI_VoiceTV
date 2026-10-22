import React from 'react';
import { History, Trash2, RotateCcw, Mic, Terminal, Tv, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { CommandLog } from '../types/tv';

interface CommandHistoryProps {
  history: CommandLog[];
  onClearHistory: () => void;
  onReplayCommand: (rawText: string) => void;
}

export const CommandHistory: React.FC<CommandHistoryProps> = ({
  history,
  onClearHistory,
  onReplayCommand,
}) => {
  const getSourceIcon = (source: CommandLog['source']) => {
    switch (source) {
      case 'voice':
        return <Mic className="w-3 h-3 text-sky-400" />;
      case 'typed':
        return <Terminal className="w-3 h-3 text-emerald-400" />;
      case 'remote':
        return <Tv className="w-3 h-3 text-amber-400" />;
      default:
        return <Zap className="w-3 h-3 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">Recent Command Audit Log</h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {history.length} events
          </span>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            title="Clear Command History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* History Items Container */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[320px] pr-1">
        {history.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center text-slate-500">
            <History className="w-8 h-8 stroke-[1.5] mb-2 opacity-50" />
            <p className="text-xs font-medium">No voice or text commands executed yet</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Speak via microphone, type a prompt, or use remote buttons.
            </p>
          </div>
        ) : (
          history.map((log) => (
            <div
              key={log.id}
              className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-start justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {getSourceIcon(log.source)}
                    <span className="capitalize">{log.source}</span>
                  </span>

                  <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                    {log.timestamp}
                  </span>

                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/50">
                    {log.intent}
                  </span>

                  {log.status === 'success' ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium ml-auto">
                      <CheckCircle2 className="w-3 h-3" />
                      Executed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-rose-400 font-medium ml-auto">
                      <XCircle className="w-3 h-3" />
                      Failed
                    </span>
                  )}
                </div>

                <p className="text-slate-200 font-medium truncate">
                  "{log.rawText}"
                </p>

                <p className="text-[11px] text-slate-400 mt-0.5">
                  {log.feedbackMessage}
                </p>
              </div>

              {/* Re-run action button */}
              <button
                onClick={() => onReplayCommand(log.rawText)}
                title="Re-run this command"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500 text-slate-400 hover:text-sky-300 transition-colors shrink-0 mt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
