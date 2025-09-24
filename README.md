# Ava Spelling Games — Spec v0.1 (MVP)

## 1) Product Goals

* **Delight Ava** with cute, quick-reward mini-games that always speak the target word.
* **Zero retyping**: word lists persist across pages/games.
* **iPad-friendly**: big buttons, reliable on-screen keyboard.
* **Share later**: simple architecture, easy to add games and printables.

---

## 2) Tech Stack & Project Setup

* **Frontend**: TypeScript + **Phaser 3** (2D games), Vite
* **State/Router**: Lightweight client router (page components), global store via simple TS module
* **Audio/TTS**: Web Speech API (abstraction layer to allow swapping ElevenLabs later)
* **Storage**: `localStorage` (lists, settings, progress)
* **Hosting (dev)**: `vite dev --host` to expose on LAN for iPad; access via `http://<PC-IP>:5173`
* **Optional later**: PWA (Workbox), IndexedDB for richer saves, Firebase for sync

**File tree (MVP)**

```
/src
  /games
    AnimalBoxGame.ts
    BlockBuilder.ts
    Basketball.ts
    BlockBreaker.ts   // stub for now
  /core
    store.ts           // global app state (lists, settings, progress)
    tts.ts             // speak(), speakSlow(), selectVoice(), engine swap
    input.ts           // keyboard focus helpers (iPad)
    sfx.ts             // buzzer, confetti, pop, swish
    animals.ts         // animal catalog + RNG (no immediate repeats)
    scoring.ts         // shared scoring helpers
  /ui
    Home.tsx
    GameSelect.tsx
    Layout.tsx
    Components.tsx     // BigButton, Card, Modal, Toggle, etc.
  /pages
    HomePage.tsx
    GamePage.tsx       // wraps Phaser canvas + top bar
    SettingsPage.tsx
  main.tsx
  router.ts
/assets
  sfx/*.mp3
  sprites/animals/*.png
  ui/*
```

---

## 3) UX & Layout

### Home Page (MVP)

* **Word Input**: multiline `<textarea>` that accepts:

  * One word per line *or* comma-separated: e.g. `lick, luck, brick`
  * Normalizes to lower-case, trims whitespace, removes duplicates
* **Buttons** (touch-friendly, 64px+ height):

  * “Play Games” → Game Select
  * “Practice Mode” (optional v1)
  * “Test Mode” (optional v1)
  * “Speed Round” (optional v1)
  * “Copy List to Clipboard”
  * “Save List” (auto save also on blur)
* **Nav**: persistent top bar with “Home” and “Games”
* **Feedback**: toast when list saved / copied

### Game Select

* Large cards for:

  * **Animal Box**
  * **Block Builder**
  * **Basketball**
  * **Block Breaker (coming soon)**
* Each card shows short description + “Play”
* Back links: “← Home”, “← All Games”

### In-Game UI (shared)

* Top bar: “← Games”, current list name, speaker icon (replay prompt), settings (music off, dyslexic font)
* Big **“Hear word again”** button
* Always-focused hidden input to force iPad keyboard (tap anywhere refocuses)

---

## 4) Data Model & Persistence

### Word List

```ts
type WordItem = { text: string; hint?: string; sentence?: string };
type WordList = {
  id: string;          // uuid
  name: string;        // “Week 7 - Short u”
  words: WordItem[];   // unique, normalized
  createdAt: number;
  lastUsedAt?: number;
};
```

### Settings

```ts
type Settings = {
  voiceId?: string;         // persisted chosen voice
  ttsRate: number;          // 0.75–1.25 (default 1.0)
  showHints: boolean;       // default true
  dyslexicFont: boolean;    // default false
  sfx: boolean;             // default on
};
```

### Storage Keys

* `asgs.currentListId`
* `asgs.lists` (array of WordList)
* `asgs.settings`
* `asgs.progress.<listId>.<gameKey>` (optional per-game stats)

---

## 5) TTS Strategy

### v1 (Free, Simple)

* **Web Speech API** via `speechSynthesis`
* **speak(text, {rate, voiceId})**, **speakSlow(text)**, **speakSentence(sentence)**
* On first load, enumerate voices; pick clear US English voice (prefer “Samantha/Google US English” if present). Persist selection.

### Swap-able Engine (Future)

* Keep `tts.ts` interface:

```ts
export async function speak(text: string, opts?: SpeakOpts): Promise<void>;
export async function speakSlow(text: string): Promise<void>;
export function getVoices(): VoiceMeta[];
export function setVoice(id: string): void;
```

* Later, ElevenLabs/Polly can implement same interface and use pre-generated clips.

---

## 6) iPad Keyboard Reliability

* Hidden input always focused; tap on canvas re-focuses:

```html
<input id="kb" inputmode="latin" autocomplete="off" autocapitalize="none"
  style="position:fixed;left:-9999px;opacity:0;" />
```

```ts
function ensureKeyboard() { kb.focus(); }
document.addEventListener('touchstart', ensureKeyboard, {passive:true});
```

* Avoid `contenteditable`; use a real `<input>` for letters/words.

---

## 7) Shared Game Mechanics (Scaffolding & Hints)

