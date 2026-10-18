# Koprulu Idle: design note

A browser idle RPG set in the StarCraft universe, inspired by Azeroth Idle's "MMORPG that plays itself":
you create one hero, set **policies**, and the hero keeps questing, grinding and levelling while you
watch or while you're away. Personal, non-commercial fan project (StarCraft is Blizzard's IP).

## Files
- `game.html`: the game as an artifact page (no doctype; the source of truth).
- `index.html`: standalone copy for opening locally or hosting anywhere. Rebuild with `sh build.sh`.
- No build step, no dependencies besides Google Fonts. Saves to `localStorage`, with export/import codes.

## Core loop
1. Pick race (Terran / Protoss / Zerg) and one of 3 classes each (9 total), each with 3 abilities.
2. Hero auto-attacks; abilities cost Energy / Psi / Biomass and have cooldowns.
3. 8 zones from Mar Sara (1–5) to The Void (35–40). Each has 3 kill quests from a lore character,
   then a boss (Duke, Zasz, the Overmind, Ulrezaj, Mengsk, Maar, Amon...). Beating it opens the next zone.
4. Loot in 5 slots and 5 rarities, minerals and gas. Gas plus minerals buy permanent research
   (Weapons, Armor, Logistics, Salvage). One talent point per level, 5 talents.
5. Beating Amon unlocks **Ascension**: reset for Xel'Naga essence (+4% stats/xp each). Research carries over.

## Dungeons, raids and companions
- 7 companions join as you beat zone bosses: Raynor, Kerrigan, Zeratul (damage), Tassadar, Morales (healers),
  Fenix, Dehaka (tanks). Party = hero + 2. Tanks draw 85% of attacks, healers heal the lowest member.
- 6 dungeons (3 encounters + boss) and 2 raids (4 + boss, need 2 companions), one per zone, unlocked by its boss.
  Dying ends the run. Lockouts: 20 min (dungeons) and 2 h (raids) of play time.
- Rewards: extra loot (rare+ from dungeon bosses, epic+ from raid bosses) and Valor, spent on companion bonds
  (+10% companion power per rank, max 10). Bonds carry over through ascension.

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

## Offline / background
On load (or when a backgrounded tab returns) the game simulates the elapsed time, capped at 8 hours,
with the current policies, then shows a "While you were away" summary.

## Balance
Foes are tuned against a reference hero of the same level, so an even fight is ~7s and costs ~25%
health before abilities. Headless sims of all 9 classes on full autopilot reach Amon in roughly
5–9 hours of play time, with tankier/faster classes at the quick end. Dungeons usually open up around
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

## Not done yet / ideas
- Real multiplayer (shared realm, chat, parties, leaderboards) needs a server.
- Race-specific storylines (today every race follows the same quest givers).
- Music (needs a free track picked by Austin). Per-zone activity schedules and more retreat rules, as in Azeroth Idle.
- `benilla-re` (shared as a reference) is a WoW 1.12 client reverse-engineering index, likely what
  Azeroth Idle's real-client approach builds on. It isn't needed for a browser game like this one.
