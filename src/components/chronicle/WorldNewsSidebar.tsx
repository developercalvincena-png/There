import React, { useState, useEffect } from 'react';
import { WorldNewsArticle } from '../../types';
import { 
  Globe, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Scroll, 
  ShieldAlert, 
  Swords, 
  Crown, 
  Coins, 
  Flame, 
  Compass, 
  ExternalLink,
  BookOpen,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface WorldNewsSidebarProps {
  currentYear: number;
  onAddChronicleEntry?: (title: string, desc: string, isImportant?: boolean) => void;
}

export const WorldNewsSidebar: React.FC<WorldNewsSidebarProps> = ({
  currentYear,
  onAddChronicleEntry
}) => {
  const [articles, setArticles] = useState<WorldNewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGrounded, setIsGrounded] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<WorldNewsArticle | null>(null);
  const [lastRefreshedYear, setLastRefreshedYear] = useState<number>(0);
  const [customSearchStatus, setCustomSearchStatus] = useState<string | null>(null);

  const categories = ['All', 'War & Sieges', 'Crown Scandals', 'Holy Edicts', 'Guilds & Trade', 'Omens & Astrology'];

  // Fetch world news with Search Grounding
  const fetchWorldNews = async (year: number, topic: string = '') => {
    setIsLoading(true);
    setCustomSearchStatus(null);
    try {
      const url = topic 
        ? `/api/world-news?year=${year}&topic=${encodeURIComponent(topic)}`
        : `/api/world-news?year=${year}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.articles && Array.isArray(data.articles)) {
        setArticles(data.articles);
        setIsGrounded(!!data.grounded);
        setLastRefreshedYear(year);
      }
    } catch (err) {
      console.warn('Could not fetch online world news, using local historical cache:', err);
      setIsGrounded(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lastRefreshedYear !== currentYear) {
      fetchWorldNews(currentYear);
    }
  }, [currentYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchWorldNews(currentYear);
      return;
    }
    sound.playClick();
    setCustomSearchStatus(`Grounded search on: "${searchQuery}"...`);
    fetchWorldNews(currentYear, searchQuery.trim());
  };

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'War & Sieges':
        return { icon: <Swords className="w-3.5 h-3.5" />, bg: 'bg-red-950/80 text-red-300 border-red-700/60' };
      case 'Crown Scandals':
        return { icon: <Crown className="w-3.5 h-3.5" />, bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60' };
      case 'Holy Edicts':
        return { icon: <Scroll className="w-3.5 h-3.5" />, bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60' };
      case 'Guilds & Trade':
        return { icon: <Coins className="w-3.5 h-3.5" />, bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' };
      case 'Omens & Astrology':
        return { icon: <Flame className="w-3.5 h-3.5" />, bg: 'bg-purple-950/80 text-purple-300 border-purple-700/60' };
      default:
        return { icon: <Globe className="w-3.5 h-3.5" />, bg: 'bg-stone-800 text-stone-300 border-stone-700' };
    }
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col h-full space-y-4">
      {/* Header with Search Grounding status badge */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-200 font-cinzel flex items-center gap-2">
              World News & Gazettes
            </h3>
            <p className="text-[11px] text-stone-400">
              Continental dispatches & medieval world chronicles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isGrounded ? (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-mono">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              Live Search Grounded
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] bg-stone-800 text-stone-400 border border-stone-700 px-2 py-0.5 rounded-full font-mono">
              📜 Medieval Annals
            </span>
          )}

          <button
            onClick={() => {
              sound.playClick();
              fetchWorldNews(currentYear, searchQuery);
            }}
            disabled={isLoading}
            title="Refresh Gazettes"
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 border border-stone-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Medieval Query Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search medieval history, crusades, tournaments..."
          className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-500 rounded-xl pl-9 pr-16 py-2 text-xs text-stone-200 placeholder:text-stone-500 outline-none transition-colors"
        />
        <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
        <button
          type="submit"
          className="absolute right-1.5 top-1 px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-[11px] font-semibold text-stone-900 transition-colors cursor-pointer"
        >
          Ground
        </button>
      </form>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.playClick();
              setSelectedCategory(cat);
            }}
            className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border transition-all ${
              selectedCategory === cat
                ? 'bg-amber-950 text-amber-300 border-amber-600/70 font-semibold'
                : 'bg-stone-950/50 text-stone-400 border-stone-800 hover:border-stone-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {customSearchStatus && (
        <div className="text-[11px] text-amber-300/80 italic font-mono flex items-center gap-1.5 px-2 py-1 bg-amber-950/30 rounded-lg border border-amber-900/40">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>{customSearchStatus}</span>
        </div>
      )}

      {/* Articles Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[480px]">
        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-amber-400/80 font-mono">
              Inscribing continental scrolls with search grounding...
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-10 text-center text-stone-500 text-xs">
            No dispatches found for this category or search topic.
          </div>
        ) : (
          filteredArticles.map((article) => {
            const badge = getCategoryBadge(article.category);
            return (
              <div
                key={article.id}
                onClick={() => {
                  sound.playClick();
                  setActiveArticle(article);
                }}
                className="group bg-stone-950/60 hover:bg-stone-950 border border-stone-800/80 hover:border-amber-600/60 rounded-2xl p-3.5 transition-all cursor-pointer shadow-sm hover:shadow-md space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-medium ${badge.bg}`}>
                    {badge.icon}
                    <span>{article.category}</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {article.region}
                  </span>
                </div>

                <h4 className="text-xs sm:text-[13px] font-bold text-stone-200 group-hover:text-amber-300 leading-snug font-cinzel transition-colors">
                  {article.headline}
                </h4>

                <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-2">
                  {article.summary}
                </p>

                {article.rumorImpact && (
                  <div className="text-[10px] text-amber-400/80 bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-900/30 flex items-start gap-1 font-mono">
                    <span className="text-amber-500">📜 Effect:</span>
                    <span>{article.rumorImpact}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal for Selected Article */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-600/70 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${getCategoryBadge(activeArticle.category).bg}`}>
                {getCategoryBadge(activeArticle.category).icon}
                <span>{activeArticle.category}</span>
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="text-stone-400 hover:text-stone-100 text-sm font-bold px-2 py-1 rounded-lg hover:bg-stone-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-amber-500 font-mono">
                📍 {activeArticle.region} • Recorded circa Year {currentYear} AD
              </div>
              <h3 className="text-lg font-bold text-amber-100 font-cinzel">
                {activeArticle.headline}
              </h3>
            </div>

            <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 text-stone-200 text-xs sm:text-sm leading-relaxed">
              {activeArticle.summary}
            </div>

            {activeArticle.historicalContext && (
              <div className="bg-stone-900/90 p-3.5 rounded-xl border border-stone-800/80 space-y-1">
                <div className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Historical Chronicle Footnote</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed italic">
                  "{activeArticle.historicalContext}"
                </p>
              </div>
            )}

            {activeArticle.rumorImpact && (
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-700/40 text-xs text-amber-200">
                <span className="font-bold text-amber-400">Realm & Diplomatic Ramification: </span>
                {activeArticle.rumorImpact}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <span className="text-[10px] text-stone-500 font-mono">
                Scribed by: {activeArticle.source}
              </span>
              <button
                onClick={() => {
                  sound.playCoin();
                  if (onAddChronicleEntry) {
                    onAddChronicleEntry(
                      `World Dispatch: ${activeArticle.headline}`,
                      `${activeArticle.summary} (Origin: ${activeArticle.region})`,
                      false
                    );
                  }
                  setActiveArticle(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors"
              >
                Inscribe into My Chronicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
