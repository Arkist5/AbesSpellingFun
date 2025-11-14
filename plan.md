# Abe's Spelling & Math Fun – Development Plan

## 0. High-Level Goals

- Create a clean, kid-friendly, iPad-first web app where the **root home page** simply asks: “Do you want Spelling or Math?”
- Move the existing **Math flashcards game** behind a dedicated “Math home page”.
- Build a **new Spelling area** from scratch (word lists + fun games) and **remove all old spelling games from the UI**.
- Keep the codebase easy for multiple AI agents (Codex, etc.) to work on in parallel (clear sections and tasks).

---

## 1. Table of Contents (Tasks & 1-Sentence Overviews)

1. **Task 1 – New Root Home Page & Navigation Split**  
   Implement a brand-new root home page that looks good on iPad and splits the app into “Spelling home page” and “Math home page” with no direct game links.

2. **Task 2 – Math Home Page & Flashcards Entry**  
   Create a simple Math home page that currently exposes only one big “Flashcards” box/button, wired to the existing math flashcards game.

3. **Task 3 – Spelling Home Page Shell (No Games Yet)**  
   Build a Spelling home page that has no games yet (all old spelling games removed from the UI) and just shows a kid-friendly “Spelling zone” with room for future list management and games.

4. **Task 4 – Visual Design System & Shared UI Components**  
   Define a small design system (colors, typography, spacing, breakpoints) and shared components (BigButton, Card, Layout) so all pages look consistent and iPad-friendly.

5. **Task 5 – Spelling Infrastructure (Word Lists, Storage, TTS Hooks)**  
   Implement the underlying data model and storage for word lists plus hooks for text-to-speech and reliable iPad keyboard behavior (no games yet).

6. **Task 6 – Spelling Game Framework & First New Game**  
   Create a reusable “game shell” (HUD, TTS, scoring hooks) and implement the first new spelling mini-game that feels fun for Ava.

7. **Task 7 – Polish, QA, and Deploy Flow**  
   Add QA passes on iPad/PC, basic automated checks, and a simple deployment pipeline so updates are easy to ship.

---

## 2. Task 1 – New Root Home Page & Navigation Split

> **Goal:** Replace the current landing with a clean, centered “Choose Spelling or Math” screen that works great on iPad, while setting up basic navigation to `Spelling home page` and `Math home page`.

This task is mostly **HTML/CSS/React (or UI framework) + simple navigation state**. No game logic changes yet beyond removing old game links from the home page.

### 2.1. Task 1 – Implementation Steps for Codex

> Assumption: The project uses Vite + TypeScript and some sort of main UI entry (e.g., `src/main.tsx` and one or more “page” components, as implied by the README). If exact filenames differ, adapt these steps to the actual structure.

---

### Step 1: Locate the current root UI entry and home page

1. Search in the repo for the main entry:
   - Look for `src/main.tsx` or `src/main.ts` (Vite default).
   - Confirm which element in `index.html` is the mounting point (e.g. `<div id="app"></div>`).

2. Search for the current “home” UI:
   - Look for files like:
     - `src/pages/HomePage.tsx`
     - `src/ui/Home.tsx`
     - or any component clearly responsible for the initial landing screen.
   - Identify where the current home layout is rendered from the entry component (e.g. `App`, `HomePage`, etc.).

3. Document in comments (in the main entry file) where the root home page is rendered so future agents know:
   ```ts
   // NOTE: Root home page (Spelling vs Math) is rendered from <RootHomePage /> below.
   ```

---

### Step 2: Define the “screen” model for navigation

We need three conceptual screens:

- `RootHome` – the new, pretty “Spelling or Math?” page.
- `SpellingHome` – spelling area entry (will be fleshed out in Task 3).
- `MathHome` – math area entry (will be fleshed out in Task 2).

