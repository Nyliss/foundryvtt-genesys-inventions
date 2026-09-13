# Genesys Inventions v0.2.3

Player-facing invention project manager for Foundry VTT 13.x + Genesys 0.2.19, based on **Wonderous Inventions** with clearly marked Workshop guidance where the supplement leaves adjudication to the GM.

## v0.2.3

- Fixed blank Genesys die faces rendering as literal `@symbol[]` text in Inventions chat cards. Blank faces are now displayed as blank dice, while rolled symbols use the active Genesys symbol enricher.
- Added clearer die silhouettes to Inventions chat cards for Ability/Difficulty, Proficiency/Challenge, and Boost/Setback dice.
- Schematic rolls now resolve from the **actual chat roll**. A successful roll with no spendable Advantage/Threat/Triumph/Despair immediately creates the next Schematic Level; rolls with spendable symbols are locked as a pending result for the **Resolve / Spend Result** step; failed attempts are recorded without creating a level.
- Players can no longer manually rewrite Schematic outcomes. The GM-side project update validates the originating chat message, net Success/Failure, and available spending symbols.
- Added a persistent **Component Stockpile** to each inventor Actor. Gathering rolls automatically register material family, Tier, value, Skill, difficulty, net Successes, and the originating chat roll.
- Added explicit Workshop gathering yield: **Tier 3 = 250 currency per net Success (Average suggested)**, **Tier 5 = 150 per net Success (Hard suggested)**, and **Tier 7 = 50 per net Success (Daunting suggested)**. This is module guidance, not a Wonderous Inventions RAW rule.
- The gathering yield deliberately mirrors the supplement's 25% / 15% / 5% deconstruction rates by treating each net Success as a notional 1,000-currency resource opportunity. Advantage/Threat/Triumph/Despair remain narrative results rather than automatic value modifiers.
- Gather Components now shows the selected Actor's complete Component Stockpile and Tier totals. Invention projects also show available stockpile totals beside their project-specific component allocation.
- Added a GM-only **Choose NPC / Test Actor** mode. GMs can use Character, Rival, Nemesis, or Minion Actors that are not player-owned as invention test platforms; normal players still see only Character Actors they own.
- Updated the Rules screen with the automatic gathering ledger, yield table, and the RAW/Workshop boundary.

## v0.2.1

- Every finished Weapon, Armor, Gear, or Nuvarotech Item is now copied into the world Compendium **Inventions · Created Items** when the project is completed.
- Finished Vehicle Actors are likewise copied into **Inventions · Created Vehicles**. Foundry Compendium packs contain one Document type, so Items and Vehicle Actors use separate packs.
- The GM gets an **Open Compendium Copy** button on completed projects, and the Project Log records which Compendium received the finished object.
- The module prepares both world Compendia automatically when a GM loads the world. If archiving fails during completion, the newly created world object is rolled back instead of silently completing without an archive copy.

## v0.2.0

- Item Qualities are filtered by the selected Item Type. The module prefers actual usage found in the active Fantasy Gear library, with conservative compatibility fallbacks for Weapon and Armor qualities.
- Added **Vehicle** inventions. Vehicle projects can define Silhouette, Max Speed, Handling, Defense, Armor, Hull Trauma, System Strain, Encumbrance Capacity, Control Skill, crew/occupants, and consumables. Finished vehicles are created as Vehicle Actors.
- Added **Nuvarotech · Enkor** as a project discipline when a Nuvarotech / Нуваротехніка skill is available in the active world or on the selected Character.
- Reworked Genesys rolls to use the active Genesys system's registered narrative dice terms (`da`, `dp`, `db`, `di`, `dc`, `ds`) and a narrative result card instead of Foundry's generic numeric total card.
- Schematic and final-crafting rolls retain their project context and are written into the immutable Project Rolls log.
- Added **Use the base object as part of the construction** for projects based on an existing object. Recoverable Tier value offsets the new component requirement. Exact Character Inventory objects are consumed when the invention is completed; library references require GM verification.
- Added a separate **Gather Components** workflow with Character/Skill-based rolls, Tier targets, and detailed Ukrainian component examples for Alchemy, Cooking, Smithing, Leatherwork, Runes/Enchanting, Mechanisms, Vehicles, and Nuvarotech.
- Component descriptions explain what each category can be used to craft and provide concrete project examples.
- Component values display the active world's configured currency label when one can be resolved, rather than hard-coding credits.
- The Character Sheet shortcut is now a compact **Inventions** button.
- Expanded the Rules screen with base-object reuse, Vehicle inventions, and Nuvarotech notes.
- Launcher icon remains `icons/svg/portal.svg`.