* On each word:

  1. Play prompt (`speak(word)` or `speakSentence()` if provided)
  2. Player types letters
  3. On mistake: light buzzer SFX, increment `mistakes`
  4. **Hint ladder**:

     * 1st miss → replay word
     * 2nd miss → slower TTS
     * 3rd miss → reveal first letter (ghost)
* “Hear again” button always available

---

## 8) Animal Catalog (MVP)

Simple, cute set with RNG no-repeat rule:

```
cat, dog, bunny, turtle, fox, panda, koala, penguin, lion, tiger,
giraffe, elephant, hippo, zebra, monkey, owl, dolphin, whale,
parrot, frog, raccoon, squirrel, deer, llama, sloth
```

* Asset plan: start with simple placeholder sprites (flat color + eyes), upgrade later.

---

## 9) Games — Detailed Specs

### 9.1 Animal Box (Core MVP)

**Goal:** Type the target word correctly; every 3 correct words, a random animal pops out of a gift box.

**Flow**

1. Choose next word (shuffle once per round).
2. `speak(word)`; show input field with underscores or ghost placeholders.
3. On each keystroke:

   * If next letter matches → reveal that letter.
   * Else → buzzer; apply hint ladder.
4. When the full word matches:

   * Confetti burst + “Great!” VO (optional `sfx.pop`).
   * Increment `correctCount`.
   * If `correctCount % 3 === 0`: play **Animal Reveal**:

     * Random animal (not same as last) bounces from a closed box, cute 1.0s animation.
5. End of list:

   * Show results: `Correct: N / Total`, time spent, “Play again” and “Choose another game”.

**Rules & Edge Cases**

* After 2 missed letters total (not per position), show full word faintly above input, but still require typing it fully.
* “Hear again” replays the word; “Hear slower” appears after 2 misses.
* Backspace allowed. Non-letters ignored.
* Accepts case-insensitive; trims spaces.

**Success Criteria**

* Unlock animal every 3 corrects.
* No identical animal twice in a row.
* Confetti on each word; big confetti on round end.
* Persist list and settings when navigating away/back.

---

### 9.2 Block Builder

**Goal:** Build a towering stack of letter blocks for each correctly typed word. Crash the tower on repeated mistakes; recover and keep going.

**Flow**

1. Show an empty “base” platform.
2. For the current word:

   * As letters are typed correctly, place lettered blocks on the top (snap animation).
   * On full word, add a **blank spacer block** (thin) to separate words.
3. **Mistake logic**:

   * On wrong letter: buzzer; increment `missesForThisWord`.
   * If `missesForThisWord >= 5`: trigger **Crash**:

     * A random “rogue block” flies in and tips the tower.
     * Physics-based fall (exaggerated, fun).
     * Current word remains the **base** of the new tower (the one being attempted).
     * **Previously completed words** are appended back to the **end** of the pending list (order preserved).
     * Reset `missesForThisWord = 0`.
4. If the player completes all words without crashing:

   * Show “Knock it down!” big button → spectacular fall sequence.

**Extra Fun for the Fall**

* Slow-motion toggle for last 0.8s
* “Pinata confetti” when blocks hit floor
* Camera shake + exaggerated bounce on impact

**Success Criteria**

* Block placement feels snappy; letters readable.
* Crash behaves as spec (base word retained; finished words recycled to the end).
* Optional: show a tiny tower height meter.

---

### 9.3 Basketball

**Goal:** Spell words to score points.

* Correctly typed word = **shot made** (2 points).
* **Streak ≥ 2** enables 3-point shots until a miss.

**Flow**

1. For each word:

   * Type the whole word (not per-letter validation).
   * On **submit** (Enter or tap “Shoot”):

     * If exact match → animate ball arc → swish; `streak++`

       * If `streak >= 2`, award **3 points**; else **2 points**
     * Else → clank off rim; `streak = 0`; show hint ladder options
2. Scoreboard:

   * Points, current streak, words remaining.
3. End:

   * Final score, best streak, accuracy %, play again.

**Rules**

* Input is full-word; live validation optional.
* “Hear again” available before each shot.
* Missed attempts don’t advance the word until correct (to keep it learning-focused).

---

### 9.4 Block Breaker (Design Draft for later)

**Two possible directions:**

1. **Phonics Peggle**: bricks labeled with near-miss distractor letters; the player selects a letter to shoot; must clear the correct letters in order to spell the word.
2. **Reading Match**: pegs show 4 words; audio plays target; player shoots the matching word (good for sight words).

*For MVP, ship a simple placeholder scene with “Coming soon!” and a tiny demo ball bounce to prove the Phaser scene loads.*

---

## 10) Modes Beyond Games (Phaseable)

### Practice

* Immediate per-letter feedback (like Animal Box) but no scoring; just finish list.
* Progress ring around “Hear again.”

### Test

* Dictation: speak word (and/or sentence), no letters shown.
* Player types full word; no hints during attempt.
* Score at the end: % correct; per-word report; export CSV.

### Speed Round

* Timer counts up; finish fastest time.
* Wrong letters penalize by +0.5s (configurable).

