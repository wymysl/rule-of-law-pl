// scripts/gen-pronunciation.mjs
// Generates spoken pronunciation clips for Polish case names via the ElevenLabs
// text-to-speech REST API, saving MP3s into data/audio/.
//
// Setup: put your key in <project>/.env.local as:  ELEVENLABS_API_KEY=sk_...
// Optionally:  ELEVENLABS_VOICE_ID=<id>   (default below is a multilingual voice)
// Run:   node scripts/gen-pronunciation.mjs
//
// It speaks each case's `pronunciation.say` (Polish text) using the
// eleven_multilingual_v2 model, writes data/audio/<id-slug>.mp3, and prints the
// `pronunciation.audio` path to set for each case. Re-running overwrites files.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CASES } from '../data/cases.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvLocal() {
  const p = join(ROOT, '.env.local');
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = { ...loadEnvLocal(), ...process.env };
const API_KEY = env.ELEVENLABS_API_KEY;
const VOICE_ID = env.ELEVENLABS_VOICE_ID || 'XB0fDUnXU5powFXDhCwa'; // "Charlotte" — multilingual; override via env
const MODEL = 'eleven_multilingual_v2';

if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY. Add it to .env.local (ELEVENLABS_API_KEY=sk_...).');
  process.exit(1);
}

const slug = (id) => id.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
const audioDir = join(ROOT, 'data', 'audio');
mkdirSync(audioDir, { recursive: true });

const targets = CASES.filter(c => c.pronunciation && c.pronunciation.say);
if (!targets.length) { console.log('No cases have pronunciation.say — nothing to do.'); process.exit(0); }

console.log(`Generating ${targets.length} clip(s) with voice ${VOICE_ID} (${MODEL})…\n`);
const mapping = {};
for (const c of targets) {
  const file = `${slug(c.id)}.mp3`;
  const dest = join(audioDir, file);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text: c.pronunciation.say, model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.8 } }),
  });
  if (!res.ok) { console.error(`  ✗ ${c.id}: HTTP ${res.status} ${await res.text().catch(() => '')}`); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  mapping[c.id] = `data/audio/${file}`;
  console.log(`  ✓ ${c.id} → data/audio/${file}  ("${c.pronunciation.say}", ${buf.length} bytes)`);
}

console.log('\nSet these pronunciation.audio values in data/cases.js:');
for (const [id, path] of Object.entries(mapping)) console.log(`  ${id}: '${path}'`);
