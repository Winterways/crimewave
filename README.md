# Koprulu Idle

A browser idle RPG set in the StarCraft universe, inspired by Azeroth Idle's "MMORPG that plays itself": you create one
hero, set policies, and the hero keeps questing, grinding and levelling while you watch or while you're away. Personal,
non-commercial fan project (StarCraft is Blizzard's IP).

## Play in a browser

Open `index.html`. That's the whole game: one file, no server, saves in the browser's local storage (with export/import
codes in the Codex). Up to three heroes per browser; click the hero's name at the top to switch. `game.html` is the source; `node build.js` regenerates `index.html` and `dist/index.html`.

## What is in the game

- Three races and nine classes, each with its own abilities, talents and research building; eight zones from Mar Sara
  to the Void, each with quests, a boss and a storyline told by that race's own quest givers.
- An autopilot driven by policies (Autopilot tab) that fights, rests, flees, equips, researches, crafts, mines, runs
  dungeons after rehearsing them, challenges bosses on a safety margin, advances zones and can ascend. Per-zone plans on
  the Map tab hold it in a zone or add mining there.
- Dungeons and raids with seven companions from the lore, each with a signature ability, and a forecast of your odds
  before you enter.
- Every boss, in the field or in an instance, has a telegraphed signature move that a shield or dodge can answer.
- Professions (mining, salvaging, crafting, kits, stims, reforging), item affixes, rotating contracts, ten world
  events, bounty elites, kill streaks, ranks, feats, a daily check-in with a streak, and ascension into harder cycles
  with permanent perks.
- Up to three heroes per browser, offline catch-up of up to eight hours, a Codex with a bestiary and your record, a
  guided tour on the first deploy (replayable from the Codex), an autopilot plan card and level forecasts, a dated
  Chronicle of milestones, titles earned from feats, zone hazards and companion bond traits, first-hour tip strip, synthesized sound effects and a per-zone ambience bed, all drawn and synthesized in code.

## Desktop client (Windows, macOS, Linux)

`src-tauri/` wraps the same `dist/index.html` in a [Tauri 2](https://v2.tauri.app) window: a small native shell around
the operating system's web view (WebView2 on Windows). You get an installer, a Start-menu entry, your own window and
icon, and the save lives in that app's web view instead of the browser's storage. It runs the same JavaScript as the
browser, so it is not inherently faster; the gain is a dedicated window that is never throttled as a background tab
and no browser UI.

### Build on Windows

1. Install the prerequisites once:
   - [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the
     "Desktop development with C++" workload.
   - [Rust](https://www.rust-lang.org/tools/install) (`rustup-init.exe`, defaults are fine). Open a new terminal afterwards.
   - [Node.js](https://nodejs.org) LTS.
   - WebView2 is already part of Windows 10/11; the installer fetches it if it is missing.
2. In the repository folder:
   ```
   npm install
   npm run desktop:dev
   ```
   `desktop:dev` opens the game in a native window straight away (first run compiles Tauri, a few minutes).
3. To produce installers:
   ```
   npm run desktop:build
   ```
   Output lands in `src-tauri\target\release\bundle\`: `nsis\Koprulu Idle_0.1.0_x64-setup.exe` (recommended) and
   `msi\Koprulu Idle_0.1.0_x64_en-US.msi`. The bare executable is `src-tauri\target\release\koprulu-idle.exe`.

### Build on macOS or Linux

Same commands. macOS needs Xcode command line tools (`xcode-select --install`); Linux needs the WebKitGTK packages listed
in the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/). Bundles come out as `.dmg` / `.app` and
`.AppImage` / `.deb`.

### Where the save is

The desktop app keeps its own local storage, separate from any browser. To move a hero between browser and desktop,
use **Export save** in one and **Import** in the other (Codex tab, Save data card). On Windows the data lives under
`%LOCALAPPDATA%\com.winterways.kopruluidle\`.

### Updating the icon

`src-tauri/icons/` was generated from a 1024×1024 PNG with `npx tauri icon path/to/icon.png`. Replace it the same way.

## Repository layout

- `game.html`: the game (HTML, CSS and JavaScript in one file; no dependencies besides Google Fonts).
- `build.js` / `build.sh`: wrap `game.html` into `index.html` and `dist/index.html`.
- `src-tauri/`: the desktop shell (Rust, Tauri 2).
- `DESIGN.md`: design notes, systems, balance and what's not done yet.