*(Ship one mode in MVP if time allows; otherwise plan for Phase 2.)*

---

## 11) Accessibility & Options

* **OpenDyslexic toggle**
* **High contrast** mode
* **SFX toggle**, **Music toggle**
* **Left-hand UI** option (moves replay/submit to left side)
* **Font size** large for iPad (minimum 20–24px in inputs; 44px touch targets)

---

## 12) Visual & Audio

* **Confetti**: simple particle emitter (triangles, circles)
* **Buzzer**: 100ms soft “buzz” (not harsh)
* **Swish/Pop**: short pleasant samples (44.1kHz MP3)
* **Animals**: start with flat sprites (colored blobs + eyes), upgrade later

---

## 13) Routing & State Flow

```
Home → (Save list) → Game Select → Game Page (Phaser scene)
^                                    |
|________ back (persist) ____________|
```

On every navigation:

* Persist current list, settings.
* Restore focused hidden input.

---

## 14) Pseudocode Snippets

**Normalize word list**

```ts
export function parseWords(raw: string): string[] {
  return raw
    .split(/[\n,]/g)
    .map(w => w.trim().toLowerCase())
    .filter(Boolean)
    .filter((w, i, a) => a.indexOf(w) === i);
}
```

**Hint ladder (shared)**

```ts
function applyHintLadder(misses: number, word: string) {
  if (misses === 1) speak(word);
  else if (misses === 2) speak(word, { rate: 0.85 });
  else if (misses === 3) showFirstLetterGhost(word);
}
```

**No-repeat random animal**

```ts
let lastAnimal = '';
export function nextAnimal(): string {
  let pick = ANIMALS[Math.floor(Math.random()*ANIMALS.length)];
  if (pick === lastAnimal) {
    pick = ANIMALS[(ANIMALS.indexOf(pick)+1) % ANIMALS.length];
  }
  lastAnimal = pick;
  return pick;
}
```

**Force iPad keyboard**

```ts
const kb = document.getElementById('kb') as HTMLInputElement;
export function ensureKeyboard() { kb.focus(); }
document.addEventListener('touchstart', ensureKeyboard, { passive: true });
```

---

## 15) Acceptance Criteria (MVP)

### Global

* ✅ Words entered on Home persist across **all** games and page changes.
* ✅ “Copy List” copies normalized, one-per-line words.
* ✅ TTS works on iPad Safari + desktop Chrome/Edge.
* ✅ Hidden input keeps on-screen keyboard available on iPad.

### Animal Box

* ✅ Per-letter validation with light buzzer on wrong letter.
* ✅ After **2 total misses**, show the full word above but still require typing it.
* ✅ Every **3** correct words → animal pops from a box; never same animal twice in a row.
* ✅ End-of-round confetti + “Play another round”.

### Block Builder

* ✅ Correct letters stack blocks; spacer block after each completed word.
* ✅ After **5** wrong letters on current word, tower crashes:

  * Current word becomes base of new tower attempt.
  * Completed words are appended back to end of pending list.
* ✅ “Knock it down!” button shows spectacular fall when all words done.

### Basketball

* ✅ Full-word entry; **2 points** by default, **3 points** during streak ≥2.
* ✅ Miss resets streak; word repeats until correct.
* ✅ Final score + best streak shown.

---

## 16) Dev Notes / How to Run

* `npm create vite@latest ava-spelling -- --template react-ts` (or vanilla-ts if you prefer)
* `npm i phaser` (and tiny libs as needed)
* `npm run dev -- --host` → visit on iPad at `http://<PC-IP>:5173`
* Use local network (same Wi-Fi) so iPad can access dev server.

---

## 17) Future Extensions (nice to have)

* Cursive trace game (canvas overlay; export PNG for parent)
* Sticker book “Habitats” to place unlocked animals
* Word search & handwriting worksheet generator (HTML → Print)
* Teacher share codes (serialize list to URL hash)
* ElevenLabs/Polly TTS engine option

---

## 18) Lightweight Tasks (Tickets)

1. **Core Store & TTS**

   * Parse/save word lists, settings; implement `tts.ts` with Web Speech.
2. **Home Page**

   * Word textarea, Copy, Save, big buttons; normalization; toasts.
3. **Game Shell + Router**

   * GameSelect with 4 cards; GamePage wrapper; back links.
4. **Animal Box**

   * Per-letter validation, hint ladder, animal pop, confetti, results.
5. **Block Builder**

   * Tower stacking, spacer blocks, crash logic, “Knock it down!”.
6. **Basketball**

   * Full-word input, streak/points logic, animations, scoreboard.
7. **iPad Keyboard**

   * Hidden input focus + touchstart handler; integration with games.
8. **SFX**

   * Load buzzer, pop, swish; global toggle.
9. **Polish/QA**

   * Edge cases: duplicates, empty list, long words, punctuation.

---

## 19) QA Checklist

* iPad Safari: keyboard appears and stays available; replay audio works.
* Empty list: buttons disabled with gentle message.
* Very short words (“a”, “I”) behave correctly.
* Long words (>12 chars) wrap/scale; inputs don’t overflow.
* Navigating away and back keeps the list and settings intact.

---
