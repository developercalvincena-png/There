import { GameSaveState, SaveSlotMetadata, Character, Realm, Province, Vassal, FamilyMember, RealmLaw, ChronicleEntry, TradeCaravan, WarState, RealmNPC, ProvincialSoldier } from '../types';

export const AUTOSAVE_SLOT_ID = 'autosave';
const SLOTS_INDEX_KEY = 'medieval_realms_slots_index_v2';
const SAVE_SLOT_PREFIX = 'medieval_realms_slot_v2_';

export function getSavedSlotsMetadata(): SaveSlotMetadata[] {
  try {
    const raw = localStorage.getItem(SLOTS_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to get saved slots metadata:', e);
    return [];
  }
}

function saveSlotsIndex(slots: SaveSlotMetadata[]) {
  try {
    localStorage.setItem(SLOTS_INDEX_KEY, JSON.stringify(slots));
  } catch (e) {
    console.error('Failed to update slots index:', e);
  }
}

export function saveGameToSlot(
  slotId: string,
  slotName: string,
  state: {
    character: Character;
    familyMembers: FamilyMember[];
    realms: Realm[];
    provinces: Province[];
    realmNPCs: RealmNPC[];
    vassals: Vassal[];
    realmLaws: RealmLaw[];
    chronicleEntries: ChronicleEntry[];
    tradeCaravans: TradeCaravan[];
    currentYear: number;
    reignYears: number;
    activeWars: WarState[];
    provincialSoldiers?: Record<string, ProvincialSoldier[]>;
  },
  isAutoSave: boolean = false
): SaveSlotMetadata[] {
  const fullSaveState: GameSaveState = {
    version: '2.5.0',
    savedAt: new Date().toISOString(),
    slotId,
    slotName,
    character: state.character,
    familyMembers: state.familyMembers,
    realms: state.realms,
    provinces: state.provinces,
    realmNPCs: state.realmNPCs,
    vassals: state.vassals,
    realmLaws: state.realmLaws,
    chronicleEntries: state.chronicleEntries,
    tradeCaravans: state.tradeCaravans,
    currentYear: state.currentYear,
    reignYears: state.reignYears,
    activeWars: state.activeWars,
    provincialSoldiers: state.provincialSoldiers,
  };

  try {
    localStorage.setItem(`${SAVE_SLOT_PREFIX}${slotId}`, JSON.stringify(fullSaveState));
  } catch (err) {
    console.error('LocalStorage error while saving slot:', err);
    throw new Error('Failed to save state to localStorage. Storage may be full.');
  }

  // Find player realm
  const playerRealm = state.realms.find(r => r.id === state.character.realmId) || state.realms[0];
  const controlledProvinces = state.provinces.filter(p => p.isPlayerControlled).length;

  const metadata: SaveSlotMetadata = {
    id: slotId,
    name: slotName,
    savedAt: new Date().toISOString(),
    year: state.currentYear,
    rulerName: state.character.name,
    dynastyName: state.character.dynastyName,
    rank: state.character.rank,
    portrait: state.character.portrait,
    realmName: playerRealm ? playerRealm.name : 'Player Realm',
    realmCrest: playerRealm ? (playerRealm.crestIcon || '👑') : '👑',
    gold: state.character.stats.gold,
    provincesControlled: controlledProvinces,
    totalProvinces: state.provinces.length,
    isAutoSave: isAutoSave || slotId === AUTOSAVE_SLOT_ID,
  };

  const existingSlots = getSavedSlotsMetadata();
  const filtered = existingSlots.filter(s => s.id !== slotId);
  const updatedSlots = [metadata, ...filtered];
  saveSlotsIndex(updatedSlots);

  return updatedSlots;
}

export function loadGameFromSlot(slotId: string): GameSaveState | null {
  try {
    const raw = localStorage.getItem(`${SAVE_SLOT_PREFIX}${slotId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validation = validateSavePayload(parsed);
    if (validation.valid && validation.state) {
      return validation.state;
    }
    return null;
  } catch (e) {
    console.error('Failed to load game from slot:', e);
    return null;
  }
}

export function deleteSaveSlot(slotId: string): SaveSlotMetadata[] {
  try {
    localStorage.removeItem(`${SAVE_SLOT_PREFIX}${slotId}`);
  } catch (e) {
    console.error('Error removing slot item:', e);
  }
  const existingSlots = getSavedSlotsMetadata();
  const updatedSlots = existingSlots.filter(s => s.id !== slotId);
  saveSlotsIndex(updatedSlots);
  return updatedSlots;
}

export function downloadSaveAsJson(state: GameSaveState) {
  try {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    const safeName = (state.character?.name || 'Dynasty').toLowerCase().replace(/\s+/g, '_');
    const safeYear = state.currentYear || 1000;
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `medieval_dynasty_save_${safeName}_yr${safeYear}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (e) {
    console.error('Failed to download save as JSON:', e);
  }
}

export function validateSavePayload(data: any): { valid: boolean; state?: GameSaveState; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Save data is empty or not an object.' };
  }

  if (!data.character || !data.character.name || typeof data.currentYear !== 'number') {
    return { valid: false, error: 'Invalid save structure: missing core character or year data.' };
  }

  if (!Array.isArray(data.realms) || !Array.isArray(data.provinces)) {
    return { valid: false, error: 'Invalid save structure: missing realms or provinces arrays.' };
  }

  const validated: GameSaveState = {
    version: data.version || '2.0.0',
    savedAt: data.savedAt || new Date().toISOString(),
    slotId: data.slotId,
    slotName: data.slotName,
    character: data.character,
    familyMembers: Array.isArray(data.familyMembers) ? data.familyMembers : [],
    realms: data.realms,
    provinces: data.provinces,
    realmNPCs: Array.isArray(data.realmNPCs) ? data.realmNPCs : [],
    vassals: Array.isArray(data.vassals) ? data.vassals : [],
    realmLaws: Array.isArray(data.realmLaws) ? data.realmLaws : [],
    chronicleEntries: Array.isArray(data.chronicleEntries) ? data.chronicleEntries : [],
    tradeCaravans: Array.isArray(data.tradeCaravans) ? data.tradeCaravans : [],
    currentYear: Number(data.currentYear) || 1000,
    reignYears: Number(data.reignYears) || 1,
    activeWars: Array.isArray(data.activeWars) ? data.activeWars : [],
  };

  return { valid: true, state: validated };
}

export async function readUploadedSaveFile(file: File): Promise<{ valid: boolean; state?: GameSaveState; error?: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    return validateSavePayload(parsed);
  } catch (err: any) {
    return { valid: false, error: `Could not parse JSON file: ${err.message || 'Unknown error'}` };
  }
}
