# Koprulu Idle: design note

A browser idle RPG set in the StarCraft universe, inspired by Azeroth Idle's "MMORPG that plays itself":
you create one hero, set **policies**, and the hero keeps questing, grinding and levelling while you
watch or while you're away. Personal, non-commercial fan project (StarCraft is Blizzard's IP).

## Files
- `game.html`: the game as an artifact page (no doctype; the source of truth).
- `index.html`: standalone copy for opening locally or hosting anywhere. Rebuild with `node build.js` (or `sh build.sh`).
- No build step for the game itself, no dependencies besides Google Fonts. Saves to `localStorage`, with export/import codes.
- `src-tauri/`: a Tauri 2 desktop shell around `dist/index.html` (Windows installer via NSIS/MSI, also macOS and Linux).
  Build steps are in `README.md`. It runs the same JavaScript in the system web view, so it is not faster by itself; the
  point is a dedicated window that is never throttled as a background tab. Austin asked about the Azeroth Idle client:
  that one is a Rust/Bevy app, which is a different architecture (native rendering), not a wrapped web page.

## Core loop
1. Pick race (Terran / Protoss / Zerg) and one of 3 classes each (9 total), each with 3 abilities.
2. Hero auto-attacks; abilities cost Energy / Psi / Biomass and have cooldowns.
3. 8 zones from Mar Sara (1–5) to The Void (35–40). Each has 3 kill quests from a lore character,
   then a boss (Duke, Zasz, the Overmind, Ulrezaj, Mengsk, Maar, Amon...). Beating it opens the next zone.
4. Loot in 5 slots and 5 rarities, minerals and gas. Gas plus minerals buy permanent research
   (Weapons, Armor, Logistics, Salvage). One talent point per level, 5 talents.
5. Beating Amon unlocks **Ascension**: reset for Xel'Naga essence (+4% stats/xp each). Research carries over.

## Storylines per race
Kill targets and counts are shared for balance, but each race hears the campaign from its own side (`STORY` in
`game.html`, overlaid on the zone data): Terrans follow Raynor, Kerrigan, Zeratul, Tassadar, Raszagal, Valerian and
Artanis; Protoss follow Tassadar (then "the Heretic"), Fenix, Zeratul, Raszagal and Artanis; Zerg serve the Overmind
and Cerebrate Daggoth, then Kerrigan's rebellion, with Zagara at Ulnar. Two boss lines change for the Zerg (Zasz and
Mengsk). Quest titles, briefs, the arrival greeting and the decisions feed all use the race's version.

## Dungeons, raids and companions
- 7 companions join as you beat zone bosses: Raynor, Kerrigan, Zeratul (damage), Tassadar, Morales (healers),
  Fenix, Dehaka (tanks). Party = hero + 2. Tanks draw 85% of attacks, healers heal the lowest member.
- 6 dungeons (3 encounters + boss) and 2 raids (4 + boss, need 2 companions), one per zone, unlocked by its boss.
  Dying ends the run. Lockouts: 20 min (dungeons) and 2 h (raids) of play time.
- Rewards: extra loot (rare+ from dungeon bosses, epic+ from raid bosses) and Valor, spent on companion bonds
  (+10% companion power per rank, max 10). Bonds carry over through ascension.

Each companion has a signature ability that fires on its own every 14–20 s of instance combat (`SIGNATURES`): Raynor's
Suppressing Fire (burst plus a 1 s stun), Kerrigan's Psionic Lash (7 s of her damage), Zeratul's Shadow Ambush (burst plus
3 s of hero dodge), Tassadar's Khala's Embrace (party heal 15%), Fenix's Dragoon Shell (6 s taunt plus a self repair),
Morales' Stim Dispenser (heal the lowest ally 30%, 15 hero energy) and Dehaka's Devour Essence (bite plus regrowth).
Damage is expressed in seconds of the companion's dps and heals as fractions of max health, so bonds, essence and
Bloodline scale them. Headless trials of the Aiur raid with a tank and healer: clearable from level 17 with signatures,
level 20 without; higher dungeons were already cleared at both settings. The autopilot rehearses before entering, so the
practical effect is that it takes parties in two to three levels earlier. Each use floats the ability name over the
companion in the scene; the Dungeons tab and Codex list the signatures.

