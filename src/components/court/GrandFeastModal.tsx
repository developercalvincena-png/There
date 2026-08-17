import React, { useState } from 'react';
import { Character, HookSecret, RealmNPC, Vassal, VassalFaction } from '../../types';
import { 
  Wine, 
  Sparkles, 
  Crown, 
  Eye, 
  Users, 
  Heart, 
  X, 
  ChevronRight, 
  Coins,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface GrandFeastModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  vassals: Vassal[];
  realmNPCs: RealmNPC[];
  vassalFactions: VassalFaction[];
  onCompleteFeast: (outcome: {
    goldDelta: number;
    renownDelta: number;
    happinessDelta: number;
    stressRelieved: number;
    newHook?: HookSecret;
    pacifiedFactionId?: string;
    summary: string;
  }) => void;
}

type FeastPhase = 'seating' | 'mingling' | 'midnight_revelry' | 'conclusion';

export const GrandFeastModal: React.FC<GrandFeastModalProps> = ({
  isOpen,
  onClose,
  character,
  vassals,
  realmNPCs,
  vassalFactions,
  onCompleteFeast
}) => {
  const [phase, setPhase] = useState<FeastPhase>('seating');
  const [seatedGuestId, setSeatedGuestId] = useState<string>(vassals[0]?.id || '');
  const [feastLog, setFeastLog] = useState<string[]>([]);
  const [intrigueOutcome, setIntrigueOutcome] = useState<{
    newHook?: HookSecret;
    pacifiedFactionId?: string;
    renownBonus: number;
  }>({ renownBonus: 0 });

  if (!isOpen) return null;

  const handleSeatingChoice = (choiceType: 'honor_vassal' | 'public_toast' | 'humiliate_rival') => {
    sound.playClick();
    let log = '';

    if (choiceType === 'honor_vassal') {
      const honoredVassal = vassals.find(v => v.id === seatedGuestId) || vassals[0];
      log = `🍷 You seat ${honoredVassal?.name || 'Lord Marshal'} at the high dais table of honor, raising a gilded goblet to their ancestral house (+25 Opinion)!`;
    } else if (choiceType === 'public_toast') {
      log = `👑 You deliver an inspiring banquet oration uniting all species and factions beneath the crown banner (+20 Realm Happiness, +15 Renown).`;
      setIntrigueOutcome(prev => ({ ...prev, renownBonus: prev.renownBonus + 15 }));
    } else {
      log = `🗡️ You pointedly place your rival at the cold drafty table by the kennel, asserting monarchical dominance (-Discontent, +10 Dread).`;
    }

    setFeastLog([log]);
    setPhase('mingling');
  };

  const handleMinglingIntrigue = (action: 'poison_rival' | 'pact' | 'romance' | 'quell_faction') => {
    sound.playClick();
    let log = '';

    if (action === 'poison_rival') {
      sound.playSword();
      if (character.stats.intrigue >= 12 || Math.random() < 0.65) {
        log = '🧪 Your disguised servant slips potent nightshade into your rival\'s spiced wine! They leave the hall clutching their stomach in agonizing humiliation.';
        const newHook: HookSecret = {
          id: `hook_feast_${Date.now()}`,
          targetId: vassals[0]?.id || 'vassal_1',
          targetName: vassals[0]?.name || 'Discontented Lord',
          type: 'Strong Hook',
          secretName: 'Poisoned Banquet Humiliation',
          description: 'Holds terrifying dread over the disgraced rival after the banquet poisoning.',
          obtainedYear: 1085,
          leveragePower: 100
        };
        setIntrigueOutcome(prev => ({ ...prev, newHook }));
      } else {
        log = '⚠️ The rival noticed a strange aroma in the chalice and switched glasses, casting suspicious glares across the hall.';
      }
    } else if (action === 'pact') {
      sound.playFanfare();
      log = '🤝 Over roasted venison and blackberry liqueur, you clasp hands with visiting dukes, sealing an unbreakable secret friendship.';
    } else if (action === 'romance') {
      sound.playFanfare();
      log = '🥀 In the moonlit rose garden outside the great hall, you share a clandestine romantic moment with an alluring noble guest (+Stress Relief).';
    } else {
      sound.playClick();
      const dangerousFaction = vassalFactions.find(f => f.powerPercent > 40) || vassalFactions[0];
      if (dangerousFaction) {
        log = `📜 You share a private flagon with ${dangerousFaction.leaderName}, offering trading concessions to dismantle the faction's unrest!`;
        setIntrigueOutcome(prev => ({ ...prev, pacifiedFactionId: dangerousFaction.id }));
      } else {
        log = `📜 You distribute royal favors to grumbling lords, dissolving minor court conspiracies.`;
      }
    }

    setFeastLog(prev => [log, ...prev]);
    setPhase('midnight_revelry');
  };

  const handleMidnightRevelry = () => {
    sound.playFanfare();
    const finalLog = '🕯️ Minstrels play lively jigs until sunrise. Guests dance upon banquet tables as hundreds of beeswax candles burn low.';
    setFeastLog(prev => [finalLog, ...prev]);
    setPhase('conclusion');
  };

  const handleFinishFeast = () => {
    sound.playVictory();
    onCompleteFeast({
      goldDelta: -50, // Feast cost
      renownDelta: 35 + intrigueOutcome.renownBonus,
      happinessDelta: 25,
      stressRelieved: 50,
      newHook: intrigueOutcome.newHook,
      pacifiedFactionId: intrigueOutcome.pacifiedFactionId,
      summary: `Hosted a lavish Grand Banquet in the Great Hall. Strengthened vassal loyalty and refreshed mental spirit.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-500/60 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-2xl shadow">
              🍷
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-amber-100">Grand Feast & Imperial Banquet</h2>
              <p className="text-xs text-stone-400">Court diplomacy, intrigues, and stress-relieving revelry</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PHASE 1: SEATING & OPENING TOAST */}
        {phase === 'seating' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-300 leading-relaxed">
              The great hearth roars with seasoned oak logs. Pages pour spiced mulled wine into silver goblets. How do you direct the seating arrangements and opening royal toast?
            </p>

            <div className="space-y-2.5">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
                <label className="block text-xs font-serif text-amber-300 font-bold">Select Lord to Honor at High Dais:</label>
                <select
                  value={seatedGuestId}
                  onChange={(e) => setSeatedGuestId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                >
                  {vassals.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.portrait} {v.name} ({v.title} - Loyalty {v.loyalty}%)
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleSeatingChoice('honor_vassal')}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-lg text-xs font-serif font-semibold transition-all"
                >
                  Seat Lord of Honor & Propose Royal Toast 🥂
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSeatingChoice('public_toast')}
                  className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all text-xs font-serif"
                >
                  <div className="font-bold text-amber-200 mb-1">👑 Grand Realm Toast</div>
                  <p className="text-[10px] text-stone-400">Deliver an inclusive oration to the entire court (+Renown, +Joy).</p>
                </button>

                <button
                  onClick={() => handleSeatingChoice('humiliate_rival')}
                  className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all text-xs font-serif"
                >
                  <div className="font-bold text-rose-300 mb-1">🗡️ Snub & Cold Table</div>
                  <p className="text-[10px] text-stone-400">Publicly humble a scheming rival to instill fear (+Dread).</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: MINGLING & INTRIGUE */}
        {phase === 'mingling' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold mb-1">
                <Eye className="w-4 h-4" /> Banquet Shadows & Intrigues
              </div>
              <p>
                As roasted peacocks and honeyed pastries are brought out, lords mingle away from prying ears. Where do you focus your attention?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handleMinglingIntrigue('poison_rival')}
                className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-purple-500 text-left transition-all space-y-1"
              >
                <div className="text-xs font-serif font-bold text-purple-300">🧪 Poison Rival's Wine</div>
                <p className="text-[10px] text-stone-400">Slip subtle nightshade to extract a Strong Blackmail Hook (Intrigue Check).</p>
              </button>

              <button
                onClick={() => handleMinglingIntrigue('pact')}
                className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1"
              >
                <div className="text-xs font-serif font-bold text-amber-300">🤝 Forge Secret Non-Aggression Vow</div>
                <p className="text-[10px] text-stone-400">Clasp hands with wavering vassals over fine vintage liqueur.</p>
              </button>

              <button
                onClick={() => handleMinglingIntrigue('romance')}
                className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-rose-500 text-left transition-all space-y-1"
              >
                <div className="text-xs font-serif font-bold text-rose-300">🥀 Clandestine Moonlit Affair</div>
                <p className="text-[10px] text-stone-400">Slip away into the rose garden for a passionate courtly rendezvous.</p>
              </button>

              <button
                onClick={() => handleMinglingIntrigue('quell_faction')}
                className="p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500 text-left transition-all space-y-1"
              >
                <div className="text-xs font-serif font-bold text-emerald-300">📜 Pacify Faction Ring-Leaders</div>
                <p className="text-[10px] text-stone-400">Offer lucrative trade monopolies to fracture rebel factions.</p>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: MIDNIGHT REVELRY */}
        {phase === 'midnight_revelry' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                <Wine className="w-4 h-4" /> The Midnight Revelry
              </div>
              <p>
                Flutes and lutes play lively jigs. Vassals and courtiers sing rowdy ballads together, casting aside royal formality.
              </p>
            </div>

            <button
              onClick={handleMidnightRevelry}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-xs shadow-xl flex items-center justify-center gap-2"
            >
              <span>Join the Dancing & Relieve All Royal Stress (-50 Stress)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PHASE 4: CONCLUSION */}
        {phase === 'conclusion' && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-gradient-to-b from-amber-950/40 to-stone-950 rounded-xl border border-amber-600/50 space-y-2">
              <div className="text-3xl">🎉</div>
              <h3 className="text-base font-serif font-bold text-amber-100">The Feast of the Century Concludes!</h3>
              <p className="text-xs text-stone-300 max-w-sm mx-auto">
                Bards will sing of this night's generosity for years. Your vassals return to their estates singing the praises of House {character.dynastyName}.
              </p>
            </div>

            <button
              onClick={handleFinishFeast}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-serif font-bold text-xs shadow-xl"
            >
              Conclude Feast & Record in Chronicle
            </button>
          </div>
        )}

        {/* Logs */}
        {feastLog.length > 0 && (
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] font-serif text-stone-400 max-h-24 overflow-y-auto space-y-1">
            {feastLog.map((log, idx) => (
              <div key={idx} className="text-stone-300">{log}</div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
