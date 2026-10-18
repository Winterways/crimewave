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

## Not done yet / ideas
- Real multiplayer (shared realm, chat, parties, leaderboards) needs a server.
- Race-specific storylines (today every race follows the same quest givers).
- Professions, art/sprites, sound.
- `benilla-re` (shared as a reference) is a WoW 1.12 client reverse-engineering index, likely what
  Azeroth Idle's real-client approach builds on. It isn't needed for a browser game like this one.
