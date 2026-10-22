import React from 'react';
import {
  Power,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mic,
  Home,
  Menu,
  Info,
  Tv,
  Sparkles,
} from 'lucide-react';
import { TVState, ChannelId } from '../types/tv';

interface TVRemoteProps {
  tvState: TVState;
  onPowerToggle: () => void;
  onChannelChange: (direction: 'up' | 'down') => void;
  onChannelSelect: (channelId: ChannelId) => void;
  onVolumeChange: (direction: 'up' | 'down') => void;
  onMuteToggle: () => void;
  onPlayPauseToggle: () => void;
  onToggleGuide: () => void;
  onGoHome: () => void;
  onToggleInfo: () => void;
  onOpenChotu: () => void;
  isListening: boolean;
}

export const TVRemote: React.FC<TVRemoteProps> = ({
  tvState,
  onPowerToggle,
  onChannelChange,
  onChannelSelect,
  onVolumeChange,
  onMuteToggle,
  onPlayPauseToggle,
  onToggleGuide,
  onGoHome,
  onToggleInfo,
  onOpenChotu,
  isListening,
}) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
      {/* Remote Header / Branding */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Tv className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-300 font-mono">
            Smart Remote · Chotu
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>PAIRED</span>
        </div>
      </div>

      {/* Top Action Row: Power & Chotu Mic */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Power Button */}
        <button
          onClick={onPowerToggle}
          title={tvState.power === 'ON' ? 'Put TV in Standby' : 'Power On TV'}
          className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
            tvState.power === 'ON'
              ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900/80'
              : 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900/80 animate-pulse'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{tvState.power === 'ON' ? 'Standby' : 'Power On'}</span>
        </button>

        {/* Chotu Microphone Button */}
        <button
          onClick={onOpenChotu}
          title="Summon Chotu Voice Assistant"
          className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all shadow-md ${
            isListening
              ? 'bg-rose-600 border-rose-400 text-white shadow-rose-500/50 animate-pulse ring-2 ring-rose-400/50'
              : 'bg-gradient-to-tr from-sky-600 to-cyan-500 border-sky-400 text-slate-950 font-bold hover:brightness-110'
          }`}
        >
          <Mic className="w-4 h-4 fill-slate-950" />
          <span>{isListening ? 'Listening...' : 'Chotu Voice'}</span>
        </button>
      </div>

      {/* Mode Switches: Home, Guide, Info */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={onGoHome}
          className={`py-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-colors ${
            tvState.viewMode === 'HOME'
              ? 'bg-sky-900/50 border-sky-500 text-sky-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <button
          onClick={onToggleGuide}
          className={`py-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-colors ${
            tvState.viewMode === 'GUIDE'
              ? 'bg-sky-900/50 border-sky-500 text-sky-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Guide</span>
        </button>

        <button
          onClick={onToggleInfo}
          className={`py-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-colors ${
            tvState.infoOverlayVisible
              ? 'bg-sky-900/50 border-sky-500 text-sky-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Info</span>
        </button>
      </div>

      {/* D-Pad Directional Controller */}
      <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-slate-950 border border-slate-800 p-2 shadow-inner flex items-center justify-center relative">
          <button
            onClick={() => onChannelChange('up')}
            title="Channel Up / Navigate Up"
            className="absolute top-2 w-10 h-9 rounded-t-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => onChannelChange('down')}
            title="Channel Down / Navigate Down"
            className="absolute bottom-2 w-10 h-9 rounded-b-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => onVolumeChange('down')}
            title="Volume Down / Left"
            className="absolute left-2 h-10 w-9 rounded-l-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onVolumeChange('up')}
            title="Volume Up / Right"
            className="absolute right-2 h-10 w-9 rounded-r-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayPauseToggle}
            title="OK / Play-Pause"
            className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-sky-600 border border-slate-700 text-white font-bold text-xs shadow-md flex items-center justify-center transition-colors"
          >
            {tvState.isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
        </div>
      </div>

      {/* Rocker Bars: Volume & Channel */}
      <div className="grid grid-cols-2 gap-3 my-3">
        {/* Volume Rocker */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
          <span className="text-[10px] font-mono text-slate-400 mb-1">VOL ({tvState.volume}%)</span>
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => onVolumeChange('down')}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-xs font-bold transition-colors"
            >
              -
            </button>
            <button
              onClick={onMuteToggle}
              className={`p-1.5 rounded transition-colors ${
                tvState.isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Mute Toggle"
            >
              {tvState.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onVolumeChange('up')}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-xs font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Channel Rocker */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
          <span className="text-[10px] font-mono text-slate-400 mb-1">CH ({tvState.currentChannelId})</span>
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => onChannelChange('down')}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-xs font-bold transition-colors"
            >
              CH -
            </button>
            <button
              onClick={() => onChannelChange('up')}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-xs font-bold transition-colors"
            >
              CH +
            </button>
          </div>
        </div>
      </div>

      {/* Direct Channel Preset Buttons (Indian Channels) */}
      <div className="border-t border-slate-800/80 pt-3">
        <span className="text-[10px] font-mono text-slate-400 block mb-2">QUICK INDIAN CHANNELS</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onChannelSelect('105')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left transition-all ${
              tvState.currentChannelId === '105'
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-mono text-[11px] text-amber-400">105 · Maa Movies</div>
            <div className="text-[10px] text-slate-400 truncate">Pushpa (Allu Arjun)</div>
          </button>

          <button
            onClick={() => onChannelSelect('301')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left transition-all ${
              tvState.currentChannelId === '301'
                ? 'bg-sky-950/80 border-sky-500 text-sky-200 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-mono text-[11px] text-sky-400">301 · Star Sports</div>
            <div className="text-[10px] text-slate-400 truncate">Live Cricket (India)</div>
          </button>

          <button
            onClick={() => onChannelSelect('401')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left transition-all ${
              tvState.currentChannelId === '401'
                ? 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-mono text-[11px] text-rose-400">401 · TV9 Telugu</div>
            <div className="text-[10px] text-slate-400 truncate">Live News Desk</div>
          </button>

          <button
            onClick={() => onChannelSelect('101')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left transition-all ${
              tvState.currentChannelId === '101'
                ? 'bg-sky-950/80 border-sky-500 text-sky-200 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-mono text-[11px] text-sky-400">101 · Star Maa</div>
            <div className="text-[10px] text-slate-400 truncate">Bigg Boss Telugu</div>
          </button>
        </div>
      </div>
    </div>
  );
};
