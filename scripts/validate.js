#!/usr/bin/env node
/**
 * Validasi dataset suku-kata-json.
 *
 * 1. Setiap berkas di data/ dicek terhadap JSON Schema di schema/.
 * 2. Konsistensi antar berkas dicek (id unik, pemenggalan suku kata,
 *    pola K/V, rujukan antar berkas).
 *
 * Jalankan: npm install && npm run validate
 */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = path.join(__dirname, '..');
const load = (...p) => JSON.parse(fs.readFileSync(path.join(ROOT, ...p), 'utf8'));

const VOWELS = 'aeiou';
const DIGRAPH_K = ['ng', 'ny', 'sy', 'kh'];
const DIFTONG = ['ai', 'au', 'oi'];

/** Pecah suku kata menjadi satuan huruf (ng, ny, sy, kh, ai, au, oi dihitung satu). */
function tokenize(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2);
    if (DIGRAPH_K.includes(two) || DIFTONG.includes(two)) {
      out.push(two);
      i += 2;
    } else {
      out.push(s[i]);
      i += 1;
    }
  }
  return out;
}
const polaOf = (tokens) => tokens.map((t) => (VOWELS.includes(t[0]) ? 'V' : 'K')).join('');

const errors = [];
const err = (file, id, msg) => errors.push(`${file} [${id}]: ${msg}`);

const FILES = ['huruf', 'suku-kata', 'kata', 'kalimat', 'huruf-en', 'suku-kata-en', 'kata-en', 'kalimat-en'];
const data = {};
const ajv = new Ajv({ allErrors: true });

// ---- 1. Skema ----
for (const name of FILES) {
  data[name] = load('data', `${name}.json`);
  const validate = ajv.compile(load('schema', `${name}.schema.json`));
  if (!validate(data[name])) {
    for (const e of validate.errors) {
      errors.push(`${name}.json${e.instancePath}: ${e.message}`);
    }
  }
}

// ---- 2. Id unik ----
for (const name of FILES) {
  const seen = new Set();
  for (const row of data[name]) {
    if (seen.has(row.id)) err(`${name}.json`, row.id, 'id ganda');
    seen.add(row.id);
  }
}

// ---- 3. Huruf ----
const hurufIds = new Set(data.huruf.map((h) => h.id));
for (const c of 'abcdefghijklmnopqrstuvwxyz') {
  if (!hurufIds.has(c)) err('huruf.json', c, 'huruf belum ada');
}
for (const h of data.huruf) {
  if (h.id !== h.huruf) err('huruf.json', h.id, 'id harus sama dengan huruf');
  if (h.kapital !== h.huruf.toUpperCase()) err('huruf.json', h.id, 'kapital tidak cocok');
  const jenis = VOWELS.includes(h.huruf) ? 'vokal' : 'konsonan';
  if (h.jenis !== jenis) err('huruf.json', h.id, `jenis seharusnya ${jenis}`);
}

// ---- 4. Suku kata ----
const sukuIds = new Set(data['suku-kata'].map((s) => s.id));
const kataIds = new Set(data.kata.map((k) => k.id));
for (const s of data['suku-kata']) {
  const tokens = tokenize(s.teks);
  if (s.id !== s.teks) err('suku-kata.json', s.id, 'id harus sama dengan teks');
  if (s.huruf.join('') !== s.teks) err('suku-kata.json', s.id, 'gabungan "huruf" tidak sama dengan teks');
  if (JSON.stringify(s.huruf) !== JSON.stringify(tokens)) {
    err('suku-kata.json', s.id, `"huruf" seharusnya ${JSON.stringify(tokens)}`);
  }
  if (s.pola !== polaOf(tokens)) err('suku-kata.json', s.id, `pola seharusnya ${polaOf(tokens)}`);
  for (const w of s.contoh_kata) {
    if (!kataIds.has(w)) err('suku-kata.json', s.id, `contoh_kata "${w}" tidak ada di kata.json`);
  }
}