The Dungeons tab forecasts each open instance within eight levels of the hero: "Rehearsal: cleared 4 of 5 with Fenix and
Tassadar", from the same five rehearsals the autopilot uses before entering (it goes in at four), so a manual player sees the same odds the
autopilot acts on. Forecasts are computed one at a time off the render path (`forecastPump`) and cached per dungeon,
party, level and power, so the tab never stalls; a party of two damage dealers gets a warning that it rarely survives.

## Ability choice
Each class has 6 abilities: 3 from the start, then one each at levels 10, 20 and 30. Three can be slotted
(keys 1-3 fire the slots). Slotting one yourself switches off the autopilot's ability picking.

## Race passives
Terran +15% minerals · Protoss regenerating plasma shield (25% hp) · Zerg 1.5% hp/s regeneration.

## Autopilot (the "plays itself" part)
A master switch plus individual policies: keep fighting, use abilities, rest thresholds, equip upgrades,
auto-sell rarity, spend talents, research, buy supply crates, challenge bosses at a safety margin,
advance zones, fall back after 3 deaths in 5 min, auto-ascend, pick abilities, run dungeons and raids.
Before entering an instance the autopilot rehearses it 3 times on a copy of your hero and goes in only if
it clears at least 2. Every non-trivial choice is written to the
**Autopilot decisions** feed with its reason (e.g. "+2.3% power", "margin 1.12x, need 1.3x").
Gear, talents and research are chosen by a single `power()` estimate (DPS × √effective HP).

Manual mode = autopilot off: you click Engage, fire abilities (buttons or keys 1–3), Rest, challenge
bosses, equip and spend yourself. The hero still auto-attacks.

Zone plans (Map tab, `S.plan[zone]`) are the per-zone schedule from Azeroth Idle's policy list in its simplest form:
"hold here until level N" keeps the advance rule from leaving a cleared zone, and a mining share (light about 10%,
heavy about 25% of the time there, measured over four simulated hours) adds planned mining trips of 40 or 90 s on a
150 s cooldown on top of the need-driven mining. Plans are per hero, validated on load, and shown as a note on the
current zone's card while a hold is active.

## First-hour tips

A single tip strip under the header shows one tip at a time, each once a condition is met (first kill, first drop, level 2, 2.5 minutes played, boss open, 10 minutes played, level 6) and each dismissed by hand with "Got it". Dismissals live in `S.tips`, so they survive reloads and travel with the hero when it is parked. A save with more than an hour of total play and no `tips` field is treated as a veteran's and skips the tour. The strip is a `role="status"` element, never a modal, so it never blocks play.

## Roster
Up to three heroes per browser. Click the hero's name in the header (or Roster in the Codex) to switch, add or delete.
The active hero is saved at the usual key; parked heroes sit at `koprulu-idle-v1-hero-<id>` and do not simulate until you
switch back, when they catch up like any absence (8-hour cap) and show the away summary. "New hero" parks the current one
first, so nothing is erased without a confirmed Delete.

## Offline / background
On load (or when a backgrounded tab returns) the game simulates the elapsed time, capped at 8 hours,
with the current policies, then shows a "While you were away" summary.

## Robustness
- Saves carry a version, are validated and clamped on load (bad numbers, broken items, unknown modes), and a rolling
  backup copy is written every minute and used if the main save fails to parse.
- An error inside one simulation step is logged and the current fight dropped instead of freezing the loop.
- A saved foe missing its numbers or `dots` array is discarded on load (it used to crash the renderer every frame); zones
  you have earned by beating bosses stay open even if the save lost its `unlocked` counter, and the current zone is
  clamped to what is unlocked.