1. In the main UI entry (or top-level `App` component), introduce a simple navigation state:
   - If using React:

     ```ts
     type Screen = 'rootHome' | 'spellingHome' | 'mathHome';

     const App = () => {
       const [screen, setScreen] = useState<Screen>('rootHome');

       const goToRoot = () => setScreen('rootHome');
       const goToSpellingHome = () => setScreen('spellingHome');
       const goToMathHome = () => setScreen('mathHome');

       return (
         <>
           {/* Optional top bar can be added later */}
           {screen === 'rootHome' && (
             <RootHomePage
               onChooseSpelling={goToSpellingHome}
               onChooseMath={goToMathHome}
             />
           )}
           {screen === 'spellingHome' && (
             <SpellingHomePage onBack={goToRoot} />
           )}
           {screen === 'mathHome' && <MathHomePage onBack={goToRoot} />}
         </>
       );
     };
     ```

   - If the app already uses a custom router module (e.g., `router.ts`), add routes for:
     - `/` → `RootHomePage`
     - `/spelling` → `SpellingHomePage`
     - `/math` → `MathHomePage`
     and wire navigation callbacks to update the route instead of local state.

2. Create stub components for `SpellingHomePage` and `MathHomePage` if they do not exist yet:
   - For now, they can just render:
     - A simple “Back to Main Menu” button.
     - A heading “Spelling Home (stub)” or “Math Home (stub)”.
   - These will be fully implemented in Task 2 and Task 3.

---

### Step 3: Implement the new Root Home Page layout (structure)

We want a simple, centered “two big tiles” layout that works especially well on iPad in portrait.

1. Create a new component, e.g. `src/pages/RootHomePage.tsx`:
   - Props:
     - `onChooseSpelling: () => void`
     - `onChooseMath: () => void`

2. Basic JSX structure (adapt if not using React, but keep semantics similar):

   ```tsx
   export function RootHomePage(props: {
     onChooseSpelling: () => void;
     onChooseMath: () => void;
   }) {
     return (
       <main className="root-home">
         <header className="root-home__header">
           <h1>Abe's Spelling & Math Fun</h1>
           <p>What do you want to play today?</p>
         </header>

         <section className="root-home__choices">
           <button
             className="root-home__tile root-home__tile--spelling"
             onClick={props.onChooseSpelling}
           >
             <div className="root-home__tile-label">Spelling</div>
             <div className="root-home__tile-subtitle">Words, sounds, and games</div>
           </button>

           <button
             className="root-home__tile root-home__tile--math"
             onClick={props.onChooseMath}
           >
             <div className="root-home__tile-label">Math</div>
             <div className="root-home__tile-subtitle">Numbers and flashcards</div>
           </button>
         </section>
       </main>
     );
   }
   ```

3. Accessibility:
   - Use `<button>` elements (not plain `<div>`s) so tapping/enter/space works correctly.
   - Ensure there is a single `<main>` landmark and a `<header>` inside it.

4. Hook this new `RootHomePage` into the top-level `App` / entry, replacing any old “game selection” or “word input” UI that is currently on the root.

---

### Step 4: Style the Root Home Page for iPad-first layout

We want the page to look clean and “finished” before moving on to game work.

1. Add or update a CSS/SCSS file for global styles, e.g.:
   - `src/styles/root-home.css`  
   - or extend your existing global stylesheet.

2. Suggested styling behavior (Codex should translate into concrete CSS):

   - Body & Root:
     - Full-viewport fit:
       - `min-height: 100vh;`
       - Flex center or grid center for main container.
     - Soft background gradient (example):
       - From a light blue to soft purple.
     - Use system UI font stack:
       - `font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`

   - Layout:
     - `.root-home`:
       - Max width around `900px`.
       - Centered with `margin: 0 auto; padding: 24px;`.
       - Use `display: flex; flex-direction: column; gap: 24px;`.
     - `.root-home__header`:
       - Center text.
       - Large `h1` (around 2.25rem on iPad), with a fun but readable feel.
       - Short subtitle under it.

   - Choice Tiles / Buttons:
     - `.root-home__choices`:
       - For mobile/iPad portrait: a column of tiles (`flex-direction: column; gap: 16px;`).
       - For wider screens (`min-width: 900px`): switch to row layout (`flex-direction: row;`) with equal width tiles.
     - `.root-home__tile`:
       - Big touch targets:
         - Min height ≈ `160–200px` on iPad;
         - `border-radius` ≈ `20–32px`.
       - `display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px;`.
       - Remove default border, add `box-shadow` and smooth hover/active transitions.
       - Increase `font-size` for `.root-home__tile-label` (≈ 1.5rem) and a smaller subtitle.

   - Color theming:
     - `.root-home__tile--spelling`:
       - Background: soft lavender / purple pastel.
     - `.root-home__tile--math`:
       - Background: soft teal / green pastel.
     - Both should have good contrast for text (dark text, not white on light pastel).

