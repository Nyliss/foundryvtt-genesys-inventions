## Genesys Inventions v0.3.2

A focused cleanup update for item creation, project roll history, Genesys dice presentation, and bilingual component stockpiles.

### Item Qualities

- Reworked the Item Qualities browser into a single-column layout.
- Long quality descriptions now have enough horizontal space to remain readable.
- Added hover/focus tooltips showing the full quality description.
- The behavior now follows the same general approach used by the Fantasy Character Manager Shop.

### Project Roll History

- Fixed Project Roll entries storing stripped Chat Card text as one unreadable block.
- Project Rolls now store and display structured narrative results such as:
  - Success
  - Advantage
  - Threat
  - Triumph
  - Despair
- Older entries attempt to recover their structured result from the original Chat Message.
- If the original Chat Message is no longer available, the Project Log falls back to a clean neutral record instead of displaying broken text.

### Genesys Skill Rolls

- Skill rolls now display the Skill and linked Characteristic more explicitly, for example:
  - `Crafting (Cun)`
  - `Alchemy (Int)`
- Inventions continues to build its dice pools from the Actor's embedded Skill rank and linked Characteristic.
- Verified that the native Genesys system does not expose a stable public Actor skill-roll API suitable for reproducing the full native Dice Prompt workflow from an external module.

### Dice Display

- Simplified the custom Inventions dice display for reliability.
- Dice results now use consistent square color-coded faces instead of attempting to imitate the physical Genesys die shapes.
- Colors remain easy to identify:
  - Green: Ability
  - Yellow: Proficiency
  - Blue: Boost
  - Purple: Difficulty
  - Red: Challenge
  - Black: Setback
- Narrative symbols remain the actual Genesys Success, Advantage, Triumph, Failure, Threat, and Despair symbols.
- This change affects presentation only. Roll resolution still uses the Genesys system's registered narrative dice.

### Component Stockpile Localization

- Standard Component Stockpile entries are now rendered from their crafting-domain data instead of permanently storing one language as their visible name.
- Switching between Ukrainian and English now updates standard component names and their intended uses.
- Example:
  - `Шкіра, хутро, кістка й волокна`
  - `Leather, fur, bone & fibers`
- System-generated labels such as `Suitable for` / `Підходять для` also follow the selected module language.
- User-written custom names and notes are never automatically translated.

### Compatibility

- Foundry VTT 13
- Genesys 0.2.19

## Installation

Install **Genesys Inventions** directly through Foundry VTT using the module manifest.

1. Open **Setup → Add-on Modules → Install Module**.
2. Paste this URL into **Manifest URL**:

   `https://raw.githubusercontent.com/Nyliss/foundryvtt-genesys-inventions/main/module.json`

3. Click **Install**.
4. Open your Genesys world and enable **Genesys Inventions** under **Manage Modules**.

Existing installations can use **Check for Updates** to update to v0.3.2.