- Offline catch-up uses 1-second steps past the first hour; an 8-hour return simulates in about a second.
- The autopilot gets a decision tick right after rests and kills, and rests up to 92% before a boss or instance it
  wants to take on. Before this, heroes without self-healing could sit at 50-90% health forever and never meet the
  "90% health" condition to challenge a boss (the Zealot never reached Amon in 10 h of simulation; now 5.4 h).

## Balance
Foes are tuned against a reference hero of the same level, so an even fight is ~7s and costs ~25%
health before abilities. The first levels are deliberately softer: enemies below level 8 have 72–100% of their
nominal stats (it was 78–100% below level 5, which still left squishy classes dying two or three times in the first
ten minutes to a level-5 Outlaw Raider; now it is under one death in the first 90 minutes for most classes), enemies never roll a level above the hero's before level 6, the flee
rule can fire every 40 s instead of once a minute, the xp curve ramps from 28% of its full value at level 1 to 100% at level 12, and the second and
sixth kills always drop an item. A new hero now reaches level 2 in 30–60 s, level 5 in 4–10 min and the first boss
in 10–28 min (it was 3–4 min to level 2 and 25–40 min to the first boss); the time to Amon is unchanged. Headless sims of all 9 classes on full autopilot reach Amon in roughly
4–7 hours of play time (see Feel below), with tankier/faster classes at the quick end. Dungeons usually open up around
hour 1–2, once a tank or healer companion has joined.

## Professions
Three skills per hero, levelled by use (max 50), with race-flavoured names:
- **Mining** (Terran) / Khaydarin Harvesting / Creep Harvesting: a mode instead of fighting. Minerals per second scale
  with zone and skill, plus Crystal Shards. The autopilot mines when gas is banked but minerals block research, or
  when crafting is short of shards (policy "Mine when short"). Manual: the Mine button.
- **Salvaging** / Reclamation / Consumption: every sale also yields Scrap (more with skill); epic+ items may give a Core.
  Bosses drop Cores. The auto-sell rule now also clears non-upgrades below legendary once the bag is near full.
- **Engineering** / Forging / Evolution: craft a level+1 item for a chosen slot from Scrap + Shards (+ a Core at the
  Epic tier). Guaranteed quality rises with skill: Uncommon, Rare at 15, Epic at 30, legendary chance at 45. The
  autopilot crafts for the weakest slot when it is likely an upgrade or scrap is piling up. Crafting yourself turns
  the autopilot's crafting off. Combat Stim (shards): +15% damage and health for 10 min; the autopilot pops one
  before zone bosses and raids. Skills and materials carry over through ascension.

Kits (`Medkit`, `Khaydarin Salve`, `Regenerative Biomass` by race) are the one consumable from Azeroth Idle's policy
list: a mid-fight heal of 40% max health usable against bosses and inside instances, once every 45 s, capped at five.
They are crafted from scrap and shards (the autopilot makes one from spare materials when carrying fewer than two),
always left by instance bosses and sometimes by bounty elites. The autopilot uses one under 30% health when fleeing is
not an option (boss, instance, flee on cooldown or disabled); in an ordinary fight it still prefers to flee. A Kit
button and the K key cover manual play; the Crafting tab has the card.

## Reference material from Austin
- `benilla-re` and `wowdecomp` (SatyPardus) are reverse-engineering projects for the WoW 1.12 and 3.3.5a clients.
- The Azeroth Idle Windows client he uploaded is a Rust app built on benilla with Bevy UI. Its strings list the
  policy families it offers: combat, retreat (flee at %, avoid packs), activities per zone, quests (escort/group/item),
  gathering on the way, bag (sell quality threshold), talents, consumables, crafting, professions, utility (aoe,
  dispel, interrupt), class-specific, inn/rested, offline cap. Details in `/mnt/project-files/.notes/inputs.md`.
  Good checklist for where our autopilot could grow (per-zone activity schedules, consumables, retreat rules).