3. Add a simple focus outline for keyboard users:
   - Ensure `.root-home__tile:focus-visible` has a clear outline (e.g., 3px darker border or outline).

4. Make sure the layout works in:
   - iPad portrait (most important).
   - iPad landscape.
   - A desktop browser window (tiles side-by-side on wide screens).

---

### Step 5: Remove old spelling game links from the root home page

> The goal here is no spelling games exposed from the root; Ava must always pick “Spelling” first, and even that will show zero games until we build them later.

1. Search for any buttons/links on the existing landing/home that directly start specific spelling games:
   - Names mentioned in the README (for reference): `Animal Box`, `Block Builder`, `Basketball`, `Block Breaker`, etc.
   - Remove or comment out those UI elements so they no longer appear on the root page.

2. If there is a “Games” screen that is currently the default landing:
   - Change the default landing to the new `RootHomePage`.
   - Ensure there is no auto-redirect from the root into any specific spelling game.

3. Do not delete the underlying game code yet:
   - Only remove the entry points from the UI.
   - Leave a short comment near any removed links indicating:
     ```ts
     // NOTE: Old spelling game entry removed from UI in favor of new RootHomePage (Task 1).
     //       The game code is still here for now; it may be reused or replaced in Task 6.
     ```

---

### Step 6: Basic QA for Task 1

1. Run the dev server (e.g. `npm run dev` / `pnpm dev`) and verify:
   - The app loads directly into the new Root Home Page.
   - Only two big options are visible: Spelling and Math.
   - Clicking/tapping each option:
     - Navigates to the Spelling home stub or Math home stub respectively.
   - Each stub has a clear way to go back to the root (e.g., “← Back to Main Menu”).

2. Test on:
   - Desktop browser.
   - iPad (if possible) via local network:
     - Check touch targets are large enough and easy to tap.
     - Rotate the iPad to landscape and confirm the layout still looks reasonable.

3. Once confirmed, commit with a clear message, e.g.:
   - `feat: add new root home page and split navigation into spelling/math`

---

## 2.2. Outputs of Task 1

By the end of Task 1, we should have:

- A new, pretty, iPad-first root home page with just two big options: Spelling and Math.
- A simple navigation mechanism (state or router) that supports:
  - Root Home → Spelling Home (stub)
  - Root Home → Math Home (stub)
- All old spelling game start buttons removed from the landing page, so they’re effectively “gone” from Ava’s view until we rebuild them.


---

## 3. Task 2 – Math Home Page & Flashcards Entry

> **Goal:** Create a simple, iPad-friendly Math home page that currently shows exactly one big option — “Flashcards” — and routes into the existing math flashcards game, while wiring navigation cleanly from the new Root Home Page (Task 1).

This task is about making the **Math side** feel like a real area of the app, even though it only has one game for now.

### 3.1. Task 2 – Implementation Steps for Codex

> Assumption: The math flashcards game already exists somewhere in `/src` (possibly as a page, route, or component). Adapt file names to the actual code.

---

### Step 1: Locate the existing Math flashcards implementation

1. Search the repo for likely names:
   - Keywords: `flashcard`, `Flashcards`, `MathFlashcards`, `mathFlashcards`, `math-flashcards`, `FlashcardsPage`, etc.
   - Also check under:
     - `/src/pages`
     - `/src/ui`
     - `/src/games`
   - Identify:
     - The **main component** that renders the flashcards UI.
     - The **current way it is started** (e.g., router path, button, or direct render).

2. Once found, add a short comment near the main flashcards component definition documenting its role, e.g.:

   ```ts
   // NOTE: This component is the main Math Flashcards game.
   // It is launched from MathHomePage (Task 2) and should remain math-only.
   ```

3. If there are multiple variants:
   - Prefer the one that is currently wired up and working in the live UI.
   - If unclear, pick the simplest one and leave a comment for future refactors.

---

### Step 2: Define the MathHomePage component (structure & props)

We want a **dedicated “Math home page”** that can be reached from the Root Home Page.

