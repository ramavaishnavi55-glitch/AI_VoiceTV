import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tv,
  Maximize2,
  Minimize2,
  Menu,
  Mic,
  Volume2,
} from 'lucide-react';

import { TVState, ChannelId, CommandLog, ChotuAssistantState, CommandSource } from './types/tv';
import { CHANNELS } from './data/channelsData';
import { processTVCommand } from './services/commandProcessor';
import { speechService } from './services/speechService';
import { tvAudioEngine } from './services/tvAudioEngine';

import { TVScreen } from './components/TVScreen';
import { TVRemote } from './components/TVRemote';
import { ChotuVoiceBar } from './components/ChotuVoiceBar';
import { CommandHistory } from './components/CommandHistory';
import { ChannelGuideModal } from './components/ChannelGuideModal';
import { VoiceListeningModal } from './components/VoiceListeningModal';

export default function App() {
  // Main Virtual Smart TV State - initialized on Channel 105 (Star Maa Movies - Pushpa: The Rise)
  const [tvState, setTvState] = useState<TVState>({
    power: 'ON',
    currentChannelId: '105',
    isPlaying: true,
    volume: 75,
    isMuted: false,
    previousVolume: 75,
    viewMode: 'LIVE',
    showOSD: true,
    showVolumeOSD: false,
    osdMessage: 'Star Maa Movies · Channel 105 · Pushpa: The Rise',
    infoOverlayVisible: false,
    isFullscreen: false,
    voiceFeedbackMuted: true,
  });

  // Track if Web Audio context has been unlocked by user gesture
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Chotu Assistant State
  const [chotuState, setChotuState] = useState<ChotuAssistantState>({
    status: 'idle',
    isOpen: false,
    transcript: '',
    responseMessage: '',
    micPermissionStatus: speechService.isSupported() ? 'prompt' : 'unsupported',
    errorMessage: undefined,
  });

  // Dedicated Voice Modal Open State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Ephemeral toast notice on TV screen for no-match queries
  const [noticeMessage, setNoticeMessage] = useState<string | undefined>(undefined);
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Command Audit History
  const [commandHistory, setCommandHistory] = useState<CommandLog[]>([
    {
      id: 'cmd-init-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rawText: 'system initialization',
      intent: 'SYSTEM_BOOT',
      source: 'quick',
      status: 'success',
      feedbackMessage: 'Playing Channel 105 Star Maa Movies (Pushpa: The Rise - Allu Arjun) with live Telugu 5.1 audio.',
      foundProgram: 'Pushpa: The Rise - Part 1',
      foundChannel: 'Star Maa Movies',
    },
  ]);

  // EPG Guide modal
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // References for OSD auto-hide timeouts
  const osdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const volumeOsdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Unmute / Start TV Audio Output
  const handleUnmuteAudio = useCallback(async () => {
    await tvAudioEngine.resumeAudioContext();
    tvAudioEngine.startChannelAudio(tvState.currentChannelId, tvState.volume, false);
    setIsAudioActive(true);
    setTvState((prev) => ({ ...prev, isMuted: false }));
  }, [tvState.currentChannelId, tvState.volume]);

  // Sync TV Audio with TV State changes (only for channels without an embedded video player)
  useEffect(() => {
    const channel = CHANNELS[tvState.currentChannelId];
    if (tvState.power === 'STANDBY' || !tvState.isPlaying || channel?.videoEmbedId) {
      tvAudioEngine.stopChannelAudio();
    } else if (isAudioActive) {
      tvAudioEngine.startChannelAudio(tvState.currentChannelId, tvState.volume, tvState.isMuted);
    }
  }, [tvState.currentChannelId, tvState.power, tvState.isPlaying, tvState.isMuted, tvState.volume, isAudioActive]);

  // First interaction listener to enable audio seamlessly
  useEffect(() => {
    const handleFirstClick = () => {
      tvAudioEngine.resumeAudioContext().then(() => {
        setIsAudioActive(true);
        tvAudioEngine.startChannelAudio(tvState.currentChannelId, tvState.volume, tvState.isMuted);
      });
    };
    window.addEventListener('click', handleFirstClick, { once: true });
    return () => window.removeEventListener('click', handleFirstClick);
  }, [tvState.currentChannelId, tvState.volume, tvState.isMuted]);

  // Helper to trigger OSD channel banner with auto-hide (3.5s)
  const triggerOSD = useCallback((message?: string) => {
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    setTvState((prev) => ({
      ...prev,
      showOSD: true,
      osdMessage: message || prev.osdMessage,
    }));
    osdTimerRef.current = setTimeout(() => {
      setTvState((prev) => ({ ...prev, showOSD: false }));
    }, 3500);
  }, []);

  // Helper to trigger Volume OSD HUD with auto-hide (2.5s)
  const triggerVolumeOSD = useCallback(() => {
    if (volumeOsdTimerRef.current) clearTimeout(volumeOsdTimerRef.current);
    setTvState((prev) => ({ ...prev, showVolumeOSD: true }));
    volumeOsdTimerRef.current = setTimeout(() => {
      setTvState((prev) => ({ ...prev, showVolumeOSD: false }));
    }, 2500);
  }, []);

  // Central Command Execution Engine: Directly opens and plays channel with real sound!
  const executeCommand = useCallback(
    (commandText: string, source: CommandSource = 'typed') => {
      // Ensure audio context is running
      tvAudioEngine.resumeAudioContext().then(() => setIsAudioActive(true));

      setChotuState((prev) => ({
        ...prev,
        status: 'processing',
        transcript: commandText,
        errorMessage: undefined,
      }));

      // Process query through smart natural language matcher
      const result = processTVCommand(commandText, tvState, source);

      // Apply updated TV state immediately
      setTvState((prev) => ({
        ...prev,
        ...result.updatedState,
        isPlaying: true, // Always start playback immediately!
      }));

      // Start audio for target channel right away
      if (result.updatedState.currentChannelId) {
        tvAudioEngine.startChannelAudio(
          result.updatedState.currentChannelId,
          result.updatedState.volume ?? tvState.volume,
          result.updatedState.isMuted ?? false
        );
      }

      // Handle no-match notice toast if present
      if (result.noticeToast) {
        if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
        setNoticeMessage(result.noticeToast);
        noticeTimerRef.current = setTimeout(() => {
          setNoticeMessage(undefined);
        }, 4000);
      } else {
        setNoticeMessage(undefined);
      }

      // Update Chotu State
      setChotuState((prev) => ({
        ...prev,
        status: 'idle',
        transcript: commandText,
        responseMessage: result.commandLog.feedbackMessage,
        matchedProgram: result.matchedProgram,
        matchedChannel: result.matchedChannel,
      }));

      // Log to command history
      setCommandHistory((prev) => [result.commandLog, ...prev.slice(0, 49)]);

      // Trigger brief OSD banner on channel change
      if (result.updatedState.showOSD) {
        triggerOSD(result.updatedState.osdMessage);
      }
      if (result.updatedState.showVolumeOSD) {
        triggerVolumeOSD();
      }
    },
    [tvState, triggerOSD, triggerVolumeOSD]
  );

  // Microphone Speech Recognition Handler: opens modal & listens directly!
  const handleStartListening = useCallback(() => {
    setIsVoiceModalOpen(true);
    setChotuState((prev) => ({
      ...prev,
      status: 'listening',
      transcript: '',
      errorMessage: undefined,
    }));

    const started = speechService.startListening(
      (interim) => {
        setChotuState((prev) => ({ ...prev, transcript: interim }));
      },
      (finalTranscript) => {
        executeCommand(finalTranscript, 'voice');
        setIsVoiceModalOpen(false); // auto-close on speech recognized!
      },
      (errorMsg, isPerm) => {
        setChotuState((prev) => ({
          ...prev,
          status: 'idle',
          micPermissionStatus: isPerm ? 'denied' : 'unsupported',
          errorMessage: errorMsg,
        }));
      },
      () => {
        setChotuState((prev) => ({
          ...prev,
          status: prev.status === 'listening' ? 'idle' : prev.status,
        }));
      }
    );

    if (!started) {
      setChotuState((prev) => ({
        ...prev,
        status: 'idle',
      }));
    }
  }, [executeCommand]);

  const handleStopListening = useCallback(() => {
    speechService.stopListening();
    setChotuState((prev) => ({ ...prev, status: 'idle' }));
  }, []);

  // Direct Remote Handlers
  const handlePowerToggle = () => {
    executeCommand(tvState.power === 'ON' ? 'turn off tv' : 'turn on tv', 'remote');
  };

  const handleChannelSelect = (channelId: ChannelId) => {
    executeCommand(`channel ${channelId}`, 'remote');
  };

  const handleChannelChange = (direction: 'up' | 'down') => {
    executeCommand(direction === 'up' ? 'next channel' : 'previous channel', 'remote');
  };

  const handleVolumeChange = (direction: 'up' | 'down') => {
    executeCommand(direction === 'up' ? 'volume up' : 'volume down', 'remote');
  };

  const handleMuteToggle = () => {
    executeCommand(tvState.isMuted ? 'unmute' : 'mute', 'remote');
  };

  const handlePlayPauseToggle = () => {
    executeCommand(tvState.isPlaying ? 'pause' : 'play', 'remote');
  };

  const handleToggleGuide = () => {
    setIsGuideOpen((prev) => !prev);
  };

  const handleGoHome = () => {
    setIsGuideOpen(false);
    executeCommand('home', 'remote');
  };

  const handleToggleInfo = () => {
    setTvState((prev) => ({ ...prev, infoOverlayVisible: !prev.infoOverlayVisible }));
    triggerOSD();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setTvState((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setTvState((prev) => ({ ...prev, isFullscreen: false }));
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault();
          handleStartListening();
          break;
        case ' ':
          e.preventDefault();
          handlePlayPauseToggle();
          break;
        case 'g':
          e.preventDefault();
          handleToggleGuide();
          break;
        case 'm':
          e.preventDefault();
          handleMuteToggle();
          break;
        case 'h':
          e.preventDefault();
          handleGoHome();
          break;
        case 'p':
          e.preventDefault();
          handlePowerToggle();
          break;
        case 'arrowup':
          e.preventDefault();
          handleChannelChange('up');
          break;
        case 'arrowdown':
          e.preventDefault();
          handleChannelChange('down');
          break;
        case 'arrowright':
          e.preventDefault();
          handleVolumeChange('up');
          break;
        case 'arrowleft':
          e.preventDefault();
          handleVolumeChange('down');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStartListening, handlePlayPauseToggle, handleToggleGuide, handleMuteToggle, handleGoHome, handlePowerToggle, handleChannelChange, handleVolumeChange]);

  // Initial OSD banner display
  useEffect(() => {
    triggerOSD('Star Maa Movies · Channel 105 · Pushpa: The Rise (Allu Arjun)');
  }, [triggerOSD]);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-950">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              VoiceTV AI
            </span>
            <span className="ml-2 hidden sm:inline-block text-[10px] font-mono text-sky-400 bg-sky-950/80 border border-sky-800/80 px-2 py-0.5 rounded">
              Chotu Assistant Pre-Installed
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={handleGoHome}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              tvState.viewMode === 'HOME' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            TV Home Hub
          </button>
          <button
            onClick={() => {
              setTvState((prev) => ({ ...prev, viewMode: 'LIVE' }));
              setIsGuideOpen(false);
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              tvState.viewMode === 'LIVE' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Live Feed (Ch {tvState.currentChannelId})
          </button>
          <button
            onClick={handleToggleGuide}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Channel Guide (EPG)
          </button>
          <a
            href="#recent-commands"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Command Audit Log
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* Sound State Toggle Button */}
          <button
            onClick={handleUnmuteAudio}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isAudioActive && !tvState.isMuted
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                : 'bg-amber-950/80 border-amber-700 text-amber-300 animate-pulse'
            }`}
            title="Toggle TV Sound"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isAudioActive && !tvState.isMuted ? 'Sound Active' : 'Enable Sound'}</span>
          </button>

          {/* Standalone Tab Link */}
          <a
            href={typeof window !== 'undefined' ? window.location.href : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Open in Full Browser Tab for Physical Microphone Access"
          >
            <span>Open in Full Tab</span>
          </a>

          <button
            onClick={handleToggleFullscreen}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            title="Toggle Fullscreen TV"
          >
            {tvState.isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Fullscreen</span>
          </button>

          <button
            onClick={handleStartListening}
            className="px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 shadow-lg bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 hover:brightness-110"
          >
            <Mic className="w-3.5 h-3.5 fill-slate-950" />
            <span>Tap to Speak</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-5 space-y-5">
        {/* TV Screen + Side Remote Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main TV Screen Column (8 Cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* 1. TV Screen (Pure, clean, with real audio broadcast and equalizer) */}
            <TVScreen
              tvState={tvState}
              onPowerToggle={handlePowerToggle}
              onChannelSelect={handleChannelSelect}
              onToggleGuide={handleToggleGuide}
              onToggleFullscreen={handleToggleFullscreen}
              onUnmuteAudio={handleUnmuteAudio}
              noticeMessage={noticeMessage}
              isAudioActive={isAudioActive}
            />

            {/* 2. Chotu Voice & Text Input Bar (Positioned DOWN below the TV screen) */}
            <ChotuVoiceBar
              state={chotuState}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onExecuteCommand={executeCommand}
            />
          </div>

          {/* TV Remote Control Column (4 Cols on desktop) */}
          <div className="lg:col-span-4">
            <TVRemote
              tvState={tvState}
              onPowerToggle={handlePowerToggle}
              onChannelChange={handleChannelChange}
              onChannelSelect={handleChannelSelect}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              onPlayPauseToggle={handlePlayPauseToggle}
              onToggleGuide={handleToggleGuide}
              onGoHome={handleGoHome}
              onToggleInfo={handleToggleInfo}
              onOpenChotu={handleStartListening}
              isListening={chotuState.status === 'listening'}
            />
          </div>
        </div>

        {/* Section 2: Recent Commands Audit Log & Active Indian Channels */}
        <div id="recent-commands" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Recent Commands History (7 Cols) */}
          <div className="lg:col-span-7">
            <CommandHistory
              history={commandHistory}
              onClearHistory={() => setCommandHistory([])}
              onReplayCommand={(raw) => executeCommand(raw, 'quick')}
            />
          </div>

          {/* Indian Channel Lineup Preview (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Active Indian Channels</h3>
              </div>
              <button
                onClick={handleToggleGuide}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                Open Full EPG →
              </button>
            </div>

            <div className="space-y-2.5">
              {(['105', '106', '301', '401'] as ChannelId[]).map((id) => {
                const ch = CHANNELS[id];
                const isActive = tvState.currentChannelId === id;
                return (
                  <div
                    key={id}
                    onClick={() => handleChannelSelect(id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-slate-800/90 border-sky-500 shadow-sm ring-1 ring-sky-500'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                        <img
                          src={ch.image}
                          alt={ch.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-400">
                            {ch.number}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">
                            {ch.name}
                          </span>
                          <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                            {ch.language}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {ch.currentProgram.title} ({ch.currentProgram.leadActors[0]})
                        </p>
                      </div>
                    </div>

                    <button
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                        isActive
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {isActive ? 'Playing' : 'Tune'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Chotu Multi-Channel Search</span>
              <span className="text-sky-400">Direct Play · Real Audio Output</span>
            </div>
          </div>
        </div>
      </main>

      {/* Voice Listening Modal (Guarantees Tap to Speak always opens and works!) */}
      <VoiceListeningModal
        isOpen={isVoiceModalOpen}
        state={chotuState}
        onClose={() => setIsVoiceModalOpen(false)}
        onStartListening={handleStartListening}
        onStopListening={handleStopListening}
        onExecuteCommand={executeCommand}
      />

      {/* Electronic Program Guide Modal */}
      <ChannelGuideModal
        isOpen={isGuideOpen}
        activeChannelId={tvState.currentChannelId}
        onClose={() => setIsGuideOpen(false)}
        onSelectChannel={handleChannelSelect}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 mt-10 py-5 px-4 md:px-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>VoiceTV AI · Built-in TV Voice Agent (Chotu)</span>
          <span>Indian Television Channels · Direct Tuning & Playback with Real Sound</span>
        </div>
      </footer>
    </div>
  );
}