// ---- 5. Kata ----
for (const k of data.kata) {
  if (k.id !== k.teks) err('kata.json', k.id, 'id harus sama dengan teks');
  if (k.suku_kata.join('') !== k.teks) err('kata.json', k.id, 'gabungan suku_kata tidak sama dengan teks');
  if (k.jumlah_suku_kata !== k.suku_kata.length) err('kata.json', k.id, 'jumlah_suku_kata salah');
  if (k.pola.length !== k.suku_kata.length) err('kata.json', k.id, 'jumlah pola tidak sama dengan jumlah suku kata');
  k.suku_kata.forEach((s, i) => {
    if (!sukuIds.has(s)) err('kata.json', k.id, `suku kata "${s}" belum ada di suku-kata.json`);
    const expected = polaOf(tokenize(s));
    if (k.pola[i] !== expected) err('kata.json', k.id, `pola suku kata "${s}" seharusnya ${expected}`);
  });
}

// ---- 6. Kalimat ----
for (const k of data.kalimat) {
  const fromText = (k.teks.toLowerCase().match(/[a-z]+/g) || []).join(' ');
  if (fromText !== k.kata.join(' ')) err('kalimat.json', k.id, '"kata" tidak sesuai dengan "teks"');
  if (k.jumlah_kata !== k.kata.length) err('kalimat.json', k.id, 'jumlah_kata salah');
  for (const w of k.kata) {
    if (!kataIds.has(w)) err('kalimat.json', k.id, `kata "${w}" belum ada di kata.json`);
  }
}

// ---- 7. Versi Inggris ----
// Pemenggalan suku kata Inggris tidak diperiksa dengan aturan K/V; yang dicek hanya konsistensi.
const sukuEnIds = new Set(data['suku-kata-en'].map((s) => s.id));
const kataEnIds = new Set(data['kata-en'].map((k) => k.id));
for (const h of data['huruf-en']) {
  if (h.id !== h.huruf) err('huruf-en.json', h.id, 'id harus sama dengan huruf');
  if (h.kapital !== h.huruf.toUpperCase()) err('huruf-en.json', h.id, 'kapital tidak cocok');
}
if (data['huruf-en'].length !== 26) err('huruf-en.json', '-', 'harus berisi 26 huruf');
for (const s of data['suku-kata-en']) {
  if (s.id !== s.teks) err('suku-kata-en.json', s.id, 'id harus sama dengan teks');
  for (const w of s.contoh_kata) {
    const k = data['kata-en'].find((x) => x.id === w);
    if (!k) err('suku-kata-en.json', s.id, `contoh_kata "${w}" tidak ada di kata-en.json`);
    else if (!k.suku_kata.includes(s.id)) err('suku-kata-en.json', s.id, `"${w}" tidak memuat suku kata ini`);
  }
}
for (const k of data['kata-en']) {
  if (k.id !== k.teks) err('kata-en.json', k.id, 'id harus sama dengan teks');
  if (k.suku_kata.join('') !== k.teks) err('kata-en.json', k.id, 'gabungan suku_kata tidak sama dengan teks');
  if (k.jumlah_suku_kata !== k.suku_kata.length) err('kata-en.json', k.id, 'jumlah_suku_kata salah');
  for (const s of k.suku_kata) {
    if (!sukuEnIds.has(s)) err('kata-en.json', k.id, `suku kata "${s}" belum ada di suku-kata-en.json`);
  }
}
for (const k of data['kalimat-en']) {
  const fromText = (k.teks.toLowerCase().match(/[a-z]+/g) || []).join(' ');
  if (fromText !== k.kata.join(' ')) err('kalimat-en.json', k.id, '"kata" tidak sesuai dengan "teks"');
  if (k.jumlah_kata !== k.kata.length) err('kalimat-en.json', k.id, 'jumlah_kata salah');
  if (!k.kata.some((w) => kataEnIds.has(w))) err('kalimat-en.json', k.id, 'tidak memuat kata dari kata-en.json');
}

// ---- Hasil ----
if (errors.length) {
  console.error(`\nDitemukan ${errors.length} masalah:\n`);
  errors.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log('Semua data valid.');
for (const name of FILES) console.log(`  ${name}.json: ${data[name].length} entri`);
