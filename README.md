# suku-kata-json

Dataset JSON untuk belajar membaca dan mengeja bahasa Indonesia: huruf, suku kata, kata, dan kalimat, disusun bertahap dari yang paling mudah.

*English version below: [jump to English](#english).*

---

## Bahasa Indonesia

### Isi

| Berkas | Isi |
| --- | --- |
| `data/huruf.json` | 26 huruf: nama, bunyi, jenis (vokal/konsonan), contoh kata |
| `data/suku-kata.json` | Suku kata beserta pola K/V, level, dan contoh kata |
| `data/kata.json` | Kata dengan pemenggalan suku kata, pola, level, dan kategori |
| `data/huruf-en.json` | Alfabet Inggris: nama huruf, bunyi, contoh kata |
| `data/suku-kata-en.json` | Suku kata (syllable) Inggris dan contoh katanya |
| `data/kata-en.json` | Kata bahasa Inggris dengan suku kata (syllable) dan emoji |
| `data/kalimat-en.json` | Kalimat sederhana bahasa Inggris |
| `data/kalimat.json` | Kalimat sederhana untuk latihan membaca |
| `schema/*.schema.json` | JSON Schema untuk setiap berkas data |
| `scripts/validate.js` | Pemeriksa format dan konsistensi antar berkas |

### Tingkat (level)

Level adalah panduan urutan belajar. Aplikasi bebas memakai atau mengabaikannya.

| Level | Materi | Contoh |
| --- | --- | --- |
| 1 | Huruf, suku kata terbuka V dan KV | a, ba, bi, bu |
| 2 | Kata dengan suku kata terbuka saja | bu-ku, bo-la, ke-la-pa |
| 3 | Suku kata tertutup (VK, KVK) | ma-kan, mi-num, ram-but |
| 4 | Gabungan huruf `ng`, `ny`, `sy`, `kh`, diftong `ai`, `au`, `oi`, dan gugus konsonan | bu-nga, nya-nyi, ha-ri-mau, truk |
| 5 | Kalimat sederhana | Ibu makan nasi. |

### Pola K/V

`K` adalah konsonan dan `V` adalah vokal. Gabungan `ng`, `ny`, `sy`, `kh` dihitung satu konsonan, dan `ai`, `au`, `oi` dihitung satu vokal. Contoh: `nga` berpola `KV`, `mau` berpola `KV`, `ngan` berpola `KVK`.

### Contoh data

`kata.json`:

```json
{
  "id": "bunga",
  "teks": "bunga",
  "suku_kata": ["bu", "nga"],
  "jumlah_suku_kata": 2,
  "pola": ["KV", "KV"],
  "level": 4,
  "kategori": "alam",
  "emoji": "🌸",
  "gambar": null,
  "audio": null
}
```

`emoji` berisi emoji pewakil kata, atau `null` jika tidak ada yang cocok (mis. kata tugas). `gambar` dan `audio` berisi nama berkas media, atau `null` jika belum ada. Dengan begitu data teks bisa dipakai lebih dulu dan media menyusul.

`suku-kata.json`:

```json
{
  "id": "nga",
  "teks": "nga",
  "pola": "KV",
  "huruf": ["ng", "a"],
  "level": 4,
  "contoh_kata": ["bunga", "singa", "telinga"]
}
```

### Cara memakai

JavaScript (Node.js):

```js
const kata = require('./data/kata.json');

// Kata level 2 kategori hewan, ditampilkan sebagai "sa-pi"
kata
  .filter((k) => k.level === 2 && k.kategori === 'hewan')
  .forEach((k) => console.log(k.suku_kata.join('-')));
```

Python:

```python
import json

with open("data/kata.json", encoding="utf-8") as f:
    kata = json.load(f)

for k in kata:
    if k["level"] == 3:
        print("-".join(k["suku_kata"]))
```

Suku kata, kata, dan kalimat saling merujuk lewat `id`, sehingga mudah dipakai untuk kartu susun suku kata atau latihan mengeja.

### Validasi

Memerlukan Node.js 18 atau lebih baru.

```bash
npm install
npm run validate
```

Yang diperiksa: format sesuai skema, `id` unik, gabungan `suku_kata` sama dengan `teks`, pola K/V benar, setiap suku kata pada kata ada di `suku-kata.json`, dan setiap kata pada kalimat ada di `kata.json`.

### Kontribusi

1. Tambahkan data ke berkas JSON yang sesuai. Gunakan huruf kecil dan ejaan baku (KBBI).
2. Penggal suku kata sesuai kaidah, misalnya `lam-pu`, `ma-kan`, `bu-nga`.
3. Jika kata memakai suku kata baru, tambahkan juga ke `suku-kata.json`.
4. Jalankan `npm run validate` sebelum mengirim perubahan.

### Lisensi

MIT. Lihat berkas [LICENSE](LICENSE).

---

## English

Structured JSON data for learning to read and spell Indonesian, ordered from easiest to hardest: letters, syllables, words, and sentences.

### Contents

| File | Description |
| --- | --- |
| `data/huruf.json` | The 26 letters with names, sounds, type (vowel/consonant), example words |
| `data/suku-kata.json` | Syllables with C/V pattern, level, example words |
| `data/kata.json` | Words split into syllables, with pattern, level, and category |
| `data/kalimat.json` | Simple sentences for reading practice |
| `schema/*.schema.json` | JSON Schema for each data file |
| `scripts/validate.js` | Format and cross-file consistency checker |

### Levels

| Level | Material | Examples |
| --- | --- | --- |
| 1 | Letters, open syllables (V, CV) | a, ba, bi, bu |
| 2 | Words made of open syllables only | bu-ku, bo-la, ke-la-pa |
| 3 | Closed syllables (VC, CVC) | ma-kan, mi-num, ram-but |
| 4 | Digraphs `ng`, `ny`, `sy`, `kh`, diphthongs `ai`, `au`, `oi`, consonant clusters | bu-nga, nya-nyi, ha-ri-mau, truk |
| 5 | Simple sentences | Ibu makan nasi. |

In patterns, `K` stands for *konsonan* (consonant) and `V` for *vokal* (vowel). Digraphs count as one consonant and diphthongs as one vowel.

### Usage

```js
const kata = require('./data/kata.json');
const level2 = kata.filter((k) => k.level === 2);
```

Words, syllables, and sentences reference each other by `id`, so you can build syllable-tile games or spelling drills directly from the data.

### Validation

Requires Node.js 18+.

```bash
npm install
npm run validate
```

### Contributing

Add entries to the matching JSON file using lowercase standard spelling, split syllables correctly, add any new syllable to `suku-kata.json`, and run `npm run validate` before submitting changes.

### License

MIT. See [LICENSE](LICENSE).
