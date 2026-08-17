import React from 'react';
import { Character, DynastyArtifact } from '../../types';
import { 
  Crown, 
  Sparkles, 
  Cross, 
  Scroll, 
  Swords, 
  ShieldCheck, 
  Award,
  Flame
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface CoronationCeremonyModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onCompleteCoronation: (outcome: {
    coronationType: string;
    renownDelta: number;
    pietyDelta: number;
    happinessDelta: number;
    newArtifact?: DynastyArtifact;
    summary: string;
  }) => void;
}

export const CoronationCeremonyModal: React.FC<CoronationCeremonyModalProps> = ({
  isOpen,
  onClose,
  character,
  onCompleteCoronation
}) => {
  if (!isOpen) return null;

  const handleCoronationChoice = (pathway: 'church' | 'charter' | 'iron') => {
    sound.playVictory();

    if (pathway === 'church') {
      const holyCrown: DynastyArtifact = {
        id: `crown_coronation_${Date.now()}`,
        name: 'The Consecrated Sovereign Diadem',
        type: 'Crown',
        rarity: 'Legendary',
        icon: '👑',
        slot: 'head',
        effects: {
          pietyOrMana: 25,
          diplomacy: 4,
          renown: 50,
          vassalOpinionBonus: 15
        },
        description: 'Anointed with holy oils by the High Clergy during the sacred coronation rites.',
        history: `Crowned upon the ascension of ${character.name} of House ${character.dynastyName}.`,
        isEquipped: true
      };

      onCompleteCoronation({
        coronationType: 'Consecrated Church Anointing',
        renownDelta: 60,
        pietyDelta: 50,
        happinessDelta: 20,
        newArtifact: holyCrown,
        summary: `Solemnly anointed and crowned in the High Cathedral before the holy altar. Clergy and vassals pledge sacred fealty.`
      });
    } else if (pathway === 'charter') {
      onCompleteCoronation({
        coronationType: 'Aristocratic Charter of Feudal Liberties',
        renownDelta: 40,
        pietyDelta: 10,
        happinessDelta: 40,
        summary: `Signed the Great Charter of Feudal Liberties, swearing to honor vassal rights and law. Realm stability reaches unprecedented heights.`
      });
    } else {
      onCompleteCoronation({
        coronationType: 'The Iron Conqueror\'s Self-Coronation',
        renownDelta: 75,
        pietyDelta: -20,
        happinessDelta: 10,
        summary: `Seized the imperial crown and placed it upon their own head with iron resolve! Proclaims absolute sovereign authority.`
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-500/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-stone-800 pb-4">
          <div className="text-4xl animate-bounce">👑</div>
          <h2 className="text-xl font-serif font-bold text-amber-100">The Imperial Coronation Rites</h2>
          <p className="text-xs text-stone-300 max-w-md mx-auto">
            The bells toll across the capital as thousand gather to witness the ascension of <span className="text-amber-300 font-bold">{character.name}</span> of House <span className="text-amber-300 font-bold">{character.dynastyName}</span>. How will you take the crown?
          </p>
        </div>

        {/* Pathways Grid */}
        <div className="space-y-3">
          {/* Pathway 1: Church Anointing */}
          <button
            onClick={() => handleCoronationChoice('church')}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-stone-950 to-stone-950 hover:from-blue-900/50 hover:to-stone-900 border border-blue-800/60 hover:border-blue-500 text-left transition-all flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-blue-200 group-hover:text-blue-100">
                <Cross className="w-4 h-4 text-blue-400" />
                <span>Anointed by the High Church & Holy Clergy</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Kneel before the altar. Receive holy oils and the Consecrated Sovereign Diadem (+50 Piety, +60 Renown, Holy Crown Artifact).
              </p>
            </div>
            <span className="text-xs font-serif font-bold text-blue-300">Divine Right ✝️</span>
          </button>

          {/* Pathway 2: Aristocratic Charter */}
          <button
            onClick={() => handleCoronationChoice('charter')}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-stone-950 to-stone-950 hover:from-emerald-900/50 hover:to-stone-900 border border-emerald-800/60 hover:border-emerald-500 text-left transition-all flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-emerald-200 group-hover:text-emerald-100">
                <Scroll className="w-4 h-4 text-emerald-400" />
                <span>The Feudal Charter Oath of Liberties</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Swear upon the ancient charter to protect vassal privileges and liberties (+40 Vassal Loyalty, -Rebellion Risk).
              </p>
            </div>
            <span className="text-xs font-serif font-bold text-emerald-300">Feudal Compact 📜</span>
          </button>

          {/* Pathway 3: Iron Conqueror */}
          <button
            onClick={() => handleCoronationChoice('iron')}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-950 to-stone-950 hover:from-amber-900/50 hover:to-stone-900 border border-amber-800/60 hover:border-amber-500 text-left transition-all flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-200 group-hover:text-amber-100">
                <Swords className="w-4 h-4 text-amber-400" />
                <span>The Iron Conqueror's Self-Coronation</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Take the crown with your own hands and place it upon your brow. Rule through absolute martial majesty (+75 Renown, +25 Dread).
              </p>
            </div>
            <span className="text-xs font-serif font-bold text-amber-300">Iron Will 👑</span>
          </button>
        </div>

      </div>
    </div>
  );
};
