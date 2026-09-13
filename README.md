# Genesys Inventions

**Genesys Inventions** is a crafting and invention project manager for the Genesys system in Foundry VTT.

The module is built around the *Wondrous Inventions* crafting framework and expands it with a structured player/GM workflow for designing, approving, building, and tracking custom creations.

## Features

- Create new inventions from scratch or use an existing item as a base.
- Support for Gear, Weapons, Armor, and Vehicles.
- Optional Enkor / Nuvar Technology support.
- GM review and approval before a project begins.
- Schematic progression with Genesys narrative dice rolls.
- Project Journals with immutable roll history.
- Tier 3, Tier 5, and Tier 7 component tracking.
- Persistent Component Stockpiles for characters.
- Component gathering rolls with configurable yield.
- Manual component entry.
- Multiple crafting disciplines, including:
  - Alchemy
  - Cooking
  - Smithing
  - Leatherworking
  - Runes & Enchanting
  - Jewelry & Glasswork
  - Weaving
  - Pottery
  - Woodworking, Carpentry & Mechanisms
  - Vehicles
  - Nuvar Technology
- GM settings for enabling or disabling item types and crafting disciplines.
- English and Ukrainian interface support.
- Dark, Light, and Slate themes.
- Finished creations are archived automatically in dedicated world Compendia.

## Workflow

1. A player chooses a character and creates an invention concept.
2. The GM reviews the proposed item and defines the final crafting parameters.
3. The project becomes an Invention Journal.
4. The inventor may create and improve Schematics.
5. Required components are gathered, tracked, and assigned to the project.
6. The final crafting check is made.
7. The completed creation is added to the appropriate Actor and archived in an Inventions Compendium.

## Components

The module uses abstract component values divided into three tiers:

- **Tier 3** — common and readily available materials
- **Tier 5** — uncommon, specialized, or high-quality materials
- **Tier 7** — rare, restricted, exceptional, or supernatural materials

Component names and examples depend on the selected crafting discipline.

The GM can configure the base value gained per net Success on gathering checks.

## Schematics

Schematics reduce the difficulty of the final crafting check.

The module supports four Schematic Levels and records the actual Genesys dice results used to create them.

Advantage, Threat, Triumph, and Despair may be spent on Schematic effects according to the crafting rules.

## GM Tools

GMs can:

- Review and approve invention proposals.
- Set crafting Skill, difficulty, time, and component cost.
- Use NPC or test Actors as inventors.
- Configure available item types and crafting disciplines.
- Adjust component gathering yield.
- Manually add materials to a character's Component Stockpile.
- Access completed inventions through dedicated Compendia.

## Languages

Genesys Inventions supports:

- English
- Ukrainian

The module language can be set in Module Settings or switched directly from the Inventions interface.

## Installation

In Foundry VTT, open:

**Setup → Add-on Modules → Install Module**

Paste this URL into **Manifest URL**:

`https://raw.githubusercontent.com/Nyliss/foundryvtt-genesys-inventions/main/module.json`

Then click **Install**.

After installation, open your Genesys world and enable **Genesys Inventions** under **Manage Modules**.

## Requirements

- Foundry VTT 13
- Genesys 0.2.19

## Launcher Macro

The module automatically creates a **Genesys Inventions** world macro when a GM loads the world.

The macro can be dragged from the Macro Directory to a user's hotbar.

## Notes

*Wondrous Inventions* does not define every part of item creation, component gathering, or campaign economy.

Where the source material leaves decisions to the GM, the module provides clearly separated configurable guidance rather than presenting those additions as source rules.
