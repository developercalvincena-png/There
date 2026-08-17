import React from 'react';
import { Character, EpidemicState, Province } from '../../types';
import { 
  Biohazard, 
  ShieldCheck, 
  Skull, 
  HeartPulse, 
  Building, 
  Coins, 
  Cross, 
  X,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface EpidemicPlagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  epidemic: EpidemicState;
  provinces: Province[];
  onToggleDecree: (decreeKey: keyof EpidemicState['activeDecrees']) => void;
  onQuarantineProvince: (provinceId: string) => void;
}

export const EpidemicPlagueModal: React.FC<EpidemicPlagueModalProps> = ({
  isOpen,
  onClose,
  character,
  epidemic,
  provinces,
  onToggleDecree,
  onQuarantineProvince
}) => {
  if (!isOpen) return null;

  const severityColors: Record<string, string> = {
    None: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
    Outbreak: 'bg-amber-950/60 text-amber-300 border-amber-800',
    Epidemic: 'bg-orange-950/60 text-orange-300 border-orange-800',
    Devastation: 'bg-rose-950/80 text-rose-200 border-rose-700 animate-pulse'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-rose-500/60 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-2xl shadow">
              ☣️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-rose-100">{epidemic.name}</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {epidemic.globalSeverity} Wave
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Pestilence stalks the realm • Total Realm Casualties: <span className="text-rose-400 font-mono font-bold">{epidemic.totalRealmDeaths.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Epidemic Decrees & Mitigations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Border Quarantine */}
          <div className={`p-3.5 rounded-xl border transition-all flex items-start justify-between ${
            epidemic.activeDecrees.borderQuarantine ? 'bg-amber-950/40 border-amber-500' : 'bg-stone-950 border-stone-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Strict Border Quarantine</span>
              </div>
              <p className="text-[11px] text-stone-400">Halts trade caravans to slow contagion spread (-20% Gold, -60% Contagion).</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onToggleDecree('borderQuarantine');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold shrink-0 ${
                epidemic.activeDecrees.borderQuarantine ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'
              }`}
            >
              {epidemic.activeDecrees.borderQuarantine ? 'Active' : 'Enact'}
            </button>
          </div>

          {/* Plague Doctors */}
          <div className={`p-3.5 rounded-xl border transition-all flex items-start justify-between ${
            epidemic.activeDecrees.plagueDoctorsHired ? 'bg-purple-950/40 border-purple-500' : 'bg-stone-950 border-stone-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-purple-200">
                <HeartPulse className="w-4 h-4 text-purple-400" />
                <span>Hire Beaked Plague Doctors</span>
              </div>
              <p className="text-[11px] text-stone-400">Herbal theriac treatments preserve peasant lives (-30 Gold/Yr, +30% Recovery).</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onToggleDecree('plagueDoctorsHired');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold shrink-0 ${
                epidemic.activeDecrees.plagueDoctorsHired ? 'bg-purple-500 text-white' : 'bg-stone-800 text-stone-300'
              }`}
            >
              {epidemic.activeDecrees.plagueDoctorsHired ? 'Active' : 'Enact'}
            </button>
          </div>

          {/* Manor Seclusion */}
          <div className={`p-3.5 rounded-xl border transition-all flex items-start justify-between ${
            epidemic.activeDecrees.courtSecludedInManor ? 'bg-emerald-950/40 border-emerald-500' : 'bg-stone-950 border-stone-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-emerald-200">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Seclude Court in Mountain Manor</span>
              </div>
              <p className="text-[11px] text-stone-400">Lock the royal family behind mountain gates (100% Dynastic Protection).</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onToggleDecree('courtSecludedInManor');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold shrink-0 ${
                epidemic.activeDecrees.courtSecludedInManor ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-300'
              }`}
            >
              {epidemic.activeDecrees.courtSecludedInManor ? 'Active' : 'Enact'}
            </button>
          </div>

          {/* Holy Penance */}
          <div className={`p-3.5 rounded-xl border transition-all flex items-start justify-between ${
            epidemic.activeDecrees.holyPenanceProcessions ? 'bg-blue-950/40 border-blue-500' : 'bg-stone-950 border-stone-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-blue-200">
                <Cross className="w-4 h-4 text-blue-400" />
                <span>Holy Penance & Relic Processions</span>
              </div>
              <p className="text-[11px] text-stone-400">Chant hymns and parade sacred relics to soothe panic (+30 Piety, -Rebellion).</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onToggleDecree('holyPenanceProcessions');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold shrink-0 ${
                epidemic.activeDecrees.holyPenanceProcessions ? 'bg-blue-500 text-white' : 'bg-stone-800 text-stone-300'
              }`}
            >
              {epidemic.activeDecrees.holyPenanceProcessions ? 'Active' : 'Enact'}
            </button>
          </div>
        </div>

        {/* Province Contagion Map List */}
        <div className="space-y-2">
          <div className="text-xs font-serif font-bold uppercase tracking-wider text-stone-400">
            Province Contagion Roster & Infection Rates
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
            {provinces.map(prov => {
              const status = epidemic.provinces[prov.id] || {
                provinceId: prov.id,
                provinceName: prov.name,
                severity: 'Outbreak',
                infectionRate: 35,
                deathsThisYear: 120,
                isQuarantined: false
              };

              return (
                <div key={prov.id} className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-serif font-bold text-stone-200">{prov.name}</div>
                    <div className="text-[11px] text-stone-400">
                      Infection: <span className="text-rose-400 font-mono font-bold">{status.infectionRate}%</span> • {status.deathsThisYear} deaths
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${severityColors[status.severity] || severityColors.Outbreak}`}>
                      {status.severity}
                    </span>
                    <button
                      onClick={() => onQuarantineProvince(prov.id)}
                      className={`px-2 py-1 rounded text-[10px] font-serif ${
                        status.isQuarantined ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {status.isQuarantined ? 'Quarantined' : 'Isolate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-serif font-semibold"
          >
            Close Sanitation Registry
          </button>
        </div>

      </div>
    </div>
  );
};
