import React, { useState, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, AlertCircle, CornerDownLeft } from 'lucide-react';
import { ChotuAssistantState } from '../types/tv';

interface ChotuVoiceBarProps {
  state: ChotuAssistantState;
  onStartListening: () => void;
  onStopListening: () => void;
  onExecuteCommand: (command: string, source: 'voice' | 'quick' | 'typed') => void;
}

export const ChotuVoiceBar: React.FC<ChotuVoiceBarProps> = ({
  state,
  onStartListening,
  onStopListening,
  onExecuteCommand,
}) => {
  const [typedInput, setTypedInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    onExecuteCommand(typedInput.trim(), 'typed');
    setTypedInput('');
  };

  const quickPrompts = [
    { label: 'Allu Arjun Movie (Telugu)', query: 'keep allu arjun movie in telugu', icon: '🎬' },
    { label: 'Live Cricket (Star Sports)', query: 'put cricket on star sports', icon: '🏏' },
    { label: 'TV9 Telugu News', query: 'keep tv9 telugu news', icon: '📰' },
    { label: 'Baahubali (Prabhas)', query: 'play baahubali in telugu', icon: '👑' },
    { label: 'Tom Cruise Movie (No Match)', query: 'keep tom cruise movie in telugu', icon: '🔍' },
    { label: 'Volume 80%', query: 'set volume to 80', icon: '🔊' },
    { label: 'Mute TV', query: 'mute', icon: '🔇' },
  ];

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Top row: Brand & Speech Status */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white tracking-tight">Chotu Voice & Search Assistant</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            Direct Tuning
          </span>
        </div>

        {state.status === 'listening' ? (
          <div className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Listening... Speak into your mic now</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] font-mono">
            Directly plays matching Indian channel
          </span>
        )}
      </div>

      {/* Main Input Form with Mic Button */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
        {/* Large Tap to Speak Mic button */}
        <button
          type="button"
          onClick={state.status === 'listening' ? onStopListening : onStartListening}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            state.status === 'listening'
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950 animate-pulse'
              : 'bg-gradient-to-tr from-sky-500 to-cyan-400 hover:brightness-110 text-slate-950 shadow-md shadow-sky-950'
          }`}
          title={state.status === 'listening' ? 'Click to Stop' : 'Tap to Speak'}
        >
          {state.status === 'listening' ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 fill-slate-950" />
              <span>Tap to Speak</span>
            </>
          )}
        </button>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Type any command: e.g. 'allu arjun movie', 'cricket', 'tv9 news', 'volume 80'..."
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!typedInput.trim()}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Play</span>
        </button>
      </form>



      {/* 1-Tap Quick Action Chips */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span>QUICK VOICE & CHANNEL COMMANDS:</span>
          <span className="text-sky-400">1-click direct play</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onExecuteCommand(p.query, 'quick')}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-sky-500 hover:bg-slate-800 text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
