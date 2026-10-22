import React, { useState } from 'react';
import { X, Tv, Clock, Radio, Play, Search, Filter } from 'lucide-react';
import { ChannelId } from '../types/tv';
import { CHANNEL_LIST, CHANNELS } from '../data/channelsData';

interface ChannelGuideModalProps {
  isOpen: boolean;
  activeChannelId: ChannelId;
  onClose: () => void;
  onSelectChannel: (channelId: ChannelId) => void;
}

export const ChannelGuideModal: React.FC<ChannelGuideModalProps> = ({
  isOpen,
  activeChannelId,
  onClose,
  onSelectChannel,
}) => {
  const [selectedPreviewId, setSelectedPreviewId] = useState<ChannelId>(activeChannelId);
  const [languageFilter, setLanguageFilter] = useState<'All' | 'Telugu' | 'Hindi' | 'Sports' | 'News'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const previewChannel = CHANNELS[selectedPreviewId] || CHANNELS['105'];

  const filteredChannels = CHANNEL_LIST.filter((ch) => {
    // Filter by category or language
    if (languageFilter === 'Telugu' && ch.language !== 'Telugu') return false;
    if (languageFilter === 'Hindi' && ch.language !== 'Hindi') return false;
    if (languageFilter === 'Sports' && ch.category !== 'Sports') return false;
    if (languageFilter === 'News' && ch.category !== 'News') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchNum = ch.number.includes(q);
      const matchTitle = ch.currentProgram.title.toLowerCase().includes(q);
      const matchActors = ch.currentProgram.leadActors.some((a) => a.toLowerCase().includes(q));
      return matchName || matchNum || matchTitle || matchActors;
    }
    return true;
  });

  const timeSlots = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Indian TV Electronic Program Guide (EPG)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  Chotu Searchable
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Browse Indian live channels or ask: "Chotu keep allu arjun movie in telugu"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['All', 'Telugu', 'Hindi', 'Sports', 'News'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setLanguageFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  languageFilter === tab
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Allu Arjun, Cricket, Pushpa..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {/* Channels Schedule Grid */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {filteredChannels.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No channels match "{searchQuery}". Try searching "Allu Arjun" or "Cricket".
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const isCurrentlyTuned = activeChannelId === channel.id;
              const isSelected = selectedPreviewId === channel.id;

              return (
                <div
                  key={channel.id}
                  onClick={() => setSelectedPreviewId(channel.id)}
                  className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-sky-500 ring-1 ring-sky-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Channel Meta */}
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                        <img
                          src={channel.image}
                          alt={channel.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-sky-400">
                            {channel.number}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {channel.language}
                          </span>
                          {isCurrentlyTuned && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              LIVE
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-white leading-tight truncate">
                          {channel.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">{channel.network}</span>
                      </div>
                    </div>

                    {/* Program Slots */}
                    <div className="col-span-12 sm:col-span-8 flex flex-col sm:flex-row gap-2">
                      {/* Current Live Show */}
                      <div className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5" />
                            Airing Now ({channel.currentProgram.airTime})
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {channel.currentProgram.rating}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">
                          {channel.currentProgram.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          Actors: {channel.currentProgram.leadActors.join(', ')}
                        </p>
                        <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                          <div
                            className="bg-sky-400 h-1 rounded-full"
                            style={{ width: `${channel.currentProgram.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Next Upcoming */}
                      {channel.upcomingPrograms[0] && (
                        <div className="hidden md:block w-48 bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5">
                          <div className="text-[10px] font-mono text-slate-400 mb-0.5">
                            {channel.upcomingPrograms[0].time}
                          </div>
                          <h5 className="text-xs font-medium text-slate-300 truncate">
                            {channel.upcomingPrograms[0].title}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate">
                            {channel.upcomingPrograms[0].leadActors.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Preview Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-sky-400 font-mono">
                Channel {previewChannel.number} · {previewChannel.name}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-white font-medium">
                {previewChannel.currentProgram.title} ({previewChannel.currentProgram.language})
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              Starring: {previewChannel.currentProgram.leadActors.join(', ')} — {previewChannel.currentProgram.description}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSelectChannel(previewChannel.id);
                onClose();
              }}
              className="flex-1 md:flex-initial px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Tune To Channel {previewChannel.number}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
