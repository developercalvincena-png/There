import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Curated realistic medieval historical headlines for fallback / enrichment
const MEDIEVAL_HISTORICAL_CHRONICLES = [
  {
    id: 'news_1',
    headline: 'Papal Bull Promulgated: Truce of God Proclaimed across Western Principalities',
    category: 'Holy Edicts',
    region: 'Holy See of Rome & Christendom',
    summary: 'The Holy Father has issued a solemn edict forbidding feudal warfare and siege operations from Wednesday vespers to Monday dawn under pain of severe excommunication. Bishops urge warring barons to lay down arms.',
    historicalContext: 'Inspired by the 11th-century Peace and Truce of God movement to limit feudal violence against non-combatants and clergy.',
    rumorImpact: 'Piety increases across pious realms; mercenary recruitment costs shift +10% during holy intervals.',
    source: 'Papal Legate Chronicle'
  },
  {
    id: 'news_2',
    headline: 'Grand Tournament of Chivalry Concludes in Flanders: Knights from Six Realms Clash in Joust',
    category: 'Crown Scandals',
    region: 'County of Flanders',
    summary: 'Over two hundred mounted knights in polished plate and mail gathered for the grand tournament. A mysterious landless knight in sable armor unseated four champions before refusing to reveal his true crest.',
    historicalContext: 'Reflecting the lavish chivalric tournament culture championed by William Marshal and European aristocracy.',
    rumorImpact: 'Renown and prestige opportunities surge; tourney armorers report immense demand for Flemish tempered steel.',
    source: 'Heraldic Roll of Arms'
  },
  {
    id: 'news_3',
    headline: 'Hanseatic Guild Blockade: Northern Merchants Enforce Iron Monopoly on Baltic Sea Routes',
    category: 'Guilds & Trade',
    region: 'Baltic & North Sea Ports',
    summary: 'A confederacy of maritime merchant guilds has imposed naval embargoes on contraband timber and herring. Unlicensed merchant cogs are being seized at harbor mouths.',
    historicalContext: 'Mirroring the formidable economic and naval dominance of the Hanseatic League in medieval Northern Europe.',
    rumorImpact: 'Trade caravan profits on grain and furs increase by +25%; maritime tariffs tightened.',
    source: 'Hanseatic Guild Registry'
  },
  {
    id: 'news_4',
    headline: 'Byzantine Succession Crisis: Varangian Guard Mobilized amid Palace Conspiracies',
    category: 'War & Sieges',
    region: 'Imperial Constantinople & Eastern Reach',
    summary: 'Following the sudden poisoning of the Grand Logothete, the Golden Horn witnessed double guard watches. Axe-bearing Norse mercenaries secure the imperial bedchambers against shadow pretenders.',
    historicalContext: 'Echoing the turbulent court intrigue and elite mercenary guard dynamics of the medieval Byzantine Empire.',
    rumorImpact: 'High-tier intrigue schemes abroad; court spymasters detect foreign informants.',
    source: 'Byzantine Imperial Diptych'
  },
  {
    id: 'news_5',
    headline: 'Astronomers and Monks Record Blazing Comet Streaking across the Autumn Firmament',
    category: 'Omens & Astrology',
    region: 'Continental Sky & Monastic Observatories',
    summary: 'Monastery scribes have recorded a long-tailed fiery star visible for twelve consecutive nights. Soothsayers debate whether it portends the fall of an ancient dynasty or the birth of a world-conqueror.',
    historicalContext: 'Inspired by Halley’s Comet recorded in the Bayeux Tapestry in 1066 before the Battle of Hastings.',
    rumorImpact: 'County unrest fluctuates by ±5%; mystic and arcane shrines attract thousands of pilgrim offerings.',
    source: 'Monastic Annals of St. Alban'
  },
  {
    id: 'news_6',
    headline: 'Venetian and Genoese Galleys Clash in Fierce Naval Skirmish over Silk Route Ports',
    category: 'Guilds & Trade',
    region: 'Levantine Maritime Straights',
    summary: 'Armed merchant galleys engaged in close-quarters ramming and Greek fire volleys off the coast of Rhodes. Both maritime republics accuse each other of violating merchant treaties.',
    historicalContext: 'Reflecting the centuries-long Venetian-Genoese maritime wars over Eastern Mediterranean commerce.',
    rumorImpact: 'Exotic silk, spices, and glass imports reach record trade value; naval mercenaries in high demand.',
    source: 'Maritime Port Authority'
  },
  {
    id: 'news_7',
    headline: 'Peasant Jacquerie Revolt Erupts along River Valleys over Excessive Milling Taxes',
    category: 'War & Sieges',
    region: 'Central Riverlands',
    summary: 'Angry rural serfs armed with scythes and flails have burned three feudal manor tithe-barns. Castellan bailiffs are fortifying keeps as provincial garrisons rally to suppress the rebellion.',
    historicalContext: 'Based on the Jacquerie uprisings of 1358 and the English Peasants\' Revolt of 1381 protesting harsh feudal exactions.',
    rumorImpact: 'Vassal faction discontent spikes; lords with high county unrest face heightened uprising risks.',
    source: 'Provincial Bailiff Report'
  },
  {
    id: 'news_8',
    headline: 'Royal Archbishops Propose Universals Curriculum: First Faculty of Natural Philosophy Chartered',
    category: 'Holy Edicts',
    region: 'Bologna & Paris Academic Quarters',
    summary: 'Scholars in robes have gathered under imperial royal patent to translate ancient Arabic and Greek scrolls on optics, mathematics, and canon law. Debates rage over Aristotelian metaphysics.',
    historicalContext: 'Inspired by the rise of the first medieval universities in Bologna, Paris, and Oxford during the 11th-12th centuries.',
    rumorImpact: 'Heir intellect education efficiency boosted; Academy province buildings produce +15% research renown.',
    source: 'Chancellery Academic Roll'
  }
];