1. Create a new page component if one does not already exist, e.g. `src/pages/MathHomePage.tsx`:
   - Props:
     - `onBack: () => void` — navigates back to the Root Home Page.
     - `onStartFlashcards: () => void` — starts the math flashcards game.

2. Basic JSX structure (adapt to project style):

   ```tsx
   export function MathHomePage(props: {
     onBack: () => void;
     onStartFlashcards: () => void;
   }) {
     return (
       <main className="math-home">
         <header className="math-home__header">
           <button
             type="button"
             className="math-home__back"
             onClick={props.onBack}
           >
             ← Main Menu
           </button>
           <h1 className="math-home__title">Math Fun</h1>
           <p className="math-home__subtitle">
             Practice your math facts with flashcards.
           </p>
         </header>

         <section className="math-home__content">
           <button
             type="button"
             className="math-home__tile math-home__tile--flashcards"
             onClick={props.onStartFlashcards}
           >
             <div className="math-home__tile-label">Flashcards</div>
             <div className="math-home__tile-subtitle">
               Quick practice for addition, subtraction, and more.
             </div>
           </button>
         </section>
       </main>
     );
   }
   ```

3. If the project already uses shared layout components (e.g. `Layout`, `Card`, `BigButton` in `/src/ui/Components.tsx`):
   - Prefer to build the MathHomePage using those components instead of raw HTML elements.
   - For example, wrap content in `<Layout>` or use a `<BigButton>` component for the tile body.

---

### Step 3: Wire MathHomePage into the navigation (App/router)

We need the navigation from Task 1 to actually show this Math home page.

1. In the same place where Task 1 introduced the `screen` state (or the router routes):
   - Ensure the `mathHome` case renders the new `MathHomePage` component.
   - Example with screen state (from Task 1):

     ```ts
     type Screen = 'rootHome' | 'spellingHome' | 'mathHome' | 'mathFlashcards';

     const App = () => {
       const [screen, setScreen] = useState<Screen>('rootHome');

       const goToRoot = () => setScreen('rootHome');
       const goToSpellingHome = () => setScreen('spellingHome');
       const goToMathHome = () => setScreen('mathHome');
       const goToMathFlashcards = () => setScreen('mathFlashcards');

       return (
         <>
           {screen === 'rootHome' && (
             <RootHomePage
               onChooseSpelling={goToSpellingHome}
               onChooseMath={goToMathHome}
             />
           )}

           {screen === 'mathHome' && (
             <MathHomePage
               onBack={goToRoot}
               onStartFlashcards={goToMathFlashcards}
             />
           )}

           {/* SpellingHomePage and other screens omitted for brevity */}
         </>
       );
     };
     ```

2. If using a router (e.g. a custom `router.ts` or a library):
   - Add a route for `/math` that renders `MathHomePage`.
   - Add a route for `/math/flashcards` (see Step 4 below) that renders the flashcards game.
   - Update the Root Home Page math option to navigate to `/math`.

3. Make sure the **only** navigation from Root to Math is via this `MathHomePage` (no direct “Flashcards” link from Root).

---

### Step 4: Wire the Flashcards tile to the existing math flashcards game

We want the Flashcards tile on MathHomePage to start the existing game cleanly.

1. Decide on how to represent the flashcards game in navigation:

   - Option A – Screen state:
     - Add a `screen === 'mathFlashcards'` case in the main App component.
     - In that case, render the Math flashcards component.
   - Option B – Router path:
     - Add a `/math/flashcards` path that renders the math flashcards game.

2. Implement the `onStartFlashcards` callback for MathHomePage accordingly:

   - For **screen state**:
     ```ts
     const goToMathFlashcards = () => setScreen('mathFlashcards');
     ```
   - For **router path**:
     ```ts
     const goToMathFlashcards = () => router.navigate('/math/flashcards');
     ```

3. In the math flashcards component/page:
   - Ensure it does not assume it is the “root” page anymore.
   - If needed, wrap it in a dedicated page component, e.g. `MathFlashcardsPage`, that can show a header and back button (see Step 5).

4. If there are any **previous buttons or links** that started the flashcards game directly from other places (e.g. root, old menus):
   - Remove or comment them out so the canonical entry point is now **MathHomePage → Flashcards**.
   - Leave a short comment indicating they were superseded by Task 2.

