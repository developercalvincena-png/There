import React, { useState } from 'react';
import { Character, DynastyArtifact } from '../../types';
import { 
  Compass, 
  Sparkles, 
  MapPin, 
  Shield, 
  BookOpen, 
  Coins, 
  Award, 
  X, 
  ChevronRight,
  Heart
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface HolyPilgrimageModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onCompletePilgrimage: (outcome: {
    goldDelta: number;
    pietyDelta: number;
    renownDelta: number;
    newTrait?: string;
    newArtifact?: DynastyArtifact;
    summary: string;
  }) => void;
}

type DestinationKey = 'Rome' | 'Jerusalem' | 'Santiago' | 'Canterbury' | 'Sinai';
type PilgrimagePhase = 'choose_site' | 'encounter_1' | 'encounter_2' | 'sanctum_arrival';

export const HolyPilgrimageModal: React.FC<HolyPilgrimageModalProps> = ({
  isOpen,
  onClose,
  character,
  onCompletePilgrimage
}) => {
  const [phase, setPhase] = useState<PilgrimagePhase>('choose_site');
  const [destination, setDestination] = useState<DestinationKey>('Jerusalem');
  const [pilgrimageLog, setPilgrimageLog] = useState<string[]>([]);
  const [pietyEarned, setPietyEarned] = useState<number>(0);

  if (!isOpen) return null;

  const destinations = [
    { key: 'Jerusalem' as DestinationKey, name: 'Holy Sepulchre of Jerusalem', icon: '⛪', bonus: '+60 Piety, True Cross Splinter Relic', cost: 120 },
    { key: 'Rome' as DestinationKey, name: 'St. Peter\'s Basilica of Rome', icon: '🇻🇦', bonus: '+50 Piety, Papal Absolution Blessing', cost: 90 },
    { key: 'Santiago' as DestinationKey, name: 'Cathedral of Santiago de Compostela', icon: '🐚', bonus: '+45 Piety, Scallop of Saint James', cost: 70 },
    { key: 'Canterbury' as DestinationKey, name: 'Shrine of St. Thomas of Canterbury', icon: '🕯️', bonus: '+35 Piety, Martyr\'s Grace', cost: 50 },
    { key: 'Sinai' as DestinationKey, name: 'St. Catherine\'s Monastery at Mount Sinai', icon: '⛰️', bonus: '+70 Piety, Ancient Illuminated Psalter', cost: 140 },
  ];

  const handleSelectSiteAndDepart = () => {
    sound.playFanfare();
    setPhase('encounter_1');
    setPilgrimageLog([`🚶 Taking the pilgrim\'s staff and rough traveler\'s cloak, you embark on the sacred journey to ${destination}.`]);
  };

  const handleEncounter1 = (choice: 'fight' | 'bribe' | 'prayer') => {
    sound.playClick();
    let log = '';

    if (choice === 'fight') {
      sound.playSword();
      log = '⚔️ Mountain bandits attempted to ambush the pilgrimage caravan! You draw your sword and drive them back with righteous martial fury (+15 Renown).';
      setPietyEarned(prev => prev + 10);
    } else if (choice === 'bribe') {
      log = '🪙 You pay the toll-wardens without bloodshed, offering alms to the destitute peasants (+15 Piety).';
      setPietyEarned(prev => prev + 15);
    } else {
      log = '🕯️ You raise your holy crucifix and chant sacred hymns. Struck by divine reverence, the brigands fall to their knees and beg forgiveness (+25 Piety)!';
      setPietyEarned(prev => prev + 25);
    }

    setPilgrimageLog(prev => [log, ...prev]);
    setPhase('encounter_2');
  };

  const handleEncounter2 = (choice: 'theology' | 'relic_hunt') => {
    sound.playClick();
    let log = '';

    if (choice === 'theology') {
      log = '📜 At a secluded hillside abbey, you debate deep theology with ascetic hermits, discovering ancient illuminated scripture (+10 Intellect, +20 Piety).';
      setPietyEarned(prev => prev + 20);
    } else {
      log = '✨ Guided by visions, you uncover a silver reliquary box containing holy bones in an ancient catacomb (+30 Piety).';
      setPietyEarned(prev => prev + 30);
    }

    setPilgrimageLog(prev => [log, ...prev]);
    setPhase('sanctum_arrival');
  };

  const handleFinishPilgrimage = () => {
    sound.playVictory();
    const destObj = destinations.find(d => d.key === destination) || destinations[0];

    const holyRelic: DynastyArtifact = {
      id: `relic_${Date.now()}`,
      name: `Holy Relic of ${destination}`,
      type: 'Relic',
      rarity: 'Legendary',
      icon: '✨',
      slot: 'relic',
      effects: {
        pietyOrMana: 25,
        renown: 40,
        vassalOpinionBonus: 10,
        stewardship: 3
      },
      description: `Blessed at the altar of ${destObj.name} during the Great Dynastic Pilgrimage.`,
      history: `Carried back across perilous lands by the pious sovereign of House ${character.dynastyName}.`,
      isEquipped: false
    };

    onCompletePilgrimage({
      goldDelta: -destObj.cost,
      pietyDelta: 50 + pietyEarned,
      renownDelta: 45,
      newTrait: 'Holy Pilgrim',
      newArtifact: holyRelic,
      summary: `Completed the sacred pilgrimage to ${destObj.name}. Anointed by the holy clergy, earning sacred relics and the "Holy Pilgrim" dynastic distinction.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-blue-500/60 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/60 flex items-center justify-center text-2xl shadow">
              🧭
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-blue-100">Sacred Pilgrimage to Holy Sites</h2>
              <p className="text-xs text-stone-400">Undertake a multi-stage holy journey for divine grace & relics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PHASE 1: CHOOSE DESTINATION */}
        {phase === 'choose_site' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-300 leading-relaxed">
              Don the humble wool robe and scallop shell. Choose the sacred sanctuary where your character will seek divine absolution and holy blessings.
            </p>

            <div className="space-y-2.5">
              {destinations.map(d => (
                <button
                  key={d.key}
                  onClick={() => {
                    sound.playClick();
                    setDestination(d.key);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    destination === d.key
                      ? 'bg-blue-950/50 border-blue-500 shadow-md'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{d.icon}</span>
                    <div>
                      <div className="text-xs font-serif font-bold text-stone-200">{d.name}</div>
                      <div className="text-[11px] text-blue-300 font-medium">✨ {d.bonus}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">{d.cost} 🪙</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSelectSiteAndDepart}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-serif font-bold text-xs shadow-xl flex items-center justify-center gap-2"
            >
              <span>Depart for {destination} & Begin Sacred Journey</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PHASE 2: ENCOUNTER 1 - THE PASS */}
        {phase === 'encounter_1' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-serif font-bold text-sm">
                <Shield className="w-4 h-4" /> The Mountain Toll & Outlaw Pass
              </div>
              <p>
                In the treacherous high mountain pass, armed brigands bar the road demanding gold or blood from the passing pilgrim train.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleEncounter1('fight')}
                className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-rose-500 text-left transition-all text-xs font-serif"
              >
                <div className="font-bold text-rose-300 mb-1">⚔️ Draw Consecrated Blade</div>
                <p className="text-[10px] text-stone-400">Defend the pilgrims with martial prowess (+Renown).</p>
              </button>

              <button
                onClick={() => handleEncounter1('bribe')}
                className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all text-xs font-serif"
              >
                <div className="font-bold text-amber-300 mb-1">🪙 Distribute Holy Alms</div>
                <p className="text-[10px] text-stone-400">Pay the toll peacefully with charitable gold (+Piety).</p>
              </button>

              <button
                onClick={() => handleEncounter1('prayer')}
                className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-blue-500 text-left transition-all text-xs font-serif"
              >
                <div className="font-bold text-blue-300 mb-1">🕯️ Raise Holy Crucifix</div>
                <p className="text-[10px] text-stone-400">Inspire divine awe to convert the robbers (+High Piety).</p>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: ENCOUNTER 2 - SANCTUARY */}
        {phase === 'encounter_2' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-serif font-bold text-sm">
                <BookOpen className="w-4 h-4" /> The Secluded Valley Abbey
              </div>
              <p>
                You rest at an ancient cliffside monastery. The Abbot invites you into the scriptorium vaults.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleEncounter2('theology')}
                className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-blue-500 text-left transition-all text-xs font-serif"
              >
                <div className="font-bold text-blue-300 mb-1">📜 Study Illuminated Texts</div>
                <p className="text-[10px] text-stone-400">Debate celestial doctrine with the elder monks (+Intellect).</p>
              </button>

              <button
                onClick={() => handleEncounter2('relic_hunt')}
                className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all text-xs font-serif"
              >
                <div className="font-bold text-amber-300 mb-1">✨ Pray at the Reliquary Vault</div>
                <p className="text-[10px] text-stone-400">Touch the bones of the ancient martyr (+Piety).</p>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 4: SANCTUM ARRIVAL */}
        {phase === 'sanctum_arrival' && (
          <div className="space-y-4 text-center">
            <div className="p-5 bg-gradient-to-b from-blue-950/40 to-stone-950 rounded-xl border border-blue-500/60 space-y-2">
              <div className="text-4xl animate-pulse">✨</div>
              <h3 className="text-base font-serif font-bold text-blue-100">Kneeling Before the Holy Altar of {destination}</h3>
              <p className="text-xs text-stone-300 max-w-md mx-auto">
                Bells chime across the sacred city. The Patriarch anoints your brow with holy chrism, blessing House {character.dynastyName} with Saintly Bloodline grace!
              </p>
            </div>

            <button
              onClick={handleFinishPilgrimage}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-serif font-bold text-xs shadow-xl"
            >
              Receive Holy Relic & Complete Pilgrimage 📜
            </button>
          </div>
        )}

        {/* Chronicle Logs */}
        {pilgrimageLog.length > 0 && (
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] font-serif text-stone-400 max-h-24 overflow-y-auto space-y-1">
            {pilgrimageLog.map((log, idx) => (
              <div key={idx} className="text-stone-300">{log}</div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