## Graphics and sound
All drawn in code, no asset files. A canvas battle scene above the fight panel: a parallax-free painted backdrop per
zone (dungeons add a tunnel vignette), original vector sprites for every hero class, companion and enemy family
(~22 sprite kinds, recoloured per faction), shots, hits, floating damage numbers, ability auras, death bursts,
level-up fireworks and screen shake on big hits. Inline SVG icons mark gear slots and ability types.
Sound effects are synthesized with Web Audio (noise bursts and oscillators): weapon fire per class, hits, kills,
abilities, heals, loot, level-ups and quest turn-ins. Sound starts after the first click and can be toggled at the
top; the choice is remembered. Offline catch-up and the autopilot's rehearsals never trigger effects.
Each zone also has a looping ambience bed, synthesized from two or three detuned drones and a filtered noise layer
whose filter breathes on a slow LFO: wind on Mar Sara, a city hum on Tarsonis, a volcanic rumble on Char, a bright
chord on Aiur, a beating dissonance in the Void. The bed crossfades when the hero changes zone, goes silent while the
tab is hidden or sound is off, and has its own "Ambience" toggle next to the sound button, also remembered.

## Feel: the reward loop
Austin asked for leveling to feel powerful and for the game to keep pulling you back. What that pass added:
- **Level-up**: a full-screen flash and banner on the scene with the actual stat deltas (+damage, +health, +1 talent
  point), energy refilled, and a 20 s **Surge** (+30% damage and attack speed, gold particles) so the next fights are
  visibly easier, not just a number ticking over. The XP bar glows past 85%.
- **Ranks**: a title every 5 levels per race (Recruit → General, Initiate → Hierarch, Larva → Swarm Prime) shown under the
  hero's name; a promotion banner and a free rare+ supply crate.
- **Kill streaks**: +1% xp and minerals per kill in a row (cap +30%), shown next to the mode line from 3 kills. Resting,
  dying, travelling or mining ends it; milestones at 10/20/30 get a banner.
- **Bounty targets**: every 8–15 minutes of play an elite version of a zone enemy appears (2.2× hp, 1.25× damage, marked
  with a gold chevron): triple xp and minerals, bonus gas and a guaranteed rare+ drop.
- **Feats**: 26 milestones (kills, levels, bosses, instances, streaks, bounties, crafting, mining, bonds, ascension) with
  Valor rewards and supply crates for the big ones; a Feats tab and unlock banners. Feats carry through ascension.
- **Boss moments**: challenging a zone boss drops a red banner with its name and title and swells the zone ambience
  (louder bed with a 1.8 Hz pulse until the fight ends); the kill puts "MAR SARA CLEARED · Tarsonis is open" at the
  front of the banner queue ahead of the level-ups and feats it triggers; Amon gets its own banner, and instance clears
  a smaller blue one with the Valor earned.
- **Loot cards**: rare+ drops and any upgrade slide in at the bottom-left with the item line and "+x% power, equipping"; On phone widths the card stack is capped at two cards, narrower and shorter-lived, so it never covers the scene.
  the gear slot flashes when something new goes in and the Power stat pulses when it rises.
- New synthesized sounds for promotion, feats, streak milestones and bounty sightings; the level-up fanfare is longer.
- Balance: the streak and bounty bonuses speed a full-autopilot run up by roughly 15–20% (Amon now falls in ~4–7 h
  across the nine classes instead of 5–9 h), which felt like the right trade for the pacing.

## Goals: contracts and ascension perks
- **Contracts** (Quests tab): three rotating short goals drawn from ten kinds (destroy N enemies in this zone, hunt a
  specific enemy, defeat a boss, clear an instance, reach a streak, mine minerals, bring down a bounty, find rare items,
  earn xp, craft). Targets scale with level; rewards are minerals, gas, Valor, shards or a crate, plus 8% of a level in xp.
  A finished slot refills after 8 minutes of play (the first three arrive at once), so there is always a "next contract
  in 6m" to come back to. One free skip every 10 minutes; the autopilot drops a contract that has made no progress for
  20 minutes and will go mining for a mining contract once it has been open 5 minutes.
