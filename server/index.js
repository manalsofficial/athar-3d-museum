import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
const port = Number(process.env.PORT || 8787);
const model = process.env.OPENAI_MODEL || "gpt-6-luna";
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const contributors = [
  { id: "noura", name: "Noura Al-Harbi", age: 68, region: "Taif", skill: "Traditional embroidery", years: 45, bio: "A lifelong textile maker who learned embroidery from her grandmother and has taught it to generations of women in her community.", storyIds: ["s1"], image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" },
  { id: "salem", name: "Salem Al-Qahtani", age: 74, region: "Asir", skill: "Traditional mud-house building", years: 52, bio: "A retired builder who remembers how families worked together to build and maintain traditional homes.", storyIds: ["s2"], image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
  { id: "sara", name: "Sara Al-Otaibi", age: 65, region: "Najd", skill: "Sadu weaving", years: 40, bio: "A Sadu weaver preserving patterns, techniques and stories passed through her family.", storyIds: ["s3"], image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80" },
  { id: "fahad", name: "Fahad Al-Zahrani", age: 71, region: "Jeddah", skill: "Old Hijazi food traditions", years: 48, bio: "A storyteller and home cook who remembers recipes and celebrations from old Jeddah.", storyIds: ["s4"], image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80" },
  { id: "amal", name: "Amal Al-Ghamdi", age: 70, region: "Al Baha", skill: "Traditional landscapes and farming memories", years: 42, bio: "A community storyteller preserving memories of farms, mountains and seasonal life.", storyIds: ["s5"], image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" },
  { id: "huda", name: "Huda Al-Mutairi", age: 69, region: "Riyadh", skill: "Family traditions and celebrations", years: 44, bio: "A storyteller who remembers family celebrations and traditions passed between generations.", storyIds: ["s6"], image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80" },
];

const stories = [
  { id: "s1", contributorId: "noura", title: "The embroidery my grandmother taught me", category: "Crafts", region: "Taif", transcript: "My grandmother taught me traditional embroidery when I was young. Every pattern had a meaning, and we learned by sitting together and watching her hands. I still remember the patience she had with every stitch.", summary: "Noura remembers learning traditional embroidery from her grandmother and the meaning behind its patterns.", duration: "2:14", tags: ["embroidery", "crafts", "family", "Taif"] },
  { id: "s2", contributorId: "salem", title: "How we built our mud houses", category: "Architecture", region: "Asir", transcript: "Building a mud house was never one person's job. Neighbours helped each other prepare the earth, shape the walls and repair the house after the seasons changed. It taught us that a home was also a community.", summary: "Salem describes the communal knowledge behind traditional mud-house construction.", duration: "3:08", tags: ["architecture", "mud houses", "Asir", "community"] },
  { id: "s3", contributorId: "sara", title: "The stories inside Sadu patterns", category: "Crafts", region: "Najd", transcript: "Sadu patterns were more than decoration. The colors and shapes carried memories of the desert, family and journeys. When I weave, I feel that I am continuing a conversation that began before me.", summary: "Sara explains how Sadu patterns preserve family and desert memories.", duration: "2:46", tags: ["Sadu", "weaving", "Najd", "crafts"] },
  { id: "s4", contributorId: "fahad", title: "A recipe from old Jeddah", category: "Food", region: "Jeddah", transcript: "The kitchen was where everyone gathered. Some recipes were never written down because you simply learned by watching. The important part was not only the food, but who was around the table.", summary: "Fahad remembers food traditions and family gatherings in old Jeddah.", duration: "1:58", tags: ["food", "Jeddah", "family", "tradition"] },
  { id: "s5", contributorId: "amal", title: "The mountains and farms I remember", category: "Landscapes", region: "Al Baha", transcript: "I remember the mountain paths, the farms and the way the seasons changed the colors around us. We knew each place by the work we did there and the stories our families carried.", summary: "Amal shares memories of landscapes, farms and seasonal life in Al Baha.", duration: "2:21", tags: ["landscapes", "farms", "Al Baha"] },
  { id: "s6", contributorId: "huda", title: "The traditions around our family table", category: "Heritage", region: "Riyadh", transcript: "Our family traditions were passed on during celebrations and ordinary evenings together. The small details mattered: who prepared the food, who welcomed guests and the stories we repeated every year.", summary: "Huda remembers family traditions and celebrations passed between generations.", duration: "2:05", tags: ["traditions", "family", "celebrations"] },
];

function localSearch(query) {
  const q = String(query).toLowerCase();
  const words = q.split(/\s+/).filter(word => word.length > 2);
  return contributors.filter(c => {
    const haystack = `${c.name} ${c.skill} ${c.region} ${c.bio}`.toLowerCase();
    return haystack.includes(q) || words.some(word => haystack.includes(word));
  });
}

function cleanJson(text) {
  return text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ai: Boolean(openai), model, tts: Boolean(openai) });
});

app.get("/api/test-ai", async (_req, res) => {
  if (!openai) return res.status(503).json({ success: false, error: "OPENAI_API_KEY is not configured." });
  try {
    const response = await openai.responses.create({
      model,
      input: "Reply with exactly: ATHAR AI is working.",
      max_output_tokens: 30,
    });
    res.json({ success: true, answer: response.output_text.trim(), model });
  } catch (error) {
    console.error("/api/test-ai", error);
    res.status(500).json({ success: false, error: error?.message || "OpenAI request failed" });
  }
});

app.post("/api/search", async (req, res) => {
  const { query, language = "en" } = req.body || {};
  if (!query?.trim()) return res.status(400).json({ error: "query required" });
  if (!openai) return res.json(localSearch(query));

  try {
    const response = await openai.responses.create({
      model,
      input: `You are ATHAR, a Saudi heritage discovery assistant. Choose the best matching contributor IDs from this dataset. Return ONLY a JSON array of IDs, best match first. Never invent IDs. Query: ${query}\nLanguage: ${language}\nDataset: ${JSON.stringify(contributors)}`,
    });
    const ids = JSON.parse(cleanJson(response.output_text));
    const matches = ids.map(id => contributors.find(c => c.id === id)).filter(Boolean);
    res.json(matches.length ? matches : localSearch(query));
  } catch (error) {
    console.error("/api/search", error);
    res.json(localSearch(query));
  }
});

app.post("/api/ask-story", async (req, res) => {
  const { story, contributor, question, language = "en" } = req.body || {};
  if (!story || !contributor || !question) return res.status(400).json({ error: "missing fields" });
  if (!openai) return res.json({ answer: story.summary || "This story does not contain that information." });

  try {
    const response = await openai.responses.create({
      model,
      input: `You are ATHAR. Answer using ONLY the contributor's recorded story. Never invent facts. If the story does not answer the question, say that the recording does not contain that information. Answer in ${language === "ar" ? "Arabic" : "English"}, concise and warm.\nContributor: ${contributor.name}\nSkill: ${contributor.skill}\nStory: ${story.transcript}\nQuestion: ${question}`,
    });
    res.json({ answer: response.output_text.trim() });
  } catch (error) {
    console.error("/api/ask-story", error);
    res.json({ answer: story.summary || "This story does not contain that information." });
  }
});

app.post("/api/process-story", async (req, res) => {
  const { name, age, transcript, language = "en" } = req.body || {};
  if (!name || !age || !transcript) return res.status(400).json({ error: "name, age and transcript required" });
  if (!openai) return res.status(503).json({ error: "OPENAI_API_KEY is not configured." });

  try {
    const response = await openai.responses.create({
      model,
      input: `Transform this community member's oral history into a museum exhibit. Return ONLY valid JSON with keys title, category, summary, tags, exhibitText. Preserve meaning and do not invent facts. Language: ${language}. Name: ${name}. Age: ${age}. Transcript: ${transcript}`,
    });
    res.json(JSON.parse(cleanJson(response.output_text)));
  } catch (error) {
    console.error("/api/process-story", error);
    res.status(500).json({ error: "Could not process the story." });
  }
});

app.post("/api/tts", async (req, res) => {
  const { text, language = "en" } = req.body || {};
  if (!text?.trim()) return res.status(400).json({ error: "text required" });
  if (!openai) return res.status(503).json({ error: "OPENAI_API_KEY is not configured." });

  try {
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "marin",
      input: text,
      instructions: language === "ar"
  ? `
You are the voice of ATHAR, an elegant living museum of Saudi heritage.

Speak Modern Standard Arabic naturally and warmly.
Sound like a real human museum curator speaking directly to one visitor.

Use a calm, intimate and confident tone.
Speak slightly slowly.
Use natural pauses between ideas.
Do not sound like a GPS, automated assistant, call center, announcement, or audiobook.

The visitor should feel that a thoughtful person is personally guiding them through a museum.
`
  : `
You are the voice of ATHAR, an elegant living museum of Saudi heritage.

Speak natural English with a warm, calm and intelligent human voice.
Sound like a real museum curator speaking directly to one visitor.

Use a calm, intimate and confident tone.
Speak slightly slowly.
Use natural pauses between ideas.
Do not sound like a GPS, automated assistant, call center, announcement, or audiobook.

The visitor should feel that a thoughtful person is personally guiding them through a museum.
`,
      response_format: "mp3",
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.send(buffer);
  } catch (error) {
    console.error("/api/tts", error);
    res.status(500).json({ error: error?.message || "TTS request failed" });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dist = path.join(__dirname, "..", "dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(dist));
  app.use((_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(port, () => console.log(`ATHAR API running on http://localhost:${port}`));
