# Genesys Inventions v0.3.0

Player-facing invention project manager for Foundry VTT 13.x + Genesys 0.2.19, based on **Wonderous Inventions** with clearly marked Workshop guidance where the supplement leaves adjudication to the GM.

## v0.3.0

### Crafting families and components

- Added **Jewelry & Glasswork / Ювелірні вироби та гутництво**.
- Added **Weaving / Ткацтво**.
- Added **Pottery / Гончарство**.
- Renamed Leatherworking to **Tanning & Furriery / Чинбарство та кушнірство**.
- Expanded Mechanisms into **Joinery, Carpentry & Mechanisms / Столярство, теслярство та механізми**.
- Added manual Component Stockpile entries, including family, Tier, value, custom label, and notes.
- Gathering now uses a simple Workshop baseline of **100 currency per net Success** at 100% yield. The GM can scale this in Module Settings. For example, 200% grants 200 currency per net Success.
- Tier still determines the recommended gathering difficulty rather than changing the base value per Success.

### GM settings

- The GM can enable or disable invention object types independently: Gear, Weapon, Armor, and Vehicle.
- The GM can enable or disable each crafting/component family independently.
- Added **Gathering Yield (%)** world setting.
- Added module language setting: **Auto / Українська / English**.

### Bilingual interface

- Added Ukrainian and English interface text across the primary Inventions workflow, Rules, Gathering, Projects, GM Review, and Project screens.
- Added a **🌐 UA / 🌐 EN** button to the bottom bar for quick client-side language switching.
- Rules and Workshop guidance follow the selected module language.

### Dice and difficulty

- Reworked custom dice display to use CSS die silhouettes instead of font-private glyph shapes: d6 square, d8 diamond, and d12 hexagonal silhouette.
- Difficulty labels now show the corresponding Difficulty dice visually.
- Added **Difficulty Upgrades** support. Upgrades convert Difficulty dice into Challenge dice according to the Genesys upgrade sequence, and Challenge dice are shown alongside Difficulty dice.

### Existing features retained

- Schematic rolls resolve from the actual Genesys chat roll and advance the Schematic automatically when no result spending is required.
- Component Stockpiles persist on inventor Actors.
- GMs can use a separate **NPC / Test Actor** selector.
- Finished Items and Vehicles are archived to dedicated world Compendia.
- Players only see Characters they own; Project Journals remain GM-controlled.

## Important rules boundary

**Wonderous Inventions** defines Schematics, Tier 3/5/7 component values, and item deconstruction. It does not provide a universal field-harvesting formula or a universal base crafting difficulty/time for every possible invention. The module therefore labels gathering yields, existing-base credit, setting-specific disciplines, and some project setup as **Workshop guidance** and keeps final values under GM approval.

Vehicle profile construction is based on the **Expanded Player's Guide** vehicle creation guidelines. These describe profile balance and price guidance, not a universal physical construction procedure, so the final crafting parameters remain GM-approved.

## Workflow

1. Open **Inventions** and select a Character you own. GMs may instead choose an NPC/Test Actor.
2. Start from scratch or use an existing Item/Vehicle as the base object.
3. Choose an available crafting family and proposed object type.
4. Optionally mark the supplied base object as part of construction so its recoverable component value offsets requirements.
5. GM reviews the profile, crafting skill, schematic skill, base difficulty, difficulty upgrades, time, and total component cost.
6. Develop Schematics and use **Roll Schematic** for the appropriate design difficulty.
7. Gather, manually register, or otherwise acquire Tier 3/5/7 components in the inventor's Component Stockpile.
8. Allocate the needed components to the project, make the final crafting roll, and request completion.
9. The GM creates the finished Item or Vehicle. A reusable copy is archived in the appropriate Inventions Compendium.

## Schematic checks

- Level 1: Average, 6 hours, final crafting difficulty -1
- Level 2: Hard, 6 hours, final crafting difficulty -2
- Level 3: Daunting, 8 hours, final crafting difficulty -3
- Level 4: Formidable, 12 hours, final crafting difficulty -4

**Roll Schematic** performs the actual Actor-based Genesys roll and records it immediately. If the roll has no spendable Advantage, Threat, Triumph, or Despair, the module resolves it automatically. If spendable symbols remain, the project shows **Resolve / Spend Result** and locks those symbols to the originating chat roll.

## Component gathering

The module tracks abstract Tier 3, Tier 5, and Tier 7 component value in the world's configured currency unit.

The default Workshop gathering guidance is:

- Tier 3: Average check
- Tier 5: Hard check
- Tier 7: Daunting check
- 100% Gathering Yield: **100 currency per net Success**

The GM can change the Gathering Yield percentage in Module Settings. This is module guidance, not a Wonderous Inventions RAW rule.

## Permissions

Players only see Character Actors for which they have OWNER permission. GMs additionally have a separate **NPC / Test Actor** selector for supported non-player Actors. Project Journals remain GM-controlled; the inventor's player receives Observer permission and interacts through the module UI without directly editing the Journal source or roll history.

## Installation

In Foundry VTT Setup, open **Add-on Modules → Install Module** and paste this Manifest URL:

`https://raw.githubusercontent.com/Nyliss/foundryvtt-genesys-inventions/main/module.json`

Then enable **Genesys Inventions** in the world's **Manage Modules** screen.

## Launcher Macro

When a GM loads the world with the module enabled, the module automatically creates a world Macro named **Genesys Inventions** in the Macro Directory. Players can drag it onto their own hotbars. The repository copy under `macros/` is kept as a manual fallback.