## Important rules boundary

**Wonderous Inventions** defines Schematics, Tier 3/5/7 component values, and item deconstruction. It does not provide a universal field-harvesting formula or a universal base crafting difficulty/time for every possible invention. The module therefore labels gathering yields, existing-base credit, setting-specific disciplines, and some project setup as **Workshop guidance** and keeps final values under GM approval.

Vehicle profile construction is based on the **Expanded Player's Guide** vehicle creation guidelines. These describe profile balance and price guidance, not a universal physical construction procedure, so the final crafting parameters remain GM-approved.

## Workflow

1. Open **Inventions** and select a Character you own.
2. Start from scratch or use an existing Item/Vehicle as the base object.
3. Optionally mark the supplied base object as part of construction so its recoverable component value offsets requirements.
4. GM reviews the profile, crafting skill, schematic skill, base difficulty, time, and total component cost.
5. Develop Schematics and use **Roll Schematic** for the appropriate design difficulty.
6. Gather or acquire Tier 3/5/7 components. **Gather Components** can make Character-based narrative dice checks and posts the material category/use to chat.
7. Make the final crafting roll and request completion.
8. The GM creates the finished Item or Vehicle. The project records where it was created, archives a reusable copy in the appropriate Inventions Compendium, and provides direct Open buttons.

## Schematic checks

- Level 1: Average, 6 hours, final crafting difficulty -1
- Level 2: Hard, 6 hours, final crafting difficulty -2
- Level 3: Daunting, 8 hours, final crafting difficulty -3
- Level 4: Formidable, 12 hours, final crafting difficulty -4

**Roll Schematic** performs the actual Actor-based Genesys roll and records it immediately. If the roll has no spendable Advantage, Threat, Triumph, or Despair, the module resolves it automatically: a successful check creates the next Schematic Level and a failed check records the failed attempt. If spendable symbols remain, the project shows **Resolve / Spend Result** and locks those symbols to the originating chat roll.

## Components

The module tracks abstract Tier 3, Tier 5, and Tier 7 component value in the world's currency unit. Gathering examples are written in Ukrainian and represent material categories rather than mandatory shopping lists. Because Wonderous Inventions does not assign a universal field-harvesting yield, v0.2.3 uses clearly marked Workshop guidance: Tier 3 grants 250 currency per net Success, Tier 5 grants 150, and Tier 7 grants 50. Successful gathering checks are recorded automatically in the selected Actor's Component Stockpile.

## Permissions

Players only see Character Actors for which they have OWNER permission. GMs additionally have a separate **NPC / Test Actor** selector for supported non-player Actors. Project Journals remain GM-controlled; the inventor's player receives Observer permission and can interact through the module UI without directly editing the Journal source or roll history.

## Installation

### Manifest installation

In Foundry VTT Setup, open **Add-on Modules → Install Module** and paste this Manifest URL:

`https://raw.githubusercontent.com/Nyliss/foundryvtt-genesys-inventions/main/module.json`

Then enable **Genesys Inventions** in the world's **Manage Modules** screen.

### Manual installation

Download the release ZIP and extract the `genesys-inventions` folder into:

`Foundry Data/Data/modules/genesys-inventions/`

Restart Foundry and enable **Genesys Inventions**.

### Launcher Macro

When a GM loads the world with the module enabled, the module automatically creates a world Macro named **Genesys Inventions** in the Macro Directory. Players can drag it onto their own hotbars. The repository copy under `macros/` is kept as a manual fallback.
