export type ChannelId =
  | '101' // Star Maa (Telugu Entertainment)
  | '102' // Gemini TV (Telugu Entertainment)
  | '103' // ETV Telugu (Telugu Comedy & Serials)
  | '105' // Star Maa Movies (Telugu Movies - Allu Arjun Pushpa)
  | '106' // Gemini Movies (Telugu Movies - Ala Vaikunthapurramuloo)
  | '201' // Star Gold (Hindi Movies - Jawan)
  | '301' // Star Sports 1 Telugu/Hindi (Live Cricket)
  | '401' // TV9 Telugu (Live News)
  | '402'; // India Today (National News)

export interface Program {
  id: string;
  title: string;
  language: 'Telugu' | 'Hindi' | 'Tamil' | 'English';
  genre: string;
  rating: string;
  leadActors: string[];
  director?: string;
  description: string;
  airTime: string;
  durationMinutes: number;
  progressPercent: number;
  isLive?: boolean;
}

export interface Channel {
  id: ChannelId;
  number: string;
  name: string;
  network: string;
  language: 'Telugu' | 'Hindi' | 'English' | 'Multi-audio';
  category: 'Entertainment' | 'Movies' | 'Sports' | 'News';
  resolution: string;
  tag: string;
  image: string;
  description: string;
  currentProgram: Program;
  upcomingPrograms: Array<{
    time: string;
    title: string;
    leadActors: string[];
    genre: string;
    language: string;
  }>;
  audioTracks: string[];
  videoEmbedId?: string;
  videoTitle?: string;
}

export type PowerState = 'ON' | 'STANDBY';
export type ViewMode = 'LIVE' | 'HOME' | 'GUIDE';

export interface TVState {
  power: PowerState;
  currentChannelId: ChannelId;
  isPlaying: boolean;
  volume: number; // 0 - 100
  isMuted: boolean;
  previousVolume: number;
  viewMode: ViewMode;
  showOSD: boolean;
  showVolumeOSD: boolean;
  osdMessage?: string;
  infoOverlayVisible: boolean;
  isFullscreen: boolean;
  voiceFeedbackMuted: boolean;
}

export type CommandSource = 'voice' | 'typed' | 'remote' | 'quick';
export type CommandStatus = 'success' | 'failed' | 'not_found';

export interface CommandLog {
  id: string;
  timestamp: string;
  rawText: string;
  intent: string;
  source: CommandSource;
  status: CommandStatus;
  feedbackMessage: string;
  foundProgram?: string;
  foundChannel?: string;
}

export interface ChotuAssistantState {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  isOpen: boolean; // whether Chotu on-screen overlay is showing
  transcript: string;
  responseMessage: string;
  matchedProgram?: Program;
  matchedChannel?: Channel;
  micPermissionStatus: 'granted' | 'prompt' | 'denied' | 'unsupported';
  errorMessage?: string;
}