---

### Step 5: Add a clear “Back to Math Home” path from the flashcards game

We need Ava to be able to leave flashcards and return to the Math home page easily.

1. Wrap the existing flashcards game in a simple page/container that includes:

   - A back button at the top:
     ```tsx
     export function MathFlashcardsPage(props: { onBackToMath: () => void }) {
       return (
         <main className="math-flashcards-page">
           <header className="math-flashcards-page__header">
             <button
               type="button"
               className="math-flashcards-page__back"
               onClick={props.onBackToMath}
             >
               ← Math Home
             </button>
             <h1>Math Flashcards</h1>
           </header>

           <section className="math-flashcards-page__content">
             <MathFlashcardsGame /> {/* existing game component */}
           </section>
         </main>
       );
     }
     ```

2. Wire the `onBackToMath` callback to navigation:

   - For screen state:
     ```ts
     {screen === 'mathFlashcards' && (
       <MathFlashcardsPage onBackToMath={goToMathHome} />
     )}
     ```
   - For router:
     - Use the router’s navigation API to go back to `/math`.

3. If the flashcards game already has its own navigation bar or title:
   - Either:
     - Integrate the back button into the existing top bar, or
     - Replace the existing title bar with the new header, keeping the game unchanged.

4. Confirm that the flashcards game **does not show any spelling-related nav**; it should feel like a pure math experience.

---

### Step 6: Style the Math Home page (iPad-first)

We want MathHomePage to visually align with the RootHomePage while having its own personality.

1. Add CSS/SCSS for the math home page, e.g. `src/styles/math-home.css` or reuse an existing stylesheet:

   - `.math-home`:
     - Similar base layout to `.root-home`: centered content, max width ≈ 900px, `margin: 0 auto; padding: 24px;`.
     - Flex column, with gap between header and the main tile section.

   - `.math-home__header`:
     - Align back button to the left, title centered or left-aligned below.
     - Make the title large (≈ 2rem) and friendly.

   - `.math-home__back`:
     - Touch-friendly button, minimum height ≈ 44–48px.
     - Low visual weight (e.g., ghost button style) so the main tile is still the focus.

   - `.math-home__content`:
     - Centered layout for the Flashcards tile.
     - On wider screens, keep the tile relatively constrained so it doesn’t stretch too wide.

   - `.math-home__tile`:
     - Very similar styling to `.root-home__tile`:
       - Large clickable area, rounded corners, drop shadow, smooth hover/active states.
       - Column layout with label + subtitle.
     - `.math-home__tile--flashcards`:
       - Consider a math-themed accent color (teal/green) consistent with RootHome’s math tile.

2. Ensure:
   - It looks good and readable on:
     - iPad portrait (primary target).
     - iPad landscape.
     - Desktop browser.

3. Optionally, apply subtle visual hinting:
   - For example, add small decorative elements (numbers or symbols) in CSS pseudo-elements or background.

---

### Step 7: Basic QA for Task 2

1. Run the dev server and verify the full flow:

   - App loads → Root Home Page.
   - Tap **Math** → Math Home Page appears with:
     - Back button to Main Menu.
     - Single “Flashcards” tile.
   - Tap **Flashcards** → Math flashcards game starts.
   - Tap the back button in the flashcards header → returns to Math Home Page.
   - Tap Main Menu back button → returns to Root Home Page.

2. Confirm that:
   - There are no remaining direct links to the flashcards game from the Root Home or old menus.
   - There are no dead routes or console errors related to removed links.

3. Test on iPad (if possible) and desktop:
   - Ensure tapping works smoothly with touch.
   - Ensure layout doesn’t break in landscape.

4. Once confirmed, commit with a clear message, e.g.:
   - `feat: add math home page and wire flashcards entry`

---

### 3.2. Outputs of Task 2

By the end of Task 2, we should have:

- A **Math Home Page** reachable from the Root Home Page, with a clear “Flashcards” tile and a back-to-main-menu button.
- A navigation path that cleanly routes **Math Home → Math Flashcards → Math Home**, with no “mystery” entry points.
- All math content feels separated from spelling content, setting the stage for adding more math games later under the same Math home page.
