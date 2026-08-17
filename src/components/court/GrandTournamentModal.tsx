import React, { useState } from 'react';
import { Character, DynastyArtifact, RealmNPC, Vassal } from '../../types';
import { 
  Trophy, 
  Swords, 
  Target, 
  Music, 
  Shield, 
  Coins, 
  Crown, 
  Sparkles, 
  X, 
  Award,
  ChevronRight,
  Flame
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface GrandTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  vassals: Vassal[];
  realmNPCs: RealmNPC[];
  onCompleteTournament: (rewards: {
    goldDelta: number;
    renownDelta: number;
    happinessDelta: number;
    newArtifact?: DynastyArtifact;
    summary: string;
  }) => void;
}

type TournamentStage = 'betting' | 'joust' | 'melee' | 'archery' | 'poetry' | 'triumph';

export const GrandTournamentModal: React.FC<GrandTournamentModalProps> = ({
  isOpen,
  onClose,
  character,
  vassals,
  realmNPCs,
  onCompleteTournament
}) => {
  const [stage, setStage] = useState<TournamentStage>('betting');
  const [selectedBetChampion, setSelectedBetChampion] = useState<string>('Sir Lucan the Undefeated');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [tournamentScore, setTournamentScore] = useState<number>(0);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [playerWounded, setPlayerWounded] = useState<boolean>(false);

  if (!isOpen) return null;

  const champions = [
    { name: 'Sir Lucan the Undefeated', portrait: '🛡️', title: 'Grand Champion of the West', odds: '2.0x', martial: 18 },
    { name: 'Lady Katherine the Swift', portrait: '🏹', title: 'Master Ranger of the Glade', odds: '3.5x', martial: 15 },
    { name: 'Prince Cedric the Bold', portrait: '👑', title: 'Cousin of the Crown', odds: '4.0x', martial: 14 },
    { name: 'Yourself (The Monarch)', portrait: character.portrait, title: character.title || 'Reigning Sovereign', odds: '1.5x', martial: character.stats.martial }
  ];

  const handlePlaceBetAndStart = () => {
    sound.playFanfare();
    setStage('joust');
    setCombatLogs([`🎺 The royal horns sound! The Imperial Tournament officially commences before 5,000 cheering spectators.`]);
  };

  const handleJoustChoice = (tactic: 'aggressive' | 'steady' | 'feint') => {
    sound.playSword();
    let scoreGain = 0;
    let log = '';

    if (tactic === 'aggressive') {
      if (character.stats.martial >= 14 || Math.random() < 0.6) {
        scoreGain = 35;
        log = '💥 You lower your heavy ash lance and shatter your opponent\'s shield on impact! The challenger flies from the saddle to deafening applause (+35 Pts)!';
      } else {
        scoreGain = 10;
        setPlayerWounded(true);
        log = '⚠️ The heavy lance glance deflects off your pauldron, bruising your ribs (-5 Health, +10 Pts).';
      }
    } else if (tactic === 'steady') {
      scoreGain = 25;
      log = '🛡️ You absorb the challenger\'s blow with an unyielding shield-wall grip, unseating him in the third pass (+25 Pts).';
    } else {
      scoreGain = 30;
      log = '✨ A deceptive lance dip catches the challenger unprepared! You cleanly dislodge his gilded helm (+30 Pts).';
    }

    setTournamentScore(prev => prev + scoreGain);
    setCombatLogs(prev => [log, ...prev]);
    setStage('melee');
  };

  const handleMeleeChoice = (style: 'shield_line' | 'berserk' | 'commander') => {
    sound.playSword();
    let scoreGain = 0;
    let log = '';

    if (style === 'berserk') {
      scoreGain = 40;
      log = '⚔️ In the grand ring melee, you fight like a legendary warlord, disarming three knights in rapid succession (+40 Pts)!';
    } else if (style === 'shield_line') {
      scoreGain = 25;
      log = '🛡️ You coordinate with your retainers in a tight formation, systematically outlasting the fatigued duelists (+25 Pts).';
    } else {
      scoreGain = 30;
      log = '👑 Your commanding presence rallies the crowd, intimidating seasoned veterans into yielding their swords (+30 Pts).';
    }

    setTournamentScore(prev => prev + scoreGain);
    setCombatLogs(prev => [log, ...prev]);
    setStage('archery');
  };

  const handleArcheryChoice = (focus: 'bullseye' | 'speed') => {
    sound.playClick();
    let scoreGain = 0;
    let log = '';

    if (focus === 'bullseye') {
      scoreGain = 30;
      log = '🎯 Your yew-wood arrow splits the outer ring and strikes true in the red center bullseye (+30 Pts)!';
    } else {
      scoreGain = 25;
      log = '🏹 Rapid release! Five arrows strike the targets before the sand glass empties (+25 Pts).';
    }

    setTournamentScore(prev => prev + scoreGain);
    setCombatLogs(prev => [log, ...prev]);
    setStage('poetry');
  };

  const handlePoetryChoice = (theme: 'epic_deeds' | 'courtly_romance') => {
    sound.playFanfare();
    let scoreGain = 0;
    let log = '';

    if (theme === 'epic_deeds') {
      scoreGain = 35;
      log = '📜 Your soaring ballad of ancient ancestral conquests moves the high nobility and foreign ambassadors to tears (+35 Pts)!';
    } else {
      scoreGain = 25;
      log = '🍷 A witty and romantic sonnet charms the court ladies and visiting troubadours (+25 Pts).';
    }

    const finalScore = tournamentScore + scoreGain;
    setTournamentScore(finalScore);
    setCombatLogs(prev => [log, ...prev]);
    setStage('triumph');
  };

  const handleClaimPrizes = () => {
    const isVictorious = tournamentScore >= 95;
    const betWon = selectedBetChampion.includes('Yourself') ? isVictorious : Math.random() < 0.55;
    const betPayout = betWon ? Math.round(betAmount * 2.5) : -betAmount;

    const tournamentArtifact: DynastyArtifact = {
      id: `art_tourney_${Date.now()}`,
      name: isVictorious ? 'Grand Champion\'s Gilded Lance' : 'Knight of Honor Laurels',
      type: 'Weapon',
      rarity: isVictorious ? 'Epic' : 'Rare',
      icon: isVictorious ? '🔱' : '🌿',
      slot: 'mainHand',
      effects: {
        martial: isVictorious ? 6 : 3,
        prowess: isVictorious ? 8 : 4,
        renown: 35,
        armyMoraleBonus: 10
      },
      description: 'Awarded at the Grand Imperial Tournament before thousands of cheering subjects.',
      history: `Won by House ${character.dynastyName} in a historic feat of arms and chivalric honor.`,
      isEquipped: false
    };

    sound.playVictory();
    onCompleteTournament({
      goldDelta: betPayout - 60, // 60 gold tournament hosting cost
      renownDelta: isVictorious ? 85 : 45,
      happinessDelta: 30,
      newArtifact: tournamentArtifact,
      summary: isVictorious 
        ? `Triumphant Champion of the Grand Tournament! Scored ${tournamentScore} points across all four martial and courtly events.`
        : `Hosted a magnificent Grand Imperial Tournament, entertaining visiting lords with ${tournamentScore} points.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-500/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-2xl shadow">
              🏆
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-amber-100">The Grand Imperial Tournament</h2>
              <p className="text-xs text-stone-400">Jousts, Melees, Archery, and Courtly Wit Contests</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Score & Stage Progress */}
        <div className="flex items-center justify-between bg-stone-950/80 p-3 rounded-xl border border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-stone-400 font-serif">Tournament Standing:</span>
            <span className="font-bold text-amber-300 font-mono">{tournamentScore} Pts</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-400">
            <span className={stage === 'joust' ? 'text-amber-300 font-bold' : ''}>Joust</span> •
            <span className={stage === 'melee' ? 'text-amber-300 font-bold' : ''}>Melee</span> •
            <span className={stage === 'archery' ? 'text-amber-300 font-bold' : ''}>Archery</span> •
            <span className={stage === 'poetry' ? 'text-amber-300 font-bold' : ''}>Poetry</span> •
            <span className={stage === 'triumph' ? 'text-emerald-400 font-bold' : ''}>Prizes</span>
          </div>
        </div>

        {/* STAGE 1: BETTING & PARTICIPANT SELECTION */}
        {stage === 'betting' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-300">
              Chivalric knights, wandering champions, and foreign princes have assembled at the capital lists. Place a wager on your favorite champion before the fanfare begins.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {champions.map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    sound.playClick();
                    setSelectedBetChampion(c.name);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedBetChampion === c.name
                      ? 'bg-amber-950/50 border-amber-500 shadow-md'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{c.portrait}</span>
                    <div>
                      <div className="text-xs font-serif font-bold text-stone-200">{c.name}</div>
                      <div className="text-[10px] text-stone-400">{c.title} • Martial {c.martial}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">{c.odds}</span>
                </button>
              ))}
            </div>

            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-stone-300 font-serif">Wager on Champion:</span>
              </div>
              <div className="flex items-center gap-2">
                {[25, 50, 100].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs ${
                      betAmount === amt ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {amt} 🪙
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePlaceBetAndStart}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-sm shadow-xl flex items-center justify-center gap-2"
            >
              <span>Sound the Royal Fanfare & Enter Lists</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE 2: THE JOUST */}
        {stage === 'joust' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                <Swords className="w-4 h-4" /> The Imperial Jousting Lists
              </div>
              <p>
                Opposite the tilt-rail, Sir Lucan lowers his visor. The herald drops the white cloth and hooves thunder across the dirt track. Choose your jousting approach:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleJoustChoice('aggressive')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-rose-300">💥 Aggressive Couched Strike</div>
                <p className="text-[11px] text-stone-400">Aim directly for the center breastplate with maximum momentum (High Risk, High Reward).</p>
              </button>

              <button
                onClick={() => handleJoustChoice('steady')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-amber-300">🛡️ Defensive Shield-Lock</div>
                <p className="text-[11px] text-stone-400">Brace for impact behind heraldic shield, relying on stability to unhorse the foe.</p>
              </button>

              <button
                onClick={() => handleJoustChoice('feint')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-purple-300">✨ Deceptive Lance Feint</div>
                <p className="text-[11px] text-stone-400">Dip the tip at the final stride to dislodge the challenger's crested helm.</p>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: THE GRAND MELEE */}
        {stage === 'melee' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                <Shield className="w-4 h-4" /> The Grand Ring Melee
              </div>
              <p>
                Thirty armored knights clash inside the sawdust palisade with blunted broadswords and morningstars. Dust and sparks fill the arena!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleMeleeChoice('berserk')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-rose-300">⚔️ Whirlwind Blade Flurry</div>
                <p className="text-[11px] text-stone-400">Charge into the thickest fray with relentless warrior ferocity (+40 Pts).</p>
              </button>

              <button
                onClick={() => handleMeleeChoice('shield_line')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-amber-300">🛡️ Coordinated Shield Wall</div>
                <p className="text-[11px] text-stone-400">Fight shoulder-to-shoulder with household retainers to grind down opponents.</p>
              </button>

              <button
                onClick={() => handleMeleeChoice('commander')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-blue-300">👑 Royal Command Authority</div>
                <p className="text-[11px] text-stone-400">Direct battle momentum through martial stature, commanding knights to yield.</p>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: ROYAL ARCHERY */}
        {stage === 'archery' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                <Target className="w-4 h-4" /> Royal Archery Field
              </div>
              <p>
                Straw targets stand at eighty paces. A gentle crosswind tests the archers' patience and precision.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleArcheryChoice('bullseye')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-emerald-300">🎯 Aim for Dead Center Bullseye</div>
                <p className="text-[11px] text-stone-400">Take a deep breath and time the release between wind gusts.</p>
              </button>

              <button
                onClick={() => handleArcheryChoice('speed')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-amber-300">🏹 Rapid Quiver Release</div>
                <p className="text-[11px] text-stone-400">Loosen five arrows in rapid cadence before the crowd can blink.</p>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: TROUBADOUR / WIT DUEL */}
        {stage === 'poetry' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                <Music className="w-4 h-4" /> Troubadour & Wit Contest
              </div>
              <p>
                In the evening banquet pavilion, troubadours and noble lords take the lute to compose verses praising valor and courtly virtue.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePoetryChoice('epic_deeds')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-amber-300">📜 Epic Chanson of Dynastic Conquest</div>
                <p className="text-[11px] text-stone-400">Sing of dragons, ancestral crowns, and the glory of House {character.dynastyName}.</p>
              </button>

              <button
                onClick={() => handlePoetryChoice('courtly_romance')}
                className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-purple-300">🍷 Romantic Sonnet & Witty Banter</div>
                <p className="text-[11px] text-stone-400">Charm the visiting princesses and diplomats with delicate verses.</p>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 6: TRIUMPH & PRIZES */}
        {stage === 'triumph' && (
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-b from-amber-950/50 to-stone-950 rounded-2xl border border-amber-500/60 text-center space-y-3 shadow-xl">
              <div className="text-4xl animate-bounce">👑</div>
              <h3 className="text-xl font-serif font-bold text-amber-100">
                {tournamentScore >= 95 ? 'Grand Tournament Champion!' : 'Tournament Splendor Concluded!'}
              </h3>
              <p className="text-xs text-stone-300 max-w-md mx-auto">
                With a final score of <span className="text-amber-300 font-bold font-mono">{tournamentScore} points</span>, the heralds proclaim the royal triumph across the realm!
              </p>

              <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 max-w-sm mx-auto text-xs text-amber-200 font-serif space-y-1">
                <div>✨ +{tournamentScore >= 95 ? 85 : 45} Dynastic Renown</div>
                <div>🎉 +30 Realm Happiness & Vassal Loyalty</div>
                <div>🎁 Bestowed Heirloom Tournament Artifact</div>
              </div>
            </div>

            <button
              onClick={handleClaimPrizes}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-sm shadow-xl"
            >
              Claim Royal Laurels & Conclude Tournament
            </button>
          </div>
        )}

        {/* Combat & Chronicle Log */}
        {combatLogs.length > 0 && (
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] font-serif text-stone-400 max-h-28 overflow-y-auto space-y-1">
            {combatLogs.map((log, idx) => (
              <div key={idx} className="text-stone-300">{log}</div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
