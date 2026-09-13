# Genesys Inventions v0.2.1

Player-facing invention project manager for Foundry VTT 13.x + Genesys 0.2.19, based on **Wonderous Inventions** with clearly marked Workshop guidance where the supplement leaves adjudication to the GM.

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

**Roll Schematic** performs the actual Character-based Genesys roll. **Record / Spend Result** remains the authoritative step for resolving success and spending Advantage, Threat, Triumph, and Despair on schematic effects.

## Components

The module tracks abstract Tier 3, Tier 5, and Tier 7 component value in the world's currency unit. Gathering examples are written in Ukrainian and represent material categories rather than mandatory shopping lists. The GM decides the value of a field-gathered result because Wonderous Inventions does not assign a universal harvesting yield.

## Permissions

Only Character Actors for which the current user has OWNER permission appear in the player Character selector. Project Journals remain GM-controlled; the inventor's player receives Observer permission and can interact through the module UI without directly editing the Journal source or roll history.

## Installation

Install **Genesys Inventions** directly through Foundry VTT using the module manifest.

1. Open **Setup → Add-on Modules → Install Module**.
2. Paste this URL into **Manifest URL**:

   `https://raw.githubusercontent.com/Nyliss/foundryvtt-genesys-inventions/main/module.json`

3. Click **Install**.
4. Open your Genesys world and enable **Genesys Inventions** under **Manage Modules**.

### Optional Launcher Macro

A launcher macro is included for users who want a dedicated hotbar button.

File:

`macros/genesys-inventions-launcher-v0.2.1.json`