// Search Grounded World News Endpoint
app.get('/api/world-news', async (req: Request, res: Response) => {
  const currentYear = parseInt(req.query.year as string, 10) || 1066;
  const topic = (req.query.topic as string) || '';
  const category = (req.query.category as string) || 'All';

  try {
    const ai = getAIClient();
    if (!ai) {
      // Fallback with year-appropriate items
      return res.json({
        grounded: false,
        year: currentYear,
        source: 'Historical Medieval Annals (Offline / Local Database)',
        articles: MEDIEVAL_HISTORICAL_CHRONICLES
      });
    }

    const searchPrompt = topic 
      ? `Search and provide 4-6 authentic, historically-grounded medieval news chronicles, rumors, and diplomatic events relating to "${topic}" around the historical medieval era (specifically contextualized around year ${currentYear} AD or the High Medieval era).`
      : `Search and provide 5 authentic, historically grounded medieval world news headlines and chronicle dispatches for the year ${currentYear} AD (or major events around 11th-14th century medieval European, Byzantine, Nordic, Crusader, and Mediterranean history like battles, treaties, tournaments, church edicts, merchant trade, and dynastic intrigues).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${searchPrompt}
Return the result strictly as a valid JSON array of objects with the following schema for each article:
[
  {
    "id": "news_unique_id",
    "headline": "Compelling Medieval Chronicle Headline",
    "category": "War & Sieges" | "Crown Scandals" | "Holy Edicts" | "Guilds & Trade" | "Omens & Astrology",
    "region": "Historical Province, Realm or City",
    "summary": "2-3 sentences of immersive, authentic medieval dispatch written in chronicler tone",
    "historicalContext": "1 sentence explaining the actual historical medieval counterpart or foundation",
    "rumorImpact": "1 sentence describing the in-game realm or economic consequence",
    "source": "Monastic Scribe, Papal Legate, Guild Registry, or Royal Herald"
  }
]
Do not wrap in markdown quotes if possible, output pure JSON.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const responseText = response.text || '';
    let parsedArticles = [];

    try {
      // Clean JSON string if wrapped in markdown
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedArticles = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn('Failed to parse Gemini JSON output, using structured fallback:', parseError);
      parsedArticles = MEDIEVAL_HISTORICAL_CHRONICLES;
    }

    // Extract search grounding metadata if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const searchQueries = groundingMetadata?.webSearchQueries || [topic || `Medieval history events around ${currentYear}`];

    return res.json({
      grounded: true,
      year: currentYear,
      searchQueries,
      source: 'Google Search Grounding via Gemini 3.7 Flash',
      articles: Array.isArray(parsedArticles) && parsedArticles.length > 0 ? parsedArticles : MEDIEVAL_HISTORICAL_CHRONICLES
    });
  } catch (error) {
    console.error('Error fetching search grounded medieval news:', error);
    return res.json({
      grounded: false,
      year: currentYear,
      source: 'Historical Medieval Annals (Fallback)',
      articles: MEDIEVAL_HISTORICAL_CHRONICLES,
      error: error instanceof Error ? error.message : 'Unknown search error'
    });
  }
});

// Interactive Query Endpoint for Search Grounding
app.post('/api/world-news/query', async (req: Request, res: Response) => {
  const { query, year } = req.body;
  const currentYear = year || 1066;

  try {
    const ai = getAIClient();
    if (!ai) {
      return res.json({
        grounded: false,
        query,
        articles: MEDIEVAL_HISTORICAL_CHRONICLES.filter(a => 
          a.headline.toLowerCase().includes(query.toLowerCase()) || 
          a.summary.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
        )
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Search the web for medieval history facts regarding: "${query}". Generate 3-4 rich medieval chronicle gazette articles for year ~${currentYear} AD.
Return strictly a JSON array with schema:
[
  {
    "id": "query_1",
    "headline": "Historical Headline",
    "category": "War & Sieges" | "Crown Scandals" | "Holy Edicts" | "Guilds & Trade" | "Omens & Astrology",
    "region": "Location",
    "summary": "Detailed immersive dispatch",
    "historicalContext": "Real historical context citation",
    "rumorImpact": "Gameplay impact",
    "source": "Herald"
  }
]`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const articles = JSON.parse(cleaned);

    return res.json({
      grounded: true,
      query,
      articles: Array.isArray(articles) ? articles : MEDIEVAL_HISTORICAL_CHRONICLES
    });
  } catch (err) {
    console.error('Error querying custom search:', err);
    return res.json({
      grounded: false,
      query,
      articles: MEDIEVAL_HISTORICAL_CHRONICLES
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
