import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles, ExternalLink, CornerDownLeft } from 'lucide-react';
import { ChotuAssistantState } from '../types/tv';

interface VoiceListeningModalProps {
  isOpen: boolean;
  state: ChotuAssistantState;
  onClose: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onExecuteCommand: (command: string, source: 'voice' | 'quick' | 'typed') => void;
}

export const VoiceListeningModal: React.FC<VoiceListeningModalProps> = ({
  isOpen,
  state,
  onClose,
  onStartListening,
  onStopListening,
  onExecuteCommand,
}) => {
  const [typedInput, setTypedInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setIsInIframe(window.self !== window.top);
      } catch {
        setIsInIframe(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    onExecuteCommand(typedInput.trim(), 'typed');
    onClose();
  };

  const spokenPrompts = [
    { label: 'Chotu keep allu arjun movie in telugu', query: 'keep allu arjun movie in telugu', icon: '🎬', tag: 'Allu Arjun · Ch 105' },
    { label: 'Chotu put cricket on Star Sports', query: 'put cricket on star sports', icon: '🏏', tag: 'Live Cricket · Ch 301' },
    { label: 'Chotu keep TV9 Telugu News', query: 'keep tv9 telugu news', icon: '📰', tag: 'Live News · Ch 401' },
    { label: 'Chotu play Baahubali in Telugu', query: 'play baahubali in telugu', icon: '👑', tag: 'Prabhas · Ch 106' },
    { label: 'Chotu keep Tom Cruise movie in Telugu', query: 'keep tom cruise movie in telugu', icon: '🔍', tag: 'No Match Test' },
    { label: 'Chotu volume 80 pettu', query: 'set volume to 80', icon: '🔊', tag: 'Volume 80%' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white overflow-hidden">
        {/* Top ambient blue bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold">
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Chotu Voice Control
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  Voice Agent
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Speak or select your voice command</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Microphone & Visualizer */}
        <div className="py-5 flex flex-col items-center text-center">
          <button
            onClick={state.status === 'listening' ? onStopListening : onStartListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
              state.status === 'listening'
                ? 'bg-rose-600 text-white ring-8 ring-rose-500/30 animate-pulse'
                : 'bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 hover:brightness-110 ring-4 ring-sky-500/20'
            }`}
          >
            {state.status === 'listening' ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7 fill-slate-950" />
            )}
          </button>

          {/* Sound waves when listening */}
          {state.status === 'listening' ? (
            <div className="mt-3 flex items-center justify-center gap-1.5 h-5">
              {[30, 60, 90, 75, 100, 80, 50, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-sky-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-3 text-xs font-mono text-slate-400">
              {state.transcript ? `“${state.transcript}”` : 'Say or tap a voice command below:'}
            </div>
          )}
        </div>

        {/* If inside an iframe preview, offer a direct new tab option */}
        {isInIframe && (
          <div className="bg-sky-950/40 border border-sky-800/60 rounded-xl p-2.5 mb-3 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 text-[11px]">
              Want physical live mic input? Open in a full browser tab:
            </span>
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium text-[11px] flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>Full Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Direct Type Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
          <input
            ref={inputRef}
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Type voice command: e.g. 'allu arjun movie', 'cricket'..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-2 pl-3 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={!typedInput.trim()}
            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>Play</span>
          </button>
        </form>

        {/* Spoken Voice Commands (Instant execution) */}
        <div>
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
            <span>SAY OR TAP TO PLAY DIRECTLY:</span>
            <span className="text-sky-400">Direct Tune</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {spokenPrompts.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  onExecuteCommand(p.query, 'voice');
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500 hover:bg-slate-800 flex items-center justify-between gap-2 text-left transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{p.icon}</span>
                  <span className="text-xs text-slate-200 group-hover:text-white font-medium truncate">
                    "{p.label}"
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-sky-300 shrink-0">
                  {p.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
