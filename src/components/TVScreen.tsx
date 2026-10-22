import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Tv,
  Maximize2,
  Minimize2,
  Radio,
  Sparkles,
  Film,
} from 'lucide-react';
import { TVState, ChannelId } from '../types/tv';
import { CHANNELS, CHANNEL_LIST } from '../data/channelsData';

interface TVScreenProps {
  tvState: TVState;
  onPowerToggle: () => void;
  onChannelSelect: (channelId: ChannelId) => void;
  onToggleGuide: () => void;
  onToggleFullscreen: () => void;
  onUnmuteAudio: () => void;
  noticeMessage?: string;
  isAudioActive: boolean;
}

export const TVScreen: React.FC<TVScreenProps> = ({
  tvState,
  onPowerToggle,
  onChannelSelect,
  onToggleGuide,
  onToggleFullscreen,
  onUnmuteAudio,
  noticeMessage,
  isAudioActive,
}) => {
  const currentChannel = CHANNELS[tvState.currentChannelId] || CHANNELS['105'];
  const [useActualFilmPlayer, setUseActualFilmPlayer] = useState(true);
  const [videoKey, setVideoKey] = useState(0);

  // When channel changes, refresh video player key so it loads the new film cleanly
  useEffect(() => {
    setVideoKey((k) => k + 1);
  }, [tvState.currentChannelId]);

  return (
    <div
      className="relative w-full aspect-[16/9] max-h-[640px] bg-black rounded-3xl p-2 sm:p-3 shadow-2xl border-2 border-slate-800 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* TV Bezel Reflection Highlight */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/10" />

      {/* Screen Frame Container */}
      <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden flex flex-col">
        {/* ================= POWER OFF / STANDBY STATE ================= */}
        {tvState.power === 'STANDBY' ? (
          <div className="relative w-full h-full bg-[#04060A] flex flex-col items-center justify-center text-center p-6">
            <div className="relative flex flex-col items-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-600 shadow-inner">
                <Tv className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-300 mb-2">Smart TV in Standby</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                The TV is in standby. Click below or say <span className="text-sky-400 font-mono">"Turn on TV"</span> to wake.
              </p>
              <button
                onClick={onPowerToggle}
                className="px-5 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-rose-950/60"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Power On Display
              </button>
            </div>

            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-slate-600 border-t border-slate-900 pt-3 font-mono">
              <span>CHOTU OS · SMART TV EDITION</span>
              <span>STANDBY MODE</span>
            </div>
          </div>
        ) : (
          /* ================= POWER ON STATE ================= */
          <div className="relative w-full h-full overflow-hidden bg-black">
            {tvState.viewMode === 'HOME' ? (
              /* --- TV HOME SCREEN DASHBOARD --- */
              <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-[#0A1020] p-6 sm:p-8 flex flex-col justify-between text-white overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-950">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-base font-bold text-white flex items-center gap-2">
                        Smart TV India
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                          Chotu AI Inside
                        </span>
                      </h1>
                      <p className="text-xs text-slate-400">
                        Live Indian Channels · Telugu, Hindi & Sports
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onToggleGuide}
                    className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium"
                  >
                    View EPG Channel Guide →
                  </button>
                </div>

                {/* Popular Indian Channels Row */}
                <div className="my-auto py-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {CHANNEL_LIST.slice(0, 4).map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => onChannelSelect(channel.id)}
                        className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                          tvState.currentChannelId === channel.id
                            ? 'border-sky-500 ring-1 ring-sky-500 shadow-lg shadow-sky-950'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                        }`}
                      >
                        <div className="aspect-[16/10] relative overflow-hidden bg-slate-950">
                          <img
                            src={channel.image}
                            alt={channel.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                          
                          <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-white flex items-center gap-1">
                            <span className="text-sky-400 font-bold">{channel.number}</span>
                            <span>·</span>
                            <span>{channel.language}</span>
                          </div>

                          <div className="absolute bottom-2 left-2 right-2">
                            <span className="text-[10px] text-sky-300 font-medium block truncate">
                              {channel.name}
                            </span>
                            <h3 className="text-xs font-bold text-white truncate">
                              {channel.currentProgram.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-3 text-slate-400">
                  <span>Actual Film Playback Active · Allu Arjun Pushpa (Ch 105)</span>
                  <span>Use voice or command bar below to tune</span>
                </div>
              </div>
            ) : (
              /* --- ACTUAL FILM VIDEO PLAYER VIEW --- */
              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {/* 1. ACTUAL FILM VIDEO IFRAME EMBED (Plays Pushpa: The Rise for Ch 105, Baahubali for Ch 106, etc.) */}
                {currentChannel.videoEmbedId && useActualFilmPlayer ? (
                  <iframe
                    key={`${currentChannel.id}-${videoKey}`}
                    src={`https://www.youtube-nocookie.com/embed/${currentChannel.videoEmbedId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&playsinline=1`}
                    title={currentChannel.videoTitle || currentChannel.name}
                    className="w-full h-full object-cover border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  /* Fallback Broadcast Still with synthesized audio */
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={currentChannel.image}
                      alt={currentChannel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                  </div>
                )}

                {/* Top Corner Channel Badge */}
                <div className="absolute top-3 right-3 z-30 pointer-events-none">
                  <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-semibold border border-white/10 shadow-lg">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentChannel.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono">[{currentChannel.number}]</span>
                  </div>
                </div>

                {/* Switch to Video/Broadcast toggle button on top-left */}
                {currentChannel.videoEmbedId && (
                  <div className="absolute top-3 left-3 z-30">
                    <button
                      onClick={() => setUseActualFilmPlayer(!useActualFilmPlayer)}
                      className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-lg"
                      title="Toggle Actual Film Video Player"
                    >
                      <Film className="w-3 h-3 text-sky-400" />
                      <span>{useActualFilmPlayer ? 'Playing Actual Film' : 'Switch to Film Player'}</span>
                    </button>
                  </div>
                )}

                {/* Non-Blocking Notice Toast (for No-Match queries like "Tom Cruise") */}
                {noticeMessage && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-amber-950/95 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-500/50 text-xs text-amber-200 font-sans shadow-2xl flex items-center gap-2 pointer-events-none animate-fadeIn">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{noticeMessage}</span>
                  </div>
                )}

                {/* CHANNEL ON-SCREEN DISPLAY (OSD BANNER) - auto-fades after 3.5s */}
                {(tvState.showOSD || tvState.infoOverlayVisible) && (
                  <div className="absolute bottom-4 left-4 right-4 z-30 bg-slate-950/95 backdrop-blur-lg border border-slate-700/80 rounded-2xl p-3.5 text-white shadow-2xl transition-all duration-300 pointer-events-none">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold font-mono text-sky-400">
                          {currentChannel.number}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{currentChannel.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">· {currentChannel.language}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {currentChannel.resolution}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">
                            {currentChannel.currentProgram.title} ({currentChannel.currentProgram.leadActors[0]})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>{currentChannel.currentProgram.airTime}</span>
                        <span>·</span>
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                          {currentChannel.currentProgram.rating}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${currentChannel.currentProgram.progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {currentChannel.currentProgram.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VOLUME ON-SCREEN DISPLAY (OSD HUD) */}
        {tvState.power === 'ON' && tvState.showVolumeOSD && (
          <div className="absolute top-5 right-5 z-40 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex items-center gap-3 transition-all pointer-events-none">
            {tvState.isMuted ? (
              <div className="flex items-center gap-2 text-rose-400">
                <VolumeX className="w-5 h-5" />
                <span className="text-xs font-bold font-mono tracking-wide">MUTED</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-sky-400" />
                <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-400 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${tvState.volume}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-white tabular-nums min-w-[32px]">
                  {tvState.volume}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TV Bezel Lower Trim with Brand & Power LED */}
      <div className="relative pt-2 px-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              tvState.power === 'ON' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-500 shadow-sm shadow-rose-500'
            }`}
          />
          <span className="text-[11px] font-mono">
            {tvState.power === 'ON' ? 'TV ONLINE' : 'STANDBY'}
          </span>
        </div>

        <div className="text-[11px] tracking-widest font-extrabold uppercase text-slate-400 font-mono flex items-center gap-1.5">
          <span>SMART TV</span>
          <span className="text-sky-400">· CHOTU VOICE EDITION</span>
        </div>

        <button
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen TV"
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {tvState.isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
