import React from 'react';
import { Character, GameEventChoice, Species } from '../../types';
import { 
  Skull, 
  ShieldAlert, 
  Swords, 
  Flame, 
  Crown, 
  Coins, 
  Shield, 
  Heart, 
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Eye
} from 'lucide-react';
import { sound } from '../../utils/audio';

export type CrisisType = 'vassal_rebellion' | 'foreign_invasion' | 'assassination_plot_player' | 'assassination_plot_child';

export interface CrisisPayload {
  id: string;
  type: CrisisType;
  title: string;
  category: string;
  description: string;
  icon: string;
  instigator: {
    name: string;
    title: string;
    portrait: string;
    species: Species;
    houseName?: string;
  };
  options: Array<{
    id: string;
    text: string;
    description: string;
    requirements?: {
      gold?: number;
      martial?: number;
      intrigue?: number;
      diplomacy?: number;
      intellect?: number;
    };
    outcome: {
      text: string;
      goldDelta?: number;
      healthDelta?: number;
      renownDelta?: number;
      opinionDelta?: number;
      unrestDelta?: number;
      isFatal?: boolean;
      capturedConspirator?: boolean;
      startCivilWar?: boolean;
    };
  }>;
}

interface CrisisAndPlotModalProps {
  crisis: CrisisPayload | null;
  character: Character;
  onResolveCrisis: (optionId: string) => void;
}

export const CrisisAndPlotModal: React.FC<CrisisAndPlotModalProps> = ({
  crisis,
  character,
  onResolveCrisis
}) => {
  if (!crisis) return null;

  const getCrisisHeaderStyles = () => {
    switch (crisis.type) {
      case 'vassal_rebellion':
        return {
          banner: 'bg-amber-950/90 text-amber-300 border-amber-700/80',
          border: 'border-amber-600',
          badgeText: '⚠️ Feudal Rebellion Ultimatum',
          iconBg: 'bg-amber-900/80 border-amber-500'
        };
      case 'foreign_invasion':
        return {
          banner: 'bg-red-950/90 text-red-300 border-red-700/80',
          border: 'border-red-600',
          badgeText: '⚔️ Hostile Foreign Invasion Incursion',
          iconBg: 'bg-red-900/80 border-red-500'
        };
      case 'assassination_plot_player':
      case 'assassination_plot_child':
        return {
          banner: 'bg-purple-950/90 text-purple-300 border-purple-700/80',
          border: 'border-purple-600',
          badgeText: '🗡️ Clandestine Assassination Attempt',
          iconBg: 'bg-purple-900/80 border-purple-500'
        };
    }
  };

  const styles = getCrisisHeaderStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className={`bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 ${styles.border} rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-4`}>
        
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <span className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${styles.banner}`}>
            {styles.badgeText}
          </span>
          <span className="text-xs text-stone-400 font-mono">
            Year 1066+ • Threat Level: Critical
          </span>
        </div>

        {/* Speaker & Title */}
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl ${styles.iconBg} border-2 flex items-center justify-center text-4xl shrink-0 shadow-lg`}>
            {crisis.instigator.portrait || crisis.icon || '💀'}
          </div>

          <div>
            <div className="text-xs text-stone-400 font-medium">
              Confronting: <span className="text-stone-200 font-bold">{crisis.instigator.name}</span> ({crisis.instigator.title})
            </div>
            <h2 className="text-lg sm:text-xl font-black text-amber-100 font-cinzel leading-snug">
              {crisis.title}
            </h2>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 text-stone-200 text-xs sm:text-sm leading-relaxed max-h-56 overflow-y-auto">
          {crisis.description}
        </div>

        {/* Decision & Preparation Choices */}
        <div className="space-y-2.5 pt-1">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Your Command & Preparation Response:
          </h4>

          {crisis.options.map((option) => {
            const meetsReq = 
              (!option.requirements?.gold || character.stats.gold >= option.requirements.gold) &&
              (!option.requirements?.martial || character.stats.martial >= option.requirements.martial) &&
              (!option.requirements?.intrigue || character.stats.intrigue >= option.requirements.intrigue) &&
              (!option.requirements?.diplomacy || character.stats.diplomacy >= option.requirements.diplomacy) &&
              (!option.requirements?.intellect || character.stats.intellect >= option.requirements.intellect);

            return (
              <button
                key={option.id}
                disabled={!meetsReq}
                onClick={() => {
                  sound.playSword();
                  onResolveCrisis(option.id);
                }}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between gap-3 border cursor-pointer ${
                  meetsReq
                    ? 'bg-stone-900/90 hover:bg-stone-800 border-stone-700/80 hover:border-amber-500 text-stone-100 shadow-md active:scale-[0.99]'
                    : 'bg-stone-950/60 border-stone-900 text-stone-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-xs sm:text-sm font-bold text-amber-100 leading-snug">
                    {option.text}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {option.description}
                  </div>
                  {!meetsReq && (
                    <div className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-mono">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Requirements not met (Gold/Stats)</span>
                    </div>
                  )}
                </div>

                <div className="w-7 h-7 rounded-xl bg-amber-950/90 border border-amber-600/60 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
