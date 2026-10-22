import { Channel, ChannelId, CommandLog, CommandSource, TVState, Program } from '../types/tv';
import { CHANNELS, CHANNEL_LIST } from '../data/channelsData';

export interface CommandProcessResult {
  updatedState: Partial<TVState>;
  commandLog: CommandLog;
  feedbackSpeech: string;
  matchedProgram?: Program;
  matchedChannel?: Channel;
  searchOutcome: 'channel_tuned' | 'movie_found' | 'not_found' | 'general_control';
  noticeToast?: string;
}

/**
 * Intelligent Indian Smart TV Agent (Chotu) Natural Language Processor.
 * Directly tunes to and plays the matching channel instantly without blocking voiceovers.
 */
export function processTVCommand(
  rawInput: string,
  currentState: TVState,
  source: CommandSource = 'typed'
): CommandProcessResult {
  let clean = rawInput.trim().toLowerCase();
  const id = `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Strip Chotu wake words and colloquial honorifics (e.g. "Chotu", "Hey Chotu", "Chotu garu")
  clean = clean
    .replace(/^(hey\s+)?chotu\s*(garu|bhaiya|ji)?\s*/i, '')
    .replace(/\bplease\b/gi, '')
    .trim();

  // Helper for creating consistent logs (voiceover string is empty by default so it plays directly with no audio disruption)
  const makeResult = (
    intent: string,
    updatedState: Partial<TVState>,
    status: CommandLog['status'],
    feedbackMessage: string,
    outcome: CommandProcessResult['searchOutcome'] = 'general_control',
    matchedProgram?: Program,
    matchedChannel?: Channel,
    noticeToast?: string
  ): CommandProcessResult => ({
    updatedState: { ...updatedState, isPlaying: true },
    commandLog: {
      id,
      timestamp,
      rawText: rawInput,
      intent,
      source,
      status,
      feedbackMessage,
      foundProgram: matchedProgram?.title,
      foundChannel: matchedChannel?.name,
    },
    feedbackSpeech: '', // No output voiceover - plays directly!
    matchedProgram,
    matchedChannel,
    searchOutcome: outcome,
    noticeToast,
  });

  // 1. POWER COMMANDS
  if (
    clean.includes('turn on') ||
    clean.includes('power on') ||
    clean.includes('switch on') ||
    clean === 'on' ||
    clean.includes('tv on') ||
    clean.includes('chalu')
  ) {
    return makeResult(
      'POWER_ON',
      { power: 'ON', showOSD: true, osdMessage: 'Power On · Smart TV' },
      'success',
      'TV powered on'
    );
  }

  if (
    clean.includes('turn off') ||
    clean.includes('power off') ||
    clean.includes('standby') ||
    clean.includes('band karo') ||
    clean.includes('tv aapey') ||
    clean.includes('sleep')
  ) {
    return makeResult(
      'POWER_OFF',
      { power: 'STANDBY', showOSD: false, isPlaying: false, viewMode: 'LIVE' },
      'success',
      'TV switched to standby'
    );
  }

  // If TV is currently in standby, turn it on and proceed
  const baseState = currentState.power === 'STANDBY' ? { power: 'ON' as const } : {};

  // 2. ALLU ARJUN / PUSHPA DIRECT SEARCH
  if (
    clean.includes('allu arjun') ||
    clean.includes('bunny') ||
    clean.includes('pushpa') ||
    clean.includes('allu')
  ) {
    const channel = CHANNELS['105'];
    return makeResult(
      'TUNE_ALLU_ARJUN',
      {
        ...baseState,
        currentChannelId: '105',
        viewMode: 'LIVE',
        showOSD: true,
        osdMessage: '105 · Star Maa Movies · Pushpa: The Rise (Allu Arjun)',
      },
      'success',
      'Directly tuned to Channel 105 Star Maa Movies (Pushpa: The Rise - Allu Arjun).',
      'movie_found',
      channel.currentProgram,
      channel
    );
  }

  // 3. PRABHAS / BAAHUBALI DIRECT SEARCH
  if (clean.includes('prabhas') || clean.includes('baahubali')) {
    const channel = CHANNELS['106'];
    return makeResult(
      'TUNE_PRABHAS',
      {
        ...baseState,
        currentChannelId: '106',
        viewMode: 'LIVE',
        showOSD: true,
        osdMessage: '106 · Gemini Movies · Baahubali 2 (Prabhas)',
      },
      'success',
      'Directly tuned to Channel 106 Gemini Movies (Baahubali 2 - Prabhas).',
      'movie_found',
      channel.currentProgram,
      channel
    );
  }

  // 4. SHAH RUKH KHAN / JAWAN DIRECT SEARCH
  if (clean.includes('shah rukh khan') || clean.includes('srk') || clean.includes('jawan')) {
    const channel = CHANNELS['201'];
    return makeResult(
      'TUNE_SRK',
      {
        ...baseState,
        currentChannelId: '201',
        viewMode: 'LIVE',
        showOSD: true,
        osdMessage: '201 · Star Gold HD · Jawan (Shah Rukh Khan)',
      },
      'success',
      'Directly tuned to Channel 201 Star Gold HD (Jawan).',
      'movie_found',
      channel.currentProgram,
      channel
    );
  }

  // 5. CRICKET / STAR SPORTS SEARCH
  if (
    clean.includes('cricket') ||
    clean.includes('match') ||
    clean.includes('sports') ||
    clean.includes('india match') ||
    clean.includes('score') ||
    clean.includes('kohli')
  ) {
    const channel = CHANNELS['301'];
    return makeResult(
      'TUNE_SPORTS',
      {
        ...baseState,
        currentChannelId: '301',
        viewMode: 'LIVE',
        showOSD: true,
        osdMessage: '301 · Star Sports 1 · India vs Australia Live Cricket',
      },
      'success',
      'Directly tuned to Channel 301 Star Sports 1 (Live Cricket).',
      'channel_tuned',
      channel.currentProgram,
      channel
    );
  }

  // 6. NEWS SEARCH (TV9 Telugu / India Today)
  if (clean.includes('tv9') || clean.includes('telugu news') || clean.includes('news')) {
    const channel = CHANNELS['401'];
    return makeResult(
      'TUNE_NEWS',
      {
        ...baseState,
        currentChannelId: '401',
        viewMode: 'LIVE',
        showOSD: true,
        osdMessage: '401 · TV9 Telugu News Live',
      },
      'success',
      'Directly tuned to Channel 401 TV9 Telugu News.',
      'channel_tuned',
      channel.currentProgram,
      channel
    );
  }

  // 7. GENERIC TELUGU MOVIE REQUEST -> default to Pushpa on Star Maa Movies
  if (clean.includes('telugu movie') || clean.includes('telugu cinema') || clean.includes('movie in telugu')) {
    const channel = CHANNELS['105'];
    return makeResult(
      'TUNE_TELUGU_MOVIE',
      {
        ...baseState,
        currentChannelId: '105',
        viewMode: 'LIVE',
        showOSD: true,
        osdMessage: '105 · Star Maa Movies · Pushpa: The Rise (Telugu)',
      },
      'success',
      'Directly tuned to Channel 105 Star Maa Movies (Pushpa: The Rise).',
      'movie_found',
      channel.currentProgram,
      channel
    );
  }

  // 8. SPECIFIC ACTOR NOT FOUND (e.g. "Tom Cruise movie in Telugu")
  if (clean.includes('tom cruise') || clean.includes('hollywood in telugu')) {
    return makeResult(
      'ACTOR_NOT_FOUND',
      {},
      'not_found',
      'No Tom Cruise movies currently airing in Telugu. Retaining active channel.',
      'not_found',
      undefined,
      undefined,
      'No Tom Cruise movies are currently airing across Indian channels.'
    );
  }

  // 9. DIRECT CHANNEL NUMBER TUNING (e.g. "105", "channel 301", "101")
  const channelNumMatch = clean.match(/channel\s*(\d{3})/i) || clean.match(/^(\d{3})$/);
  if (channelNumMatch) {
    const requestedNum = channelNumMatch[1] as ChannelId;
    if (CHANNELS[requestedNum]) {
      const channel = CHANNELS[requestedNum];
      return makeResult(
        'CHANGE_CHANNEL',
        {
          ...baseState,
          currentChannelId: requestedNum,
          viewMode: 'LIVE',
          showOSD: true,
          osdMessage: `Channel ${channel.number} · ${channel.name}`,
        },
        'success',
        `Directly tuned to Channel ${channel.number} (${channel.name}).`,
        'channel_tuned',
        channel.currentProgram,
        channel
      );
    }
  }

  // Channel names
  if (clean.includes('star maa movies') || clean.includes('maa movies')) {
    const ch = CHANNELS['105'];
    return makeResult(
      'CHANGE_CHANNEL',
      { ...baseState, currentChannelId: '105', viewMode: 'LIVE', showOSD: true, osdMessage: '105 · Star Maa Movies' },
      'success',
      'Tuned to Channel 105 Star Maa Movies',
      'channel_tuned',
      ch.currentProgram,
      ch
    );
  }

  if (clean.includes('star maa') || clean.includes('maa tv')) {
    const ch = CHANNELS['101'];
    return makeResult(
      'CHANGE_CHANNEL',
      { ...baseState, currentChannelId: '101', viewMode: 'LIVE', showOSD: true, osdMessage: '101 · Star Maa' },
      'success',
      'Tuned to Channel 101 Star Maa',
      'channel_tuned',
      ch.currentProgram,
      ch
    );
  }

  if (clean.includes('gemini movies')) {
    const ch = CHANNELS['106'];
    return makeResult(
      'CHANGE_CHANNEL',
      { ...baseState, currentChannelId: '106', viewMode: 'LIVE', showOSD: true, osdMessage: '106 · Gemini Movies' },
      'success',
      'Tuned to Channel 106 Gemini Movies',
      'channel_tuned',
      ch.currentProgram,
      ch
    );
  }

  if (clean.includes('gemini')) {
    const ch = CHANNELS['102'];
    return makeResult(
      'CHANGE_CHANNEL',
      { ...baseState, currentChannelId: '102', viewMode: 'LIVE', showOSD: true, osdMessage: '102 · Gemini TV' },
      'success',
      'Tuned to Channel 102 Gemini TV',
      'channel_tuned',
      ch.currentProgram,
      ch
    );
  }

  if (clean.includes('etv')) {
    const ch = CHANNELS['103'];
    return makeResult(
      'CHANGE_CHANNEL',
      { ...baseState, currentChannelId: '103', viewMode: 'LIVE', showOSD: true, osdMessage: '103 · ETV Telugu' },
      'success',
      'Tuned to Channel 103 ETV Telugu',
      'channel_tuned',
      ch.currentProgram,
      ch
    );
  }

  // 10. VOLUME CONTROLS
  const volumeNumberMatch = clean.match(/volume (?:to )?(\d{1,3})/i) || clean.match(/volume (\d{1,3})/i);
  if (volumeNumberMatch) {
    const targetVol = Math.min(100, Math.max(0, parseInt(volumeNumberMatch[1], 10)));
    return makeResult(
      'SET_VOLUME',
      { volume: targetVol, isMuted: false, showVolumeOSD: true, osdMessage: `Volume: ${targetVol}%` },
      'success',
      `Volume adjusted to ${targetVol}%`
    );
  }

  if (clean.includes('volume up') || clean.includes('increase volume') || clean.includes('louder')) {
    const newVol = Math.min(100, currentState.volume + 10);
    return makeResult(
      'VOLUME_UP',
      { volume: newVol, isMuted: false, showVolumeOSD: true, osdMessage: `Volume: ${newVol}%` },
      'success',
      `Volume increased to ${newVol}%`
    );
  }

  if (clean.includes('volume down') || clean.includes('decrease volume') || clean.includes('softer')) {
    const newVol = Math.max(0, currentState.volume - 10);
    return makeResult(
      'VOLUME_DOWN',
      { volume: newVol, isMuted: false, showVolumeOSD: true, osdMessage: `Volume: ${newVol}%` },
      'success',
      `Volume decreased to ${newVol}%`
    );
  }

  if (clean.includes('mute') || clean.includes('silence')) {
    return makeResult(
      'MUTE',
      { isMuted: true, showVolumeOSD: true, osdMessage: 'Muted' },
      'success',
      'Audio muted'
    );
  }

  if (clean.includes('unmute')) {
    return makeResult(
      'UNMUTE',
      { isMuted: false, showVolumeOSD: true, osdMessage: `Unmuted · ${currentState.volume}%` },
      'success',
      'Audio unmuted'
    );
  }

  // 11. PLAY / PAUSE
  if (clean.includes('pause') || clean.includes('stop')) {
    return makeResult(
      'PAUSE',
      { isPlaying: false, showOSD: true, osdMessage: 'Playback Paused' },
      'success',
      'Broadcast paused'
    );
  }

  if (clean.includes('play') || clean.includes('resume')) {
    return makeResult(
      'PLAY',
      { isPlaying: true, showOSD: true, osdMessage: 'Playback Resumed' },
      'success',
      'Broadcast resumed'
    );
  }

  // 12. GUIDE
  if (clean.includes('guide') || clean.includes('epg') || clean.includes('schedule')) {
    return makeResult(
      'OPEN_GUIDE',
      { viewMode: 'GUIDE', showOSD: false },
      'success',
      'Opened TV Channel Guide'
    );
  }

  // DEFAULT FALLBACK: If unknown, search titles/actors directly
  for (const channel of CHANNEL_LIST) {
    if (
      channel.currentProgram.title.toLowerCase().includes(clean) ||
      channel.currentProgram.leadActors.some((a) => a.toLowerCase().includes(clean))
    ) {
      return makeResult(
        'SEARCH_DIRECT_MATCH',
        {
          ...baseState,
          currentChannelId: channel.id,
          viewMode: 'LIVE',
          showOSD: true,
          osdMessage: `Channel ${channel.number} · ${channel.currentProgram.title}`,
        },
        'success',
        `Directly tuned to Channel ${channel.number} (${channel.name}).`,
        'movie_found',
        channel.currentProgram,
        channel
      );
    }
  }

  return makeResult(
    'UNRECOGNIZED',
    { showOSD: true, osdMessage: `No match for "${rawInput}"` },
    'failed',
    `Could not match "${rawInput}". Try "allu arjun movie", "cricket", or "tv9 news".`,
    'not_found',
    undefined,
    undefined,
    `No channel found matching "${rawInput}".`
  );
}