- **Ascension perks** (Build tab): one point per ascension, permanent. Head Start (begin at level 5/10/15), Deep Pockets
  (+20% minerals and gas per rank), Battle Rhythm (streak cap +10% per rank), Bloodline (companions +10% per rank),
  Scavenger (+15% drop chance per rank), Hunter's Mark (bounties 25% more often per rank). The autopilot policy
  "Spend ascension perks" spreads points lowest rank first.
- Pacing check: 10 h autopilot sims complete 74–82 contracts and Amon still falls in 4.0–5.3 h (unchanged from before
  contracts); the first version paid a quarter level per contract with instant refills and cut that to 2–3 h, which is
  why the refill timer exists.

## Manual play
Autopilot off means the player presses Engage after every kill, Rest, Mine, Flee and Challenge boss by hand and fires
abilities with the three buttons or keys 1 to 3. Hotkeys mirror the buttons and respect their disabled state: E engage,
R rest, F flee, M mine, B challenge boss, L leave instance; they are ignored while typing in an input. The buttons
carry the key in their tooltip and the first tip names them.

## Daily check-in
The first session of each local day pays a supply crate (rare or better at the hero's level, rolled higher from a
7-day streak) and an hour of Rested (+15% xp, shown next to the hero's buffs and ticking down only while playing).
Consecutive days build a streak that the Codex record and three feats (3, 7 and 30 days) track; a missed day resets
it to one but keeps the best. The check runs when a hero loads, when you switch heroes, on a new hero (which only
starts the count, so a level-1 hero does not get a rare item) and once a minute for midnight passing while the tab is
open. The streak survives ascension. This is the return-visit hook: the offline summary says what happened, the
check-in banner says why today is worth staying for.

## Retreat and return
- **Flee**: a policy (default on, below 20% health) that breaks off a losing fight against an ordinary enemy, once a
  minute, then rests; never against bosses or inside instances, where a wipe should stay a wipe. A Flee button appears
  during such fights in manual play. In 8 h sims it cuts deaths from 5–6 to 2 without changing the pace to Amon, which is
  the retreat rule Azeroth Idle's policy list calls "flee at %".
- **Supply drop**: coming back after 4 or more hours away adds a rare-or-better item for the hero's level to the "While you
  were away" summary, so a long absence has something waiting at the end of it.
- The layout was checked at phone width (390 px): panels stack, no horizontal scroll.

## World events
Every 12–20 minutes of play (from level 4, outside instances) a two-to-three-minute event starts, announced with a banner
and shown as a timer pill beside the mode line: Brood Surge (enemies come four times as fast, +50% xp), Supply Convoy
(double minerals), Vespene Leak (every kill gives gas), Rich Vein (mining pays triple; the autopilot goes mining for up to
90 s if its mining policy is on), Elite Patrol (one spawn in three is a bounty target) and Khaydarin Resonance (abilities
cost half and recharge 30% faster; the autopilot's ability picker knows). Events also run during offline catch-up and
are counted in the away summary. Feat: Storm Chaser (10 events).

## Codex and bestiary
The Codex lists every zone you have seen with its three enemies and your kill count for each; after five kills the entry
reveals a line of field intel (24 entries, plus the boss once beaten). Companions you have met are listed with their bond
rank, and the Record card now covers bounties, contracts, events, best streak, minerals mined, items crafted, escapes and
ascensions. Feats: Xenobiologist (12 entries) and Field Guide (all 24, with a crate). Kill counts carry through ascension.

Instances have their own bestiary: every dungeon and raid the hero has unlocked lists its encounters and boss with kill
counts, and `INSTANCE_LORE` (34 entries) reveals a line after two kills of a kind, or one for a boss, since instance
enemies are met far less often than field ones. Run enemies now record a `kind`, so the counts work. The bestiary
counter covers both tables (58 entries).

## Not done yet / ideas
- Real multiplayer (shared realm, chat, parties, leaderboards) needs a server.
- Music (needs a free track picked by Austin). More retreat rules and consumables, as in Azeroth Idle.
- `benilla-re` (shared as a reference) is a WoW 1.12 client reverse-engineering index, likely what
  Azeroth Idle's real-client approach builds on. It isn't needed for a browser game like this one.
