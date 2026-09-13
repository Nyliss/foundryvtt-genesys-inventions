const MODULE_ID = "genesys-inventions";
const MODULE_VERSION = "0.3.1";
const SOCKET = `module.${MODULE_ID}`;
const FLAG_SCOPE = MODULE_ID;
const IMPORT_FLAG_SCOPE = "world";
const IMPORT_FLAG = "fantasyMasterImport";
const THEME_KEY = "fantasyCharacterManager.theme";
const TEXT_SIZE_KEY = "fantasyCharacterManager.textSize";
const LANGUAGE_SETTING = "language";
const GATHER_YIELD_SETTING = "gatherYieldPercent";
const ITEM_TYPE_SETTINGS = Object.freeze({
  gear: "allowItemGear",
  weapon: "allowItemWeapon",
  armor: "allowItemArmor",
  vehicle: "allowItemVehicle"
});
const DOMAIN_SETTING_PREFIX = "allowDomain.";

function configuredModuleLanguage() {
  try {
    const configured = String(game.settings?.get?.(MODULE_ID, LANGUAGE_SETTING) ?? "auto");
    if (configured === "uk" || configured === "en") return configured;
  } catch (_) {}
  const foundryLanguage = String(game.i18n?.lang ?? game.settings?.get?.("core", "language") ?? "en").toLowerCase();
  return foundryLanguage.startsWith("uk") ? "uk" : "en";
}

function tx(en, uk) {
  return configuredModuleLanguage() === "uk" ? uk : en;
}

function domainText(domain, field) {
  if (!domain) return "";
  if (configuredModuleLanguage() === "en") return String(domain[`${field}En`] ?? domain[field] ?? "");
  return String(domain[field] ?? domain[`${field}En`] ?? "");
}

function moduleDate(value) {
  try {
    return new Date(value ?? Date.now()).toLocaleString(configuredModuleLanguage() === "uk" ? "uk-UA" : "en-US");
  } catch (_) {
    return String(value ?? "");
  }
}
const PROJECT_FOLDER = "Invention Projects";
const CREATED_ITEM_PACK = Object.freeze({
  collection: "world.inventions-created-items",
  name: "inventions-created-items",
  label: "Inventions · Created Items",
  type: "Item"
});
const CREATED_VEHICLE_PACK = Object.freeze({
  collection: "world.inventions-created-vehicles",
  name: "inventions-created-vehicles",
  label: "Inventions · Created Vehicles",
  type: "Actor"
});
const PACKS = Object.freeze({
  gear: "world.fantasy-gear",
  skills: "world.fantasy-skills",
  qualities: "world.fantasy-qualities"
});

const SCHEMATIC_LEVELS = Object.freeze({
  1: {difficulty: 2, hours: 6},
  2: {difficulty: 3, hours: 6},
  3: {difficulty: 4, hours: 8},
  4: {difficulty: 5, hours: 12}
});

const COMPONENT_PERCENTAGES = Object.freeze({
  0: [100, 0, 0],
  1: [100, 0, 0],
  2: [95, 5, 0],
  3: [90, 10, 0],
  4: [80, 20, 0],
  5: [70, 30, 0],
  6: [65, 30, 5],
  7: [60, 30, 10],
  8: [50, 35, 15],
  9: [40, 40, 20],
  10: [20, 50, 30]
});

// Workshop guidance for field gathering. Wonderous Inventions does not define a
// universal harvesting yield, so the module uses a deliberately simple default
// intended as a clear, easy-to-scale campaign default. The GM can change the
// percentage in module settings. 100% means 100 currency per net Success.
const GATHERING_BASE_YIELD = 100;
const GATHERING_RECOMMENDED_DIFFICULTY = Object.freeze({3: 2, 5: 3, 7: 4});

const DECONSTRUCTION_PERCENTAGES = Object.freeze({
  0: [95, 0, 0],
  1: [95, 0, 0],
  2: [90, 0, 0],
  3: [80, 5, 0],
  4: [70, 10, 0],
  5: [60, 15, 0],
  6: [50, 15, 0],
  7: [40, 15, 5],
  8: [30, 20, 10],
  9: [20, 25, 15],
  10: [20, 40, 20]
});

const GATHERING_DOMAINS = Object.freeze({
  alchemy: {
    label: "Алхімія", labelEn: "Alchemy", icon: "⚗",
    skillCandidates: ["Алхімія", "Alchemy", "Виживання", "Survival"],
    componentType: "Алхімічні реагенти", componentTypeEn: "Alchemical reagents",
    ordinary: "лікувальні трави, спирти, солі, олії, просте скло, деревне вугілля",
    ordinaryEn: "medicinal herbs, alcohols, salts, oils, simple glassware, charcoal",
    specialist: "рідкісні трави, концентровані есенції, отруйні залози, очищені мінерали, каталізатори",
    specialistEn: "rare herbs, concentrated essences, venom glands, purified minerals, catalysts",
    exceptional: "унікальні магічні реагенти, органи надприродних істот, надзвичайно чисті каталізатори",
    exceptionalEn: "unique magical reagents, organs from supernatural creatures, exceptionally pure catalysts",
    uses: "зілля, еліксири, антидоти, кислоти, отрути, алхімічні бомби, лікувальні суміші та інші алхімічні витратні предмети",
    usesEn: "potions, elixirs, antidotes, acids, poisons, alchemical bombs, healing mixtures, and other alchemical consumables",
    examples: "лікувальне зілля, димова суміш, кислота для замків, протиотрута, вогняна колба, концентрований еліксир",
    examplesEn: "healing potion, smoke mixture, lock-eating acid, antidote, fire flask, concentrated elixir"
  },
  cooking: {
    label: "Кулінарія", labelEn: "Cooking", icon: "♨",
    skillCandidates: ["Кулінарія", "Cooking", "Виживання", "Survival"],
    componentType: "Харчові інгредієнти", componentTypeEn: "Food ingredients",
    ordinary: "зерно, овочі, м’ясо, сіль, звичайні спеції, олія",
    ordinaryEn: "grain, vegetables, meat, salt, common spices, oil",
    specialist: "рідкісні спеції, витримані продукти, незвичайні гриби, цінне м’ясо або морепродукти",
    specialistEn: "rare spices, aged foods, unusual mushrooms, valuable meat or seafood",
    exceptional: "надзвичайно рідкісні делікатеси, магічні рослини чи частини істот із кулінарною властивістю",
    exceptionalEn: "exceptionally rare delicacies, magical plants, or creature parts with culinary properties",
    uses: "звичайні й особливі страви, дорожні раціони, напої, бенкетні страви та їжа з сюжетними або механічними властивостями",
    usesEn: "ordinary and special meals, travel rations, drinks, banquet dishes, and food with narrative or mechanical effects",
    examples: "довготривалий дорожній раціон, зігрівальна страва, дорогий бенкет, тонізувальний напій, страва з рідкісного чудовиська",
    examplesEn: "long-lasting travel ration, warming expedition meal, expensive banquet, restorative drink, dish made from a rare monster"
  },
  smithing: {
    label: "Ковальство", labelEn: "Smithing", icon: "⚒",
    skillCandidates: ["Ремесло", "Craft", "Ковальство", "Smithing", "Mechanics"],
    componentType: "Ковальські матеріали", componentTypeEn: "Smithing materials",
    ordinary: "залізо, сталь, мідь, вугілля, дріт, заклепки, прості руків’я",
    ordinaryEn: "iron, steel, copper, charcoal, wire, rivets, simple grips",
    specialist: "якісні сплави, пружинна сталь, срібло, складні гарнітури, рідкісні метали",
    specialistEn: "quality alloys, spring steel, silver, complex fittings, rare metals",
    exceptional: "легендарні сплави, метеоритний метал, унікальні серцевини або метал із надприродними властивостями",
    exceptionalEn: "legendary alloys, meteoric metal, unique cores, or metals with supernatural properties",
    uses: "зброя, обладунки, щити, металеві інструменти, кріплення, механічні деталі та металеві основи для магічних або рунічних предметів",
    usesEn: "weapons, armor, shields, metal tools, fittings, mechanical parts, and metal bases for magical or runic items",
    examples: "меч, кольчуга, шолом, щит, точний інструмент, металевий корпус механізму, рунічна заготовка",
    examplesEn: "sword, chainmail, helmet, shield, precision tool, mechanical housing, runic blank"
  },
  leather: {
    label: "Чинбарство та кушнірство", labelEn: "Leatherworking", icon: "◫",
    skillCandidates: ["Ремесло", "Craft", "Чинбарство", "Tanning", "Кушнірство", "Furriery", "Leatherworking", "Виживання", "Survival"],
    componentType: "Шкіра, хутро, кістка й волокна", componentTypeEn: "Leather, fur, bone & fibers",
    ordinary: "звичайні шкури, хутро, сухожилля, нитки, віск, кістка, дерев’яна фурнітура",
    ordinaryEn: "common hides, fur, sinew, thread, wax, bone, wooden fittings",
    specialist: "винятково міцні шкури, роги, панцир, рідкісні волокна, добре вичинена шкіра небезпечних істот",
    specialistEn: "exceptionally tough hides, horns, shell, rare fibers, well-cured hides from dangerous creatures",
    exceptional: "луска могутніх чудовиськ, унікальні панцирі, надприродно міцні волокна або шкури",
    exceptionalEn: "scales from mighty monsters, unique carapaces, supernatural fibers, or extraordinary hides",
    uses: "легкі обладунки, ремені, піхви, сумки, хутряний одяг, тятиви, луки, щити, упряж і предмети з органічною основою",
    usesEn: "light armor, belts, scabbards, bags, fur clothing, bowstrings, bows, shields, harnesses, and organic-base items",
    examples: "шкіряний обладунок, хутряний плащ, сідло, міцна сумка, ремінна система, композитний лук, щит із панцира",
    examplesEn: "leather armor, fur cloak, saddle, reinforced bag, harness, composite bow, carapace shield"
  },
  runes: {
    label: "Руни й зачарування", labelEn: "Runes & Enchanting", icon: "◇",
    skillCandidates: ["Руни", "Runes", "Аркана", "Arcana", "Ремесло", "Craft"],
    componentType: "Рунічні та магічні компоненти", componentTypeEn: "Runic and magical components",
    ordinary: "підготовлені чорнила, мінеральний пил, віск, срібний дріт, чисті заготовки",
    ordinaryEn: "prepared inks, mineral dust, wax, silver wire, clean blanks",
    specialist: "рідкісні кристали, резонансні метали, спеціальні пігменти, освячені або налаштовані матеріали",
    specialistEn: "rare crystals, resonant metals, special pigments, consecrated or attuned materials",
    exceptional: "унікальні фокусувальні кристали, релікварні матеріали, компоненти з потужним магічним резонансом",
    exceptionalEn: "unique focusing crystals, relic materials, components with powerful magical resonance",
    uses: "рунічна зброя й обладунки, талісмани, магічні Implements, зачаровані інструменти, фокуси та інші постійні магічні предмети",
    usesEn: "runic weapons and armor, talismans, magical implements, enchanted tools, foci, and other permanent magical items",
    examples: "рунічний клинок, захисна пластина, магічна паличка, сфера-Implement, талісман, рунічний замок",
    examplesEn: "runic blade, protective plate, magic wand, orb implement, talisman, runic lock"
  },
  mechanisms: {
    label: "Столярство, теслярство та механізми", labelEn: "Joinery, Carpentry & Mechanisms", icon: "⚙",
    skillCandidates: ["Ремесло", "Craft", "Столярство", "Joinery", "Теслярство", "Carpentry", "Mechanics", "Механіка", "Engineering", "Інженерія"],
    componentType: "Деревина та механічні компоненти", componentTypeEn: "Woodworking and mechanical components",
    ordinary: "дошки, бруси, шпон, клей, мотузки, шестерні, пружини, дріт, прості кріплення",
    ordinaryEn: "boards, beams, veneer, glue, rope, gears, springs, wire, simple fittings",
    specialist: "добірна деревина, точні механізми, складні з’єднання, якісна оптика, регулятори, спеціалізовані приводи",
    specialistEn: "selected timber, precision mechanisms, complex joints, quality optics, regulators, specialized drives",
    exceptional: "рідкісна деревина, надточні системи керування, унікальні механічні вузли, експериментальні приводи",
    exceptionalEn: "rare timber, ultra-precise control systems, unique mechanical assemblies, experimental drives",
    uses: "луки й арбалети, меблі, дерев’яні конструкції, інструменти, пастки, годинникові механізми, автомати, прилади та корпуси машин",
    usesEn: "bows and crossbows, furniture, wooden structures, tools, traps, clockwork, automata, instruments, and machine housings",
    examples: "арбалет, складний лук, скриня з механічним замком, протез, автоматонний вузол, насос, оптичний прилад",
    examplesEn: "crossbow, composite bow, chest with a mechanical lock, prosthetic, automaton assembly, pump, optical instrument"
  },
  jewelryGlass: {
    label: "Ювелірні вироби та гутництво", labelEn: "Jewelry & Glasswork", icon: "◆",
    skillCandidates: ["Ремесло", "Craft", "Ювелірство", "Jewelry", "Гутництво", "Glassworking", "Склодувство", "Glassblowing"],
    componentType: "Дорогоцінні матеріали та скло", componentTypeEn: "Precious materials and glass",
    ordinary: "кварцовий пісок, сода, поташ, просте скло, мідь, латунь, срібний дріт, недорогі камені, абразиви",
    ordinaryEn: "quartz sand, soda, potash, simple glass, copper, brass, silver wire, inexpensive stones, abrasives",
    specialist: "чисте кольорове й термостійке скло, якісне срібло або золото, ограновані самоцвіти, емалі, складні оправи",
    specialistEn: "clear colored or heat-resistant glass, quality silver or gold, cut gemstones, enamels, intricate settings",
    exceptional: "надзвичайно рідкісні самоцвіти, унікальні кристали, магічне скло, релікварні метали або бездоганні оптичні заготовки",
    exceptionalEn: "exceptionally rare gems, unique crystals, magical glass, relic metals, or flawless optical blanks",
    uses: "прикраси, амулети, оправи для кристалів, лінзи, флакони, алхімічний посуд, декоративні та магічні компоненти",
    usesEn: "jewelry, amulets, crystal settings, lenses, vials, alchemical glassware, decorative and magical components",
    examples: "перстень, підвіска, огранований фокус, набір лінз, міцна алхімічна колба, скляний резервуар, інкрустована рукоять",
    examplesEn: "ring, pendant, cut focus stone, lens set, reinforced alchemical flask, glass reservoir, inlaid grip"
  },
  weaving: {
    label: "Ткацтво", labelEn: "Weaving", icon: "⌁",
    skillCandidates: ["Ремесло", "Craft", "Ткацтво", "Weaving", "Tailoring", "Кравецтво"],
    componentType: "Тканини, нитки та волокна", componentTypeEn: "Cloth, thread & fibers",
    ordinary: "вовна, льон, коноплі, бавовна, прості нитки, полотно, барвники",
    ordinaryEn: "wool, linen, hemp, cotton, common thread, cloth, dyes",
    specialist: "шовк, тонке сукно, водостійкі тканини, металізовані нитки, рідкісні барвники, складні плетіння",
    specialistEn: "silk, fine cloth, water-resistant fabrics, metallic thread, rare dyes, complex weaves",
    exceptional: "надприродно міцне павутиння, магічні волокна, унікальні тканини або нитки з незвичайними властивостями",
    exceptionalEn: "supernaturally strong silk, magical fibers, unique fabrics, or thread with unusual properties",
    uses: "одяг, плащі, роби, м’які обладунки, сумки, бинти, вітрила, знамена, фільтри та текстильні магічні предмети",
    usesEn: "clothing, cloaks, robes, padded armor, bags, bandages, sails, banners, filters, and textile magical items",
    examples: "міцний плащ, дорожня сумка, захисна роба, вітрило, набір перев’язочного матеріалу, рунічне знамено",
    examplesEn: "reinforced cloak, travel bag, protective robe, sail, field dressing kit, runic banner"
  },
  pottery: {
    label: "Гончарство", labelEn: "Pottery", icon: "◒",
    skillCandidates: ["Ремесло", "Craft", "Гончарство", "Pottery", "Ceramics"],
    componentType: "Глина, кераміка та глазурі", componentTypeEn: "Clay, ceramics & glazes",
    ordinary: "глина, пісок, шамот, прості пігменти, глазурі, паливо для випалу",
    ordinaryEn: "clay, sand, grog, common pigments, glazes, kiln fuel",
    specialist: "фарфорова глина, вогнетривка кераміка, якісні глазурі, хімічно стійкі суміші, точні форми",
    specialistEn: "porcelain clay, refractory ceramic, quality glazes, chemical-resistant mixtures, precision molds",
    exceptional: "унікальна керамічна сировина, надміцні або магічні глазурі, релікварні глини, спеціальні композити",
    exceptionalEn: "unique ceramic materials, exceptionally strong or magical glazes, relic clays, special composites",
    uses: "посуд, резервуари, тиглі, алхімічні ємності, керамічні деталі, ізолятори, декоративні та магічні вироби",
    usesEn: "vessels, containers, crucibles, alchemical jars, ceramic parts, insulators, decorative and magical works",
    examples: "тигель, герметична амфора, алхімічна реторта, керамічний ізолятор, захисна пластина, ритуальна посудина",
    examplesEn: "crucible, sealed amphora, alchemical retort, ceramic insulator, protective plate, ritual vessel"
  },
  vehicles: {
    label: "Транспорт і машини", labelEn: "Vehicles & Machines", icon: "▣",
    skillCandidates: ["Ремесло", "Craft", "Mechanics", "Механіка", "Engineering", "Інженерія"],
    componentType: "Транспортні компоненти", componentTypeEn: "Vehicle components",
    ordinary: "деревина, балки, листовий метал, канати, осі, колеса, прості кріплення й паливні матеріали",
    ordinaryEn: "timber, beams, sheet metal, rope, axles, wheels, simple fittings, and fuel materials",
    specialist: "двигуни, трансмісії, бронеплити, системи керування, якісні вітрила, складні підвіски",
    specialistEn: "engines, transmissions, armor plates, control systems, quality sails, complex suspension",
    exceptional: "рідкісні силові установки, унікальні бронематеріали, експериментальні системи керування або спеціальні двигуни",
    exceptionalEn: "rare power plants, unique armor materials, experimental control systems, or special engines",
    uses: "вози, карети, човни, кораблі, повітряні апарати, машини, великі механізми, транспортні засоби та їхні модифікації",
    usesEn: "carts, carriages, boats, ships, aircraft, machines, large mechanisms, vehicles, and vehicle modifications",
    examples: "посилений віз, швидкий човен, дирижабль, броньована карета, експедиційна машина, польова майстерня",
    examplesEn: "reinforced wagon, fast boat, airship, armored carriage, expedition vehicle, mobile workshop"
  },
  nuvarotech: {
    label: "Нуваротехніка", labelEn: "Nuvarotech", icon: "✧",
    skillCandidates: ["Нуваротехніка", "Nuvarotech", "Ремесло", "Craft"],
    componentType: "Нуваротехнічні компоненти", componentTypeEn: "Nuvarotech components",
    ordinary: "корпуси, провідники, кріплення, ізоляційні матеріали та звичайні технічні вузли",
    ordinaryEn: "housings, conductors, fittings, insulation materials, and common technical assemblies",
    specialist: "стабілізатори, точні провідники, налаштовані резонатори, фокусувальні матриці та спеціальні корпуси",
    specialistEn: "stabilizers, precision conductors, tuned resonators, focusing matrices, and specialized housings",
    exceptional: "рідкісні нуварні осердя, унікальні резонатори, експериментальні матриці або інші сюжетно значущі нуваротехнічні вузли",
    exceptionalEn: "rare Nuvar cores, unique resonators, experimental matrices, or other story-significant Nuvarotech assemblies",
    uses: "нуваротехнічні інструменти, зброя, обладунки, сенсори, пристрої, прототипи, силові системи та вузли для більших машин",
    usesEn: "Nuvarotech tools, weapons, armor, sensors, devices, prototypes, power systems, and assemblies for larger machines",
    examples: "нуварний різак, стабілізований сенсор, резонаторний інструмент, захисний модуль, експериментальний прототип",
    examplesEn: "Nuvar cutter, stabilized sensor, resonator tool, protective module, experimental prototype"
  }
});

const POSITIVE_SPENDS = Object.freeze([
  {id: "timeDown", label: "Reduce crafting session time by 25%", labelUk: "Зменшити час крафту на 25%", advantage: 1},
  {id: "tier3Down", label: "Reduce Tier 3 component cost by 10%", labelUk: "Зменшити вартість компонентів Tier 3 на 10%", advantage: 1},
  {id: "autoSuccess", label: "Automatically generate 1 Success during crafting", labelUk: "Додати 1 автоматичний Успіх до крафту", advantage: 2},
  {id: "tier5Down", label: "Reduce Tier 5 component cost by 10%", labelUk: "Зменшити вартість компонентів Tier 5 на 10%", advantage: 2},
  {id: "variant", label: "Unlock an easy-to-modify variant design", labelUk: "Відкрити варіант конструкції, який легко модифікувати", advantage: 3, once: true},
  {id: "autoAdvantage", label: "Automatically generate 1 Advantage during crafting", labelUk: "Додати 1 автоматичну Перевагу до крафту", advantage: 3},
  {id: "tier7Down", label: "Reduce Tier 7 component cost by 10%", labelUk: "Зменшити вартість компонентів Tier 7 на 10%", advantage: 3},
  {id: "hardPointUpA", label: "+1 Hard Point", labelUk: "+1 Hard Point", advantage: 4, onceGroup: "hardPointUp"},
  {id: "hardPointUpT", label: "+1 Hard Point", labelUk: "+1 Hard Point", triumph: 1, onceGroup: "hardPointUp"}
]);

const NEGATIVE_SPENDS = Object.freeze([
  {id: "timeUp", label: "Increase crafting session time by 25%", labelUk: "Збільшити час крафту на 25%", threat: 1},
  {id: "tier3Up", label: "Increase Tier 3 component cost by 10%", labelUk: "Збільшити вартість компонентів Tier 3 на 10%", threat: 1},
  {id: "autoThreat", label: "Automatically generate 1 Threat during crafting", labelUk: "Додати 1 автоматичну Загрозу до крафту", threat: 2},
  {id: "tier5Up", label: "Increase Tier 5 component cost by 10%", labelUk: "Збільшити вартість компонентів Tier 5 на 10%", threat: 2},
  {id: "tier7Up", label: "Increase Tier 7 component cost by 10%", labelUk: "Збільшити вартість компонентів Tier 7 на 10%", threat: 3},
  {id: "hardPointDownT", label: "-1 Hard Point due to design flaws", labelUk: "-1 Hard Point через вади конструкції", threat: 4, onceGroup: "hardPointDown"},
  {id: "hardPointDownD", label: "-1 Hard Point due to design flaws", labelUk: "-1 Hard Point через вади конструкції", despair: 1, onceGroup: "hardPointDown"}
]);

function spendLabel(option) {
  return configuredModuleLanguage() === "uk" ? (option?.labelUk ?? option?.label ?? "") : (option?.label ?? option?.labelUk ?? "");
}

const pendingSocketRequests = new Map();
const pendingCraftRolls = new Map();

function deepClone(value) {
  return foundry.utils.deepClone(value);
}

function randomId() {
  return foundry.utils.randomID();
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHTML(value) {
  const div = document.createElement("div");
  div.innerHTML = String(value ?? "");
  return (div.textContent ?? div.innerText ?? "").replace(/\s+/g, " ").trim();
}

function norm(value) {
  return String(value ?? "").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function clamp(value, min, max) {
  const n = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
}

function integer(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function money(value) {
  return new Intl.NumberFormat().format(Math.round(Number(value ?? 0)));
}

function number1(value) {
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 1}).format(Number(value ?? 0));
}

function worldCurrencyLabel() {
  const preferredKeys = ["currencyName", "currencyLabel", "moneyName", "moneyLabel", "currencyUnit", "currency"];
  const cleanLabel = value => {
    if (typeof value !== "string") return "";
    const text = value.trim();
    return text && text.length <= 40 ? text : "";
  };
  try {
    // Prefer a Genesys-native world setting when the active system exposes one.
    for (const key of preferredKeys) {
      const full = `genesys.${key}`;
      if (!game.settings?.settings?.has?.(full)) continue;
      const value = cleanLabel(game.settings.get("genesys", key));
      if (value) return value;
    }

    // Then inspect registered Genesys settings. This also supports renamed/custom campaign settings.
    const candidates = [];
    for (const [fullKey, setting] of game.settings?.settings ?? []) {
      if (!String(fullKey).startsWith("genesys.")) continue;
      const haystack = norm(`${fullKey} ${setting?.name ?? ""} ${setting?.hint ?? ""}`);
      if (!/(currency|money|credit|coin|валют|грош)/i.test(haystack)) continue;
      const key = String(fullKey).slice("genesys.".length);
      let raw;
      try { raw = game.settings.get("genesys", key); } catch (_) { continue; }
      const value = cleanLabel(raw);
      if (!value) continue;
      let score = 1;
      if (/(name|label|unit)/i.test(key)) score += 3;
      if (setting?.scope === "world") score += 2;
      candidates.push({score, value});
    }

    // Finally inspect persisted world settings. This catches campaign modules/settings that provide
    // the world's currency label without registering it in the Genesys namespace.
    const worldStorage = game.settings?.storage?.get?.("world");
    if (worldStorage) {
      for (const settingDoc of worldStorage.values?.() ?? worldStorage) {
        const key = String(settingDoc?.key ?? settingDoc?._source?.key ?? "");
        const haystack = norm(key);
        if (!/(currency|money|credit|coin|валют|грош)/i.test(haystack)) continue;
        const value = cleanLabel(settingDoc?.value ?? settingDoc?._source?.value);
        if (!value) continue;
        let score = 1;
        if (/(name|label|unit)/i.test(key)) score += 3;
        if (key.startsWith("genesys.")) score += 2;
        candidates.push({score, value});
      }
    }

    candidates.sort((a,b) => b.score - a.score);
    if (candidates[0]?.value) return candidates[0].value;
  } catch (error) {
    console.warn("Genesys Inventions | Could not resolve world currency label", error);
  }
  return "currency";
}

function currencyAmount(value) {
  return `${money(value)} ${esc(worldCurrencyLabel())}`;
}

function hasNuvarotechSkill(skills = []) {
  return skills.some(skill => /(?:нувар|nuvar)/i.test(String(skill?.name ?? "")));
}

function recommendedGatheringSkill(actor, domain) {
  const candidates = GATHERING_DOMAINS[domain]?.skillCandidates ?? [];
  for (const candidate of candidates) if (actorSkillData(actor, candidate)) return actorSkillData(actor, candidate)?.item?.name ?? candidate;
  return actor?.items?.find?.(item => item.type === "skill")?.name ?? "";
}

function difficultyLabel(value) {
  const en = {0: "Simple", 1: "Easy", 2: "Average", 3: "Hard", 4: "Daunting", 5: "Formidable"};
  const uk = {0: "Проста", 1: "Легка", 2: "Середня", 3: "Важка", 4: "Надзвичайна", 5: "Гранична"};
  const table = configuredModuleLanguage() === "uk" ? uk : en;
  return table[Number(value)] ?? tx(`Difficulty ${value}`, `Складність ${value}`);
}

function applyDifficultyUpgrades(baseDifficulty, upgrades = 0) {
  let difficulty = Math.max(0, integer(baseDifficulty, 0));
  let challenge = 0;
  for (let i = 0; i < Math.max(0, integer(upgrades, 0)); i++) {
    if (difficulty > 0) {
      difficulty -= 1;
      challenge += 1;
    } else {
      difficulty += 1;
    }
  }
  return {difficulty, challenge};
}

function difficultyDiceHTML(baseDifficulty, upgrades = 0, {compact = true} = {}) {
  const pool = applyDifficultyUpgrades(baseDifficulty, upgrades);
  const sizeClass = compact ? " compact" : "";
  const purple = Array.from({length: pool.difficulty}, () => `<span class="ginv-mini-die die-i shape-d8${sizeClass}" title="${tx("Difficulty die","Кубик складності")}" aria-hidden="true"></span>`).join("");
  const red = Array.from({length: pool.challenge}, () => `<span class="ginv-mini-die die-c shape-d12${sizeClass}" title="${tx("Challenge die","Кубик виклику")}" aria-hidden="true"></span>`).join("");
  return `<span class="ginv-difficulty-dice">${purple}${red}</span>`;
}

function difficultyDisplayHTML(value, upgrades = 0) {
  return `<span class="ginv-difficulty-display"><span>${esc(difficultyLabel(value))}</span>${difficultyDiceHTML(value, upgrades)}</span>`;
}

function difficultyTextWithUpgrades(value, upgrades = 0) {
  const pool = applyDifficultyUpgrades(value, upgrades);
  const bits = [];
  if (pool.difficulty) bits.push(`${pool.difficulty} ${tx("Difficulty", "складності")}`);
  if (pool.challenge) bits.push(`${pool.challenge} ${tx("Challenge", "виклику")}`);
  return `${difficultyLabel(value)}${bits.length ? ` · ${bits.join(" + ")}` : ""}`;
}

function gatheringYieldPercent() {
  try {
    const raw = Number(game.settings?.get?.(MODULE_ID, GATHER_YIELD_SETTING) ?? 100);
    return clamp(Number.isFinite(raw) ? raw : 100, 0, 1000);
  } catch (_) {
    return 100;
  }
}

function gatheringYieldPerSuccess(_tier) {
  return Math.max(0, Math.round(GATHERING_BASE_YIELD * gatheringYieldPercent() / 100));
}

function recommendedGatheringDifficulty(tier) {
  return Number(GATHERING_RECOMMENDED_DIFFICULTY[Number(tier)] ?? 2);
}


function itemTypeLabel(type) {
  const labels = {
    gear: tx("Gear", "Спорядження"),
    weapon: tx("Weapon", "Зброя"),
    armor: tx("Armor", "Обладунок"),
    vehicle: tx("Vehicle", "Транспорт")
  };
  return labels[String(type ?? "")] ?? String(type ?? "");
}

function availableCraftFamilies(type = null) {
  let rows = gatheringDomainsForWorld();
  if (type === "vehicle") {
    const preferred = rows.filter(([id]) => ["vehicles", "mechanisms", "nuvarotech"].includes(id));
    if (preferred.length) rows = preferred;
  }
  return rows;
}

function itemTypeAllowed(type) {
  const key = ITEM_TYPE_SETTINGS[String(type ?? "")];
  if (!key) return false;
  try { return game.settings?.get?.(MODULE_ID, key) !== false; } catch (_) { return true; }
}

function domainAllowed(id) {
  try { return game.settings?.get?.(MODULE_ID, `${DOMAIN_SETTING_PREFIX}${id}`) !== false; } catch (_) { return true; }
}

function availableItemTypes() {
  return ["gear", "weapon", "armor", "vehicle"].filter(itemTypeAllowed);
}

function nextModuleLanguage() {
  return configuredModuleLanguage() === "uk" ? "en" : "uk";
}

async function toggleModuleLanguage() {
  const next = nextModuleLanguage();
  await game.settings.set(MODULE_ID, LANGUAGE_SETTING, next);
  return next;
}

function actorComponentStockpile(actor) {
  const stored = actor?.getFlag?.(FLAG_SCOPE, "componentStockpile") ?? {};
  const entries = Array.isArray(stored.entries) ? stored.entries : [];
  return {
    schemaVersion: 1,
    entries: deepClone(entries).slice(0, 200)
  };
}

function stockpileTotals(stockpile) {
  const totals = {tier3: 0, tier5: 0, tier7: 0, total: 0};
  for (const entry of stockpile?.entries ?? []) {
    const tier = Number(entry?.tier);
    const value = Math.max(0, Number(entry?.value ?? 0) || 0);
    if (tier === 3) totals.tier3 += value;
    if (tier === 5) totals.tier5 += value;
    if (tier === 7) totals.tier7 += value;
    totals.total += value;
  }
  return totals;
}

function gatheringEntryLabel(entry) {
  const domain = GATHERING_DOMAINS[entry?.domainId];
  if (entry?.manualLabel) return String(entry.manualLabel);
  if (configuredModuleLanguage() === "en" && entry?.componentTypeEn) return String(entry.componentTypeEn);
  return String(entry?.componentType ?? domainText(domain, "componentType") ?? tx(`Tier ${entry?.tier ?? "?"} components`, `Компоненти Tier ${entry?.tier ?? "?"}`));
}

function stockpileRowsHTML(actor, {limit = 30} = {}) {
  const stockpile = actorComponentStockpile(actor);
  const entries = stockpile.entries.slice().sort((a, b) => Number(b.at ?? 0) - Number(a.at ?? 0)).slice(0, limit);
  if (!entries.length) return `<div class="ginv-sub">${tx("No components recorded yet.", "Компонентів у запасі ще немає.")}</div>`;
  return `<div class="ginv-stockpile-list">${entries.map(entry => {
    const domain = GATHERING_DOMAINS[entry.domainId];
    const source = entry.source === "manual" ? tx("Manual entry", "Ручний запис") : tx("Gathering roll", "Кидок на збір");
    const metaSkill = entry.skillName ? ` · ${esc(entry.skillName)}` : "";
    const uses = entry.note ? `<div class="ginv-help">${esc(entry.note)}</div>` : (domain?.uses ? `<div class="ginv-help">${tx("Suitable for:", "Підходять для:")} ${esc(domainText(domain, "uses"))}</div>` : "");
    return `<div class="ginv-stockpile-row"><div><strong>${esc(gatheringEntryLabel(entry))}</strong><div class="ginv-sub">${esc(domainText(domain, "label") || entry.domainId || tx("Materials","Матеріали"))} · Tier ${integer(entry.tier)}${metaSkill} · ${esc(source)} · ${esc(moduleDate(entry.at))}</div>${uses}</div><div class="ginv-stockpile-value">${currencyAmount(entry.value)}</div></div>`;
  }).join("")}</div>`;
}

async function addStockpileEntryAsGM(actor, entry) {
  const stockpile = actorComponentStockpile(actor);
  stockpile.entries.unshift({
    id: String(entry.id ?? randomId()),
    at: Number(entry.at ?? Date.now()) || Date.now(),
    domainId: String(entry.domainId ?? ""),
    componentType: String(entry.componentType ?? ""),
    tier: [3,5,7].includes(integer(entry.tier)) ? integer(entry.tier) : 3,
    value: Math.max(0, Number(entry.value ?? 0) || 0),
    skillName: String(entry.skillName ?? ""),
    difficulty: Math.max(0, integer(entry.difficulty, 0)),
    successes: Math.max(0, integer(entry.successes, 0)),
    chatMessageId: entry.chatMessageId ?? null,
    chatMessageUuid: entry.chatMessageUuid ?? null,
    userId: entry.userId ?? null,
    source: String(entry.source ?? (entry.chatMessageId ? "gathering" : "manual")),
    manualLabel: String(entry.manualLabel ?? ""),
    componentTypeEn: String(entry.componentTypeEn ?? ""),
    note: String(entry.note ?? "")
  });
  stockpile.entries = stockpile.entries.slice(0, 200);
  await actor.setFlag(FLAG_SCOPE, "componentStockpile", stockpile);
  return stockpile;
}

function storedTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return ["dark", "light", "slate"].includes(value) ? value : "slate";
  } catch (_) {
    return "slate";
  }
}

function storedTextSize() {
  try {
    const value = Number(localStorage.getItem(TEXT_SIZE_KEY) ?? 0);
    return Number.isFinite(value) ? clamp(value, -4, 4) : 0;
  } catch (_) {
    return 0;
  }
}

function nextTheme(theme) {
  const order = ["dark", "light", "slate"];
  return order[(order.indexOf(theme) + 1) % order.length] ?? "slate";
}

function themeButtonLabel(theme) {
  const labels = configuredModuleLanguage() === "uk"
    ? {dark: "☾ Темна тема", light: "☀ Світла тема", slate: "▦ Сланцева тема"}
    : {dark: "☾ Dark Theme", light: "☀ Light Theme", slate: "▦ Slate Theme"};
  return labels[nextTheme(theme)] ?? labels.dark;
}

function savePrefs(theme, textSize) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(TEXT_SIZE_KEY, String(textSize));
  } catch (_) {}
}

function removeRestoreButtons() {
  document.querySelectorAll("[data-ginv-restore]").forEach(node => node.remove());
}

function restoreButtonPalette(theme) {
  if (theme === "dark") {
    return {background: "#5B3B2A", text: "#E5D8CF", border: "#C85A35"};
  }
  if (theme === "light") {
    return {background: "#A68C7B", text: "#24150F", border: "#C85A35"};
  }
  return {background: "#303844", text: "#E6EBF0", border: "#4D8EDB"};
}

function applyShellPreferences(overlay, state) {
  const shell = overlay?.querySelector?.(".ginv-shell");
  if (!shell) return;

  shell.dataset.theme = state.theme;
  shell.style.setProperty("--ginv-text-adjust", `${state.textSize}px`);

  const themeButton = overlay.querySelector("[data-theme-btn]");
  if (themeButton) {
    themeButton.textContent = themeButtonLabel(state.theme);
    themeButton.title = `Current: ${state.theme}. Click to switch theme.`;
  }

  const inc = overlay.querySelector("[data-text-inc]");
  const dec = overlay.querySelector("[data-text-dec]");
  if (inc) inc.disabled = state.textSize >= 4;
  if (dec) dec.disabled = state.textSize <= -4;
}

function captureRenderState(overlay) {
  if (!overlay) return null;
  const active = overlay.contains(document.activeElement) ? document.activeElement : null;
  let focus = null;

  if (active) {
    const dataAttr = [...active.attributes].find(attribute => attribute.name.startsWith("data-"));
    if (dataAttr) {
      focus = {
        tag: active.tagName,
        attr: dataAttr.name,
        value: dataAttr.value,
        selectionStart: typeof active.selectionStart === "number" ? active.selectionStart : null,
        selectionEnd: typeof active.selectionEnd === "number" ? active.selectionEnd : null
      };
    }
  }

  const keyedScroll = {};
  overlay.querySelectorAll("[data-ginv-scroll-key]").forEach(node => {
    keyedScroll[node.dataset.ginvScrollKey] = node.scrollTop;
  });

  return {
    mainScroll: overlay.querySelector(".ginv-main")?.scrollTop ?? 0,
    keyedScroll,
    focus
  };
}

function restoreRenderState(overlay, snapshot) {
  if (!overlay || !snapshot) return;

  if (snapshot.focus) {
    const candidates = [...overlay.querySelectorAll(`[${snapshot.focus.attr}]`)];
    const target = candidates.find(node =>
      node.tagName === snapshot.focus.tag &&
      node.getAttribute(snapshot.focus.attr) === snapshot.focus.value
    );

    if (target) {
      try { target.focus({preventScroll: true}); } catch (_) { try { target.focus(); } catch (_) {} }
      if (snapshot.focus.selectionStart !== null && typeof target.setSelectionRange === "function") {
        try { target.setSelectionRange(snapshot.focus.selectionStart, snapshot.focus.selectionEnd); } catch (_) {}
      }
    }
  }

  const main = overlay.querySelector(".ginv-main");
  if (main) main.scrollTop = snapshot.mainScroll;

  overlay.querySelectorAll("[data-ginv-scroll-key]").forEach(node => {
    const previous = snapshot.keyedScroll?.[node.dataset.ginvScrollKey];
    if (Number.isFinite(previous)) node.scrollTop = previous;
  });
}

function ownerLevel() {
  return CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3;
}

function observerLevel() {
  return CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OBSERVER ?? 2;
}

function isPlayableCharacterActor(actor) {
  if (!actor || actor.type !== "character") return false;
  const name = String(actor.name ?? "").trim();
  // Genesys can expose a utility Character named "(Quick Send To Chat)".
  // It is not a player character and should never appear in invention pickers.
  if (/^\(?quick send to chat\)?$/i.test(name)) return false;
  return true;
}

function isOwnerCharacter(actor, user = game.user) {
  return Boolean(
    isPlayableCharacterActor(actor) &&
    actor.testUserPermission(user, ownerLevel())
  );
}

function isSupportedInventorActor(actor) {
  if (!actor || actor.type === "vehicle") return false;
  const name = String(actor.name ?? "").trim();
  if (/^\(?quick send to chat\)?$/i.test(name)) return false;
  return ["character", "rival", "nemesis", "minion"].includes(String(actor.type ?? ""));
}

function canUseInventorActor(actor, user = game.user) {
  if (!actor || !user) return false;
  if (user.isGM) return isSupportedInventorActor(actor);
  return isOwnerCharacter(actor, user);
}

function hasPlayerOwner(actor) {
  if (!actor) return false;
  return game.users
    .filter(user => !user.isGM)
    .some(user => actor.testUserPermission?.(user, ownerLevel()));
}

function ownerCharacters(user = game.user) {
  const controlledActorIds = new Set(
    (canvas?.tokens?.controlled ?? [])
      .map(token => token.actor?.id)
      .filter(Boolean)
  );

  return game.actors
    .filter(actor => isOwnerCharacter(actor, user))
    .sort((a, b) => {
      const aControlled = controlledActorIds.has(a.id) ? 1 : 0;
      const bControlled = controlledActorIds.has(b.id) ? 1 : 0;
      return bControlled - aControlled || a.name.localeCompare(b.name);
    });
}

function playerInventorActors() {
  if (!game.user?.isGM) return ownerCharacters(game.user);
  return game.actors
    .filter(actor => isPlayableCharacterActor(actor) && hasPlayerOwner(actor))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function gmNpcInventorActors() {
  if (!game.user?.isGM) return [];
  return game.actors
    .filter(actor => isSupportedInventorActor(actor) && !hasPlayerOwner(actor))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function canViewDocument(document, user = game.user) {
  if (!document) return false;
  if (typeof document.testUserPermission !== "function") return true;
  return document.testUserPermission(user, observerLevel());
}

function activePrimaryGM() {
  return game.users
    .filter(user => user.active && user.isGM)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))[0] ?? null;
}

function isPrimaryActiveGM() {
  return Boolean(game.user?.isGM && activePrimaryGM()?.id === game.user.id);
}

function cleanDocumentData(docOrData) {
  const data = typeof docOrData?.toObject === "function" ? docOrData.toObject() : deepClone(docOrData ?? {});
  delete data._id;
  delete data.folder;
  delete data.sort;
  delete data._stats;
  delete data.ownership;
  return data;
}

async function loadPackDocuments(collection) {
  const pack = game.packs.get(collection);
  if (!pack) return [];
  try {
    return await pack.getDocuments();
  } catch (error) {
    console.warn(`Genesys Inventions | Could not load ${collection}`, error);
    return [];
  }
}

function findWorldCompendium(config) {
  return game.packs.get(config.collection) ?? Array.from(game.packs).find(pack =>
    pack.collection === config.collection ||
    (
      pack.documentName === config.type &&
      String(pack.metadata?.packageName ?? pack.metadata?.package ?? "") === "world" &&
      (String(pack.metadata?.name ?? "") === config.name || String(pack.metadata?.label ?? "") === config.label)
    )
  ) ?? null;
}

async function ensureWorldCompendium(config) {
  let pack = findWorldCompendium(config);
  if (pack) return pack;
  if (!game.user?.isGM) throw new Error(`Only the GM can create the ${config.label} Compendium.`);
  const CompendiumAPI = globalThis.CompendiumCollection;
  if (typeof CompendiumAPI?.createCompendium !== "function") {
    throw new Error("Foundry's Compendium creation API is unavailable.");
  }
  pack = await CompendiumAPI.createCompendium({
    name: config.name,
    label: config.label,
    type: config.type,
    package: "world",
    system: game.system?.id ?? "genesys"
  });
  return pack;
}

async function ensureInventionCompendia() {
  if (!game.user?.isGM) return;
  await ensureWorldCompendium(CREATED_ITEM_PACK);
  await ensureWorldCompendium(CREATED_VEHICLE_PACK);
}

async function archiveInventionDocument(document, config) {
  if (!document) throw new Error("No finished document was provided for Compendium archiving.");
  const pack = await ensureWorldCompendium(config);
  const wasLocked = Boolean(pack.locked);
  if (wasLocked) {
    if (typeof pack.configure !== "function") throw new Error(`${config.label} is locked. Unlock it before completing the invention.`);
    await pack.configure({locked: false});
  }
  try {
    if (typeof pack.importDocument === "function") {
      const imported = await pack.importDocument(document);
      if (!imported) throw new Error(`Foundry did not return the archived ${config.type}.`);
      return {document: imported, pack};
    }
    const data = cleanDocumentData(document);
    const DocumentClass = document.constructor;
    const imported = await DocumentClass.create(data, {pack: pack.collection, renderSheet: false});
    if (!imported) throw new Error(`Could not create the archived ${config.type}.`);
    return {document: imported, pack};
  } finally {
    if (wasLocked && typeof pack.configure === "function") {
      try { await pack.configure({locked: true}); } catch (error) { console.warn(`Genesys Inventions | Could not restore lock on ${config.label}`, error); }
    }
  }
}

async function rollbackFinishedDocument(document) {
  if (!document) return;
  try {
    if (document.parent?.deleteEmbeddedDocuments) await document.parent.deleteEmbeddedDocuments(document.documentName, [document.id]);
    else await document.delete();
  } catch (error) {
    console.error("Genesys Inventions | Could not roll back a finished document after Compendium archiving failed.", error);
  }
}

async function ensureProjectFolder() {
  let folder = game.folders.find(f => f.type === "JournalEntry" && f.name === PROJECT_FOLDER && !f.folder);
  if (!folder) {
    folder = await Folder.create({
      name: PROJECT_FOLDER,
      type: "JournalEntry",
      color: "#4D8EDB"
    });
  }
  return folder;
}

function projectFromJournal(journal) {
  const project = journal?.getFlag?.(FLAG_SCOPE, "project");
  if (!project) return null;
  return deepClone(project);
}

function projectJournals() {
  return game.journal
    .filter(journal => Boolean(journal.getFlag?.(FLAG_SCOPE, "project")))
    .sort((a, b) => {
      const ap = projectFromJournal(a);
      const bp = projectFromJournal(b);
      return Number(bp?.updatedAt ?? 0) - Number(ap?.updatedAt ?? 0);
    });
}

function projectsForActor(actorId) {
  return projectJournals().filter(journal => projectFromJournal(journal)?.actorId === actorId);
}

function addLog(project, type, text, userId = game.user?.id) {
  project.log ??= [];
  project.log.unshift({
    id: randomId(),
    at: Date.now(),
    userId: userId ?? null,
    type,
    text: String(text ?? "")
  });
  project.log = project.log.slice(0, 80);
  project.updatedAt = Date.now();
}

function baseComponentCosts(totalCost, rarity) {
  const r = clamp(integer(rarity), 0, 10);
  const [t3, t5, t7] = COMPONENT_PERCENTAGES[r] ?? COMPONENT_PERCENTAGES[0];
  const total = Math.max(0, Number(totalCost ?? 0));
  return {
    tier3: total * t3 / 100,
    tier5: total * t5 / 100,
    tier7: total * t7 / 100,
    percentages: {tier3: t3, tier5: t5, tier7: t7}
  };
}

function allSuccessfulSchematicEntries(project) {
  return (project?.schematic?.entries ?? []).filter(entry => entry?.success);
}

function spendCount(project, id) {
  return allSuccessfulSchematicEntries(project).reduce((sum, entry) => sum + integer(entry?.spends?.[id], 0), 0);
}

function onceGroupUsed(project, group) {
  const ids = [...POSITIVE_SPENDS, ...NEGATIVE_SPENDS]
    .filter(option => option.onceGroup === group || (option.once && option.id === group))
    .map(option => option.id);
  if (!ids.length) ids.push(group);
  return ids.some(id => spendCount(project, id) > 0);
}

function schematicEffects(project) {
  const level = Math.max(0, ...allSuccessfulSchematicEntries(project).map(entry => integer(entry.level)));
  const counts = {};
  for (const option of [...POSITIVE_SPENDS, ...NEGATIVE_SPENDS]) counts[option.id] = spendCount(project, option.id);
  const timePct = 25 * ((counts.timeUp ?? 0) - (counts.timeDown ?? 0));
  const tier3Pct = 10 * ((counts.tier3Up ?? 0) - (counts.tier3Down ?? 0));
  const tier5Pct = 10 * ((counts.tier5Up ?? 0) - (counts.tier5Down ?? 0));
  const tier7Pct = 10 * ((counts.tier7Up ?? 0) - (counts.tier7Down ?? 0));
  const hardPointsDelta =
    (counts.hardPointUpA || counts.hardPointUpT ? 1 : 0) -
    (counts.hardPointDownT || counts.hardPointDownD ? 1 : 0);

  return {
    level,
    difficultyReduction: level,
    timePct,
    tier3Pct,
    tier5Pct,
    tier7Pct,
    hardPointsDelta,
    variantUnlocked: (counts.variant ?? 0) > 0,
    autoSuccess: counts.autoSuccess ?? 0,
    autoAdvantage: counts.autoAdvantage ?? 0,
    autoThreat: counts.autoThreat ?? 0
  };
}

function baseObjectContribution(project) {
  const source = project?.concept?.baseSource;
  if (!source?.useAsComponent) return {tier3:0, tier5:0, tier7:0, percentages:[0,0,0], total:0};
  const rarity = clamp(integer(source.rarity), 0, 10);
  const price = Math.max(0, Number(source.price ?? 0));
  const pct = DECONSTRUCTION_PERCENTAGES[rarity] ?? DECONSTRUCTION_PERCENTAGES[10];
  return {
    tier3: price * pct[0] / 100,
    tier5: price * pct[1] / 100,
    tier7: price * pct[2] / 100,
    percentages: pct,
    total: price
  };
}

function currentComponents(project) {
  const rules = project?.approval?.rules ?? {};
  const base = baseComponentCosts(rules.totalCost, rules.rarity);
  const contribution = baseObjectContribution(project);
  const fx = schematicEffects(project);
  const remaining = {
    tier3: Math.max(0, base.tier3 - contribution.tier3),
    tier5: Math.max(0, base.tier5 - contribution.tier5),
    tier7: Math.max(0, base.tier7 - contribution.tier7)
  };
  const adjust = (value, pct) => Math.max(0, value * Math.max(0, 1 + pct / 100));
  return {
    tier3: adjust(remaining.tier3, fx.tier3Pct),
    tier5: adjust(remaining.tier5, fx.tier5Pct),
    tier7: adjust(remaining.tier7, fx.tier7Pct),
    percentages: base.percentages,
    contribution,
    modifiers: {tier3Pct: fx.tier3Pct, tier5Pct: fx.tier5Pct, tier7Pct: fx.tier7Pct}
  };
}

function currentCraftingHours(project) {
  const base = Math.max(0, Number(project?.approval?.rules?.craftingHours ?? 0));
  const pct = schematicEffects(project).timePct;
  return Math.max(0, base * Math.max(0, 1 + pct / 100));
}

function currentCraftingDifficulty(project) {
  const base = integer(project?.approval?.rules?.craftingDifficulty, 0);
  return Math.max(0, base - schematicEffects(project).difficultyReduction);
}


function currentCraftingUpgrades(project) {
  return Math.max(0, integer(project?.approval?.rules?.craftingUpgrades, 0));
}

function itemStatSummary(itemData) {
  if (!itemData) return tx("No item profile.", "Профіль предмета відсутній.");
  const s = itemData.system ?? {};
  if (itemData.type === "vehicle") {
    return `${tx("Vehicle", "Транспорт")} · ${tx("Sil", "Сил")} ${s.silhouette ?? 2} · ${tx("Speed", "Швидкість")} ${s.maxSpeed ?? 1} · ${tx("Handling", "Керованість")} ${Number(s.handling ?? 0) >= 0 ? "+" : ""}${s.handling ?? 0} · ${tx("Armor", "Броня")} ${s.armor ?? 0} · HT ${s.hullTrauma ?? 1} · SS ${s.systemStrain ?? 1}`;
  }
  if (itemData.type === "weapon") {
    const qualities = (s.qualities ?? []).map(q => `${q.name}${q.isRated ? ` ${q.rating ?? 1}` : ""}`).join(", ");
    return `${tx("Damage", "Шкода")} ${s.baseDamage ?? 0} · ${tx("Crit", "Крит")} ${s.critical ?? 0} · ${tx("Range", "Дистанція")} ${s.range ?? "-"} · ENC ${s.encumbrance ?? 0}${qualities ? ` · ${qualities}` : ""}`;
  }
  if (itemData.type === "armor") {
    const qualities = (s.qualities ?? []).map(q => `${q.name}${q.isRated ? ` ${q.rating ?? 1}` : ""}`).join(", ");
    return `${tx("Soak", "Поглинання")} ${s.soak ?? 0} · ${tx("Defense", "Захист")} ${s.defense ?? 0} · ENC ${s.encumbrance ?? 0}${qualities ? ` · ${qualities}` : ""}`;
  }
  const kind = itemData.flags?.[FLAG_SCOPE]?.discipline === "nuvarotech" ? tx("Nuvarotech Gear", "Нуваротехнічне спорядження") : tx("Gear", "Спорядження");
  return `${kind} · ENC ${s.encumbrance ?? 0} · ${tx("Price", "Ціна")} ${money(s.price ?? 0)} · ${tx("Rarity", "Рідкість")} ${s.rarity ?? 0}`;
}

function userName(userId) {
  return game.users.get(userId)?.name ?? tx("Unknown User", "Невідомий користувач");
}

function statusLabel(status) {
  const en = {pending:"Pending GM Approval",approved:"Approved",building:"In Development",ready:"Ready for Final Crafting",rejected:"Rejected",completed:"Completed"};
  const uk = {pending:"Очікує схвалення GM",approved:"Схвалено",building:"У розробці",ready:"Готово до фінального крафту",rejected:"Відхилено",completed:"Завершено"};
  return (configuredModuleLanguage() === "uk" ? uk : en)[status] ?? status ?? tx("Unknown","Невідомо");
}

function journalProjectHTML(project) {
  const fx = schematicEffects(project);
  const components = currentComponents(project);
  const acquired = project.components?.acquired ?? {tier3: 0, tier5: 0, tier7: 0};
  const approved = project.approval?.item;
  const rules = project.approval?.rules;
  const rows = (project.schematic?.entries ?? []).map(entry => {
    const spends = Object.entries(entry.spends ?? {})
      .filter(([, qty]) => Number(qty) > 0)
      .map(([id, qty]) => {
        const option = [...POSITIVE_SPENDS, ...NEGATIVE_SPENDS].find(x => x.id === id);
        return `${spendLabel(option) || id}${Number(qty) > 1 ? ` ×${qty}` : ""}`;
      }).join("; ");
    return `<tr><td>${entry.level ? `${tx("Level", "Рівень")} ${entry.level}` : tx("Attempt", "Спроба")}</td><td>${entry.success ? tx("Success", "Успіх") : tx("Failed", "Провал")}</td><td>${esc(spends || tx("None", "Немає"))}</td></tr>`;
  }).join("");

  const rollRows = (project.rolls ?? []).slice(0, 30).map(row =>
    `<tr><td>${esc(row.label || row.skill || tx("Project Check", "Перевірка проєкту"))}</td><td>${esc(row.skill || tx("Skill", "Навичка"))}</td><td>${difficultyDisplayHTML(row.difficulty ?? 0, row.upgrades ?? 0)}</td><td>${esc(moduleDate(row.at))}</td><td>${esc(row.summary || tx("Result posted to chat", "Результат опубліковано в чаті"))}</td></tr>`
  ).join("");

  const log = (project.log ?? []).slice(0, 20).map(row =>
    `<li><strong>${esc(moduleDate(row.at))}</strong> · ${esc(userName(row.userId))}: ${esc(row.text)}</li>`
  ).join("");

  return `
    <div class="genesys-invention-journal">
      <h1>${esc(project.concept?.name ?? tx("Unnamed Invention", "Безіменний винахід"))}</h1>
      ${project.concept?.subtitle ? `<p><em>${esc(project.concept.subtitle)}</em></p>` : ""}
      <p><strong>${tx("Status:", "Статус:")}</strong> ${esc(statusLabel(project.status))}</p>
      <p><strong>${tx("Inventor:", "Винахідник:")}</strong> ${esc(game.actors.get(project.actorId)?.name ?? tx("Unknown Character", "Невідомий персонаж"))}</p>
      <h2>${tx("Concept", "Концепція")}</h2>
      <p>${esc(project.concept?.description ?? tx("No description.", "Опис відсутній.")).replace(/\n/g, "<br>")}</p>
      <p><strong>${tx("Crafting family:", "Група крафту:")}</strong> ${esc(domainText(GATHERING_DOMAINS[project.concept?.craftFamily], "label") || tx("Not specified", "Не вказано"))}</p>
      <p><strong>${tx("Proposed Profile:", "Запропонований профіль:")}</strong> ${esc(itemStatSummary(project.proposedItem))}</p>
      ${approved ? `<h2>${tx("Approved Design", "Схвалена конструкція")}</h2><p><strong>${esc(approved.name)}</strong> · ${esc(itemStatSummary(approved))}</p>` : ""}
      ${rules ? `
        <p><strong>${tx("Crafting:","Крафт:")}</strong> ${esc(rules.craftingSkill || tx("GM has not set a skill","GM не визначив навичку"))} · ${difficultyDisplayHTML(rules.craftingDifficulty, currentCraftingUpgrades(project))} → <strong>${difficultyDisplayHTML(currentCraftingDifficulty(project), currentCraftingUpgrades(project))}</strong> ${tx("with current schematic","з поточним кресленням")} · ${money(currentCraftingHours(project))} ${tx("hours","год")}</p>
        <p><strong>${tx("Schematic Skill:", "Навичка креслення:")}</strong> ${esc(rules.schematicSkill || projectSchematicSkill(project, game.actors.get(project.actorId)))}</p>
        <p><strong>${tx("Rarity:", "Рідкість:")}</strong> ${rules.rarity} · <strong>${tx("Total Component Cost:", "Загальна вартість компонентів:")}</strong> ${currencyAmount(rules.totalCost)}</p>
      ` : ""}
      ${approved ? `
        <h2>${tx("Required Components", "Необхідні компоненти")}</h2>
        <table>
          <thead><tr><th>Tier</th><th>${tx("Required", "Потрібно")}</th><th>${tx("Acquired", "Наявно в проєкті")}</th></tr></thead>
          <tbody>
            <tr><td>Tier 3</td><td>${currencyAmount(components.tier3)}</td><td>${currencyAmount(acquired.tier3)}</td></tr>
            <tr><td>Tier 5</td><td>${currencyAmount(components.tier5)}</td><td>${currencyAmount(acquired.tier5)}</td></tr>
            <tr><td>Tier 7</td><td>${currencyAmount(components.tier7)}</td><td>${currencyAmount(acquired.tier7)}</td></tr>
          </tbody>
        </table>
        <p><small>${tx("Component modifiers from schematics:", "Модифікатори компонентів від креслень:")} T3 ${fx.tier3Pct >= 0 ? "+" : ""}${fx.tier3Pct}%, T5 ${fx.tier5Pct >= 0 ? "+" : ""}${fx.tier5Pct}%, T7 ${fx.tier7Pct >= 0 ? "+" : ""}${fx.tier7Pct}%.</small></p>
        <h2>${tx("Schematic", "Креслення")}</h2>
        <p><strong>${tx("Current Level:", "Поточний рівень:")}</strong> ${fx.level} · ${tx("Difficulty reduction", "Зниження складності")} ${fx.difficultyReduction} · ${tx("Time modifier", "Модифікатор часу")} ${fx.timePct >= 0 ? "+" : ""}${fx.timePct}% · Hard Points ${fx.hardPointsDelta >= 0 ? "+" : ""}${fx.hardPointsDelta}</p>
        <p><strong>${tx("Automatic final crafting symbols:", "Автоматичні символи фінального крафту:")}</strong> ${tx("Success", "Успіх")} ${fx.autoSuccess}, ${tx("Advantage", "Перевага")} ${fx.autoAdvantage}, ${tx("Threat", "Загроза")} ${fx.autoThreat}</p>
        <table><thead><tr><th>${tx("Design", "Креслення")}</th><th>${tx("Result", "Результат")}</th><th>${tx("Spending", "Витрати символів")}</th></tr></thead><tbody>${rows || `<tr><td colspan="3">${tx("No schematic checks recorded.", "Перевірок креслення ще не записано.")}</td></tr>`}</tbody></table>
      ` : ""}
      ${approved ? `<h2>${tx("Project Rolls", "Кидки проєкту")}</h2><table><thead><tr><th>${tx("Check", "Перевірка")}</th><th>${tx("Skill", "Навичка")}</th><th>${tx("Difficulty", "Складність")}</th><th>${tx("When", "Коли")}</th><th>${tx("Result", "Результат")}</th></tr></thead><tbody>${rollRows || `<tr><td colspan="5">${tx("No project rolls recorded.", "Кидків проєкту ще не записано.")}</td></tr>`}</tbody></table>` : ""}
      <h2>${tx("Project Log", "Журнал проєкту")}</h2>
      <ul>${log || `<li>${tx("No log entries.", "Записів поки немає.")}</li>`}</ul>
    </div>
  `;
}

async function ensureJournalPage(journal, project) {
  let page = journal.pages?.contents?.find(p => p.getFlag?.(FLAG_SCOPE, "projectPage")) ?? journal.pages?.contents?.[0] ?? null;
  const content = journalProjectHTML(project);
  if (!page) {
    const created = await journal.createEmbeddedDocuments("JournalEntryPage", [{
      name: tx("Invention Project", "Проєкт винаходу"),
      type: "text",
      text: {format: CONST?.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1, content},
      flags: {[FLAG_SCOPE]: {projectPage: true}}
    }]);
    page = created?.[0] ?? null;
  } else {
    await page.update({
      name: tx("Invention Project", "Проєкт винаходу"),
      "text.format": CONST?.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1,
      "text.content": content,
      [`flags.${FLAG_SCOPE}.projectPage`]: true
    });
  }
  return page;
}

async function saveProject(journal, project, {updatePage = true} = {}) {
  project.updatedAt = Date.now();
  if (!game.user?.isGM) {
    await requestGM("saveProject", {journalId: journal.id, project: deepClone(project), updatePage});
    return project;
  }
  await journal.setFlag(FLAG_SCOPE, "project", project);
  if (updatePage) await ensureJournalPage(journal, project);
  return project;
}

async function migrateProjectJournalPermissions() {
  if (!game.user?.isGM) return;
  for (const journal of projectJournals()) {
    const project = projectFromJournal(journal);
    const userId = project?.creatorUserId;
    if (!userId) continue;
    const current = Number(journal.ownership?.[userId] ?? 0);
    if (current > observerLevel()) {
      try { await journal.update({[`ownership.${userId}`]: observerLevel()}); }
      catch (error) { console.warn("Genesys Inventions | Could not lock Project Journal", journal.name, error); }
    }
  }
}

function sanitizeSubmittedProject(raw, creatorUserId, actorId) {
  const proposed = deepClone(raw?.proposedItem ?? {});
  proposed.name = String(proposed.name ?? raw?.concept?.name ?? "Unnamed Invention").slice(0, 160);
  proposed.type = ["weapon", "armor", "gear", "vehicle"].includes(proposed.type) ? proposed.type : "gear";
  proposed.img = String(proposed.img ?? "icons/svg/item-bag.svg");
  proposed.system = deepClone(proposed.system ?? {});
  proposed.system.rarity = clamp(integer(proposed.system.rarity), 0, 10);
  proposed.system.price = Math.max(0, integer(proposed.system.price));
  proposed.system.encumbrance = Math.max(0, integer(proposed.system.encumbrance));

  return {
    schemaVersion: 1,
    moduleVersion: MODULE_VERSION,
    creatorUserId,
    actorId,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    concept: {
      name: String(raw?.concept?.name ?? proposed.name).slice(0, 160),
      subtitle: String(raw?.concept?.subtitle ?? "").slice(0, 240),
      description: String(raw?.concept?.description ?? "").slice(0, 12000),
      mode: raw?.concept?.mode === "base" ? "base" : "scratch",
      craftFamily: domainAllowed(String(raw?.concept?.craftFamily ?? "")) ? String(raw.concept.craftFamily) : "",
      baseSource: raw?.concept?.baseSource ? {
        uuid: String(raw.concept.baseSource.uuid ?? "").slice(0, 300),
        name: String(raw.concept.baseSource.name ?? "").slice(0, 160),
        origin: String(raw.concept.baseSource.origin ?? "").slice(0, 80),
        type: String(raw.concept.baseSource.type ?? "gear").slice(0, 40),
        rarity: clamp(integer(raw.concept.baseSource.rarity), 0, 10),
        price: Math.max(0, integer(raw.concept.baseSource.price)),
        useAsComponent: Boolean(raw.concept.baseSource.useAsComponent),
        actorItemId: String(raw.concept.baseSource.actorItemId ?? "").slice(0, 80)
      } : null
    },
    proposedItem: proposed,
    approval: null,
    components: {acquired: {tier3: 0, tier5: 0, tier7: 0}},
    schematic: {entries: []},
    completion: null,
    rejection: null,
    rolls: [],
    log: []
  };
}

async function createProjectAsGM(payload) {
  const user = game.users.get(payload.userId);
  const actor = game.actors.get(payload.actorId);
  if (!user || !actor) throw new Error("User or character no longer exists.");
  if (!canUseInventorActor(actor, user)) {
    throw new Error(user.isGM ? "That Actor cannot be used as an inventor." : "The requesting user does not own that Character.");
  }

  const project = sanitizeSubmittedProject(payload.project, user.id, actor.id);
  const proposedType = String(project.proposedItem?.type ?? "");
  if (!itemTypeAllowed(proposedType)) throw new Error(tx("That invention object type is disabled in Module Settings.", "Цей тип об’єкта вимкнено в налаштуваннях модуля."));
  const craftFamily = String(project.concept?.craftFamily ?? "");
  if (craftFamily && (!GATHERING_DOMAINS[craftFamily] || !domainAllowed(craftFamily))) throw new Error(tx("That crafting family is disabled in Module Settings.", "Цю групу крафту вимкнено в налаштуваннях модуля."));
  addLog(project, "submitted", tx("Project submitted for GM approval.", "Проєкт надіслано GM на схвалення."), user.id);
  const folder = await ensureProjectFolder();
  const journal = await JournalEntry.create({
    name: `Invention · ${project.concept.name}`,
    folder: folder.id,
    ownership: {default: 0, [user.id]: observerLevel()},
    flags: {[FLAG_SCOPE]: {project}}
  }, {renderSheet: false});
  await ensureJournalPage(journal, project);
  return {journalId: journal.id, projectName: project.concept.name};
}

function mergePlayerProjectUpdate(stored, incoming, userId) {
  const next = deepClone(stored);

  // Players never supply authoritative project history. The GM-side socket
  // reconstructs allowed changes and writes log entries itself.
  next.log = deepClone(stored.log ?? []);
  next.rolls = deepClone(stored.rolls ?? []);
  next.approval = deepClone(stored.approval ?? null);
  next.completion = deepClone(stored.completion ?? null);
  next.rejection = deepClone(stored.rejection ?? null);
  next.concept = deepClone(stored.concept ?? {});
  next.proposedItem = deepClone(stored.proposedItem ?? {});

  // Component ledger is player-editable through the module UI.
  const oldAcquired = stored.components?.acquired ?? {tier3: 0, tier5: 0, tier7: 0};
  const requestedAcquired = incoming.components?.acquired ?? oldAcquired;
  const newAcquired = {
    tier3: Math.max(0, Number(requestedAcquired.tier3) || 0),
    tier5: Math.max(0, Number(requestedAcquired.tier5) || 0),
    tier7: Math.max(0, Number(requestedAcquired.tier7) || 0)
  };
  next.components ??= {};
  next.components.acquired = newAcquired;
  if (["tier3", "tier5", "tier7"].some(key => Number(oldAcquired[key] ?? 0) !== Number(newAcquired[key] ?? 0))) {
    addLog(next, "components", "Component ledger updated.", userId);
  }

  // Existing schematic history is immutable. Players may only append the next
  // attempt through the recorder UI; they cannot rewrite or delete old entries.
  const oldEntries = deepClone(stored.schematic?.entries ?? []);
  const requestedEntries = deepClone(incoming.schematic?.entries ?? oldEntries);
  if (requestedEntries.length < oldEntries.length) throw new Error("Existing Schematic history cannot be removed.");
  for (let i = 0; i < oldEntries.length; i++) {
    if (JSON.stringify(requestedEntries[i]) !== JSON.stringify(oldEntries[i])) {
      throw new Error("Existing Schematic history cannot be edited.");
    }
  }
  next.schematic ??= {entries: []};
  next.schematic.entries = oldEntries;
  for (const rawEntry of requestedEntries.slice(oldEntries.length)) {
    if (next.schematic.entries.length >= 30) throw new Error("Too many Schematic history entries.");
    const expectedLevel = schematicEffects(next).level + 1;
    if (expectedLevel > 4) throw new Error("This project already has a Level 4 Schematic.");
    const pending = deepClone(next.schematic.pending ?? null);
    if (!pending) throw new Error("A Schematic result can only be resolved from a recorded Schematic roll.");
    if (integer(pending.level) !== expectedLevel) throw new Error("Pending Schematic level does not match project progression.");
    const entry = deepClone(rawEntry ?? {});
    if (String(entry.chatMessageId ?? "") !== String(pending.chatMessageId ?? "")) throw new Error("Schematic result must match the recorded chat roll.");
    entry.id = String(entry.id || randomId());
    entry.at = Number(pending.at) || Date.now();
    entry.userId = userId;
    entry.success = Boolean(pending.success);
    entry.result = deepClone(pending.result ?? {});
    if (!entry.success) entry.spends = {};
    if (entry.success) {
      const spendingState = {spends: deepClone(entry.spends ?? {})};
      const pos = spendBudget(spendingState, "positive");
      const neg = spendBudget(spendingState, "negative");
      if (pos.advantage > Number(pending.result?.advantage ?? 0) || pos.triumph > Number(pending.result?.triumph ?? 0) || neg.threat > Number(pending.result?.threat ?? 0) || neg.despair > Number(pending.result?.despair ?? 0)) {
        throw new Error("Schematic spending exceeds the symbols on the recorded roll.");
      }
      for (const option of [...POSITIVE_SPENDS, ...NEGATIVE_SPENDS]) {
        const qty = integer(entry.spends?.[option.id]);
        if ((option.once || option.onceGroup) && qty > 1) throw new Error(`${option.label} can only be applied once.`);
        if (spendOptionDisabled(next, option) && qty > 0) throw new Error(`${option.label} was already used on this project.`);
      }
      entry.level = expectedLevel;
      entry.attemptedLevel = undefined;
      next.schematic.entries.push(entry);
      if (["approved", "building"].includes(next.status)) next.status = "building";
      addLog(next, "schematic", `Level ${expectedLevel} Schematic completed from the recorded roll.`, userId);
    } else {
      entry.level = 0;
      entry.attemptedLevel = expectedLevel;
      next.schematic.entries.push(entry);
      addLog(next, "schematic-failed", `Level ${expectedLevel} Schematic attempt failed.`, userId);
    }
    next.schematic.pending = null;
  }

  // The only player-controlled workflow transition is requesting final craft.
  if (incoming.status === "ready" && ["approved", "building", "ready"].includes(next.status)) {
    const required = currentComponents(next);
    const acquired = next.components?.acquired ?? {};
    const enough = Number(acquired.tier3 ?? 0) >= Number(required.tier3 ?? 0)
      && Number(acquired.tier5 ?? 0) >= Number(required.tier5 ?? 0)
      && Number(acquired.tier7 ?? 0) >= Number(required.tier7 ?? 0);
    if (!enough) throw new Error("Required components must be acquired before requesting final crafting.");
    if (next.status !== "ready") {
      next.status = "ready";
      addLog(next, "ready", "Final crafting requested.", userId);
    }
  }

  next.updatedAt = Date.now();
  return next;
}

async function handleGMRequest(payload) {
  if (!isPrimaryActiveGM()) return;
  const response = {
    type: "response",
    requestId: payload.requestId,
    targetUserId: payload.userId,
    ok: false,
    result: null,
    error: null
  };
  try {
    if (payload.action === "createProject") {
      response.result = await createProjectAsGM(payload);
      response.ok = true;
    } else if (payload.action === "saveProject") {
      const journal = game.journal.get(payload.journalId);
      const stored = projectFromJournal(journal);
      const incoming = deepClone(payload.project);
      const user = game.users.get(payload.userId);
      const actor = game.actors.get(stored?.actorId);
      if (!journal || !stored || !incoming || !user || !actor) throw new Error("Project update target no longer exists.");
      if (incoming.actorId !== stored.actorId || incoming.id !== stored.id) throw new Error("Project identity mismatch.");
      if (!canUseInventorActor(actor, user)) throw new Error("You cannot use the inventor Actor.");
      const authoritative = user.isGM ? incoming : mergePlayerProjectUpdate(stored, incoming, user.id);
      await journal.setFlag(FLAG_SCOPE, "project", authoritative);
      if (payload.updatePage !== false) await ensureJournalPage(journal, authoritative);
      response.result = {journalId: journal.id, updatedAt: authoritative.updatedAt};
      response.ok = true;
    } else if (payload.action === "appendRollLog") {
      const journal = game.journal.get(payload.journalId);
      const project = projectFromJournal(journal);
      const user = game.users.get(payload.userId);
      const actor = game.actors.get(project?.actorId);
      if (!journal || !project || !user || !actor) throw new Error("Crafting project no longer exists.");
      if (!canUseInventorActor(actor, user)) throw new Error("You cannot use the inventor Actor.");
      project.rolls ??= [];
      const entry = deepClone(payload.roll);
      const chatMessage = entry?.chatMessageId ? game.messages?.get(entry.chatMessageId) : null;
      const chatUserId = chatMessage?.user?.id ?? chatMessage?.user ?? chatMessage?.author?.id;
      if (!chatMessage || String(chatUserId) !== String(payload.userId) || !(chatMessage.rolls?.length || chatMessage.roll)) {
        throw new Error("Project roll log entries must reference an actual roll made by the requesting user.");
      }
      entry.id ??= randomId();
      entry.at = Number(chatMessage.timestamp ?? entry.at) || Date.now();
      entry.userId = payload.userId;
      entry.chatMessageUuid = chatMessage.uuid ?? entry.chatMessageUuid ?? null;
      entry.summary = chatMessageSummary(chatMessage);
      project.rolls.unshift(entry);
      project.rolls = project.rolls.slice(0, 50);
      addLog(project, "roll", `${entry.label || entry.skill || tx("Project check", "Перевірка проєкту")} · ${difficultyLabel(entry.difficulty ?? 0)}${entry.summary ? ` · ${entry.summary}` : ""}.`, payload.userId);
      let schematicResolution = null;
      if (entry.kind === "schematic") {
        schematicResolution = registerSchematicRollOnProject(project, chatMessage, entry, payload.userId);
      }
      await journal.setFlag(FLAG_SCOPE, "project", project);
      await ensureJournalPage(journal, project);
      response.result = {journalId: journal.id, rollId: entry.id, schematicResolution};
      response.ok = true;
    } else if (payload.action === "addGatheredComponents") {
      const user = game.users.get(payload.userId);
      const actor = game.actors.get(payload.actorId);
      const chatMessage = game.messages?.get(payload.chatMessageId);
      if (!user || !actor || !chatMessage) throw new Error("Gathering result no longer exists.");
      if (!canUseInventorActor(actor, user)) throw new Error("You cannot gather components with that Actor.");
      const chatUserId = chatMessage?.user?.id ?? chatMessage?.user ?? chatMessage?.author?.id;
      if (String(chatUserId) !== String(payload.userId)) throw new Error("Gathering entries must reference your own roll.");
      const meta = chatMessage.getFlag?.(FLAG_SCOPE, "gatheringRoll") ?? {};
      if (String(meta.actorId ?? "") !== String(actor.id)) throw new Error("Gathering Actor mismatch.");
      const tier = [3,5,7].includes(integer(meta.tier)) ? integer(meta.tier) : 3;
      const roll = primaryMessageRoll(chatMessage);
      if (!roll) throw new Error("Gathering chat message has no Genesys roll.");
      const net = netNarrativeResult(genesysRollSymbols(roll));
      const value = Math.max(0, net.success * gatheringYieldPerSuccess(tier));
      if (value <= 0) {
        response.result = {actorId: actor.id, value: 0, successes: net.success};
        response.ok = true;
      } else {
        const domain = GATHERING_DOMAINS[meta.domainId] ?? GATHERING_DOMAINS.smithing;
        await addStockpileEntryAsGM(actor, {
          domainId: meta.domainId, componentType: domain.componentType, componentTypeEn: domain.componentTypeEn, tier, value, skillName: meta.skillName,
          difficulty: meta.difficulty, successes: net.success, chatMessageId: chatMessage.id, chatMessageUuid: chatMessage.uuid,
          userId: payload.userId, at: Number(chatMessage.timestamp) || Date.now(), source: "gathering"
        });
        response.result = {actorId: actor.id, value, successes: net.success, tier};
        response.ok = true;
      }
    } else if (payload.action === "addManualComponents") {
      const user = game.users.get(payload.userId);
      const actor = game.actors.get(payload.actorId);
      if (!user || !actor) throw new Error("Manual component target no longer exists.");
      if (!canUseInventorActor(actor, user)) throw new Error("You cannot add components to that Actor.");
      const tier = [3,5,7].includes(integer(payload.tier)) ? integer(payload.tier) : 3;
      const value = Math.max(0, Number(payload.value ?? 0) || 0);
      if (value <= 0) throw new Error("Component value must be greater than zero.");
      const domainId = String(payload.domainId ?? "");
      const domain = GATHERING_DOMAINS[domainId] ?? null;
      await addStockpileEntryAsGM(actor, {
        domainId,
        componentType: String(payload.componentType ?? domain?.componentType ?? ""),
        componentTypeEn: String(payload.componentTypeEn ?? domain?.componentTypeEn ?? ""),
        tier,
        value,
        userId: payload.userId,
        at: Date.now(),
        source: "manual",
        manualLabel: String(payload.label ?? "").slice(0, 160),
        note: String(payload.note ?? "").slice(0, 800)
      });
      response.result = {actorId: actor.id, value, tier};
      response.ok = true;
    } else {
      throw new Error(`Unknown request: ${payload.action}`);
    }
  } catch (error) {
    console.error("Genesys Inventions | GM request failed", error);
    response.error = error?.message ?? String(error);
  }
  game.socket.emit(SOCKET, response);
}

function handleSocketMessage(payload) {
  if (!payload || typeof payload !== "object") return;
  if (payload.type === "request") {
    handleGMRequest(payload);
    return;
  }
  if (payload.type === "response" && payload.targetUserId === game.user.id) {
    const pending = pendingSocketRequests.get(payload.requestId);
    if (!pending) return;
    pendingSocketRequests.delete(payload.requestId);
    clearTimeout(pending.timeout);
    if (payload.ok) pending.resolve(payload.result);
    else pending.reject(new Error(payload.error || "GM request failed."));
  }
}

function requestGM(action, data = {}) {
  return new Promise((resolve, reject) => {
    const gm = activePrimaryGM();
    if (!gm) {
      reject(new Error("An active GM is required to create an Invention Project."));
      return;
    }
    const requestId = randomId();
    const timeout = setTimeout(() => {
      pendingSocketRequests.delete(requestId);
      reject(new Error("The GM did not respond to the project request."));
    }, 12000);
    pendingSocketRequests.set(requestId, {resolve, reject, timeout});
    game.socket.emit(SOCKET, {
      type: "request",
      requestId,
      action,
      userId: game.user.id,
      ...data
    });
  });
}


function actorSkillData(actor, skillName) {
  const wanted = norm(skillName);
  const item = actor?.items?.find?.(entry => entry?.type === "skill" && norm(entry.name) === wanted) ?? null;
  if (!item) return null;
  return {
    item,
    key: item.id,
    data: item.system ?? {},
    rank: Math.max(0, Number(item.system?.rank ?? item.system?.ranks ?? item.system?.value ?? 0) || 0)
  };
}

function actorCharacteristicValue(actor, keyOrLabel) {
  const chars = actor?.system?.characteristics ?? {};
  const wanted = norm(keyOrLabel);
  for (const [key, value] of Object.entries(chars)) {
    if (norm(key) === wanted || norm(value?.label) === wanted || norm(value?.name) === wanted) {
      return Number(value?.value ?? value ?? 0) || 0;
    }
  }
  return 0;
}

async function craftingSkillDefinition(skillName) {
  const skills = await loadPackDocuments(PACKS.skills);
  return skills.find(s => norm(s.name) === norm(skillName)) ?? null;
}

function chatMessageSummary(message) {
  const text = stripHTML(message?.content ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "Result posted to chat";
  return text.length > 360 ? `${text.slice(0, 357)}...` : text;
}

function registeredGenesysDieFormula(denomination) {
  const term = CONFIG?.Dice?.terms?.[denomination];
  return String(term?.FORMULA ?? `d${denomination}`);
}

function genesysRollFormula(pool) {
  const parts = [];
  const dice = [
    ["ability", "a"],
    ["proficiency", "p"],
    ["boost", "b"],
    ["difficulty", "i"],
    ["challenge", "c"],
    ["setback", "s"]
  ];
  for (const [key, denomination] of dice) {
    const count = Math.max(0, integer(pool?.[key], 0));
    if (!count) continue;
    const DieClass = CONFIG?.Dice?.terms?.[denomination];
    if (!DieClass) throw new Error(`Genesys die type "${denomination}" is not registered by the active system.`);
    parts.push(`${count}${registeredGenesysDieFormula(denomination)}`);
  }
  return parts.join(" + ") || "0";
}

async function resolveProjectSkill(actor, skillName) {
  const skillRef = actorSkillData(actor, skillName);
  if (!skillRef) throw new Error(`${actor.name} does not have the ${skillName} Skill on their Character Sheet.`);
  const definition = await craftingSkillDefinition(skillName);
  const data = skillRef.data ?? {};
  const charKey = String(data.characteristic ?? data.characteristicKey ?? definition?.system?.characteristic ?? definition?.system?.characteristicKey ?? "intellect").trim().toLowerCase();
  const characteristic = actorCharacteristicValue(actor, charKey);
  const rank = skillRef.rank;
  const proficiency = Math.min(characteristic, rank);
  const ability = Math.max(characteristic, rank) - proficiency;
  return {skillRef, definition, charKey, characteristic, rank, ability, proficiency};
}

function projectSchematicSkill(project, actor) {
  const explicit = String(project?.approval?.rules?.schematicSkill ?? "").trim();
  if (explicit) return explicit;
  for (const candidate of ["Knowledge", "Ерудиція"]) {
    if (actorSkillData(actor, candidate)) return candidate;
  }
  return String(project?.approval?.rules?.craftingSkill ?? "Knowledge").trim() || "Knowledge";
}

function closeRollPrompt(prompt) {
  prompt?.remove?.();
}

function genesysDieFaceString(term, result) {
  const faces = term?.constructor?.FACES ?? term?.options?.faces ?? null;
  const value = Number(result?.result ?? result?.value ?? result ?? 0);
  if (Array.isArray(faces) && value >= 1 && value <= faces.length) return String(faces[value - 1] ?? "");
  if (faces && typeof faces === "object") return String(faces[value] ?? faces[String(value)] ?? "");
  return "";
}

function genesysRollSymbols(roll) {
  const counts = {s:0,a:0,t:0,f:0,h:0,d:0};
  const dice = [];
  for (const term of roll?.dice ?? []) {
    const denomination = String(term?.constructor?.DENOMINATION ?? term?.denomination ?? "");
    for (const result of term?.results ?? []) {
      const face = genesysDieFaceString(term, result);
      for (const symbol of face) if (Object.hasOwn(counts, symbol)) counts[symbol]++;
      dice.push({denomination, face});
    }
  }
  return {counts, dice};
}

function netNarrativeResult(symbols, automatic = {}) {
  const c = symbols?.counts ?? {};
  const successes = Number(c.s ?? 0) + Number(c.t ?? 0) + Number(automatic.success ?? 0);
  const failures = Number(c.f ?? 0) + Number(c.d ?? 0);
  const advantages = Number(c.a ?? 0) + Number(automatic.advantage ?? 0);
  const threats = Number(c.h ?? 0) + Number(automatic.threat ?? 0);
  return {
    success: Math.max(0, successes - failures),
    failure: Math.max(0, failures - successes),
    advantage: Math.max(0, advantages - threats),
    threat: Math.max(0, threats - advantages),
    triumph: Number(c.t ?? 0),
    despair: Number(c.d ?? 0)
  };
}

function primaryMessageRoll(message) {
  return message?.rolls?.[0] ?? message?.roll ?? null;
}

function schematicRollResolution(project, message, {skill = "", difficulty = 0, label = "", userId = null} = {}) {
  const roll = primaryMessageRoll(message);
  if (!roll) throw new Error("The Schematic chat message does not contain a roll.");
  const nextLevel = schematicEffects(project).level + 1;
  if (nextLevel > 4) throw new Error("This project already has a Level 4 Schematic.");
  const result = netNarrativeResult(genesysRollSymbols(roll));
  const success = result.success > 0;
  const pending = {
    id: randomId(),
    level: nextLevel,
    success,
    at: Number(message?.timestamp) || Date.now(),
    userId,
    skill,
    difficulty,
    label,
    chatMessageId: message?.id ?? null,
    chatMessageUuid: message?.uuid ?? null,
    result: {
      success: result.success,
      failure: result.failure,
      advantage: result.advantage,
      triumph: result.triumph,
      threat: result.threat,
      despair: result.despair
    }
  };
  const hasSpendable = pending.result.advantage > 0 || pending.result.triumph > 0 || pending.result.threat > 0 || pending.result.despair > 0;
  return {pending, hasSpendable};
}

function applyResolvedSchematicRoll(project, pending, spends = {}) {
  project.schematic ??= {entries: []};
  project.schematic.entries ??= [];
  const entry = {
    id: randomId(),
    level: pending.success ? pending.level : 0,
    attemptedLevel: pending.success ? undefined : pending.level,
    success: Boolean(pending.success),
    at: Number(pending.at) || Date.now(),
    userId: pending.userId ?? game.user?.id ?? null,
    chatMessageId: pending.chatMessageId ?? null,
    chatMessageUuid: pending.chatMessageUuid ?? null,
    result: deepClone(pending.result ?? {}),
    spends: pending.success ? deepClone(spends ?? {}) : deepClone(spends ?? {})
  };
  project.schematic.entries.push(entry);
  project.schematic.pending = null;
  if (entry.success) {
    if (["approved", "building"].includes(project.status)) project.status = "building";
    addLog(project, "schematic", tx(`Level ${pending.level} Schematic completed from the recorded roll.`, `Креслення рівня ${pending.level} завершено за результатом записаного кидка.`), pending.userId);
  } else {
    addLog(project, "schematic-failed", tx(`Level ${pending.level} Schematic attempt failed.`, `Спроба створити креслення рівня ${pending.level} провалилася.`), pending.userId);
  }
  return entry;
}

function registerSchematicRollOnProject(project, message, entry, userId) {
  project.schematic ??= {entries: []};
  if (project.schematic.pending) throw new Error("Resolve the previous Schematic roll before rolling again.");
  const {pending, hasSpendable} = schematicRollResolution(project, message, {
    skill: entry.skill,
    difficulty: entry.difficulty,
    label: entry.label,
    userId
  });
  if (hasSpendable) {
    project.schematic.pending = pending;
    addLog(project, "schematic-pending", tx(`Schematic Level ${pending.level} roll recorded; spend Advantage/Threat/Triumph/Despair to resolve it.`, `Кидок для креслення рівня ${pending.level} записано; розподіліть Переваги/Загрози/Тріумф/Відчай, щоб завершити його.`), userId);
    return {pending: true, level: pending.level, success: pending.success, result: pending.result};
  }
  const resolved = applyResolvedSchematicRoll(project, pending, {});
  return {pending: false, level: pending.level, success: resolved.success, result: pending.result};
}

async function narrativeSymbolHTML(code) {
  const cleaned = String(code ?? "").replace(/\s+/g, "");
  if (!cleaned) return "";
  try {
    const enriched = await TextEditor.enrichHTML(`@symbol[${cleaned}]`, {async: true});
    return String(enriched ?? "").includes("@symbol[") ? esc(cleaned) : enriched;
  } catch (_) {
    return esc(cleaned);
  }
}

function dieShapeKind(denomination) {
  const d = String(denomination ?? "").toLowerCase();
  if (d === "b" || d === "s") return "d6";
  if (d === "a" || d === "i") return "d8";
  if (d === "p" || d === "c") return "d12";
  return "d6";
}

function genesysDieShapeSVG(denomination) {
  const kind = dieShapeKind(denomination);
  if (kind === "d8") {
    return `<svg class="ginv-die-shape shape-d8" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><polygon points="16,1.5 30.5,16 16,30.5 1.5,16" /></svg>`;
  }
  if (kind === "d12") {
    return `<svg class="ginv-die-shape shape-d12" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><polygon points="8,2 24,2 31,16 24,30 8,30 1,16" /></svg>`;
  }
  return `<svg class="ginv-die-shape shape-d6" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="2" y="2" width="28" height="28" rx="3.5" ry="3.5" /></svg>`;
}

async function genesysDieFaceHTML(die) {
  const denomination = String(die?.denomination ?? "").toLowerCase();
  const rawFace = String(die?.face ?? "").trim();
  const face = rawFace ? await narrativeSymbolHTML(rawFace) : "";
  return `<span class="ginv-chat-die die-${esc(denomination)} ${rawFace ? "" : "blank"}">${genesysDieShapeSVG(denomination)}<span class="ginv-die-face-symbols">${face}</span></span>`;
}

async function genesysChatCardHTML({actor, skillName, label, difficulty, upgrades = 0, roll, automatic = {}, contextHTML = ""}) {
  const symbols = genesysRollSymbols(roll);
  const net = netNarrativeResult(symbols, automatic);
  const visibleCodes = [
    "s".repeat(net.success), "f".repeat(net.failure),
    "a".repeat(net.advantage), "h".repeat(net.threat),
    "t".repeat(net.triumph), "d".repeat(net.despair)
  ].join("");
  const resultSymbols = visibleCodes ? await narrativeSymbolHTML(visibleCodes) : `<span class="ginv-chat-none">${tx("No uncanceled results", "Немає нескансельованих результатів")}</span>`;
  const dieFaces = [];
  for (const die of symbols.dice) dieFaces.push(await genesysDieFaceHTML(die));
  const rows = [];
  if (net.success) rows.push(`<div><span>${await narrativeSymbolHTML("s")}</span><strong>${tx("Successes", "Успіхи")}</strong><b>${net.success}</b></div>`);
  if (net.failure) rows.push(`<div><span>${await narrativeSymbolHTML("f")}</span><strong>${tx("Failures", "Провали")}</strong><b>${net.failure}</b></div>`);
  if (net.advantage) rows.push(`<div><span>${await narrativeSymbolHTML("a")}</span><strong>${tx("Advantages", "Переваги")}</strong><b>${net.advantage}</b></div>`);
  if (net.threat) rows.push(`<div><span>${await narrativeSymbolHTML("h")}</span><strong>${tx("Threats", "Загрози")}</strong><b>${net.threat}</b></div>`);
  if (net.triumph) rows.push(`<div><span>${await narrativeSymbolHTML("t")}</span><strong>${tx("Triumph", "Тріумф")}</strong><b>${net.triumph}</b></div>`);
  if (net.despair) rows.push(`<div><span>${await narrativeSymbolHTML("d")}</span><strong>${tx("Despair", "Відчай")}</strong><b>${net.despair}</b></div>`);
  if (!rows.length) rows.push(`<div><strong>${tx("No uncanceled results", "Немає нескансельованих результатів")}</strong><b>0</b></div>`);
  const automaticBits = [];
  if (automatic.success) automaticBits.push(`${automatic.success} ${tx("automatic Success", "автоматичний Успіх")}`);
  if (automatic.advantage) automaticBits.push(`${automatic.advantage} ${tx("automatic Advantage", "автоматична Перевага")}`);
  if (automatic.threat) automaticBits.push(`${automatic.threat} ${tx("automatic Threat", "автоматична Загроза")}`);
  return `<div class="ginv-chat-card"><div class="ginv-chat-rolling">${tx("Rolling", "Кидок")} <strong>${esc(skillName)}</strong>...</div><div class="ginv-chat-context">${esc(label)} · ${esc(difficultyTextWithUpgrades(difficulty, upgrades))}${automaticBits.length ? ` · ${esc(automaticBits.join(", "))}` : ""}</div>${contextHTML}<h3>${tx("ROLL RESULTS", "РЕЗУЛЬТАТ КИДКА")}</h3><div class="ginv-chat-results">${resultSymbols || "–"}</div><h3>${tx("SUMMARY", "ПІДСУМОК")}</h3><div class="ginv-chat-summary">${rows.join("")}</div><h3>${tx("DICE", "КУБИКИ")}</h3><div class="ginv-chat-dice">${dieFaces.join("") || tx("No dice", "Немає кубиків")}</div></div>`;
}

async function executeGenesysProjectRoll({journal, actor, skillName, difficulty, upgrades = 0, kind, label, pool, prompt, automatic = {}}) {
  const formula = genesysRollFormula(pool);
  const roll = await (new Roll(formula)).evaluate();
  const content = await genesysChatCardHTML({actor, skillName, label, difficulty, upgrades, roll, automatic});
  closeRollPrompt(prompt);
  const message = await ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({actor}),
    content,
    style: CONST.CHAT_MESSAGE_STYLES?.OTHER ?? 0,
    rolls: [roll],
    sound: CONFIG.sounds?.dice,
    flags: {[FLAG_SCOPE]: {projectRoll: {journalId: journal.id, kind, skill: skillName, difficulty, upgrades, label, formula}}}
  });
  const entry = {
    id: randomId(), at: Number(message?.timestamp) || Date.now(), skill: skillName, difficulty, upgrades, kind, label,
    chatMessageId: message?.id ?? null, chatMessageUuid: message?.uuid ?? null, summary: chatMessageSummary(message)
  };
  let schematicResolution = null;
  if (game.user.isGM) {
    const project = projectFromJournal(journal);
    project.rolls ??= [];
    project.rolls.unshift({...entry, userId: game.user.id});
    project.rolls = project.rolls.slice(0, 50);
    addLog(project, "roll", `${label} · ${difficultyTextWithUpgrades(difficulty, upgrades)}.`, game.user.id);
    if (kind === "schematic") schematicResolution = registerSchematicRollOnProject(project, message, entry, game.user.id);
    await saveProject(journal, project);
  } else {
    const response = await requestGM("appendRollLog", {journalId: journal.id, roll: entry});
    schematicResolution = response?.schematicResolution ?? null;
  }
  return {roll, message, result: netNarrativeResult(genesysRollSymbols(roll), automatic), schematicResolution};
}

async function openProjectRollPrompt(journal, project, {kind = "crafting", skillName = null, difficulty = null, upgrades = null, label = null} = {}) {
  const actor = game.actors.get(project?.actorId);
  if (!actor || !canUseInventorActor(actor)) throw new Error("You cannot use the inventor Actor to roll this check.");

  const isSchematic = kind === "schematic";
  const resolvedSkillName = String(skillName ?? (isSchematic ? projectSchematicSkill(project, actor) : project?.approval?.rules?.craftingSkill ?? "")).trim();
  if (!resolvedSkillName) throw new Error(isSchematic ? "No Schematic Skill is available." : "The GM has not assigned a crafting skill.");
  const resolvedDifficulty = Math.max(0, integer(difficulty ?? (isSchematic ? 2 : currentCraftingDifficulty(project)), 0));
  const resolvedUpgrades = Math.max(0, integer(upgrades ?? (isSchematic ? 0 : currentCraftingUpgrades(project)), 0));
  const resolvedLabel = String(label ?? (isSchematic ? tx("Schematic", "Креслення") : tx("Crafting", "Крафт")));
  const skill = await resolveProjectSkill(actor, resolvedSkillName);
  const opposition = applyDifficultyUpgrades(resolvedDifficulty, resolvedUpgrades);

  const pool = {
    ability: skill.ability,
    proficiency: skill.proficiency,
    boost: 0,
    difficulty: opposition.difficulty,
    challenge: opposition.challenge,
    setback: 0
  };

  document.querySelectorAll("[data-ginv-roll-prompt]").forEach(node => node.remove());
  const prompt = document.createElement("div");
  prompt.className = "ginv-roll-prompt-overlay";
  prompt.dataset.ginvRollPrompt = "true";
  const charLabel = ({brawn:"Brawn",agility:"Agility",intellect:"Intellect",cunning:"Cunning",willpower:"Willpower",presence:"Presence"})[skill.charKey] ?? skill.charKey;
  const diceDefs = [
    ["ability", tx("Ability", "Здібність"), "green"], ["proficiency", tx("Proficiency", "Майстерність"), "yellow"], ["boost", tx("Boost", "Перевага"), "blue"],
    ["difficulty", tx("Difficulty", "Складність"), "purple"], ["challenge", tx("Challenge", "Виклик"), "red"], ["setback", tx("Setback", "Перешкода"), "black"]
  ];
  prompt.innerHTML = `<div class="ginv-shell ginv-roll-prompt" data-theme="${esc(storedTheme())}" style="--ginv-text-adjust:${storedTextSize()}px">
    <div class="ginv-roll-prompt-head"><div><h2>${esc(resolvedLabel)}</h2><div class="ginv-sub">${esc(actor.name)} · ${esc(resolvedSkillName)} · ${difficultyDisplayHTML(resolvedDifficulty, resolvedUpgrades)}</div></div><button type="button" class="ginv-btn" data-roll-close>${tx("Close", "Закрити")}</button></div>
    <div class="ginv-callout"><strong>${esc(resolvedSkillName)} ${skill.rank}</strong> · <strong>${esc(charLabel)} ${skill.characteristic}</strong>. ${tx("The pool is pre-filled from the Character Sheet. Adjust situational dice before rolling if needed.", "Пул уже набраний із чаркуша. За потреби додайте або приберіть ситуативні кубики перед кидком.")}</div>
    <div class="ginv-dice-grid">${diceDefs.map(([key,name,tone]) => `<div class="ginv-die-counter ${tone}"><strong>${name}</strong><div class="ginv-die-stepper"><button type="button" data-die-dec="${key}">−</button><span data-die-value="${key}">${pool[key]}</span><button type="button" data-die-inc="${key}">+</button></div></div>`).join("")}</div>
    <div class="ginv-row" style="margin-top:8px"><div class="ginv-roll-formula" data-roll-formula>${esc(genesysRollFormula(pool))}</div><button type="button" class="ginv-btn small" data-upgrade-difficulty>⬆ ${tx("Upgrade Difficulty","Підвищити складність")}</button></div>
    <div class="ginv-row ginv-roll-actions"><button type="button" class="ginv-btn primary" data-roll-confirm>🎲 ${tx("Roll", "Кинути")} ${esc(resolvedSkillName)}</button><span class="ginv-sub">${tx("The resulting Genesys roll is recorded in this Invention Project.", "Результат кидка Genesys буде записаний у цей проєкт.")}</span></div>
  </div>`;
  document.body.appendChild(prompt);

  const refresh = () => {
    for (const key of Object.keys(pool)) {
      const node = prompt.querySelector(`[data-die-value="${key}"]`);
      if (node) node.textContent = String(pool[key]);
    }
    const formula = prompt.querySelector("[data-roll-formula]");
    if (formula) formula.textContent = genesysRollFormula(pool);
  };
  prompt.querySelector("[data-roll-close]")?.addEventListener("click", () => closeRollPrompt(prompt));
  prompt.addEventListener("click", async event => {
    const dec = event.target?.closest?.("[data-die-dec]");
    const inc = event.target?.closest?.("[data-die-inc]");
    if (dec) { const key = dec.dataset.dieDec; pool[key] = Math.max(0, integer(pool[key], 0) - 1); refresh(); return; }
    if (inc) { const key = inc.dataset.dieInc; pool[key] = Math.min(12, integer(pool[key], 0) + 1); refresh(); return; }
    if (event.target?.closest?.("[data-upgrade-difficulty]")) {
      if (pool.difficulty > 0) { pool.difficulty -= 1; pool.challenge += 1; } else { pool.difficulty += 1; }
      refresh(); return;
    }
    if (event.target?.closest?.("[data-roll-confirm]")) {
      const button = prompt.querySelector("[data-roll-confirm]");
      if (button) button.disabled = true;
      try {
        const outcome = await executeGenesysProjectRoll({journal, actor, skillName: resolvedSkillName, difficulty: resolvedDifficulty, upgrades: resolvedUpgrades, kind, label: resolvedLabel, pool, prompt, automatic: isSchematic ? {} : {success: schematicEffects(project).autoSuccess, advantage: schematicEffects(project).autoAdvantage, threat: schematicEffects(project).autoThreat}});
        if (isSchematic && outcome?.schematicResolution) {
          if (outcome.schematicResolution.pending) {
            ui.notifications.info(`Schematic Level ${outcome.schematicResolution.level} roll recorded. Resolve the remaining symbols in the project to finish the schematic.`);
          } else if (outcome.schematicResolution.success) {
            ui.notifications.info(`Schematic Level ${outcome.schematicResolution.level} completed automatically.`);
          } else {
            ui.notifications.warn(`Schematic Level ${outcome.schematicResolution.level} attempt failed and was recorded.`);
          }
        }
      } catch (error) {
        console.error("Genesys Inventions | Roll failed", error);
        ui.notifications.error(`Could not roll ${resolvedSkillName}: ${error.message}`);
        if (button) button.disabled = false;
      }
    }
  });
}

async function rollProjectSkill(journal, project) {
  const skillName = String(project?.approval?.rules?.craftingSkill ?? "").trim();
  if (!skillName) throw new Error("The GM has not assigned a crafting skill.");
  return openProjectRollPrompt(journal, project, {
    kind: "crafting",
    skillName,
    difficulty: currentCraftingDifficulty(project),
    upgrades: currentCraftingUpgrades(project),
    label: `${tx("Final Crafting", "Фінальний крафт")} · ${project.concept?.name ?? tx("Invention", "Винахід")}`
  });
}

async function rollProjectSchematic(journal, project) {
  const actor = game.actors.get(project?.actorId);
  if (!actor) throw new Error("Inventor Actor no longer exists.");
  if (project?.schematic?.pending) throw new Error("Resolve the previous Schematic roll before rolling another one.");
  const nextLevel = schematicEffects(project).level + 1;
  const level = SCHEMATIC_LEVELS[nextLevel];
  if (!level) throw new Error("This project already has a Level 4 Schematic.");
  return openProjectRollPrompt(journal, project, {
    kind: "schematic",
    skillName: projectSchematicSkill(project, actor),
    difficulty: level.difficulty,
    label: `${tx("Schematic Level", "Креслення рівня")} ${nextLevel} · ${project.concept?.name ?? tx("Invention", "Винахід")}`
  });
}

async function captureCraftingChatMessage(message) {
  const userId = message?.user?.id ?? message?.user ?? message?.author?.id;
  if (!userId) return;
  const candidates = [...pendingCraftRolls.entries()]
    .filter(([key, pending]) => key.startsWith(`${userId}:`) && Date.now() - pending.startedAt < 120000)
    .sort((a, b) => b[1].startedAt - a[1].startedAt);
  if (!candidates.length) return;
  const [key, pending] = candidates[0];
  pendingCraftRolls.delete(key);
  const roll = {
    id: randomId(),
    at: Date.now(),
    skill: pending.skill,
    difficulty: pending.difficulty,
    kind: pending.kind ?? "crafting",
    label: pending.label ?? pending.skill,
    chatMessageId: message.id ?? null,
    chatMessageUuid: message.uuid ?? null,
    summary: chatMessageSummary(message)
  };
  try {
    if (game.user?.isGM) {
      const journal = game.journal.get(pending.journalId);
      const project = projectFromJournal(journal);
      if (!journal || !project) return;
      project.rolls ??= [];
      project.rolls.unshift({...roll, userId});
      project.rolls = project.rolls.slice(0, 50);
      addLog(project, "roll", `${roll.label || roll.skill} · ${difficultyLabel(roll.difficulty)} · ${roll.summary}.`, userId);
      await saveProject(journal, project);
    } else {
      await requestGM("appendRollLog", {journalId: pending.journalId, roll});
    }
    ui.notifications.info(`${pending.label || pending.skill} result recorded in the Invention Project log.`);
  } catch (error) {
    console.error("Genesys Inventions | Could not record crafting roll", error);
    ui.notifications.warn(`The roll was made, but the project log could not be updated: ${error.message}`);
  }
}

function gatheringDomainsForWorld() {
  const entries = Object.entries(GATHERING_DOMAINS);
  const hasNuvar = Array.from(game.items ?? []).some(item => item.type === "skill" && /(?:нувар|nuvar)/i.test(item.name))
    || Array.from(game.actors ?? []).some(actor => actor.items?.some?.(item => item.type === "skill" && /(?:нувар|nuvar)/i.test(item.name)));
  return entries.filter(([id]) => domainAllowed(id) && (id !== "nuvarotech" || hasNuvar));
}

function gatheringReferenceHTML() {
  return gatheringDomainsForWorld().map(([id, d]) => `<article class="ginv-gather-card" data-domain-reference="${id}"><div class="ginv-gather-title"><span>${d.icon}</span><strong>${esc(domainText(d, "label"))}</strong></div><div><b>${tx("Component type:", "Тип компонентів:")}</b> ${esc(domainText(d, "componentType"))}</div><div class="ginv-gather-tiers"><p><b>Tier 3:</b> ${esc(domainText(d, "ordinary"))}</p><p><b>Tier 5:</b> ${esc(domainText(d, "specialist"))}</p><p><b>Tier 7:</b> ${esc(domainText(d, "exceptional"))}</p></div><p><b>${tx("Suitable for:", "Підходять для:")}</b> ${esc(domainText(d, "uses"))}</p><p><b>${tx("Example projects:", "Приклади проєктів:")}</b> ${esc(domainText(d, "examples"))}</p></article>`).join("");
}

function rulesReferenceHTML() {
  const rarityRows = Object.entries(COMPONENT_PERCENTAGES).map(([rarity, values]) => `<tr><td>${rarity}</td><td>${values[0]}%</td><td>${values[1]}%</td><td>${values[2]}%</td></tr>`).join("");
  const currency = esc(worldCurrencyLabel());
  const pct = gatheringYieldPercent();
  const perSuccess = gatheringYieldPerSuccess(3);
  const schematicRows = [1,2,3,4].map(level => {
    const row = SCHEMATIC_LEVELS[level];
    return `<tr><td>${level}</td><td>${difficultyDisplayHTML(row.difficulty,0)}</td><td>${row.hours} ${tx("h","год")}</td><td>-${level}</td></tr>`;
  }).join("");
  return `<div class="ginv-rules-grid">
    <section class="ginv-panel"><h2>${tx("Crafting Workflow","Як працює крафт")}</h2>
      <p><strong>1. ${tx("Define the invention.","Визначте винахід.")}</strong> ${tx("The player proposes the object; the GM approves its final profile, crafting skill, difficulty, difficulty upgrades, time, and component cost.","Гравець пропонує об'єкт, а GM затверджує остаточний профіль, навичку крафту, складність, її підвищення, час і вартість компонентів.")}</p>
      <p><strong>2. ${tx("Develop a schematic if useful.","За потреби розробіть креслення.")}</strong> ${tx("A schematic belongs to one specific invention and lowers the final crafting difficulty.","Креслення стосується одного конкретного винаходу та зменшує складність фінального крафту.")}</p>
      <table class="ginv-table"><thead><tr><th>${tx("Level","Рівень")}</th><th>${tx("Design Check","Перевірка креслення")}</th><th>${tx("Time","Час")}</th><th>${tx("Crafting Difficulty","Складність крафту")}</th></tr></thead><tbody>${schematicRows}</tbody></table>
      <p><strong>3. ${tx("Acquire components.","Зберіть компоненти.")}</strong> ${tx("Components are abstract value pools measured in the world's configured currency:","Компоненти є абстрактними запасами вартості й рахуються у валюті цього світу:")} <strong>${currency}</strong>.</p>
      <p><strong>4. ${tx("Make the final crafting check.","Зробіть фінальну перевірку крафту.")}</strong> ${tx("Apply the current schematic reduction, GM-set upgrades, and any automatic results created by schematic spending.","Застосуйте зниження складності від креслення, підвищення від GM та автоматичні результати, отримані під час роботи над кресленням.")}</p>
    </section>

    <section class="ginv-panel"><h2>${tx("Difficulty and Challenge Dice","Складність і кубики виклику")}</h2>
      <p>${tx("The difficulty name describes the base number of Difficulty dice:","Назва складності визначає базову кількість фіолетових кубиків:")}</p>
      <div class="ginv-difficulty-guide">${[0,1,2,3,4,5].map(n=>`<div><strong>${difficultyLabel(n)}</strong> ${difficultyDiceHTML(n,0,{compact:false})}</div>`).join("")}</div>
      <p>${tx("An upgrade converts one Difficulty die into one Challenge die. If no Difficulty dice remain, the next upgrade adds one Difficulty die; later upgrades can convert it in turn.","Підвищення складності замінює один фіолетовий кубик складності на червоний кубик виклику. Якщо фіолетових кубиків не лишилося, наступне підвищення додає новий кубик складності; подальше підвищення вже може перетворити його на червоний.")}</p>
      <p class="ginv-help">${tx("Example: Hard with 1 upgrade = 2 Difficulty + 1 Challenge; Hard with 3 upgrades = 3 Challenge; Hard with 4 upgrades = 1 Difficulty + 3 Challenge.","Приклад: Важка з 1 підвищенням = 2 фіолетові + 1 червоний; з 3 підвищеннями = 3 червоні; з 4 підвищеннями = 1 фіолетовий + 3 червоні.")}</p>
    </section>

    <section class="ginv-panel"><h2>${tx("Component Tiers","Тіри компонентів")}</h2>
      <p><strong>Tier 3:</strong> ${tx("ordinary components associated with rarity 0–3.","звичайні компоненти, пов'язані з рідкістю 0–3.")} <strong>Tier 5:</strong> ${tx("rarer or specialist components associated with rarity 4–5.","рідкісні або спеціалізовані компоненти для рідкості 4–5.")} <strong>Tier 7:</strong> ${tx("restricted or exceptionally rare components associated with rarity 6+.","обмежені або винятково рідкісні компоненти для рідкості 6+.")}</p>
      <table class="ginv-table"><thead><tr><th>${tx("Item Rarity","Рідкість предмета")}</th><th>Tier 3</th><th>Tier 5</th><th>Tier 7</th></tr></thead><tbody>${rarityRows}</tbody></table>
      <p class="ginv-help">${tx(`The supplement suggests roughly 1 Encumbrance per 500 ${currency} of carried components.`,`Доповнення радить орієнтовно 1 Encumbrance на кожні 500 ${currency} компонентів, які персонаж несе із собою.`)}</p>
    </section>

    <section class="ginv-panel"><h2>${tx("Recovering Components from Items · Source Rule","Добування компонентів із предметів · правило джерела")}</h2>
      <p>${tx("Declare the Tier you want to recover, then make the appropriate deconstruction check. The process takes hours equal to the item's rarity.","Оголосіть, компоненти якого Tier ви намагаєтеся добути, і зробіть відповідну перевірку розбирання. Процес триває стільки годин, якою є рідкість предмета.")}</p>
      <p>${tx("Each net Success recovers value equal to", "Кожен net Success дає компоненти на суму")} <strong>25%</strong> ${tx("of item cost for Tier 3,", "вартості предмета для Tier 3,")} <strong>15%</strong> ${tx("for Tier 5, or", "для Tier 5 або")} <strong>5%</strong> ${tx("for Tier 7, up to the item's component cap for that Tier.","для Tier 7, але не більше максимальної частки цього Tier у предметі.")}</p>
      <p>${tx("Advantage can allow recovery from another Tier or reduce the time by 30 minutes; Threat can increase the time by 30 minutes.","Advantage може дозволити добувати компоненти іншого Tier або скоротити час на 30 хвилин; Threat може збільшити час на 30 хвилин.")}</p>
    </section>

    <section class="ginv-panel"><h2>${tx("Gathering Materials in Play · Workshop Guidance","Збирання матеріалів у грі · Workshop-настанова")}</h2>
      <div class="ginv-callout"><strong>${tx("Not RAW.","Не RAW.")}</strong> ${tx("Wonderous Inventions defines component tiers and deconstruction but gives no universal field-gathering formula. The module therefore provides an adjustable campaign rule.","Wonderous Inventions визначає тіри компонентів і розбирання предметів, але не дає універсальної формули польового збору. Тому модуль використовує окреме правило, яке GM може налаштувати під кампанію.")}</div>
      <p>${tx("Base yield:","Базовий вихід:")} <strong>${GATHERING_BASE_YIELD} ${currency} ${tx("per net Success","за кожен net Success")}</strong>. ${tx("Current world multiplier:","Поточний множник світу:")} <strong>${pct}%</strong>, ${tx("so the current yield is", "тобто зараз це")} <strong>${currencyAmount(perSuccess)}</strong> ${tx("per net Success for any Tier.","за net Success для будь-якого Tier.")}</p>
      <table class="ginv-table"><thead><tr><th>${tx("Target Tier","Цільовий Tier")}</th><th>${tx("Recommended Difficulty","Рекомендована складність")}</th><th>${tx("Value per net Success","Вартість за net Success")}</th></tr></thead><tbody>
        <tr><td>Tier 3</td><td>${difficultyDisplayHTML(2,0)}</td><td>${currencyAmount(perSuccess)}</td></tr>
        <tr><td>Tier 5</td><td>${difficultyDisplayHTML(3,0)}</td><td>${currencyAmount(perSuccess)}</td></tr>
        <tr><td>Tier 7</td><td>${difficultyDisplayHTML(4,0)}</td><td>${currencyAmount(perSuccess)}</td></tr>
      </tbody></table>
      <p>${tx("Higher Tier changes how hard the material is to find, not its value per Success. The GM may upgrade the difficulty to introduce Challenge dice for dangerous locations, restricted resources, unstable deposits, hostile territory, or similarly serious circumstances.","Вищий Tier змінює складність пошуку, а не вартість одного успіху. GM може підвищувати складність і додавати червоні кубики виклику для небезпечних місць, контрольованих ресурсів, нестабільних родовищ, ворожої території та інших серйозних обставин.")}</p>
      <p><strong>${tx("Advantage, Threat, Triumph, and Despair do not automatically change component value.","Advantage, Threat, Triumph і Despair автоматично не змінюють вартість компонентів.")}</strong> ${tx("Use them for quality, time, hazards, special components, damaged finds, attention, or other narrative consequences.","Їх варто витрачати на якість матеріалу, час, небезпеки, особливі компоненти, пошкоджену знахідку, небажану увагу або інші сюжетні наслідки.")}</p>
    </section>

    <section class="ginv-panel"><h2>${tx("Component Stockpile","Запас компонентів")}</h2>
      <p>${tx("Gathered materials are stored on the inventor Actor as persistent batches. A GM can also add components manually for purchases, rewards, downtime, loot, or materials obtained outside a gathering roll.","Зібрані матеріали зберігаються на Actor винахідника як постійні партії. GM або користувач із доступом до персонажа також може додати компоненти вручну: після купівлі, як нагороду, під час downtime, із трофеїв або коли матеріали отримано без окремого кидка.")}</p>
      <p>${tx("A Stockpile batch records its crafting family, Tier, value, source, and intended uses. Project Acquired values remain separate so the module never silently spends alchemical reagents on a sword or timber on a potion.","Кожна партія в запасі має галузь крафту, Tier, вартість, походження й призначення. Значення Acquired у конкретному проєкті лишається окремим, щоб модуль не витрачав алхімічні реагенти на меч або деревину на зілля без рішення гравця чи GM.")}</p>
    </section>

    <section class="ginv-panel"><h2>${tx("Existing Base Objects","Наявні базові предмети")}</h2>
      <div class="ginv-callout"><strong>${tx("Workshop guidance.","Workshop-настанова.")}</strong> ${tx("If an inventor supplies an existing base object, its recoverable Tier value can offset the new project's requirements. An exact Inventory object is consumed at completion; a library reference requires GM verification that an equivalent object is actually owned.","Якщо винахідник має готовий базовий предмет, його відновлювана вартість за Tier може зменшити потреби нового проєкту. Конкретний предмет з інвентарю витрачається під час завершення; для бібліотечного зразка GM має підтвердити, що відповідний предмет справді є у персонажа.")}</div>
    </section>

    <section class="ginv-panel"><h2>${tx("Vehicles","Транспорт")}</h2>
      <p>${tx("Vehicle inventions use the Expanded Player's Guide vehicle-profile construction guidelines: function, silhouette, control skill, speed, handling, defense, armor, Hull Trauma, System Strain, capacity, crew, and consumables. These are profile-balance guidelines, so the physical crafting difficulty, time, and component cost remain GM-approved.","Винаходи-транспорт використовують настанови Expanded Player's Guide для створення профілю: призначення, Silhouette, навичка керування, швидкість, Handling, Defense, Armor, Hull Trauma, System Strain, місткість, екіпаж і запаси. Це правила балансу профілю, тому фізичну складність крафту, час і вартість компонентів затверджує GM.")}</p>
    </section>

    <section class="ginv-panel"><h2>${tx("Crafting and Component Families","Галузі крафту та компонентів")}</h2>
      <p>${tx("The GM can enable or disable these families in Module Settings. Disabled families disappear from new projects, Gathering, and material guidance.","GM може вмикати або вимикати ці галузі в Module Settings. Вимкнені галузі зникають із нових проєктів, збору матеріалів і довідки.")}</p>
      <div class="ginv-gather-reference">${gatheringReferenceHTML()}</div>
    </section>
  </div>`;
}

async function openGatheringRollPrompt(actor, {domainId, skillName, difficulty, tier, onRecorded = null}) {
  if (!canUseInventorActor(actor)) throw new Error(tx("You cannot use that Actor for the gathering check.", "Ви не можете використовувати цього персонажа для збору компонентів."));
  const domain = GATHERING_DOMAINS[domainId]; if (!domain || !domainAllowed(domainId)) throw new Error(tx("Unknown or disabled gathering domain.", "Невідома або вимкнена група компонентів."));
  const normalizedTier = [3,5,7].includes(integer(tier)) ? integer(tier) : 3;
  const normalizedDifficulty = Math.max(0, integer(difficulty, recommendedGatheringDifficulty(normalizedTier)));
  const skill = await resolveProjectSkill(actor, skillName);
  const pool = {ability:skill.ability, proficiency:skill.proficiency, boost:0, difficulty:normalizedDifficulty, challenge:0, setback:0};
  document.querySelectorAll("[data-ginv-roll-prompt]").forEach(node=>node.remove());
  const prompt=document.createElement("div"); prompt.className="ginv-roll-prompt-overlay"; prompt.dataset.ginvRollPrompt="true";
  const diceDefs=[
    ["ability",tx("Ability","Здібність"),"green"],["proficiency",tx("Proficiency","Майстерність"),"yellow"],["boost",tx("Boost","Перевага"),"blue"],
    ["difficulty",tx("Difficulty","Складність"),"purple"],["challenge",tx("Challenge","Виклик"),"red"],["setback",tx("Setback","Перешкода"),"black"]
  ];
  const perSuccess = gatheringYieldPerSuccess(normalizedTier);
  prompt.innerHTML=`<div class="ginv-shell ginv-roll-prompt" data-theme="${esc(storedTheme())}" style="--ginv-text-adjust:${storedTextSize()}px">
    <div class="ginv-roll-prompt-head"><div><h2>${tx("Gather Components", "Збір компонентів")} · ${esc(domainText(domain,"label"))}</h2><div class="ginv-sub">${esc(actor.name)} · ${esc(skillName)} · ${difficultyDisplayHTML(normalizedDifficulty,0)} · Tier ${normalizedTier}</div></div><button type="button" class="ginv-btn" data-roll-close>${tx("Close","Закрити")}</button></div>
    <div class="ginv-callout"><strong>${esc(domainText(domain,"componentType"))}</strong><br>${tx("Suitable for:", "Підходять для:")} ${esc(domainText(domain,"uses"))}<br><span class="ginv-help">${tx("Workshop yield:", "Вихід за Workshop rule:")} ${tx("each net Success", "кожен net Success")} = ${currencyAmount(perSuccess)} Tier ${normalizedTier}. ${tx("Advantage, Threat, Triumph, and Despair remain available for narrative consequences and material quality.", "Переваги, Загрози, Тріумф і Відчай лишаються для сюжетних наслідків і якості знахідки.")}</span></div>
    <div class="ginv-dice-grid">${diceDefs.map(([key,name,tone])=>`<div class="ginv-die-counter ${tone}"><strong>${name}</strong><div class="ginv-die-stepper"><button type="button" data-die-dec="${key}">−</button><span data-die-value="${key}">${pool[key]}</span><button type="button" data-die-inc="${key}">+</button></div></div>`).join("")}</div>
    <div class="ginv-row" style="margin-top:8px"><div class="ginv-roll-formula" data-roll-formula>${esc(genesysRollFormula(pool))}</div><button type="button" class="ginv-btn small" data-upgrade-difficulty>⬆ ${tx("Upgrade Difficulty","Підвищити складність")}</button></div>
    <div class="ginv-row ginv-roll-actions"><button type="button" class="ginv-btn primary" data-roll-confirm>🎲 ${tx("Roll","Кинути")} ${esc(skillName)}</button><span class="ginv-sub">${tx("A successful result is added automatically to this Actor's Component Stockpile.", "Успішний результат автоматично додається до запасу компонентів цього персонажа.")}</span></div>
  </div>`;
  document.body.appendChild(prompt);
  const refresh=()=>{for(const key of Object.keys(pool)){const n=prompt.querySelector(`[data-die-value="${key}"]`);if(n)n.textContent=String(pool[key]);}const f=prompt.querySelector("[data-roll-formula]");if(f)f.textContent=genesysRollFormula(pool);};
  prompt.querySelector("[data-roll-close]")?.addEventListener("click",()=>closeRollPrompt(prompt));
  prompt.addEventListener("click",async event=>{
    const dec=event.target?.closest?.("[data-die-dec]"); const inc=event.target?.closest?.("[data-die-inc]");
    if(dec){const k=dec.dataset.dieDec;pool[k]=Math.max(0,integer(pool[k])-1);refresh();return;}
    if(inc){const k=inc.dataset.dieInc;pool[k]=Math.min(12,integer(pool[k])+1);refresh();return;}
    if(event.target?.closest?.("[data-upgrade-difficulty]")){if(pool.difficulty>0){pool.difficulty-=1;pool.challenge+=1;}else{pool.difficulty+=1;}refresh();return;}
    if(!event.target?.closest?.("[data-roll-confirm]"))return;
    const button=prompt.querySelector("[data-roll-confirm]"); if(button)button.disabled=true;
    try{
      const formula=genesysRollFormula(pool);
      const roll=await(new Roll(formula)).evaluate();
      const net=netNarrativeResult(genesysRollSymbols(roll));
      const gatheredValue=Math.max(0, net.success * perSuccess);
      const resultLine = gatheredValue > 0
        ? `<strong>${tx("Gathered:", "Здобуто:")}</strong> ${currencyAmount(gatheredValue)} · Tier ${normalizedTier} (${net.success} net Success × ${currencyAmount(perSuccess)})`
        : `<strong>${tx("Gathered:", "Здобуто:")}</strong> 0 ${esc(worldCurrencyLabel())} · ${tx("no successful find", "успішної знахідки немає")}.`;
      const contextHTML=`<div class="ginv-chat-material"><strong>${esc(domainText(domain,"componentType"))}</strong> · Tier ${normalizedTier}<br><span>${tx("Suitable for:", "Підходять для:")} ${esc(domainText(domain,"uses"))}</span><br><span>${resultLine}</span></div>`;
      const content=await genesysChatCardHTML({actor,skillName,label:`${tx("Gather Components", "Збір компонентів")} · ${domainText(domain,"label")}`,difficulty:normalizedDifficulty,roll,contextHTML});
      const message=await ChatMessage.create({user:game.user.id,speaker:ChatMessage.getSpeaker({actor}),content,style:CONST.CHAT_MESSAGE_STYLES?.OTHER??0,rolls:[roll],sound:CONFIG.sounds?.dice,flags:{[FLAG_SCOPE]:{gatheringRoll:{actorId:actor.id,domainId,tier:normalizedTier,skillName,difficulty:normalizedDifficulty,formula}}}});
      if (gatheredValue > 0) {
        if (game.user.isGM) {
          await addStockpileEntryAsGM(actor,{domainId,componentType:domain.componentType,componentTypeEn:domain.componentTypeEn,tier:normalizedTier,value:gatheredValue,skillName,difficulty:normalizedDifficulty,successes:net.success,chatMessageId:message.id,chatMessageUuid:message.uuid,userId:game.user.id,at:Number(message.timestamp)||Date.now(),source:"gathering"});
        } else {
          await requestGM("addGatheredComponents", {actorId: actor.id, chatMessageId: message.id});
        }
        ui.notifications.info(tx(`${currencyAmount(gatheredValue)} of Tier ${normalizedTier} components added to ${actor.name}'s Stockpile.`, `${currencyAmount(gatheredValue)} компонентів Tier ${normalizedTier} додано до запасу персонажа ${actor.name}.`));
      } else {
        ui.notifications.warn(tx("No component value was gathered from this check.", "Ця перевірка не дала компонентів."));
      }
      closeRollPrompt(prompt);
      try { onRecorded?.(); } catch (_) {}
    }catch(error){console.error("Genesys Inventions | Gathering roll failed",error);ui.notifications.error(tx(`Could not roll ${skillName}: ${error.message}`, `Не вдалося виконати кидок ${skillName}: ${error.message}`));if(button)button.disabled=false;}
  });
}

async function openManualComponentPrompt(actor, {onSaved = null} = {}) {
  if (!canUseInventorActor(actor)) throw new Error(tx("You cannot edit that Actor's component stockpile.", "Ви не можете змінювати запас компонентів цього персонажа."));
  const domains = gatheringDomainsForWorld();
  if (!domains.length) throw new Error(tx("No component families are enabled in module settings.", "У налаштуваннях модуля не ввімкнено жодної групи компонентів."));
  document.querySelectorAll("[data-ginv-manual-components]").forEach(node => node.remove());
  const prompt = document.createElement("div");
  prompt.className = "ginv-roll-prompt-overlay";
  prompt.dataset.ginvManualComponents = "true";
  const options = domains.map(([id,d]) => `<option value="${esc(id)}">${esc(domainText(d,"label"))} · ${esc(domainText(d,"componentType"))}</option>`).join("");
  prompt.innerHTML = `<div class="ginv-shell ginv-manual-components" data-theme="${esc(storedTheme())}" style="--ginv-text-adjust:${storedTextSize()}px">
    <div class="ginv-roll-prompt-head"><div><h2>${tx("Add Components Manually", "Додати компоненти вручну")}</h2><div class="ginv-sub">${esc(actor.name)} · ${tx("Component Stockpile", "Запас компонентів")}</div></div><button type="button" class="ginv-btn" data-manual-close>${tx("Close", "Закрити")}</button></div>
    <div class="ginv-grid3">
      <div class="ginv-field"><label>${tx("Component family", "Група компонентів")}</label><select data-manual-domain>${options}</select></div>
      <div class="ginv-field"><label>Tier</label><select data-manual-tier><option value="3">Tier 3</option><option value="5">Tier 5</option><option value="7">Tier 7</option></select></div>
      <div class="ginv-field"><label>${tx("Value", "Вартість")} (${esc(worldCurrencyLabel())})</label><input type="number" min="1" step="1" data-manual-value value="${gatheringYieldPerSuccess(3)}"></div>
      <div class="ginv-field ginv-wide"><label>${tx("Custom label (optional)", "Власна назва (необов’язково)")}</label><input data-manual-label placeholder="${tx("e.g. Tempered steel stock", "наприклад, Загартована сталь")}"></div>
      <div class="ginv-field ginv-wide"><label>${tx("Note / intended use (optional)", "Примітка / призначення (необов’язково)")}</label><textarea data-manual-note placeholder="${tx("Where it came from or what it is suitable for.", "Звідки отримано матеріали або для чого вони підходять.")}"></textarea></div>
    </div>
    <div class="ginv-callout">${tx("Manual entries are written to the same persistent Stockpile as gathered materials and are marked as Manual entries.", "Ручні записи зберігаються в тому самому постійному запасі, що й зібрані матеріали, та мають позначку «Ручний запис».")}</div>
    <div class="ginv-row ginv-roll-actions"><button type="button" class="ginv-btn primary" data-manual-save>${tx("Add to Stockpile", "Додати до запасу")}</button></div>
  </div>`;
  document.body.appendChild(prompt);
  prompt.querySelector("[data-manual-close]")?.addEventListener("click", () => prompt.remove());
  prompt.querySelector("[data-manual-save]")?.addEventListener("click", async () => {
    const button = prompt.querySelector("[data-manual-save]");
    if (button) button.disabled = true;
    try {
      const domainId = String(prompt.querySelector("[data-manual-domain]")?.value ?? "");
      const tier = integer(prompt.querySelector("[data-manual-tier]")?.value, 3);
      const value = Math.max(0, Number(prompt.querySelector("[data-manual-value]")?.value ?? 0) || 0);
      const label = String(prompt.querySelector("[data-manual-label]")?.value ?? "").trim();
      const note = String(prompt.querySelector("[data-manual-note]")?.value ?? "").trim();
      const domain = GATHERING_DOMAINS[domainId];
      if (!domain || !domainAllowed(domainId)) throw new Error(tx("Choose an enabled component family.", "Оберіть дозволену групу компонентів."));
      if (value <= 0) throw new Error(tx("Value must be greater than zero.", "Вартість має бути більшою за нуль."));
      const payload = {
        actorId: actor.id, domainId, tier, value, label, note,
        componentType: domain.componentType, componentTypeEn: domain.componentTypeEn
      };
      if (game.user.isGM) {
        await addStockpileEntryAsGM(actor, {...payload, userId: game.user.id, source: "manual", manualLabel: label});
      } else {
        await requestGM("addManualComponents", payload);
      }
      ui.notifications.info(tx(`${currencyAmount(value)} added to ${actor.name}'s Component Stockpile.`, `${currencyAmount(value)} додано до запасу компонентів персонажа ${actor.name}.`));
      prompt.remove();
      try { onSaved?.(); } catch (_) {}
    } catch (error) {
      ui.notifications.error(error.message);
      if (button) button.disabled = false;
    }
  });
}


function shellHeader(title, subtitle, state) {
  return `
    <header class="ginv-head">
      <div>
        <div class="ginv-title">${esc(title)}</div>
        <div class="ginv-sub">${esc(subtitle)}</div>
      </div>
      <div class="ginv-spacer"></div>
      <div class="ginv-textsize"><span>${tx("Text Size", "Розмір тексту")}</span><button type="button" class="ginv-btn" data-text-inc ${state.textSize >= 4 ? "disabled" : ""}>⌃</button><button type="button" class="ginv-btn" data-text-dec ${state.textSize <= -4 ? "disabled" : ""}>⌄</button></div>
      <button type="button" class="ginv-btn" data-theme-btn>${esc(themeButtonLabel(state.theme))}</button>
      <button type="button" class="ginv-btn" data-minimize>▁ ${tx("Minimize", "Згорнути")}</button>
      <button type="button" class="ginv-btn" data-close>${tx("Close", "Закрити")}</button>
    </header>`;
}

function temporarilyHideOverlay(overlay, state, title = null) {
  if (!overlay?.isConnected) return null;
  removeRestoreButtons();
  const restore = document.createElement("button");
  const palette = restoreButtonPalette(state?.theme ?? storedTheme());
  restore.type = "button";
  restore.className = "ginv-restore";
  restore.dataset.ginvRestore = "true";
  restore.textContent = `↥ ${tx("Return to", "Повернутися до")} ${title || overlay.querySelector(".ginv-title")?.textContent?.trim() || "Inventions"}`;
  restore.style.setProperty("--ginv-restore-bg", palette.background);
  restore.style.setProperty("--ginv-restore-text", palette.text);
  restore.style.setProperty("--ginv-restore-border", palette.border);
  document.body.appendChild(restore);
  overlay.style.display = "none";

  const observer = new MutationObserver(() => {
    if (!overlay.isConnected) {
      restore.remove();
      observer.disconnect();
    }
  });
  observer.observe(document.body, {childList: true});

  restore.addEventListener("click", () => {
    restore.remove();
    observer.disconnect();
    if (overlay.isConnected) overlay.style.display = "flex";
  });
  return restore;
}

function bindShellControls(overlay, state, rerender, close) {
  overlay.querySelector("[data-close]")?.addEventListener("click", close);

  overlay.querySelector("[data-theme-btn]")?.addEventListener("click", () => {
    state.theme = nextTheme(state.theme);
    savePrefs(state.theme, state.textSize);
    applyShellPreferences(overlay, state);
  });

  overlay.querySelector("[data-text-inc]")?.addEventListener("click", () => {
    state.textSize = clamp(state.textSize + 2, -4, 4);
    savePrefs(state.theme, state.textSize);
    applyShellPreferences(overlay, state);
  });

  overlay.querySelector("[data-text-dec]")?.addEventListener("click", () => {
    state.textSize = clamp(state.textSize - 2, -4, 4);
    savePrefs(state.theme, state.textSize);
    applyShellPreferences(overlay, state);
  });

  overlay.querySelector("[data-minimize]")?.addEventListener("click", () => temporarilyHideOverlay(overlay, state));

  const footer = overlay.querySelector(".ginv-foot");
  if (footer && !footer.querySelector("[data-language-toggle]")) {
    const languageButton = document.createElement("button");
    languageButton.type = "button";
    languageButton.className = "ginv-btn ginv-language-toggle";
    languageButton.dataset.languageToggle = "true";
    languageButton.textContent = configuredModuleLanguage() === "uk" ? "🌐 EN" : "🌐 UA";
    languageButton.title = configuredModuleLanguage() === "uk" ? "Switch interface to English" : "Перемкнути інтерфейс українською";
    const spacer = footer.querySelector(".ginv-spacer");
    if (spacer) footer.insertBefore(languageButton, spacer);
    else footer.appendChild(languageButton);
    languageButton.addEventListener("click", async () => {
      try {
        await toggleModuleLanguage();
        rerender?.({preserveUI: true});
      } catch (error) {
        console.error("Genesys Inventions | Could not change language", error);
      }
    });
  }

  applyShellPreferences(overlay, state);
}

function importedSourceKey(doc) {
  return String(doc?.flags?.[IMPORT_FLAG_SCOPE]?.[IMPORT_FLAG]?.sourceKey ?? "").trim();
}

function libraryItemSignature(doc) {
  // World Items are often copies of the same imported Fantasy Gear document,
  // but their importer source keys are not guaranteed to stay identical.
  // De-duplicate the two libraries by their stable item profile instead of
  // trusting only the source key. Character Inventory remains a separate source.
  const system = doc?.system ?? {};
  const qualities = (system.qualities ?? [])
    .map(q => `${norm(q?.name)}:${integer(q?.rating, 1)}`)
    .sort()
    .join("|");
  return [
    norm(doc?.name),
    doc?.type ?? "",
    integer(system.rarity),
    integer(system.price),
    integer(system.encumbrance),
    integer(system.baseDamage),
    integer(system.critical),
    norm(system.range),
    integer(system.soak),
    integer(system.defense),
    qualities
  ].join("::");
}

async function collectLibraries(actor) {
  const [gearPack, skills, qualities] = await Promise.all([
    loadPackDocuments(PACKS.gear),
    loadPackDocuments(PACKS.skills),
    loadPackDocuments(PACKS.qualities)
  ]);
  const allowedTypes = new Set(["weapon", "armor", "gear"]);
  const sources = [];
  const libraryByIdentity = new Map();
  const qualityUsage = new Map();

  function recordQualityUsage(doc) {
    if (!doc || !["weapon", "armor"].includes(doc.type)) return;
    for (const q of doc.system?.qualities ?? []) {
      const key = norm(q?.name);
      if (!key) continue;
      if (!qualityUsage.has(key)) qualityUsage.set(key, new Set());
      qualityUsage.get(key).add(doc.type);
    }
  }

  function pushOwned(doc) {
    if (!doc || !allowedTypes.has(doc.type)) return;
    recordQualityUsage(doc);
    const key = doc.uuid ?? `owned:${doc.id}`;
    sources.push({doc, key, origin: "Character Inventory", kind: "item"});
  }

  function pushLibrary(doc, origin, precedence) {
    if (!doc || !allowedTypes.has(doc.type)) return;
    recordQualityUsage(doc);
    const identity = libraryItemSignature(doc);
    const existing = libraryByIdentity.get(identity);
    if (existing && existing.precedence >= precedence) return;
    libraryByIdentity.set(identity, {doc, key: doc.uuid ?? `${origin}:${doc.id}`, origin, precedence, kind: "item"});
  }

  actor?.items?.forEach(pushOwned);
  gearPack.forEach(doc => pushLibrary(doc, "Fantasy Gear", 1));
  game.items?.filter(doc => canViewDocument(doc)).forEach(doc => pushLibrary(doc, "World Items", 2));
  sources.push(...[...libraryByIdentity.values()].map(({precedence, ...row}) => row));

  for (const vehicle of game.actors?.filter?.(entry => entry.type === "vehicle" && canViewDocument(entry)) ?? []) {
    sources.push({doc: vehicle, key: vehicle.uuid ?? `vehicle:${vehicle.id}`, origin: "World Vehicles", kind: "vehicle"});
  }
  sources.sort((a, b) => a.doc.name.localeCompare(b.doc.name) || a.origin.localeCompare(b.origin));
  return {sources, skills, qualities, gearPack, qualityUsage, nuvarotechAvailable: hasNuvarotechSkill(skills) || actor?.items?.some?.(item => item.type === "skill" && /(?:нувар|nuvar)/i.test(String(item?.name ?? "")))};
}

function qualityRated(q) {
  const raw = q?.system?.isRated ?? q?.system?.rated ?? q?.system?.ranked;
  if (typeof raw === "boolean") return raw;
  return ["yes", "true", "rated"].includes(norm(raw));
}

function qualitiesMapFromItem(itemData, qualityDefs) {
  const map = new Map();
  for (const quality of itemData?.system?.qualities ?? []) {
    const def = qualityDefs.find(q => norm(q.name) === norm(quality.name));
    if (def) map.set(def.id, Math.max(1, integer(quality.rating, 1)));
  }
  return map;
}

function selectedQualityObjects(map, qualityDefs) {
  return [...map.entries()].map(([id, rating]) => {
    const q = qualityDefs.find(x => x.id === id);
    if (!q) return null;
    const rated = qualityRated(q);
    return {
      name: q.name,
      description: String(q.system?.description ?? ""),
      isRated: rated,
      rating: rated ? Math.max(1, integer(rating, 1)) : 1
    };
  }).filter(Boolean);
}

function normalizeItemProposal(state, libraries) {
  if (state.type === "vehicle") {
    return {
      name: state.name.trim() || "Unnamed Vehicle",
      type: "vehicle",
      img: state.img || "icons/svg/wing.svg",
      system: {
        description: state.description ? `<p>${esc(state.description).replace(/\n/g, "<br>")}</p>` : "",
        source: "Invention Project", rarity: clamp(integer(state.rarity),0,10), price: Math.max(0,integer(state.price)),
        silhouette: clamp(integer(state.silhouette,2),1,10), maxSpeed: clamp(integer(state.maxSpeed,1),0,6), handling: clamp(integer(state.handling),-4,4),
        defense: Math.max(0,integer(state.vehicleDefense)), armor: Math.max(0,integer(state.vehicleArmor)),
        hullTrauma: Math.max(1,integer(state.hullTrauma,1)), systemStrain: Math.max(1,integer(state.systemStrain,1)),
        encumbranceCapacity: Math.max(0,integer(state.vehicleEncumbrance)), controlSkill: String(state.controlSkill ?? ""),
        occupants: String(state.occupants ?? ""), consumables: String(state.consumables ?? "")
      },
      flags: {[FLAG_SCOPE]: {discipline: state.discipline ?? "standard", craftFamily: state.craftFamily ?? ""}}
    };
  }

  let data;
  if (state.baseKey) {
    const source = libraries.sources.find(row => row.key === state.baseKey);
    data = source?.kind === "item" ? cleanDocumentData(source.doc) : null;
  }
  if (!data) {
    const template = libraries.gearPack.find(doc => doc.type === state.type) ?? game.items.find(doc => doc.type === state.type);
    data = template ? cleanDocumentData(template) : {type: state.type, img: "icons/svg/item-bag.svg", system: {}, effects: []};
  }

  data.name = state.name.trim() || "Unnamed Invention";
  data.type = state.type;
  data.img = state.img || data.img || "icons/svg/item-bag.svg";
  data.effects = [];
  data.system = deepClone(data.system ?? {});
  Object.assign(data.system, {
    description: state.description ? `<p>${esc(state.description).replace(/\n/g, "<br>")}</p>` : "",
    source: state.discipline === "nuvarotech" ? "Nuvarotech Invention Project" : "Invention Project",
    rarity: clamp(integer(state.rarity), 0, 10), price: Math.max(0, integer(state.price)), encumbrance: Math.max(0, integer(state.encumbrance)),
    quantity: 1, damage: "undamaged", container: "", state: "carried"
  });

  if (state.type === "weapon") {
    Object.assign(data.system, {baseDamage: integer(state.damage), critical: clamp(integer(state.critical,3),1,6), range: state.range, skills: state.skill ? [state.skill] : [], qualities: selectedQualityObjects(state.qualities,libraries.qualities), damageCharacteristic: state.damageCharacteristic});
    delete data.system.soak; delete data.system.defense;
  } else if (state.type === "armor") {
    Object.assign(data.system, {soak: Math.max(0,integer(state.soak)), defense: Math.max(0,integer(state.defense)), qualities: selectedQualityObjects(state.qualities,libraries.qualities)});
    delete data.system.baseDamage; delete data.system.critical; delete data.system.range; delete data.system.skills;
  } else {
    delete data.system.qualities; delete data.system.baseDamage; delete data.system.critical; delete data.system.range; delete data.system.skills; delete data.system.soak; delete data.system.defense;
  }
  data.flags ??= {};
  data.flags[FLAG_SCOPE] = {...(data.flags[FLAG_SCOPE] ?? {}), discipline: state.discipline ?? "standard", craftFamily: state.craftFamily ?? ""};
  data.flags[IMPORT_FLAG_SCOPE] ??= {};
  data.flags[IMPORT_FLAG_SCOPE][IMPORT_FLAG] = {
    ...(data.flags?.[IMPORT_FLAG_SCOPE]?.[IMPORT_FLAG] ?? {}), managed:false, sourceKey:`invention|${norm(data.name)}|${randomId()}`, originalName:data.name,
    tags:[...new Set(["Created","Invention", ...(state.discipline === "nuvarotech" ? ["Nuvarotech"] : [])])]
  };
  return data;
}

function stateFromBaseDoc(state, row, libraries) {
  const doc = row?.doc;
  if (!doc) return;
  const s = doc.system ?? {};
  state.baseKey = row.key;
  state.baseOwned = row.origin === "Character Inventory";
  state.useBaseAsComponent = false;
  state.discipline = "standard";
  state.craftFamily = String(doc.flags?.[FLAG_SCOPE]?.craftFamily ?? state.craftFamily ?? "");
  if (row.kind === "vehicle" || doc.type === "vehicle") {
    state.type = "vehicle";
    state.name = doc.name;
    state.description = stripHTML(s.description ?? s.biography ?? "");
    state.img = doc.img ?? "icons/svg/wing.svg";
    state.rarity = integer(s.rarity, 0);
    state.price = integer(s.price, 0);
    state.silhouette = integer(s.silhouette, 2);
    state.maxSpeed = integer(s.maxSpeed ?? s.speed, 1);
    state.handling = integer(s.handling, 0);
    state.vehicleDefense = integer(s.defense, 0);
    state.vehicleArmor = integer(s.armor, 0);
    state.hullTrauma = integer(s.hullTrauma?.max ?? s.hullTraumaThreshold?.max ?? s.hullTrauma, 5);
    state.systemStrain = integer(s.systemStrain?.max ?? s.systemStrainThreshold?.max ?? s.systemStrain, 5);
    state.vehicleEncumbrance = integer(s.encumbranceCapacity ?? s.encumbrance?.max ?? 10);
    state.controlSkill = String(s.controlSkill ?? s.skill ?? "");
    state.occupants = String(s.occupants ?? s.complement ?? "1");
    state.consumables = String(s.consumables ?? "");
    return;
  }
  state.type = ["weapon", "armor", "gear"].includes(doc.type) ? doc.type : "gear";
  state.name = doc.name;
  state.description = stripHTML(s.description ?? "");
  state.img = doc.img ?? "";
  state.rarity = integer(s.rarity);
  state.price = integer(s.price);
  state.encumbrance = integer(s.encumbrance, 1);
  state.damage = integer(s.baseDamage, 6);
  state.critical = integer(s.critical, 3);
  state.range = String(s.range ?? "engaged");
  state.skill = Array.isArray(s.skills) ? String(s.skills[0] ?? "") : String(s.skills ?? "");
  state.damageCharacteristic = String(s.damageCharacteristic ?? "brawn");
  state.soak = integer(s.soak, 1);
  state.defense = integer(s.defense, 0);
  state.qualities = qualitiesMapFromItem({system: s}, libraries.qualities);
}

function bindField(overlay, selector, setter, event = "input") {
  overlay.querySelector(selector)?.addEventListener(event, e => setter(e.target.value, e));
}

function qualityApplicableToType(quality, type, libraries) {
  if (!quality || !["weapon", "armor"].includes(type)) return false;
  const key = norm(quality.name);
  const usage = libraries.qualityUsage?.get?.(key);
  if (usage?.has?.(type)) return true;
  const text = norm(`${quality.name} ${stripHTML(quality.system?.description ?? "")} ${JSON.stringify(quality.system ?? {})}`);
  if (type === "armor") {
    if (/armor|armour|обладунк|брон/.test(text)) return true;
    return ["reinforced", "defensive", "deflection"].includes(key);
  }
  if (/armor only|armour only|лише обладунк/.test(text)) return false;
  return usage ? usage.has("weapon") : /weapon|attack|combat|damage|critical|range|wielder|збро|атак|пошкод/.test(text);
}

function qualityBrowserHTML(state, libraries) {
  const rows = libraries.qualities.filter(q => qualityApplicableToType(q, state.type, libraries)).map(q => {
    const rated = qualityRated(q);
    const checked = state.qualities.has(q.id);
    const rating = state.qualities.get(q.id) ?? 1;
    const searchText = norm(`${q.name} ${stripHTML(q.system?.description ?? "")}`);
    return `<div class="ginv-qrow ${checked ? "selected" : ""}" data-quality-row data-quality-search-text="${esc(searchText)}">
      <input type="checkbox" data-quality="${q.id}" ${checked ? "checked" : ""}>
      <div><strong>${esc(q.name)}</strong><div class="ginv-sub">${esc(stripHTML(q.system?.description ?? "")).slice(0, 180)}</div></div>
      ${rated ? `<input type="number" data-quality-rating="${q.id}" min="1" max="10" step="1" value="${rating}" ${checked ? "" : "disabled"}>` : `<span class="ginv-sub">${tx("Unrated","Без рейтингу")}</span>`}
    </div>`;
  }).join("");
  return `<div class="ginv-field"><label>${tx("Search Qualities","Пошук властивостей")}</label><input type="search" data-quality-search value="${esc(state.qualitySearch)}" placeholder="${tx("Search","Пошук")}"></div><div class="ginv-list ginv-quality-grid" data-ginv-scroll-key="quality-list">${rows || `<div class="ginv-listrow">${tx("No Qualities are available for this item type.","Для цього типу предмета немає доступних властивостей.")}</div>`}</div><div class="ginv-sub" data-quality-empty hidden>${tx("No matching Qualities.","Нічого не знайдено.")}</div>`;
}

function applyQualityFilter(overlay, state) {
  const search = norm(state.qualitySearch);
  let visible = 0;
  overlay.querySelectorAll("[data-quality-row]").forEach(row => {
    const match = !search || String(row.dataset.qualitySearchText ?? "").includes(search);
    row.hidden = !match;
    if (match) visible++;
  });
  const empty = overlay.querySelector("[data-quality-empty]");
  if (empty) empty.hidden = visible !== 0;
}

async function openNewInvention(actor, parentState, goHome) {
  if (!canUseInventorActor(actor)) {
    ui.notifications.warn(tx("You cannot use that Actor to create an invention.", "Ви не можете використовувати цього Actor для створення винаходу."));
    goHome?.();
    return;
  }
  const libraries = await collectLibraries(actor);
  const allowedTypes = availableItemTypes();
  const initialType = allowedTypes[0] ?? "gear";
  const initialFamilies = availableCraftFamilies(initialType);
  const state = {
    theme: parentState.theme, textSize: parentState.textSize, step: 0, mode: "scratch", baseKey: "", baseSearch: "",
    baseOwned: false, useBaseAsComponent: false, discipline: "standard", type: initialType, craftFamily: initialFamilies[0]?.[0] ?? "", name: "", subtitle: "", description: "",
    img: "icons/svg/item-bag.svg", rarity: 0, price: 0, encumbrance: 1, damage: 6, critical: 3, range: "engaged", skill: "",
    damageCharacteristic: "brawn", soak: 1, defense: 0, qualitySearch: "", qualities: new Map(),
    silhouette: 2, maxSpeed: 1, handling: 0, vehicleDefense: 0, vehicleArmor: 0, hullTrauma: 5, systemStrain: 5,
    vehicleEncumbrance: 10, controlSkill: "", occupants: "1", consumables: "", busy: false, message: ""
  };

  const overlay = document.createElement("div");
  overlay.className = "ginv-overlay";
  document.body.appendChild(overlay);
  const close = () => { overlay.remove(); removeRestoreButtons(); };
  const home = () => { parentState.theme = state.theme; parentState.textSize = state.textSize; close(); goHome(); };

  const sourceTypeLabel = row => row.kind === "vehicle" || row.doc?.type === "vehicle" ? tx("Vehicle", "Транспорт") : itemTypeLabel(String(row.doc?.type ?? "gear"));
  const sourceRarity = row => integer(row.doc?.system?.rarity, 0);
  const sourcePrice = row => integer(row.doc?.system?.price, 0);

  function renderSource() {
    const allowedSources = libraries.sources.filter(row => {
      const t = row.kind === "vehicle" || row.doc?.type === "vehicle" ? "vehicle" : (["weapon","armor","gear"].includes(row.doc?.type) ? row.doc.type : "gear");
      return itemTypeAllowed(t);
    });
    const rows = allowedSources.map(row => {
      const searchText = norm(`${row.doc.name} ${row.origin} ${sourceTypeLabel(row)} rarity ${sourceRarity(row)} price ${sourcePrice(row)}`);
      return `<div class="ginv-listrow ginv-itemrow ${state.baseKey === row.key ? "selected" : ""}" data-base-item-row data-base-search-text="${esc(searchText)}">
        <img src="${esc(row.doc.img || "icons/svg/item-bag.svg")}">
        <div><strong>${esc(row.doc.name)}</strong><div class="ginv-sub">${esc(row.origin)} · ${esc(sourceTypeLabel(row))} · ${tx("Rarity","Рідкість")} ${sourceRarity(row)} · ${currencyAmount(sourcePrice(row))}</div></div>
        <button type="button" class="ginv-btn small ${state.baseKey === row.key ? "primary" : ""}" data-base-key="${esc(row.key)}">${state.baseKey === row.key ? tx("Selected","Обрано") : tx("Use","Обрати")}</button>
      </div>`;
    }).join("");
    const selected = allowedSources.find(row => row.key === state.baseKey);
    const exactOwned = selected?.origin === "Character Inventory";
    const reusePanel = state.mode === "base" && selected ? `<div class="ginv-callout ginv-base-reuse">
      <label class="ginv-checkline"><input type="checkbox" data-base-contributes ${state.useBaseAsComponent ? "checked" : ""}> <strong>${tx("Use the owned base object as part of construction", "Використати наявний базовий предмет у крафті")}</strong></label>
      <p class="ginv-help">${exactOwned ? tx("This exact Item from the inventor's inventory will be consumed when the invention is completed.", "Цей конкретний предмет з інвентарю винахідника буде використано під час завершення крафту.") : tx("This marks that the inventor owns an equivalent base object; the GM should verify it before approval.", "Це позначає, що винахідник має відповідний базовий предмет; GM має підтвердити його наявність під час схвалення.")} ${tx("Its recoverable Tier 3 / 5 / 7 value reduces the new project's component requirement. This is Workshop guidance based on the supplement's deconstruction caps.", "Його відновлювана вартість Tier 3 / 5 / 7 зменшує потребу нового проєкту в компонентах. Це Workshop-настанова на основі меж деконструкції з доповнення.")}</p>
    </div>` : "";

    return `<div class="ginv-cards">
      <button type="button" class="ginv-card ${state.mode === "scratch" ? "selected" : ""}" data-mode="scratch"><div class="ginv-icon">✦</div><h2>${tx("From Scratch","З нуля")}</h2><p class="ginv-help">${tx("Define a new object without using an existing one as the starting point.", "Створіть новий предмет або транспорт без базового об'єкта.")}</p></button>
      <button type="button" class="ginv-card ${state.mode === "base" ? "selected" : ""}" data-mode="base"><div class="ginv-icon">⚙</div><h2>${tx("Based on Existing Object","На основі готового об'єкта")}</h2><p class="ginv-help">${tx("Copy an existing Item or Vehicle as a stable starting snapshot, then propose changes.", "Скопіюйте наявний предмет або транспорт як базу й запропонуйте зміни.")}</p></button>
    </div>
    ${state.mode === "base" ? `<div class="ginv-panel" style="margin-top:14px"><div class="ginv-field"><label>${tx("Find Base Object","Знайти базовий об'єкт")}</label><input type="search" data-base-search value="${esc(state.baseSearch)}" placeholder="${tx("Search inventory, World Items, Fantasy Gear, or World Vehicles","Пошук в інвентарі, World Items, Fantasy Gear або World Vehicles")}"></div><div class="ginv-list ginv-scroll" data-ginv-scroll-key="base-items" style="margin-top:10px">${rows || `<div class="ginv-listrow">${tx("No allowed base objects are available.","Немає доступних базових об'єктів дозволеного типу.")}</div>`}</div><div class="ginv-sub" data-base-empty hidden>${tx("No matching objects.","Нічого не знайдено.")}</div>${reusePanel}</div>` : ""}`;
  }

  function applyBaseItemFilter() {
    const search = norm(state.baseSearch); let visible = 0;
    overlay.querySelectorAll("[data-base-item-row]").forEach(row => { const match = !search || String(row.dataset.baseSearchText ?? "").includes(search); row.hidden = !match; if (match) visible++; });
    const empty = overlay.querySelector("[data-base-empty]"); if (empty) empty.hidden = visible !== 0;
  }

  function itemFieldsHTML() {
    const skills = libraries.skills.map(s => `<option value="${esc(s.name)}" ${state.skill === s.name ? "selected" : ""}>${esc(s.name)}</option>`).join("");
    const controlSkills = libraries.skills.map(s => `<option value="${esc(s.name)}" ${state.controlSkill === s.name ? "selected" : ""}>${esc(s.name)}</option>`).join("");
    const types = availableItemTypes();
    if (!types.includes(state.type)) state.type = types[0] ?? "gear";
    const typeOptions = types.map(type => `<option value="${type}" ${state.type === type ? "selected" : ""}>${esc(itemTypeLabel(type))}</option>`).join("");
    const families = availableCraftFamilies(state.type);
    if (!families.some(([id]) => id === state.craftFamily)) state.craftFamily = families[0]?.[0] ?? "";
    const familyOptions = families.map(([id,d]) => `<option value="${esc(id)}" ${state.craftFamily === id ? "selected" : ""}>${d.icon} ${esc(domainText(d,"label"))}</option>`).join("");
    const discipline = libraries.nuvarotechAvailable && domainAllowed("nuvarotech") ? `<div class="ginv-field"><label>${tx("Craft Discipline","Дисципліна крафту")}</label><select data-discipline><option value="standard" ${state.discipline === "standard" ? "selected" : ""}>${tx("Standard","Звичайна")}</option><option value="nuvarotech" ${state.discipline === "nuvarotech" ? "selected" : ""}>Нуваротехніка · Enkor</option></select></div>` : "";
    const common = `<div class="ginv-field"><label>${tx("Object Type","Тип об'єкта")}</label><select data-type>${typeOptions}</select></div>
      <div class="ginv-field"><label>${tx("Crafting Family","Галузь крафту")}</label><select data-craft-family>${familyOptions}</select><div class="ginv-help">${tx("Controlled by the GM in module settings.","Доступні галузі визначає GM у налаштуваннях модуля.")}</div></div>
      ${discipline}<div class="ginv-field"><label>${tx("Rarity","Рідкість")}</label><input type="number" data-rarity min="0" max="10" step="1" value="${state.rarity}"></div>
      <div class="ginv-field"><label>${tx("Proposed Retail Price","Запропонована роздрібна ціна")}</label><input type="number" data-price min="0" step="1" value="${state.price}"><div class="ginv-help">${esc(worldCurrencyLabel())}</div></div>`;
    if (state.type === "vehicle") {
      return `<div class="ginv-grid3">${common}
        <div class="ginv-field"><label>${tx("Silhouette","Силует")}</label><input type="number" data-silhouette min="1" max="10" value="${state.silhouette}"></div>
        <div class="ginv-field"><label>${tx("Max Speed","Максимальна швидкість")}</label><input type="number" data-max-speed min="0" max="6" value="${state.maxSpeed}"></div>
        <div class="ginv-field"><label>${tx("Handling","Керованість")}</label><input type="number" data-handling min="-4" max="4" value="${state.handling}"></div>
        <div class="ginv-field"><label>${tx("Defense","Захист")}</label><input type="number" data-vehicle-defense min="0" value="${state.vehicleDefense}"></div>
        <div class="ginv-field"><label>${tx("Armor","Броня")}</label><input type="number" data-vehicle-armor min="0" value="${state.vehicleArmor}"></div>
        <div class="ginv-field"><label>${tx("Hull Trauma Threshold","Поріг пошкоджень корпусу")}</label><input type="number" data-hull min="1" value="${state.hullTrauma}"></div>
        <div class="ginv-field"><label>${tx("System Strain Threshold","Поріг перевантаження систем")}</label><input type="number" data-system-strain min="1" value="${state.systemStrain}"></div>
        <div class="ginv-field"><label>${tx("Encumbrance Capacity","Вантажомісткість")}</label><input type="number" data-vehicle-enc min="0" value="${state.vehicleEncumbrance}"></div>
        <div class="ginv-field"><label>${tx("Control Skill","Навичка керування")}</label><select data-control-skill><option value="">${tx("Choose Skill","Оберіть навичку")}</option>${controlSkills}</select></div>
        <div class="ginv-field"><label>${tx("Occupants / Complement","Екіпаж / пасажири")}</label><input data-occupants value="${esc(state.occupants)}"></div>
        <div class="ginv-field"><label>${tx("Consumables","Запаси")}</label><input data-consumables value="${esc(state.consumables)}" placeholder="${tx("e.g. 1 week","наприклад, 1 тиждень")}"></div>
      </div><div class="ginv-callout">${tx("Vehicle profiles use the Expanded Player's Guide construction framework. The GM still approves the final crafting parameters.","Профіль транспорту використовує настанови Expanded Player's Guide. Остаточні параметри крафту все одно затверджує GM.")}</div>`;
    }
    return `<div class="ginv-grid3">${common}
      <div class="ginv-field"><label>${tx("Encumbrance","Громіздкість")}</label><input type="number" data-enc min="0" step="1" value="${state.encumbrance}"></div>
      ${state.type === "weapon" ? `<div class="ginv-field"><label>${tx("Base Damage","Базова шкода")}</label><input type="number" data-damage value="${state.damage}"></div><div class="ginv-field"><label>${tx("Critical","Критичний рейтинг")}</label><input type="number" data-critical min="1" max="6" value="${state.critical}"></div><div class="ginv-field"><label>${tx("Range","Дистанція")}</label><select data-range>${["engaged","short","medium","long","extreme"].map(r => `<option value="${r}" ${state.range === r ? "selected" : ""}>${r}</option>`).join("")}</select></div><div class="ginv-field"><label>${tx("Combat Skill","Бойова навичка")}</label><select data-skill><option value="">${tx("Choose Skill","Оберіть навичку")}</option>${skills}</select></div><div class="ginv-field"><label>${tx("Damage Characteristic","Характеристика шкоди")}</label><select data-dmg-char>${["brawn","agility","intellect","cunning","willpower","presence"].map(c => `<option value="${c}" ${state.damageCharacteristic === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>` : ""}
      ${state.type === "armor" ? `<div class="ginv-field"><label>${tx("Soak","Поглинання")}</label><input type="number" data-soak min="0" value="${state.soak}"></div><div class="ginv-field"><label>${tx("Defense","Захист")}</label><input type="number" data-defense min="0" value="${state.defense}"></div>` : ""}
    </div>${["weapon","armor"].includes(state.type) ? `<div class="ginv-panel" style="margin-top:14px"><h3>${tx("Item Qualities","Властивості предмета")}</h3><p class="ginv-help">${tx("Only Qualities compatible with the selected object type are shown.","Показано лише властивості, сумісні з обраним типом об'єкта.")}</p>${qualityBrowserHTML(state, libraries)}</div>` : ""}`;
  }

  function renderProfile() {
    return `<div class="ginv-grid"><div class="ginv-panel"><h2>${tx("Concept","Концепція")}</h2><div class="ginv-grid"><div class="ginv-field"><label>${tx("Invention Name","Назва винаходу")}</label><input data-name value="${esc(state.name)}"></div><div class="ginv-field"><label>${tx("Subtitle","Підзаголовок")}</label><input data-subtitle value="${esc(state.subtitle)}" placeholder="${tx("Optional","Необов'язково")}"></div><div class="ginv-field ginv-wide"><label>${tx("Description","Опис")}</label><textarea data-description>${esc(state.description)}</textarea></div></div></div><div class="ginv-panel"><h2>${tx("Proposed Profile","Запропонований профіль")}</h2>${itemFieldsHTML()}</div></div>`;
  }

  function renderReview() {
    const item = normalizeItemProposal(state, libraries); const base = libraries.sources.find(row => row.key === state.baseKey);
    const family = GATHERING_DOMAINS[state.craftFamily];
    return `<div class="ginv-grid"><div class="ginv-panel"><h2>${esc(state.name || tx("Unnamed Invention","Безіменний винахід"))}</h2><div class="ginv-chips"><span class="ginv-chip action">${esc(itemTypeLabel(state.type))}</span>${family ? `<span class="ginv-chip">${family.icon} ${esc(domainText(family,"label"))}</span>` : ""}${state.discipline === "nuvarotech" ? `<span class="ginv-chip good">Нуваротехніка</span>` : ""}<span class="ginv-chip">${tx("Rarity","Рідкість")} ${state.rarity}</span><span class="ginv-chip">${currencyAmount(state.price)}</span></div><p>${esc(state.description || tx("No description.","Опис відсутній."))}</p></div><div class="ginv-panel"><h2>${tx("Submission","Подання GM")}</h2><p><strong>${tx("Inventor:","Винахідник:")}</strong> ${esc(actor.name)}</p><p><strong>${tx("Starting point:","Основа:")}</strong> ${state.mode === "base" ? esc(base?.doc?.name ?? tx("No base selected","Базу не обрано")) : tx("From scratch","З нуля")}</p>${state.mode === "base" && state.useBaseAsComponent ? `<p><strong>${tx("Owned base contribution:","Внесок базового предмета:")}</strong> ${tx("requested","врахувати")}</p>` : ""}<p><strong>${tx("Proposed profile:","Запропонований профіль:")}</strong> ${esc(itemStatSummary(item))}</p><div class="ginv-callout">${tx("The GM sets the final crafting skill, base difficulty, difficulty upgrades, time, and total component cost.","GM визначає остаточну навичку крафту, базову складність, її підвищення, час і загальну вартість компонентів.")}</div></div></div>${state.message ? `<div class="ginv-callout ${state.message.startsWith("Error") ? "ginv-bad" : "ginv-good"}">${esc(state.message)}</div>` : ""}`;
  }

  function render({preserveUI = false} = {}) {
    const renderState = preserveUI ? captureRenderState(overlay) : null;
    const body = state.step === 0 ? renderSource() : state.step === 1 ? renderProfile() : renderReview();
    overlay.innerHTML = `<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">${shellHeader(tx("New Invention","Новий винахід"), `${actor.name} · Wonderous Inventions`, state)}<main class="ginv-main"><div class="ginv-stepbar"><span class="ginv-step ${state.step === 0 ? "active" : ""}">1 · ${tx("Starting Point","Основа")}</span><span class="ginv-step ${state.step === 1 ? "active" : ""}">2 · ${tx("Concept & Profile","Концепція та профіль")}</span><span class="ginv-step ${state.step === 2 ? "active" : ""}">3 · ${tx("Review","Перевірка")}</span></div>${body}</main><footer class="ginv-foot"><button type="button" class="ginv-btn" data-home>← Inventions</button><div class="ginv-spacer"></div>${state.step > 0 ? `<button type="button" class="ginv-btn" data-back>${tx("Back","Назад")}</button>` : ""}${state.step < 2 ? `<button type="button" class="ginv-btn primary" data-next>${tx("Next","Далі")}</button>` : `<button type="button" class="ginv-btn primary" data-submit ${state.busy ? "disabled" : ""}>${state.busy ? tx("Submitting...","Надсилання...") : tx("Submit to GM","Надіслати GM")}</button>`}</footer></div>`;
    bindShellControls(overlay, state, render, close);
    overlay.querySelector("[data-home]")?.addEventListener("click", home);
    overlay.querySelector("[data-back]")?.addEventListener("click", () => { state.step--; state.message = ""; render(); });
    overlay.querySelector("[data-next]")?.addEventListener("click", () => { if (state.step === 0 && state.mode === "base" && !state.baseKey) { ui.notifications.warn(tx("Choose a base object first.", "Спочатку оберіть базовий об'єкт.")); return; } if (state.step === 1 && !state.name.trim()) { ui.notifications.warn(tx("Give the invention a name first.", "Спочатку дайте винаходу назву.")); return; } state.step++; render(); });
    overlay.querySelectorAll("[data-mode]").forEach(btn => btn.addEventListener("click", () => { state.mode = btn.dataset.mode; if (state.mode === "scratch") { state.baseKey = ""; state.useBaseAsComponent = false; } render({preserveUI:true}); }));
    bindField(overlay, "[data-base-search]", value => { state.baseSearch = value; applyBaseItemFilter(); });
    overlay.querySelectorAll("[data-base-key]").forEach(btn => btn.addEventListener("click", () => { const row = libraries.sources.find(x => x.key === btn.dataset.baseKey); if (!row) return; state.mode = "base"; stateFromBaseDoc(state, row, libraries); render({preserveUI:true}); }));
    overlay.querySelector("[data-base-contributes]")?.addEventListener("change", e => { state.useBaseAsComponent = Boolean(e.target.checked); });

    bindField(overlay,"[data-name]",v=>state.name=v); bindField(overlay,"[data-subtitle]",v=>state.subtitle=v); bindField(overlay,"[data-description]",v=>state.description=v);
    bindField(overlay,"[data-type]",v=>{state.type=v;state.qualities=new Map();const fam=availableCraftFamilies(v);if(!fam.some(([id])=>id===state.craftFamily))state.craftFamily=fam[0]?.[0]??"";render({preserveUI:true});},"change"); bindField(overlay,"[data-craft-family]",v=>state.craftFamily=v,"change"); bindField(overlay,"[data-discipline]",v=>state.discipline=v,"change");
    bindField(overlay,"[data-rarity]",v=>state.rarity=clamp(integer(v),0,10),"change"); bindField(overlay,"[data-price]",v=>state.price=Math.max(0,integer(v)),"change"); bindField(overlay,"[data-enc]",v=>state.encumbrance=Math.max(0,integer(v)),"change");
    bindField(overlay,"[data-damage]",v=>state.damage=integer(v),"change"); bindField(overlay,"[data-critical]",v=>state.critical=clamp(integer(v,3),1,6),"change"); bindField(overlay,"[data-range]",v=>state.range=v,"change"); bindField(overlay,"[data-skill]",v=>state.skill=v,"change"); bindField(overlay,"[data-dmg-char]",v=>state.damageCharacteristic=v,"change");
    bindField(overlay,"[data-soak]",v=>state.soak=Math.max(0,integer(v)),"change"); bindField(overlay,"[data-defense]",v=>state.defense=Math.max(0,integer(v)),"change");
    bindField(overlay,"[data-silhouette]",v=>state.silhouette=clamp(integer(v,2),1,10),"change"); bindField(overlay,"[data-max-speed]",v=>state.maxSpeed=clamp(integer(v,1),0,6),"change"); bindField(overlay,"[data-handling]",v=>state.handling=clamp(integer(v),-4,4),"change"); bindField(overlay,"[data-vehicle-defense]",v=>state.vehicleDefense=Math.max(0,integer(v)),"change"); bindField(overlay,"[data-vehicle-armor]",v=>state.vehicleArmor=Math.max(0,integer(v)),"change"); bindField(overlay,"[data-hull]",v=>state.hullTrauma=Math.max(1,integer(v,1)),"change"); bindField(overlay,"[data-system-strain]",v=>state.systemStrain=Math.max(1,integer(v,1)),"change"); bindField(overlay,"[data-vehicle-enc]",v=>state.vehicleEncumbrance=Math.max(0,integer(v)),"change"); bindField(overlay,"[data-control-skill]",v=>state.controlSkill=v,"change"); bindField(overlay,"[data-occupants]",v=>state.occupants=v); bindField(overlay,"[data-consumables]",v=>state.consumables=v);
    bindField(overlay,"[data-quality-search]",v=>{state.qualitySearch=v;applyQualityFilter(overlay,state);});
    overlay.querySelectorAll("[data-quality]").forEach(box => box.addEventListener("change", () => { if (box.checked) state.qualities.set(box.dataset.quality,state.qualities.get(box.dataset.quality)??1); else state.qualities.delete(box.dataset.quality); const row=box.closest(".ginv-qrow"); row?.classList.toggle("selected",box.checked); const rating=row?.querySelector("[data-quality-rating]"); if(rating) rating.disabled=!box.checked; }));
    overlay.querySelectorAll("[data-quality-rating]").forEach(input=>input.addEventListener("input",()=>{if(state.qualities.has(input.dataset.qualityRating))state.qualities.set(input.dataset.qualityRating,Math.max(1,integer(input.value,1)));}));
    applyBaseItemFilter(); applyQualityFilter(overlay,state); if(renderState) restoreRenderState(overlay,renderState);

    overlay.querySelector("[data-submit]")?.addEventListener("click", async () => {
      if (state.busy) return; state.busy=true;state.message="";render({preserveUI:true});
      try {
        const item=normalizeItemProposal(state,libraries); const base=libraries.sources.find(row=>row.key===state.baseKey);
        const rawProject={concept:{name:state.name.trim(),subtitle:state.subtitle.trim(),description:state.description.trim(),mode:state.mode,craftFamily:state.craftFamily,baseSource:state.mode==="base"&&base?{uuid:base.doc.uuid??"",name:base.doc.name,origin:base.origin,type:sourceTypeLabel(base),rarity:sourceRarity(base),price:sourcePrice(base),useAsComponent:Boolean(state.useBaseAsComponent),actorItemId:base.origin==="Character Inventory"?String(base.doc.id??""):""}:null},proposedItem:item};
        const result=game.user.isGM?await createProjectAsGM({userId:game.user.id,actorId:actor.id,project:rawProject}):await requestGM("createProject",{actorId:actor.id,project:rawProject});
        ui.notifications.info(tx(`${result.projectName} submitted for GM approval.`, `${result.projectName} надіслано GM на схвалення.`)); close(); openWorkshop(actor.id);
      } catch(error){state.busy=false;state.message=`Error: ${error.message}`;render({preserveUI:true});}
    });
  }
  render();
}

function projectCardHTML(journal) {
  const project = projectFromJournal(journal);
  const actor = game.actors.get(project.actorId);
  const fx = schematicEffects(project);
  return `<div class="ginv-listrow">
    <div><div class="ginv-row"><strong>${esc(project.concept?.name ?? journal.name)}</strong><span class="ginv-status ${esc(project.status)}">${esc(statusLabel(project.status))}</span></div><div class="ginv-sub">${esc(actor?.name ?? tx("Unknown Character","Невідомий персонаж"))} · ${tx("Schematic","Креслення")} L${fx.level} · ${tx("Updated","Оновлено")} ${esc(moduleDate(project.updatedAt ?? project.createdAt))}</div></div>
    <button type="button" class="ginv-btn small" data-open-project="${journal.id}">${tx("Open","Відкрити")}</button>
  </div>`;
}

function renderApprovedItemFields(project, review) {
  const item = review.item;
  const s = item.system ?? {};
  const rangeLabel = value => ({engaged:tx("Engaged","Впритул"),short:tx("Short","Близька"),medium:tx("Medium","Середня"),long:tx("Long","Далека"),extreme:tx("Extreme","Гранична")})[value] ?? value;
  if (item.type === "vehicle") {
    return `<div class="ginv-grid3">
      <div class="ginv-field"><label>${tx("Approved Name","Схвалена назва")}</label><input data-review-name value="${esc(item.name)}"></div>
      <div class="ginv-field"><label>${tx("Rarity","Рідкість")}</label><input type="number" min="0" max="10" data-review-rarity value="${review.rules.rarity}"></div>
      <div class="ginv-field"><label>${tx("Retail Price","Роздрібна ціна")}</label><input type="number" min="0" data-review-price value="${s.price ?? 0}"></div>
      <div class="ginv-field"><label>${tx("Silhouette","Силует")}</label><input type="number" min="1" max="10" data-review-silhouette value="${s.silhouette ?? 2}"></div>
      <div class="ginv-field"><label>${tx("Max Speed","Максимальна швидкість")}</label><input type="number" min="0" max="6" data-review-max-speed value="${s.maxSpeed ?? 1}"></div>
      <div class="ginv-field"><label>${tx("Handling","Керованість")}</label><input type="number" min="-4" max="4" data-review-handling value="${s.handling ?? 0}"></div>
      <div class="ginv-field"><label>${tx("Defense","Захист")}</label><input type="number" min="0" data-review-vehicle-defense value="${s.defense ?? 0}"></div>
      <div class="ginv-field"><label>${tx("Armor","Броня")}</label><input type="number" min="0" data-review-vehicle-armor value="${s.armor ?? 0}"></div>
      <div class="ginv-field"><label>${tx("Hull Trauma","Поріг пошкоджень корпусу")}</label><input type="number" min="1" data-review-hull value="${s.hullTrauma ?? 1}"></div>
      <div class="ginv-field"><label>${tx("System Strain","Поріг перевантаження систем")}</label><input type="number" min="1" data-review-system-strain value="${s.systemStrain ?? 1}"></div>
      <div class="ginv-field"><label>${tx("Encumbrance Capacity","Вантажомісткість")}</label><input type="number" min="0" data-review-vehicle-enc value="${s.encumbranceCapacity ?? 0}"></div>
      <div class="ginv-field"><label>${tx("Control Skill","Навичка керування")}</label><input data-review-control-skill value="${esc(s.controlSkill ?? "")}"></div>
      <div class="ginv-field"><label>${tx("Occupants / Crew","Пасажири / екіпаж")}</label><input data-review-occupants value="${esc(s.occupants ?? "")}"></div>
      <div class="ginv-field"><label>${tx("Consumables","Запаси")}</label><input data-review-consumables value="${esc(s.consumables ?? "")}"></div>
    </div>`;
  }
  return `<div class="ginv-grid3">
    <div class="ginv-field"><label>${tx("Approved Name","Схвалена назва")}</label><input data-review-name value="${esc(item.name)}"></div>
    <div class="ginv-field"><label>${tx("Rarity","Рідкість")}</label><input type="number" min="0" max="10" data-review-rarity value="${review.rules.rarity}"></div>
    <div class="ginv-field"><label>${tx("Retail Price","Роздрібна ціна")}</label><input type="number" min="0" data-review-price value="${s.price ?? 0}"></div>
    <div class="ginv-field"><label>${tx("Encumbrance","Громіздкість")}</label><input type="number" min="0" data-review-enc value="${s.encumbrance ?? 0}"></div>
    ${item.type === "weapon" ? `<div class="ginv-field"><label>${tx("Base Damage","Базова шкода")}</label><input type="number" data-review-damage value="${s.baseDamage ?? 0}"></div><div class="ginv-field"><label>${tx("Critical","Критичний рейтинг")}</label><input type="number" min="1" max="6" data-review-critical value="${s.critical ?? 3}"></div><div class="ginv-field"><label>${tx("Range","Дистанція")}</label><select data-review-range>${["engaged","short","medium","long","extreme"].map(r => `<option value="${r}" ${s.range === r ? "selected" : ""}>${rangeLabel(r)}</option>`).join("")}</select></div>` : ""}
    ${item.type === "armor" ? `<div class="ginv-field"><label>${tx("Soak","Поглинання")}</label><input type="number" min="0" data-review-soak value="${s.soak ?? 0}"></div><div class="ginv-field"><label>${tx("Defense","Захист")}</label><input type="number" min="0" data-review-defense value="${s.defense ?? 0}"></div>` : ""}
  </div>`;
}

async function openGMReview(journal, parentState, returnToWorkshop) {
  if (!game.user.isGM) return;
  const project = projectFromJournal(journal);
  if (!project) return;
  const skills = await loadPackDocuments(PACKS.skills);
  const defaultSchematicSkill = skills.find(s => norm(s.name) === "knowledge")?.name
    ?? skills.find(s => norm(s.name) === norm("Ерудиція"))?.name
    ?? "";
  const discipline = String(project.proposedItem?.flags?.[FLAG_SCOPE]?.discipline ?? "standard");
  const defaultCraftingSkill = discipline === "nuvarotech"
    ? (skills.find(s => /(?:нувар|nuvar)/i.test(s.name))?.name ?? "")
    : "";
  const review = {
    item: cleanDocumentData(project.approval?.item ?? project.proposedItem),
    rules: deepClone(project.approval?.rules ?? {
      rarity: clamp(integer(project.proposedItem?.system?.rarity), 0, 10),
      totalCost: Math.max(0, integer(project.proposedItem?.system?.price)),
      craftingSkill: defaultCraftingSkill,
      schematicSkill: defaultSchematicSkill,
      craftingDifficulty: null,
      craftingUpgrades: 0,
      craftingHours: 0,
      notes: "",
      specialComponents: []
    })
  };
  review.rules.schematicSkill ??= defaultSchematicSkill;
  review.rules.craftingUpgrades = Math.max(0, integer(review.rules.craftingUpgrades, 0));
  const state = {theme: parentState.theme, textSize: parentState.textSize, message: ""};
  const overlay = document.createElement("div"); overlay.className = "ginv-overlay"; document.body.appendChild(overlay);
  const close = () => { overlay.remove(); removeRestoreButtons(); };
  const back = () => { parentState.theme = state.theme; parentState.textSize = state.textSize; close(); returnToWorkshop(); };

  function syncComponentPreview() {
    const draft = deepClone(project);
    draft.approval = {rules: deepClone(review.rules), item: deepClone(review.item)};
    const preview = currentComponents(draft);
    const base = baseObjectContribution(draft);
    const node = overlay.querySelector("[data-component-preview]");
    if (node) {
      node.innerHTML = `<strong>${tx("Component preview:", "Попередній розрахунок компонентів:")}</strong> Tier 3 ${currencyAmount(preview.tier3)} · Tier 5 ${currencyAmount(preview.tier5)} · Tier 7 ${currencyAmount(preview.tier7)}.${project.concept?.baseSource?.useAsComponent ? ` <br><strong>${tx("Base object credit:", "Внесок базового об’єкта:")}</strong> Tier 3 ${currencyAmount(base.tier3)} · Tier 5 ${currencyAmount(base.tier5)} · Tier 7 ${currencyAmount(base.tier7)}.` : ""} ${tx("The supplement defines the rarity split; base-object credit is Workshop guidance based on its deconstruction caps.", "Доповнення визначає розподіл за рідкістю; внесок базового об’єкта є Workshop-настановою на основі обмежень деконструкції.")}`;
    }
  }

  function render({preserveUI = false} = {}) {
    const renderState = preserveUI ? captureRenderState(overlay) : null;
    const skillOptions = skills.map(s => `<option value="${esc(s.name)}" ${review.rules.craftingSkill === s.name ? "selected" : ""}>${esc(s.name)}</option>`).join("");
    const schematicSkillOptions = skills.map(s => `<option value="${esc(s.name)}" ${review.rules.schematicSkill === s.name ? "selected" : ""}>${esc(s.name)}</option>`).join("");
    const previewDraft = deepClone(project); previewDraft.approval = {rules: deepClone(review.rules), item: deepClone(review.item)}; const componentPreview = currentComponents(previewDraft);
    overlay.innerHTML = `<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">
      ${shellHeader(tx("GM Invention Review", "Перевірка винаходу GM"), `${project.concept.name} · ${tx("submitted by", "надіслано")} ${userName(project.creatorUserId)}`, state)}
      <main class="ginv-main">
        <div class="ginv-grid">
          <div class="ginv-panel"><h2>${tx("Player Proposal", "Пропозиція гравця")}</h2><p>${esc(project.concept.description || tx("No description.", "Опис відсутній."))}</p><p><strong>${tx("Crafting family:", "Група крафту:")}</strong> ${esc(domainText(GATHERING_DOMAINS[project.concept?.craftFamily], "label") || tx("Not specified", "Не вказано"))}</p><p><strong>${tx("Proposed:", "Запропоновано:")}</strong> ${esc(itemStatSummary(project.proposedItem))}</p>${project.concept.baseSource ? `<div class="ginv-row"><p style="margin:0"><strong>${tx("Based on:", "На основі:")}</strong> ${esc(project.concept.baseSource.name)}</p><button type="button" class="ginv-btn small" data-open-original-item>${tx("Open Original Object", "Відкрити оригінальний об’єкт")}</button></div>` : ""}</div>
          <div class="ginv-panel"><h2>${project.proposedItem?.type === "vehicle" ? tx("Approved Vehicle Profile", "Схвалений профіль транспорту") : tx("Approved Item Profile", "Схвалений профіль предмета")}</h2>${renderApprovedItemFields(project, review)}</div>
        </div>
        <div class="ginv-panel" style="margin-top:14px"><h2>${tx("Crafting Parameters", "Параметри крафту")}</h2><div class="ginv-grid3">
          <div class="ginv-field"><label>${tx("Crafting Skill", "Навичка крафту")}</label><select data-review-craft-skill><option value="">${tx("Choose Skill", "Оберіть навичку")}</option>${skillOptions}</select></div>
          <div class="ginv-field"><label>${tx("Schematic Skill", "Навичка креслення")}</label><select data-review-schematic-skill><option value="">${tx("Choose Skill", "Оберіть навичку")}</option>${schematicSkillOptions}</select><div class="ginv-help">${tx("Wonderous Inventions uses Knowledge in Genesys; this override supports custom world skill lists.", "У Wonderous Inventions для креслень використовується Knowledge; тут GM може обрати відповідну навичку свого світу.")}</div></div>
          <div class="ginv-field"><label>${tx("Base Crafting Difficulty", "Базова складність крафту")}</label><select data-review-difficulty><option value="" ${review.rules.craftingDifficulty === null || review.rules.craftingDifficulty === undefined ? "selected" : ""}>${tx("Choose Difficulty", "Оберіть складність")}</option>${[0,1,2,3,4,5].map(n => `<option value="${n}" ${Number(review.rules.craftingDifficulty) === n ? "selected" : ""}>${difficultyLabel(n)}</option>`).join("")}</select><div class="ginv-help">${Number.isFinite(Number(review.rules.craftingDifficulty)) ? difficultyDisplayHTML(review.rules.craftingDifficulty, review.rules.craftingUpgrades) : ""}</div></div>
          <div class="ginv-field"><label>${tx("Difficulty Upgrades", "Підвищення складності")}</label><input type="number" min="0" max="12" data-review-upgrades value="${review.rules.craftingUpgrades ?? 0}"><div class="ginv-help">${tx("Each upgrade converts a Difficulty die into a Challenge die; if no Difficulty dice remain, the next upgrade adds a Difficulty die.", "Кожне підвищення замінює кубик складності на кубик виклику; якщо фіолетових кубиків не лишилося, наступне підвищення додає новий кубик складності.")}</div></div>
          <div class="ginv-field"><label>${tx("Base Crafting Time (hours)", "Базовий час крафту (години)")}</label><input type="number" min="0" step=".5" data-review-hours value="${review.rules.craftingHours}"></div>
          <div class="ginv-field"><label>${tx("Total Component Cost", "Загальна вартість компонентів")}</label><input type="number" min="0" data-review-total-cost value="${review.rules.totalCost}"><div class="ginv-help">${esc(worldCurrencyLabel())}</div></div>
          <div class="ginv-field ginv-wide"><label>${tx("GM Notes", "Нотатки GM")}</label><textarea data-review-notes>${esc(review.rules.notes ?? "")}</textarea></div>
        </div>
        <div class="ginv-callout" data-component-preview><strong>${tx("Component preview:", "Попередній розрахунок компонентів:")}</strong> Tier 3 ${currencyAmount(componentPreview.tier3)} · Tier 5 ${currencyAmount(componentPreview.tier5)} · Tier 7 ${currencyAmount(componentPreview.tier7)}.</div></div>
        ${state.message ? `<div class="ginv-callout ginv-bad">${esc(state.message)}</div>` : ""}
      </main>
      <footer class="ginv-foot"><button type="button" class="ginv-btn" data-back>← ${tx("Review Queue", "Черга перевірки")}</button><div class="ginv-spacer"></div><button type="button" class="ginv-btn danger" data-reject>${tx("Reject", "Відхилити")}</button><button type="button" class="ginv-btn primary" data-approve>${tx("Approve Project", "Схвалити проєкт")}</button></footer>
    </div>`;
    bindShellControls(overlay, state, render, close);
    overlay.querySelector("[data-back]")?.addEventListener("click", back);
    overlay.querySelector("[data-open-original-item]")?.addEventListener("click", async () => {
      const uuid = String(project.concept?.baseSource?.uuid ?? "").trim();
      if (!uuid) { state.message = tx("The original object reference is unavailable.", "Посилання на оригінальний об’єкт недоступне."); render({preserveUI: true}); return; }
      try {
        const original = await fromUuid(uuid);
        if (!original?.sheet) throw new Error(tx("Original object could not be resolved.", "Не вдалося знайти оригінальний об’єкт."));
        temporarilyHideOverlay(overlay, state, tx("GM Invention Review", "Перевірка винаходу GM"));
        original.sheet.render(true);
      } catch (error) {
        state.message = tx(`Could not open original object: ${error.message}`, `Не вдалося відкрити оригінальний об’єкт: ${error.message}`);
        render({preserveUI: true});
      }
    });
    bindField(overlay, "[data-review-name]", v => review.item.name = v);
    bindField(overlay, "[data-review-rarity]", v => {
      review.rules.rarity = clamp(integer(v), 0, 10);
      review.item.system.rarity = review.rules.rarity;
      syncComponentPreview();
    }, "input");
    bindField(overlay, "[data-review-price]", v => review.item.system.price = Math.max(0, integer(v)), "change");
    bindField(overlay, "[data-review-enc]", v => review.item.system.encumbrance = Math.max(0, integer(v)), "change");
    bindField(overlay, "[data-review-damage]", v => review.item.system.baseDamage = integer(v), "change");
    bindField(overlay, "[data-review-critical]", v => review.item.system.critical = clamp(integer(v, 3), 1, 6), "change");
    bindField(overlay, "[data-review-range]", v => review.item.system.range = v, "change");
    bindField(overlay, "[data-review-soak]", v => review.item.system.soak = Math.max(0, integer(v)), "change");
    bindField(overlay, "[data-review-defense]", v => review.item.system.defense = Math.max(0, integer(v)), "change");
    bindField(overlay, "[data-review-silhouette]", v => review.item.system.silhouette = clamp(integer(v,2),1,10), "change");
    bindField(overlay, "[data-review-max-speed]", v => review.item.system.maxSpeed = clamp(integer(v,1),0,6), "change");
    bindField(overlay, "[data-review-handling]", v => review.item.system.handling = clamp(integer(v),-4,4), "change");
    bindField(overlay, "[data-review-vehicle-defense]", v => review.item.system.defense = Math.max(0, integer(v)), "change");
    bindField(overlay, "[data-review-vehicle-armor]", v => review.item.system.armor = Math.max(0, integer(v)), "change");
    bindField(overlay, "[data-review-hull]", v => review.item.system.hullTrauma = Math.max(1, integer(v,1)), "change");
    bindField(overlay, "[data-review-system-strain]", v => review.item.system.systemStrain = Math.max(1, integer(v,1)), "change");
    bindField(overlay, "[data-review-vehicle-enc]", v => review.item.system.encumbranceCapacity = Math.max(0, integer(v)), "change");
    bindField(overlay, "[data-review-control-skill]", v => review.item.system.controlSkill = v);
    bindField(overlay, "[data-review-occupants]", v => review.item.system.occupants = v);
    bindField(overlay, "[data-review-consumables]", v => review.item.system.consumables = v);
    bindField(overlay, "[data-review-craft-skill]", v => review.rules.craftingSkill = v, "change");
    bindField(overlay, "[data-review-schematic-skill]", v => review.rules.schematicSkill = v, "change");
    bindField(overlay, "[data-review-difficulty]", v => { review.rules.craftingDifficulty = v === "" ? null : clamp(integer(v), 0, 5); render({preserveUI: true}); }, "change");
    bindField(overlay, "[data-review-upgrades]", v => { review.rules.craftingUpgrades = clamp(integer(v), 0, 12); render({preserveUI: true}); }, "change");
    bindField(overlay, "[data-review-hours]", v => review.rules.craftingHours = Math.max(0, Number(v) || 0), "change");
    bindField(overlay, "[data-review-total-cost]", v => {
      review.rules.totalCost = Math.max(0, integer(v));
      syncComponentPreview();
    }, "input");
    bindField(overlay, "[data-review-notes]", v => review.rules.notes = v);

    syncComponentPreview();
    if (renderState) restoreRenderState(overlay, renderState);

    overlay.querySelector("[data-approve]")?.addEventListener("click", async () => {
      if (!review.rules.craftingSkill) { state.message = tx("Choose a crafting skill before approval.", "Перед схваленням оберіть навичку крафту."); render({preserveUI: true}); return; }
      if (!review.rules.schematicSkill) { state.message = tx("Choose a Schematic Skill before approval.", "Перед схваленням оберіть навичку креслення."); render({preserveUI: true}); return; }
      if (!Number.isFinite(Number(review.rules.craftingDifficulty))) { state.message = tx("Choose a base crafting difficulty before approval.", "Перед схваленням оберіть базову складність крафту."); render({preserveUI: true}); return; }
      const fresh = projectFromJournal(journal);
      fresh.status = "approved";
      fresh.approval = {item: deepClone(review.item), rules: deepClone(review.rules), approvedBy: game.user.id, approvedAt: Date.now()};
      fresh.rejection = null;
      addLog(fresh, "approved", `Project approved. Base crafting check: ${review.rules.craftingSkill}, ${difficultyLabel(review.rules.craftingDifficulty)}.`, game.user.id);
      await saveProject(journal, fresh);
      ui.notifications.info(`${fresh.concept.name} approved.`);
      back();
    });

    overlay.querySelector("[data-reject]")?.addEventListener("click", async () => {
      const reason = window.prompt(tx("Reason for rejection or requested revision:", "Причина відхилення або бажана правка:"), project.rejection?.reason ?? "");
      if (reason === null) return;
      const fresh = projectFromJournal(journal);
      fresh.status = "rejected";
      fresh.rejection = {reason: reason.trim(), by: game.user.id, at: Date.now()};
      addLog(fresh, "rejected", `Project rejected${reason.trim() ? `: ${reason.trim()}` : "."}`, game.user.id);
      await saveProject(journal, fresh);
      ui.notifications.warn(`${fresh.concept.name} rejected.`);
      back();
    });
  }
  render();
}

function spendBudget(entryState, kind) {
  const options = kind === "positive" ? POSITIVE_SPENDS : NEGATIVE_SPENDS;
  const spent = {advantage: 0, triumph: 0, threat: 0, despair: 0};
  for (const option of options) {
    const qty = Math.max(0, integer(entryState.spends[option.id], 0));
    for (const symbol of Object.keys(spent)) spent[symbol] += qty * Number(option[symbol] ?? 0);
  }
  return spent;
}

function spendOptionDisabled(project, option) {
  if (option.once && spendCount(project, option.id) > 0) return true;
  if (option.onceGroup && onceGroupUsed(project, option.onceGroup)) return true;
  return false;
}

async function openSchematicRecorder(journal, parentState, returnToProject) {
  const project = projectFromJournal(journal);
  if (!project?.approval || !["approved", "building"].includes(project.status)) return;
  const pending = deepClone(project.schematic?.pending ?? null);
  if (!pending) {
    ui.notifications.info(tx("Roll the next Schematic check first. Its actual chat result will appear here for spending.", "Спочатку зробіть наступну перевірку креслення. Її фактичний результат із чату з’явиться тут для витрати символів."));
    return;
  }
  const nextLevel = integer(pending.level);
  const state = {
    theme: parentState.theme,
    textSize: parentState.textSize,
    success: Boolean(pending.success),
    advantage: Math.max(0, integer(pending.result?.advantage)),
    triumph: Math.max(0, integer(pending.result?.triumph)),
    threat: Math.max(0, integer(pending.result?.threat)),
    despair: Math.max(0, integer(pending.result?.despair)),
    spends: {},
    message: ""
  };
  const overlay = document.createElement("div"); overlay.className = "ginv-overlay"; document.body.appendChild(overlay);
  const close = () => { overlay.remove(); removeRestoreButtons(); };
  const back = () => { parentState.theme = state.theme; parentState.textSize = state.textSize; close(); returnToProject(); };

  function symbolName(key) {
    const names = {
      advantage: tx("Advantage", "Перевага"), triumph: tx("Triumph", "Тріумф"),
      threat: tx("Threat", "Загроза"), despair: tx("Despair", "Відчай")
    };
    return names[key] ?? key;
  }

  function spendRows(options) {
    return options.map(option => {
      const disabled = spendOptionDisabled(project, option);
      const cost = [
        option.advantage ? `${option.advantage} ${symbolName("advantage")}` : "",
        option.triumph ? `${option.triumph} ${symbolName("triumph")}` : "",
        option.threat ? `${option.threat} ${symbolName("threat")}` : "",
        option.despair ? `${option.despair} ${symbolName("despair")}` : ""
      ].filter(Boolean).join(` ${tx("or", "або")} `);
      return `<div class="ginv-spendrow"><div><strong>${esc(spendLabel(option))}</strong><div class="ginv-sub">${esc(cost)}${disabled ? ` · ${tx("already used on this project", "вже використано в цьому проєкті")}` : ""}</div></div><input type="number" min="0" max="${option.once || option.onceGroup ? 1 : 20}" step="1" data-spend="${option.id}" value="${integer(state.spends[option.id])}" ${disabled ? "disabled" : ""}></div>`;
    }).join("");
  }

  function budgetText(kind, spent) {
    if (kind === "positive") return `${tx("Available", "Доступно")}: ${state.advantage} ${symbolName("advantage")}, ${state.triumph} ${symbolName("triumph")} · ${tx("Spent", "Витрачено")}: ${spent.advantage} ${symbolName("advantage")}, ${spent.triumph} ${symbolName("triumph")}`;
    return `${tx("Available", "Доступно")}: ${state.threat} ${symbolName("threat")}, ${state.despair} ${symbolName("despair")} · ${tx("Spent", "Витрачено")}: ${spent.threat} ${symbolName("threat")}, ${spent.despair} ${symbolName("despair")}`;
  }

  function syncBudgetUI() {
    const pos = spendBudget(state, "positive");
    const neg = spendBudget(state, "negative");
    const posNode = overlay.querySelector("[data-positive-budget]");
    const negNode = overlay.querySelector("[data-negative-budget]");
    if (posNode) {
      posNode.textContent = budgetText("positive", pos);
      posNode.classList.toggle("ginv-bad", pos.advantage > state.advantage || pos.triumph > state.triumph);
    }
    if (negNode) {
      negNode.textContent = budgetText("negative", neg);
      negNode.classList.toggle("ginv-bad", neg.threat > state.threat || neg.despair > state.despair);
    }
  }

  function render({preserveUI = false} = {}) {
    const renderState = preserveUI ? captureRenderState(overlay) : null;
    const pos = spendBudget(state, "positive");
    const neg = spendBudget(state, "negative");
    const skillName = pending.skill || projectSchematicSkill(project, game.actors.get(project.actorId));
    const difficulty = pending.difficulty ?? SCHEMATIC_LEVELS[nextLevel]?.difficulty ?? 0;
    overlay.innerHTML = `<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">
      ${shellHeader(`${tx("Resolve Schematic Level", "Розв’язання креслення рівня")} ${nextLevel}`, `${project.concept.name} · ${esc(skillName)} · ${difficultyDisplayHTML(difficulty, pending.upgrades ?? 0)}`, state)}
      <main class="ginv-main">
        <div class="ginv-panel"><h2>${tx("Recorded Roll", "Записаний кидок")}</h2><div class="ginv-callout ${state.success ? "ginv-good" : "ginv-warn"}"><strong>${state.success ? tx(`Succeeded with ${pending.result?.success ?? 0} net Success`, `Успіх: ${pending.result?.success ?? 0} чистих Успіхів`) : tx("Failed", "Провал")}</strong><br>${symbolName("advantage")} ${state.advantage} · ${symbolName("triumph")} ${state.triumph} · ${symbolName("threat")} ${state.threat} · ${symbolName("despair")} ${state.despair}<br><span class="ginv-help">${tx("This result is locked to the actual Genesys chat roll and cannot be edited here.", "Цей результат прив’язаний до фактичного кидка Genesys у чаті й не може бути змінений тут вручну.")}</span></div>${!state.success ? `<p class="ginv-help">${tx("The failed attempt will be recorded, but it does not create a new Schematic level.", "Невдалу спробу буде записано, але вона не створить нового рівня креслення.")}</p>` : ""}</div>
        ${state.success ? `<div class="ginv-grid" style="margin-top:14px">
          <div class="ginv-panel"><h2>${tx("Positive Spending", "Витрата позитивних символів")}</h2><div class="ginv-budget" data-positive-budget>${budgetText("positive", pos)}</div>${spendRows(POSITIVE_SPENDS)}</div>
          <div class="ginv-panel"><h2>${tx("Negative Spending", "Витрата негативних символів")}</h2><div class="ginv-budget" data-negative-budget>${budgetText("negative", neg)}</div>${spendRows(NEGATIVE_SPENDS)}</div>
        </div>` : ""}
        ${state.message ? `<div class="ginv-callout ginv-bad">${esc(state.message)}</div>` : ""}
      </main>
      <footer class="ginv-foot"><button class="ginv-btn" data-back>${tx("Cancel", "Скасувати")}</button><div class="ginv-spacer"></div><button class="ginv-btn primary" data-save>${state.success ? tx("Resolve & Record Schematic", "Розв’язати й записати креслення") : tx("Record Failed Attempt", "Записати невдалу спробу")}</button></footer>
    </div>`;
    bindShellControls(overlay, state, render, close);
    overlay.querySelector("[data-back]")?.addEventListener("click", back);
    overlay.querySelectorAll("[data-spend]").forEach(input => input.addEventListener("input", () => {
      state.spends[input.dataset.spend] = Math.max(0, integer(input.value));
      syncBudgetUI();
    }));
    syncBudgetUI();
    if (renderState) restoreRenderState(overlay, renderState);
    overlay.querySelector("[data-save]")?.addEventListener("click", async () => {
      if (state.success) {
        const p = spendBudget(state, "positive");
        const n = spendBudget(state, "negative");
        if (p.advantage > state.advantage || p.triumph > state.triumph || n.threat > state.threat || n.despair > state.despair) {
          state.message = tx("Selected spending exceeds the symbols on the recorded roll.", "Обрані витрати перевищують кількість символів у записаному кидку."); render({preserveUI: true}); return;
        }
        for (const option of [...POSITIVE_SPENDS, ...NEGATIVE_SPENDS]) {
          const qty = integer(state.spends[option.id]);
          if ((option.once || option.onceGroup) && qty > 1) {
            state.message = tx(`${option.label} can only be applied once.`, `${spendLabel(option)} можна застосувати лише один раз.`); render({preserveUI: true}); return;
          }
          if (spendOptionDisabled(project, option) && qty > 0) {
            state.message = tx(`${option.label} can only be applied once to this project.`, `${spendLabel(option)} можна застосувати лише один раз у цьому проєкті.`); render({preserveUI: true}); return;
          }
        }
        const upGroup = integer(state.spends.hardPointUpA) + integer(state.spends.hardPointUpT);
        const downGroup = integer(state.spends.hardPointDownT) + integer(state.spends.hardPointDownD);
        if (upGroup > 1 || downGroup > 1) {
          state.message = tx("The +1 Hard Point and -1 Hard Point results can each only be applied once.", "Результати +1 Hard Point і -1 Hard Point можна застосувати лише по одному разу."); render({preserveUI: true}); return;
        }
      }

      const fresh = projectFromJournal(journal);
      const livePending = deepClone(fresh?.schematic?.pending ?? null);
      if (!livePending || String(livePending.chatMessageId ?? "") !== String(pending.chatMessageId ?? "")) {
        state.message = tx("This Schematic roll has already been resolved or was replaced.", "Цей кидок креслення вже розв’язано або замінено іншим."); render({preserveUI: true}); return;
      }
      if (game.user.isGM) {
        applyResolvedSchematicRoll(fresh, livePending, state.success ? state.spends : {});
      } else {
        fresh.schematic.entries.push({
          id: randomId(),
          level: livePending.success ? livePending.level : 0,
          attemptedLevel: livePending.success ? undefined : livePending.level,
          success: Boolean(livePending.success),
          at: livePending.at,
          userId: game.user.id,
          chatMessageId: livePending.chatMessageId,
          chatMessageUuid: livePending.chatMessageUuid,
          result: deepClone(livePending.result ?? {}),
          spends: livePending.success ? deepClone(state.spends) : {}
        });
      }
      await saveProject(journal, fresh);
      back();
    });
  }
  render();
}

function systemLeafPaths(value, prefix = "system", out = []) {
  if (value === null || value === undefined) return out;
  if (typeof value !== "object" || Array.isArray(value)) { out.push({path: prefix, value}); return out; }
  for (const [key, child] of Object.entries(value)) systemLeafPaths(child, `${prefix}.${key}`, out);
  return out;
}

function findVehicleSystemPath(actor, tokenGroups) {
  const system = actor?.system?.toObject?.() ?? actor?.toObject?.().system ?? actor?.system ?? {};
  const leaves = systemLeafPaths(system);
  for (const tokens of tokenGroups) {
    const matched = leaves.filter(row => tokens.every(token => norm(row.path).replace(/[^a-z0-9а-яіїєґ]+/g, " ").includes(norm(token))));
    if (matched.length) return matched.sort((a,b) => a.path.length - b.path.length)[0].path;
  }
  return null;
}

async function createCompletedVehicle(journal, project) {
  const inventor = game.actors.get(project.actorId);
  if (!inventor) throw new Error("The inventor Character no longer exists.");
  const profile = deepClone(project.approval?.item ?? project.proposedItem);
  const s = profile.system ?? {};
  const ownership = deepClone(inventor.ownership ?? {default:0});
  const vehicle = await Actor.create({
    name: profile.name || project.concept.name,
    type: "vehicle",
    img: profile.img || "icons/svg/wing.svg",
    ownership,
    flags: {[FLAG_SCOPE]: {projectJournalId: journal.id, projectJournalUuid: journal.uuid, completedAt: Date.now(), vehicleProfile: deepClone(s)}}
  }, {renderSheet:false});
  const mapping = [
    [["silhouette"], s.silhouette], [["max","speed"], s.maxSpeed], [["handling"], s.handling], [["defense"], s.defense], [["armor"], s.armor],
    [["hull","trauma","max"], s.hullTrauma], [["hull","threshold"], s.hullTrauma], [["system","strain","max"], s.systemStrain], [["strain","threshold"], s.systemStrain],
    [["encumbrance","capacity"], s.encumbranceCapacity], [["control","skill"], s.controlSkill], [["consumables"], s.consumables]
  ];
  const updates = {};
  for (const [groupsOrTokens, value] of mapping) {
    if (value === undefined || value === null || value === "") continue;
    const groups = Array.isArray(groupsOrTokens?.[0]) ? groupsOrTokens : [groupsOrTokens];
    const path = findVehicleSystemPath(vehicle, groups);
    if (path) updates[path] = value;
  }
  if (Object.keys(updates).length) {
    try { await vehicle.update(updates, {render:false}); }
    catch (error) { console.warn("Genesys Inventions | Vehicle profile mapped partially; full profile remains in module flags.", error, updates); }
  }
  return vehicle;
}

async function consumeOwnedBaseObject(project) {
  const source = project?.concept?.baseSource;
  if (!source?.useAsComponent || !source?.actorItemId) return;
  const actor = game.actors.get(project.actorId);
  const item = actor?.items?.get?.(source.actorItemId);
  if (!item) return;
  try { await actor.deleteEmbeddedDocuments("Item", [item.id]); }
  catch (error) { console.warn("Genesys Inventions | Could not consume the owned base object", error); }
}

async function createCompletedItem(journal, project) {
  const actor = game.actors.get(project.actorId);
  if (!actor) throw new Error("The inventor Character no longer exists.");
  const data = cleanDocumentData(project.approval.item);
  data.name = project.approval.item.name || project.concept.name;
  data.folder = null;
  data.flags ??= {};
  data.flags[IMPORT_FLAG_SCOPE] ??= {};
  const existingImport = deepClone(data.flags[IMPORT_FLAG_SCOPE][IMPORT_FLAG] ?? {});
  const baseHP = Number(existingImport?.customization?.hardPoints?.total);
  const fallbackHP = Math.max(0, Math.ceil(Number(data.system?.encumbrance ?? 0) / 2));
  const hp = Math.max(0, (Number.isFinite(baseHP) ? baseHP : fallbackHP) + schematicEffects(project).hardPointsDelta);
  data.flags[IMPORT_FLAG_SCOPE][IMPORT_FLAG] = {
    ...existingImport,
    managed: false,
    sourceKey: `completed-invention|${norm(data.name)}|${randomId()}`,
    originalName: data.name,
    tags: [...new Set([...(existingImport.tags ?? []), "Created", "Invention"])],
    customization: {
      ...(existingImport.customization ?? {}),
      hardPoints: { ...(existingImport.customization?.hardPoints ?? {}), total: hp }
    }
  };
  data.flags[FLAG_SCOPE] = {
    projectJournalId: journal.id,
    projectJournalUuid: journal.uuid,
    completedAt: Date.now(),
    schematicLevel: schematicEffects(project).level
  };
  const created = await actor.createEmbeddedDocuments("Item", [data]);
  return created?.[0] ?? null;
}

async function openProject(journal, parentState, returnToWorkshop) {
  const initialProject = projectFromJournal(journal);
  const initialActor = game.actors.get(initialProject?.actorId);
  if (!initialProject || !initialActor) {
    ui.notifications.warn(tx("This Invention Project is no longer linked to a valid Character.", "Цей проєкт винаходу більше не прив’язаний до дійсного персонажа."));
    return;
  }
  if (!game.user.isGM && !isOwnerCharacter(initialActor)) {
    ui.notifications.warn(tx("You must have OWNER permission for the inventor Character to open this project.", "Щоб відкрити цей проєкт, потрібен рівень OWNER для персонажа-винахідника."));
    return;
  }

  const state = {theme: parentState.theme, textSize: parentState.textSize, message: ""};
  const overlay = document.createElement("div"); overlay.className = "ginv-overlay"; document.body.appendChild(overlay);
  let projectUpdateHook = null;
  const close = () => {
    if (projectUpdateHook !== null) {
      Hooks.off("updateJournalEntry", projectUpdateHook);
      projectUpdateHook = null;
    }
    overlay.remove();
    removeRestoreButtons();
  };
  const back = () => { parentState.theme = state.theme; parentState.textSize = state.textSize; close(); returnToWorkshop(); };

  function render({preserveUI = false} = {}) {
    const renderState = preserveUI ? captureRenderState(overlay) : null;
    const project = projectFromJournal(journal);
    if (!project) { close(); return; }
    const actor = game.actors.get(project.actorId);
    const fx = schematicEffects(project);
    const pendingSchematic = project.schematic?.pending ?? null;
    const components = currentComponents(project);
    const acquired = project.components?.acquired ?? {tier3: 0, tier5: 0, tier7: 0};
    const actorStockpile = actorComponentStockpile(actor);
    const stockpileTotalsForActor = stockpileTotals(actorStockpile);
    const familyStockpile = project.concept?.craftFamily
      ? stockpileTotals({entries: actorStockpile.entries.filter(entry => entry.domainId === project.concept.craftFamily)})
      : stockpileTotalsForActor;
    const approved = project.approval?.item;
    const rules = project.approval?.rules;
    const canDevelop = ["approved", "building"].includes(project.status);
    const enoughComponents = approved && acquired.tier3 >= components.tier3 && acquired.tier5 >= components.tier5 && acquired.tier7 >= components.tier7;
    const entries = (project.schematic?.entries ?? []).map(entry => `<tr><td>${entry.success ? `${tx("Level","Рівень")} ${entry.level}` : `${tx("Failed","Провал")} L${entry.attemptedLevel}`}</td><td>${entry.success ? tx("Success","Успіх") : tx("Failed","Провал")}</td><td>${esc(moduleDate(entry.at))}</td></tr>`).join("");
    const log = (project.log ?? []).slice(0, 30).map(row => `<div class="ginv-logrow"><strong>${esc(moduleDate(row.at))}</strong> · ${esc(userName(row.userId))}<div>${esc(row.text)}</div></div>`).join("");
    const rolls = (project.rolls ?? []).slice(0, 20).map(row => `<div class="ginv-rollrow"><div><strong>${esc(row.label || row.skill || tx("Project Check","Перевірка проєкту"))}</strong> · ${esc(row.skill || tx("Skill","Навичка"))} · ${difficultyDisplayHTML(row.difficulty ?? 0, row.upgrades ?? 0)} · ${esc(moduleDate(row.at))}</div><div class="ginv-help">${esc(row.summary || tx("Result recorded in chat.","Результат записано в чаті."))}</div></div>`).join("");
    const completedItem = project.completion?.itemId ? actor?.items?.get(project.completion.itemId) : null;
    const completedVehicle = project.completion?.vehicleActorId ? game.actors.get(project.completion.vehicleActorId) : null;
    const archivedUuid = project.completion?.compendiumUuid ?? null;
    const archivedLabel = project.completion?.compendiumLabel ?? null;

    overlay.innerHTML = `<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">
      ${shellHeader(project.concept.name, `${actor?.name ?? tx("Unknown Character","Невідомий персонаж")} · ${tx("Invention Project","Проєкт винаходу")}`, state)}
      <main class="ginv-main">
        <div class="ginv-project-head"><div><div class="ginv-row"><h2>${esc(project.concept.name)}</h2><span class="ginv-status ${esc(project.status)}">${esc(statusLabel(project.status))}</span></div>${project.concept.subtitle ? `<div class="ginv-sub">${esc(project.concept.subtitle)}</div>` : ""}</div><button class="ginv-btn small" data-open-journal>${tx("Open Journal","Відкрити журнал")}</button></div>
        <div class="ginv-grid ginv-project-section">
          <div class="ginv-panel"><h3>${tx("Concept","Концепція")}</h3><p>${esc(project.concept.description || tx("No description.","Опис відсутній."))}</p><p><strong>${tx("Crafting family:","Група крафту:")}</strong> ${esc(domainText(GATHERING_DOMAINS[project.concept?.craftFamily], "label") || tx("Not specified","Не вказано"))}</p><p><strong>${tx("Proposed:","Запропоновано:")}</strong> ${esc(itemStatSummary(project.proposedItem))}</p>${project.rejection?.reason ? `<div class="ginv-callout ginv-bad"><strong>${tx("GM response:","Відповідь GM:")}</strong> ${esc(project.rejection.reason)}</div>` : ""}</div>
          <div class="ginv-panel"><h3>${approved ? tx("Approved Design","Схвалена конструкція") : tx("GM Approval","Схвалення GM")}</h3>${approved ? `<p><strong>${esc(approved.name)}</strong></p><p>${esc(itemStatSummary(approved))}</p><div class="ginv-chips"><span class="ginv-chip">${esc(rules.craftingSkill)}</span><span class="ginv-chip">${difficultyDisplayHTML(rules.craftingDifficulty, currentCraftingUpgrades(project))} → ${difficultyDisplayHTML(currentCraftingDifficulty(project), currentCraftingUpgrades(project))}</span><span class="ginv-chip">${money(currentCraftingHours(project))} ${tx("h","год")}</span><span class="ginv-chip">${currencyAmount(rules.totalCost)} · ${tx("components","компоненти")}</span></div>${rules.notes ? `<p class="ginv-help">${esc(rules.notes)}</p>` : ""}` : `<p class="ginv-help">${tx("This project is waiting for GM review. The GM sets the final design and crafting parameters.","Проєкт очікує перевірки GM. GM визначає остаточну конструкцію та параметри крафту.")}</p>`}</div>
        </div>
        ${approved ? `<div class="ginv-grid ginv-project-section">
          <div class="ginv-panel"><h3>${tx("Schematic","Креслення")}</h3><div class="ginv-chips"><span class="ginv-chip action">${tx("Level","Рівень")} ${fx.level}</span><span class="ginv-chip">${tx("Difficulty","Складність")} -${fx.difficultyReduction}</span><span class="ginv-chip">${tx("Time","Час")} ${fx.timePct >= 0 ? "+" : ""}${fx.timePct}%</span><span class="ginv-chip">HP ${fx.hardPointsDelta >= 0 ? "+" : ""}${fx.hardPointsDelta}</span>${fx.variantUnlocked ? `<span class="ginv-chip good">${tx("Variant Unlocked","Варіант відкрито")}</span>` : ""}</div><p><strong>${tx("Automatic crafting:","Автоматичні символи крафту:")}</strong> ${fx.autoSuccess} ${tx("Success","Успіх")} · ${fx.autoAdvantage} ${tx("Advantage","Перевага")} · ${fx.autoThreat} ${tx("Threat","Загроза")}</p><table class="ginv-table"><thead><tr><th>${tx("Design","Креслення")}</th><th>${tx("Result","Результат")}</th><th>${tx("When","Коли")}</th></tr></thead><tbody>${entries || `<tr><td colspan="3">${tx("No schematic checks recorded.","Перевірок креслення ще не записано.")}</td></tr>`}</tbody></table>${canDevelop && fx.level < 4 ? (pendingSchematic ? `<div class="ginv-callout ${pendingSchematic.success ? "ginv-good" : "ginv-warn"}" style="margin-top:10px"><strong>${tx("Pending Schematic Level","Очікує розв’язання креслення рівня")} ${integer(pendingSchematic.level)}</strong><br>${pendingSchematic.success ? `${integer(pendingSchematic.result?.success)} ${tx("net Success","чистих Успіхів")}` : tx("Failed","Провал")} · ${tx("Advantage","Перевага")} ${integer(pendingSchematic.result?.advantage)} · ${tx("Triumph","Тріумф")} ${integer(pendingSchematic.result?.triumph)} · ${tx("Threat","Загроза")} ${integer(pendingSchematic.result?.threat)} · ${tx("Despair","Відчай")} ${integer(pendingSchematic.result?.despair)}<div class="ginv-row" style="margin-top:8px"><button class="ginv-btn primary" data-schematic>${tx("Resolve / Spend Result","Розв’язати / витратити результат")}</button></div><div class="ginv-help">${tx("The roll is already registered. Resolve its remaining symbols to finish this Schematic attempt.","Кидок уже записаний. Розподіліть решту символів, щоб завершити цю спробу креслення.")}</div></div>` : `<div class="ginv-row" style="margin-top:10px"><button class="ginv-btn action" data-roll-schematic>🎲 ${tx("Roll Schematic","Кинути креслення")} · ${difficultyDisplayHTML(SCHEMATIC_LEVELS[fx.level + 1]?.difficulty ?? 0,0)}</button></div><div class="ginv-help">${tx(`Rolls ${projectSchematicSkill(project, actor)} for Schematic Level ${fx.level + 1}. Success/Failure-only results resolve automatically; other narrative symbols create a pending result for spending.`,`Перевірка ${projectSchematicSkill(project, actor)} для креслення рівня ${fx.level + 1}. Якщо після скасування лишилися лише Успіхи/Провали, результат розв’язується автоматично; інші символи треба розподілити вручну.`)}</div>`) : ""}</div>
          <div class="ginv-panel"><h3>${tx("Components","Компоненти")}</h3>${project.concept?.baseSource?.useAsComponent ? `<div class="ginv-callout"><strong>${tx("Base object contributes:","Базовий об’єкт покриває:")}</strong> Tier 3 ${currencyAmount(components.contribution?.tier3 ?? 0)} · Tier 5 ${currencyAmount(components.contribution?.tier5 ?? 0)} · Tier 7 ${currencyAmount(components.contribution?.tier7 ?? 0)}.</div>` : ""}<div class="ginv-callout"><strong>${tx("Compatible Stockpile:","Сумісний запас:")}</strong> Tier 3 ${currencyAmount(familyStockpile.tier3)} · Tier 5 ${currencyAmount(familyStockpile.tier5)} · Tier 7 ${currencyAmount(familyStockpile.tier7)}.<br><span class="ginv-help">${tx("These totals use this project's crafting family. The full Actor Stockpile remains available in Gather Components.","Ці суми враховують групу крафту цього проєкту. Повний запас персонажа доступний у розділі «Збір компонентів».")}</span></div><table class="ginv-table"><thead><tr><th>Tier</th><th>${tx("Required","Потрібно")}</th><th>${tx("Allocated","Виділено")}</th></tr></thead><tbody><tr><td>Tier 3</td><td>${currencyAmount(components.tier3)}</td><td><input type="number" min="0" step="1" data-acq="tier3" value="${acquired.tier3}"></td></tr><tr><td>Tier 5</td><td>${currencyAmount(components.tier5)}</td><td><input type="number" min="0" step="1" data-acq="tier5" value="${acquired.tier5}"></td></tr><tr><td>Tier 7</td><td>${currencyAmount(components.tier7)}</td><td><input type="number" min="0" step="1" data-acq="tier7" value="${acquired.tier7}"></td></tr></tbody></table><div class="ginv-row" style="margin-top:10px"><button class="ginv-btn" data-save-components>${tx("Save Components","Зберегти компоненти")}</button><span class="${enoughComponents ? "ginv-good" : "ginv-warn"}">${enoughComponents ? tx("Component requirement met.","Потребу в компонентах виконано.") : tx("More components are required.","Потрібно більше компонентів.")}</span></div><p class="ginv-help">${tx("Approximate carried component encumbrance at the supplement's guideline of 1 ENC per 500", "Орієнтовна громіздкість виділених компонентів за настановою доповнення: 1 ENC на 500")} ${esc(worldCurrencyLabel())}: ${number1((Number(acquired.tier3)+Number(acquired.tier5)+Number(acquired.tier7))/500)} ENC.</p></div>
        </div>` : ""}
        ${approved ? `<div class="ginv-panel ginv-project-section"><h3>${tx("Final Crafting","Фінальний крафт")}</h3><p>${tx("Current final check:","Поточна фінальна перевірка:")} <strong>${esc(rules.craftingSkill)}</strong> · <strong>${difficultyDisplayHTML(currentCraftingDifficulty(project), currentCraftingUpgrades(project))}</strong> · ${fx.autoSuccess} ${tx("automatic Success","автоматичних Успіхів")}, ${fx.autoAdvantage} ${tx("automatic Advantage","автоматичних Переваг")}, ${fx.autoThreat} ${tx("automatic Threat","автоматичних Загроз")}.</p>${project.status !== "completed" ? `<button class="ginv-btn action" data-roll-crafting>🎲 ${tx("Roll","Кинути")} ${esc(rules.craftingSkill)}</button><span class="ginv-sub">${tx(`Builds the dice pool from ${actor?.name ?? "the inventor"} and records the result in this project.`,`Формує пул кубиків персонажа ${actor?.name ?? "винахідник"} і записує результат у цей проєкт.`)}</span>` : ""}${canDevelop ? `<div class="ginv-row" style="margin-top:10px"><button class="ginv-btn ${enoughComponents ? "primary" : ""}" data-ready ${enoughComponents ? "" : "disabled"}>${tx("Request Final Crafting","Запросити фінальний крафт")}</button>${!enoughComponents ? `<span class="ginv-sub">${tx("Acquire the required Tier 3 / 5 / 7 components before requesting the final craft.","Спочатку зберіть потрібні компоненти Tier 3 / 5 / 7.")}</span>` : ""}</div>` : ""}${project.status === "ready" ? `<div class="ginv-callout">${tx("The project is ready for the GM to resolve the final crafting check and create the finished object.","Проєкт готовий: GM може завершити фінальну перевірку та створити готовий об’єкт.")}</div>` : ""}${game.user.isGM && ["approved","building","ready"].includes(project.status) ? `<button class="ginv-btn good" style="margin-top:10px" data-complete>${tx("GM: Complete & Create","GM: завершити й створити")}</button>` : ""}${project.status === "completed" ? (project.completion?.vehicleActorId ? `<div class="ginv-finished-card"><div class="ginv-finished-label">${tx("Finished Vehicle","Готовий транспорт")}</div><div class="ginv-finished-name">${esc(project.completion?.itemName ?? approved.name)}</div><div><strong>${tx("Created as:","Створено як:")}</strong> ${tx("Vehicle Actor","Actor транспорту")}</div>${archivedLabel ? `<div><strong>${tx("Archived in:","Архівовано в:")}</strong> ${esc(archivedLabel)}</div>` : ""}<div class="ginv-row" style="margin-top:10px"><button class="ginv-btn primary" data-open-vehicle ${completedVehicle ? "" : "disabled"}>${tx("Open Vehicle","Відкрити транспорт")}</button><button class="ginv-btn" data-open-actor>${tx("Open Inventor","Відкрити винахідника")}</button>${game.user.isGM && archivedUuid ? `<button class="ginv-btn" data-open-compendium>${tx("Open Compendium Copy","Відкрити копію в компендіумі")}</button>` : ""}</div></div>` : `<div class="ginv-finished-card"><div class="ginv-finished-label">${tx("Finished Item","Готовий предмет")}</div><div class="ginv-finished-name">${esc(project.completion?.itemName ?? approved.name)}</div><div><strong>${tx("Added to:","Додано до:")}</strong> ${esc(actor?.name ?? tx("Unknown Character","Невідомий персонаж"))}</div>${archivedLabel ? `<div><strong>${tx("Archived in:","Архівовано в:")}</strong> ${esc(archivedLabel)}</div>` : ""}<div class="ginv-row" style="margin-top:10px"><button class="ginv-btn primary" data-open-actor>${tx("Open Character Sheet","Відкрити аркуш персонажа")}</button><button class="ginv-btn" data-open-item ${completedItem ? "" : "disabled"}>${tx("Open Item","Відкрити предмет")}</button>${game.user.isGM && archivedUuid ? `<button class="ginv-btn" data-open-compendium>${tx("Open Compendium Copy","Відкрити копію в компендіумі")}</button>` : ""}</div></div>`) : ""}</div>` : ""}
        ${approved ? `<div class="ginv-panel ginv-project-section"><h3>${tx("Project Rolls","Кидки проєкту")}</h3><div class="ginv-roll-log">${rolls || `<div class="ginv-sub">${tx("No project rolls recorded yet.","Кидків проєкту ще не записано.")}</div>`}</div><p class="ginv-help">${tx("This log is generated from actual Genesys chat rolls. Players can view it but cannot edit the Project Journal.","Цей журнал формується з фактичних кидків Genesys у чаті. Гравці можуть його переглядати, але не можуть редагувати Journal проєкту.")}</p></div>` : ""}
        <div class="ginv-panel ginv-project-section"><h3>${tx("Project Log","Журнал проєкту")}</h3><div class="ginv-log" data-ginv-scroll-key="project-log">${log || `<div class="ginv-sub">${tx("No log entries.","Записів поки немає.")}</div>`}</div></div>
        ${state.message ? `<div class="ginv-callout">${esc(state.message)}</div>` : ""}
      </main>
      <footer class="ginv-foot"><button class="ginv-btn" data-back>← ${tx("My Projects","Мої проєкти")}</button><div class="ginv-spacer"></div>${game.user.isGM && project.status === "pending" ? `<button class="ginv-btn primary" data-gm-review>${tx("GM Review","Перевірка GM")}</button>` : ""}</footer>
    </div>`;
    bindShellControls(overlay, state, render, close);
    overlay.querySelector("[data-back]")?.addEventListener("click", back);
    overlay.querySelector("[data-open-journal]")?.addEventListener("click", () => {
      if (!journal.sheet) return;
      temporarilyHideOverlay(overlay, state, project.concept?.name ?? "Invention Project");
      journal.sheet.render(true);
    });
    overlay.querySelector("[data-gm-review]")?.addEventListener("click", () => { close(); openGMReview(journal, parentState, () => openProject(journal, parentState, returnToWorkshop)); });
    overlay.querySelector("[data-roll-schematic]")?.addEventListener("click", async () => {
      try {
        const fresh = projectFromJournal(journal);
        await rollProjectSchematic(journal, fresh);
      } catch (error) {
        state.message = tx(`Could not roll Schematic check: ${error.message}`, `Не вдалося зробити перевірку креслення: ${error.message}`);
        render({preserveUI: true});
      }
    });
    overlay.querySelector("[data-schematic]")?.addEventListener("click", () => { close(); openSchematicRecorder(journal, parentState, () => openProject(journal, parentState, returnToWorkshop)); });
    overlay.querySelector("[data-save-components]")?.addEventListener("click", async () => {
      const fresh = projectFromJournal(journal);
      fresh.components ??= {acquired: {tier3:0,tier5:0,tier7:0}};
      fresh.components.acquired ??= {tier3:0,tier5:0,tier7:0};
      for (const input of overlay.querySelectorAll("[data-acq]")) fresh.components.acquired[input.dataset.acq] = Math.max(0, Number(input.value) || 0);
      addLog(fresh, "components", tx("Component ledger updated.", "Облік компонентів оновлено."), game.user.id);
      await saveProject(journal, fresh);
      state.message = tx("Components saved.", "Компоненти збережено."); render({preserveUI: true});
    });
    overlay.querySelector("[data-roll-crafting]")?.addEventListener("click", async () => {
      try {
        const fresh = projectFromJournal(journal);
        await rollProjectSkill(journal, fresh);
      } catch (error) {
        state.message = tx(`Could not roll crafting check: ${error.message}`, `Не вдалося зробити перевірку крафту: ${error.message}`);
        render({preserveUI: true});
      }
    });
    overlay.querySelector("[data-open-actor]")?.addEventListener("click", () => {
      if (!actor?.sheet) return;
      temporarilyHideOverlay(overlay, state, project.concept?.name ?? "Invention Project");
      actor.sheet.render(true);
    });
    overlay.querySelector("[data-open-item]")?.addEventListener("click", () => {
      if (!completedItem?.sheet) return;
      temporarilyHideOverlay(overlay, state, project.concept?.name ?? "Invention Project");
      completedItem.sheet.render(true);
    });
    overlay.querySelector("[data-open-vehicle]")?.addEventListener("click", () => {
      if (!completedVehicle?.sheet) return;
      temporarilyHideOverlay(overlay, state, project.concept?.name ?? "Invention Project");
      completedVehicle.sheet.render(true);
    });
    overlay.querySelector("[data-open-compendium]")?.addEventListener("click", async () => {
      if (!archivedUuid || !game.user.isGM) return;
      try {
        const archived = await fromUuid(archivedUuid);
        if (!archived?.sheet) throw new Error("Archived Compendium entry could not be opened.");
        temporarilyHideOverlay(overlay, state, project.concept?.name ?? "Invention Project");
        archived.sheet.render(true);
      } catch (error) {
        ui.notifications.warn(error.message ?? tx("Could not open the Compendium copy.", "Не вдалося відкрити копію в компендіумі."));
      }
    });

    overlay.querySelector("[data-ready]")?.addEventListener("click", async () => {
      const fresh = projectFromJournal(journal);
      fresh.status = "ready";
      addLog(fresh, "ready", tx("Final crafting requested.", "Запитано фінальний крафт."), game.user.id);
      await saveProject(journal, fresh);
      render({preserveUI: true});
    });
    overlay.querySelector("[data-complete]")?.addEventListener("click", async () => {
      if (!game.user.isGM) return;
      const fresh = projectFromJournal(journal);
      if (fresh.status === "completed") return;
      try {
        const isVehicle = fresh.approval?.item?.type === "vehicle";
        const created = isVehicle ? await createCompletedVehicle(journal, fresh) : await createCompletedItem(journal, fresh);
        let archived;
        try {
          archived = await archiveInventionDocument(created, isVehicle ? CREATED_VEHICLE_PACK : CREATED_ITEM_PACK);
        } catch (archiveError) {
          await rollbackFinishedDocument(created);
          throw new Error(`The finished ${isVehicle ? "Vehicle" : "Item"} could not be archived in its Inventions Compendium: ${archiveError.message}`);
        }
        await consumeOwnedBaseObject(fresh);
        fresh.status = "completed";
        fresh.completion = isVehicle
          ? {vehicleActorId: created?.id ?? null, itemName: created?.name ?? fresh.approval.item.name, actorId: fresh.actorId, compendiumUuid: archived.document?.uuid ?? null, compendiumCollection: archived.pack?.collection ?? CREATED_VEHICLE_PACK.collection, compendiumLabel: archived.pack?.metadata?.label ?? CREATED_VEHICLE_PACK.label, at: Date.now(), by: game.user.id}
          : {itemId: created?.id ?? null, itemName: created?.name ?? fresh.approval.item.name, actorId: fresh.actorId, compendiumUuid: archived.document?.uuid ?? null, compendiumCollection: archived.pack?.collection ?? CREATED_ITEM_PACK.collection, compendiumLabel: archived.pack?.metadata?.label ?? CREATED_ITEM_PACK.label, at: Date.now(), by: game.user.id};
        addLog(fresh, "completed", `${isVehicle ? "Finished Vehicle" : "Finished Item"} created: ${fresh.completion.itemName}. Archived in ${fresh.completion.compendiumLabel}.`, game.user.id);
        await saveProject(journal, fresh);
        ui.notifications.info(`${fresh.completion.itemName} created.`);
        render({preserveUI: true});
      } catch (error) {
        state.message = `Could not create finished object: ${error.message}`; render({preserveUI: true});
      }
    });

    if (renderState) restoreRenderState(overlay, renderState);
  }

  projectUpdateHook = Hooks.on("updateJournalEntry", updated => {
    if (updated?.id !== journal.id || !overlay.isConnected) return;
    render({preserveUI: true});
  });

  render();
}

function openWorkshop(initialActorId = null) {
  document.querySelectorAll(".ginv-overlay").forEach(node => node.remove());
  const playerActors = playerInventorActors();
  const npcActors = gmNpcInventorActors();
  const availableActors = [...playerActors, ...npcActors];
  if (!availableActors.length) {
    ui.notifications.warn(game.user?.isGM ? "No supported inventor Actors are available." : "You do not own any Character actors.");
    return;
  }
  const selected = availableActors.find(a => a.id === initialActorId) ?? playerActors[0] ?? npcActors[0] ?? null;
  const selectedIsNpc = npcActors.some(actor => actor.id === selected?.id);
  const state = {theme: storedTheme(), textSize: storedTextSize(), actorId: selected?.id ?? "", actorMode: selectedIsNpc ? "npc" : "player", npcSearch: "", view: "home", projectFilter: "all"};
  const activeActorList = () => game.user?.isGM && state.actorMode === "npc" ? npcActors : playerActors;
  const overlay = document.createElement("div"); overlay.className = "ginv-overlay"; document.body.appendChild(overlay);
  const close = () => { overlay.remove(); removeRestoreButtons(); };

  function renderHome() {
    const fullList = activeActorList();
    const npcQuery = String(state.npcSearch ?? "").trim().toLocaleLowerCase();
    let list = fullList;
    if (game.user?.isGM && state.actorMode === "npc") {
      const matches = npcQuery
        ? fullList.filter(actor => `${actor.name ?? ""} ${actor.type ?? ""}`.toLocaleLowerCase().includes(npcQuery))
        : fullList;
      list = matches.slice(0, 75);
      const selectedActor = fullList.find(actor => actor.id === state.actorId);
      if (selectedActor && !list.some(actor => actor.id === selectedActor.id)) list = [selectedActor, ...list].slice(0, 75);
    }
    if (!fullList.some(a => a.id === state.actorId)) state.actorId = fullList[0]?.id ?? "";
    const actor = game.actors.get(state.actorId);
    const projects = actor ? projectsForActor(actor.id) : [];
    const pending = game.user.isGM ? projectJournals().filter(j => projectFromJournal(j)?.status === "pending") : [];
    const hasTypes = availableItemTypes().length > 0;
    const hasFamilies = gatheringDomainsForWorld().length > 0;
    overlay.innerHTML = `<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">
      ${shellHeader("Inventions", `Genesys ${game.system?.version ?? "?"} · v${MODULE_VERSION} · Wonderous Inventions`, state)}
      <main class="ginv-main">
        <div class="ginv-home-summary">
          <div class="ginv-panel ginv-home-character">
            <div class="ginv-field">
              <label>${game.user.isGM && state.actorMode === "npc" ? tx("NPC / Test Inventor","НІП / тестовий винахідник") : tx("Inventor Character","Персонаж-винахідник")}</label>
              ${game.user.isGM && state.actorMode === "npc" ? `<input type="search" data-npc-search value="${esc(state.npcSearch)}" placeholder="${tx("Search NPC / Test Actor…","Пошук НІПа / тестового Actor…")}">` : ""}
              <select data-actor>${list.map(a => `<option value="${a.id}" ${a.id === state.actorId ? "selected" : ""}>${esc(a.name)}${game.user.isGM && state.actorMode === "npc" ? ` · ${esc(a.type)}` : ""}</option>`).join("")}</select>
              ${game.user.isGM && state.actorMode === "npc" ? `<div class="ginv-help" data-npc-count>${tx(`Showing ${list.length} of ${fullList.length} NPC / test Actors. Type to narrow the list.`,`Показано ${list.length} із ${fullList.length} НІПів / тестових Actor. Введіть текст, щоб звузити список.`)}</div>` : ""}
            </div>
            ${game.user.isGM ? `<div class="ginv-row" style="align-self:end"><button type="button" class="ginv-btn ${state.actorMode === "npc" ? "action" : ""}" data-actor-mode>${state.actorMode === "npc" ? tx("Use Player Characters","Обрати персонажа гравця") : tx("Choose NPC / Test Actor","Обрати НІПа / тестового Actor")}</button></div>` : ""}
            <div class="ginv-home-counts">
              <div class="ginv-counter"><div class="ginv-counter-label">${tx("Projects","Проєкти")}</div><div class="ginv-counter-value">${projects.length}</div></div>
              ${game.user.isGM ? `<div class="ginv-counter"><div class="ginv-counter-label">${tx("Pending","Очікують")}</div><div class="ginv-counter-value">${pending.length}</div></div>` : ""}
            </div>
          </div>
        </div>
        ${!hasTypes ? `<div class="ginv-callout ginv-warn">${tx("All invention object types are disabled in Module Settings.","Усі типи винаходів вимкнено в Module Settings.")}</div>` : ""}
        ${!hasFamilies ? `<div class="ginv-callout ginv-warn">${tx("All crafting families are disabled in Module Settings.","Усі галузі крафту вимкнено в Module Settings.")}</div>` : ""}
        <div class="ginv-home-cards">
          <button type="button" class="ginv-card" data-new ${actor && hasTypes && hasFamilies ? "" : "disabled"}><div class="ginv-icon">✦</div><h2>${tx("New Invention","Новий винахід")}</h2><p class="ginv-help">${tx("Create a design from scratch or use an existing object as the starting point.","Створіть проєкт з нуля або використайте готовий об'єкт як основу.")}</p></button>
          <button type="button" class="ginv-card" data-projects ${actor ? "" : "disabled"}><div class="ginv-icon">⚙</div><h2>${tx("My Projects","Мої проєкти")}</h2><p class="ginv-help">${tx("Open designs, develop schematics, allocate components, and prepare the final crafting check.","Відкривайте проєкти, розробляйте креслення, обліковуйте компоненти та готуйте фінальну перевірку крафту.")}</p></button>
          <button type="button" class="ginv-card" data-gather ${actor && hasFamilies ? "" : "disabled"}><div class="ginv-icon">⛏</div><h2>${tx("Components & Gathering","Компоненти та збір")}</h2><p class="ginv-help">${tx("View the Actor's persistent Component Stockpile, gather materials, or add known materials manually.","Переглядайте постійний запас компонентів Actor, збирайте матеріали або додавайте вже отримані вручну.")}</p></button>
          ${game.user.isGM ? `<button type="button" class="ginv-card" data-review-queue><div class="ginv-icon">◆</div><h2>${tx("GM Review Queue","Черга GM")}</h2><p class="ginv-help">${pending.length ? tx(`${pending.length} project(s) await approval.`, `${pending.length} проєкт(и) очікують схвалення.`) : tx("Nothing is waiting for approval.","Немає проєктів, що очікують схвалення.")}</p></button>` : ""}
          <button type="button" class="ginv-card" data-rules><div class="ginv-icon">📖</div><h2>${tx("Crafting Rules & Components","Правила крафту та компоненти")}</h2><p class="ginv-help">${tx("Schematics, tiers, deconstruction, gathering guidance, difficulty upgrades, and crafting-family examples.","Креслення, тіри, розбирання, правила збору, підвищення складності та приклади для різних галузей крафту.")}</p></button>
          <div class="ginv-panel"><h2>${tx("Workshop","Майстерня")}</h2><p class="ginv-help">${tx("Each invention is stored as a project Journal. The finished object is created only after GM approval and project completion.","Кожен винахід зберігається як Journal-проєкт. Готовий об'єкт створюється лише після схвалення GM та завершення проєкту.")}</p><div class="ginv-workflow-row" style="margin-top:10px"><span class="ginv-workflow-step">1 · ${tx("Concept","Концепція")}</span><span class="ginv-workflow-arrow">›</span><span class="ginv-workflow-step">2 · ${tx("GM Approval","Схвалення GM")}</span><span class="ginv-workflow-arrow">›</span><span class="ginv-workflow-step">3 · ${tx("Schematics","Креслення")}</span><span class="ginv-workflow-arrow">›</span><span class="ginv-workflow-step">4 · ${tx("Components","Компоненти")}</span><span class="ginv-workflow-arrow">›</span><span class="ginv-workflow-step">5 · ${tx("Craft","Крафт")}</span></div></div>
        </div>
      </main>
      <footer class="ginv-foot"><span class="ginv-sub">${tx("Wonderous Inventions workflow · Project records are stored in Foundry Journals.","Процес Wonderous Inventions · записи проєктів зберігаються у Foundry Journals.")}</span></footer>
    </div>`;
    bindShellControls(overlay, state, renderHome, close);
    bindField(overlay, "[data-actor]", v => { state.actorId = v; renderHome(); }, "change");
    const npcSearch = overlay.querySelector("[data-npc-search]");
    if (npcSearch) {
      npcSearch.addEventListener("input", () => {
        state.npcSearch = npcSearch.value;
        const select = overlay.querySelector("[data-actor]");
        const count = overlay.querySelector("[data-npc-count]");
        const full = npcActors;
        const query = String(state.npcSearch ?? "").trim().toLocaleLowerCase();
        const matches = (query ? full.filter(actor => `${actor.name ?? ""} ${actor.type ?? ""}`.toLocaleLowerCase().includes(query)) : full).slice(0, 75);
        const selectedActor = full.find(actor => actor.id === state.actorId);
        const visible = selectedActor && !matches.some(actor => actor.id === selectedActor.id) ? [selectedActor, ...matches].slice(0, 75) : matches;
        if (select) {
          select.innerHTML = visible.map(actor => `<option value="${actor.id}" ${actor.id === state.actorId ? "selected" : ""}>${esc(actor.name)} · ${esc(actor.type)}</option>`).join("");
          if (!visible.some(actor => actor.id === state.actorId) && visible[0]) { state.actorId = visible[0].id; select.value = state.actorId; }
        }
        if (count) count.textContent = tx(`Showing ${visible.length} of ${full.length} NPC / test Actors. Type to narrow the list.`, `Показано ${visible.length} із ${full.length} НІПів / тестових Actor. Введіть текст, щоб звузити список.`);
      });
    }
    overlay.querySelector("[data-actor-mode]")?.addEventListener("click", () => { state.actorMode = state.actorMode === "npc" ? "player" : "npc"; state.npcSearch = ""; state.actorId = activeActorList()[0]?.id ?? ""; renderHome(); });
    overlay.querySelector("[data-new]")?.addEventListener("click", () => { const actorNow = game.actors.get(state.actorId); if (!canUseInventorActor(actorNow)) { ui.notifications.warn(tx("You cannot use that Actor as the inventor.","Ви не можете використовувати цього Actor як винахідника.")); return; } close(); openNewInvention(actorNow, state, () => openWorkshop(actorNow.id)); });
    overlay.querySelector("[data-projects]")?.addEventListener("click", () => { state.view = "projects"; renderProjects(); });
    overlay.querySelector("[data-gather]")?.addEventListener("click", () => { state.view = "gather"; renderGathering(); });
    overlay.querySelector("[data-review-queue]")?.addEventListener("click", () => { state.view = "review"; renderReviewQueue(); });
    overlay.querySelector("[data-rules]")?.addEventListener("click", () => { state.view = "rules"; renderRules(); });
  }

  function renderGathering() {
    const actor = game.actors.get(state.actorId);
    if (!canUseInventorActor(actor)) { renderHome(); return; }
    const enabledDomains = gatheringDomainsForWorld();
    if (!enabledDomains.length) {
      overlay.innerHTML = `<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">${shellHeader(tx("Gather Components","Збір компонентів"), actor.name, state)}<main class="ginv-main"><div class="ginv-callout ginv-warn">${tx("No component families are enabled in Module Settings.", "У налаштуваннях модуля не ввімкнено жодної групи компонентів.")}</div></main><footer class="ginv-foot"><button class="ginv-btn" data-home>← Inventions</button></footer></div>`;
      bindShellControls(overlay,state,renderGathering,close);
      overlay.querySelector("[data-home]")?.addEventListener("click",renderHome);
      return;
    }
    if (!enabledDomains.some(([id]) => id === state.gatherDomain)) state.gatherDomain = enabledDomains[0][0];
    state.gatherTier ??= 3;
    state.gatherDifficulty ??= recommendedGatheringDifficulty(state.gatherTier);
    const domain = GATHERING_DOMAINS[state.gatherDomain] ?? enabledDomains[0][1];
    state.gatherSkill ??= recommendedGatheringSkill(actor, state.gatherDomain);
    const allActorSkills = actor.items.filter(item=>item.type==="skill").sort((a,b)=>a.name.localeCompare(b.name));
    const candidateNames = new Set((domain.skillCandidates ?? []).map(norm));
    const matchingSkills = allActorSkills.filter(item => candidateNames.has(norm(item.name)));
    const actorSkills = matchingSkills.length ? matchingSkills : allActorSkills;
    if (!actorSkills.some(item => item.name === state.gatherSkill)) state.gatherSkill = recommendedGatheringSkill(actor, state.gatherDomain) || actorSkills[0]?.name || "";
    const skillOptions = actorSkills.map(item=>`<option value="${esc(item.name)}" ${item.name===state.gatherSkill?"selected":""}>${esc(item.name)}</option>`).join("");
    const domainOptions = enabledDomains.map(([id,d])=>`<option value="${id}" ${id===state.gatherDomain?"selected":""}>${esc(domainText(d,"label"))} · ${esc(domainText(d,"componentType"))}</option>`).join("");
    const stockpile = actorComponentStockpile(actor);
    const totals = stockpileTotals(stockpile);
    const perSuccess = gatheringYieldPerSuccess(state.gatherTier);
    const recommended = recommendedGatheringDifficulty(state.gatherTier);
    const multiplier = gatheringYieldPercent();
    overlay.innerHTML=`<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">
      ${shellHeader(tx("Gather Components", "Збір компонентів"), `${actor.name} · ${tx("materials for inventions and crafting", "матеріали для винаходів і крафту")}`, state)}
      <main class="ginv-main">
        <div class="ginv-panel">
          <div class="ginv-grid3">
            <div class="ginv-field"><label>${tx("Gathering type", "Тип збору")}</label><select data-gather-domain>${domainOptions}</select></div>
            <div class="ginv-field"><label>${tx("Skill", "Навичка")}</label><select data-gather-skill>${skillOptions}</select></div>
            <div class="ginv-field"><label>${tx("Difficulty", "Складність")}</label><select data-gather-difficulty>${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${Number(state.gatherDifficulty)===n?"selected":""}>${difficultyLabel(n)}</option>`).join("")}</select><div class="ginv-help">${difficultyDisplayHTML(state.gatherDifficulty,0)}</div></div>
            <div class="ginv-field"><label>${tx("Target Tier", "Цільовий Tier")}</label><select data-gather-tier>${[3,5,7].map(n=>`<option value="${n}" ${Number(state.gatherTier)===n?"selected":""}>Tier ${n}</option>`).join("")}</select></div>
          </div>
          <div class="ginv-callout" style="margin-top:12px">
            <strong>${esc(domainText(domain,"componentType"))}</strong>
            <p><b>${tx("Suitable for:", "Підходять для:")}</b> ${esc(domainText(domain,"uses"))}</p>
            <p><b>${tx("Examples:", "Приклади:")}</b> ${esc(domainText(domain,"examples"))}</p>
            <p><b>${tx("Workshop yield:", "Вихід за Workshop rule:")}</b> ${currencyAmount(perSuccess)} ${tx("per net Success", "за кожен net Success")} (${multiplier}% ${tx("of the 100-base value", "від базових 100")}).</p>
            <p>${tx("Recommended minimum difficulty for", "Рекомендована мінімальна складність для")} Tier ${state.gatherTier}: ${difficultyDisplayHTML(recommended,0)}.</p>
            <p class="ginv-help">${tx("This field-gathering yield is module Workshop guidance, not RAW Wonderous Inventions. Advantage, Threat, Triumph, and Despair remain narrative levers for quality, time, hazards, special finds, or complications.", "Це модульна Workshop-настанова для польового збору, а не RAW Wonderous Inventions. Переваги, Загрози, Тріумф і Відчай краще використовувати для якості матеріалу, часу, небезпек, особливих знахідок або ускладнень.")}</p>
          </div>
          <div class="ginv-row" style="margin-top:10px"><button class="ginv-btn primary" data-gather-roll>🎲 ${tx("Roll", "Кинути")} ${esc(state.gatherSkill || tx("Skill","Навичку"))}</button></div>
        </div>
        <div class="ginv-panel" style="margin-top:14px">
          <div class="ginv-row"><div><h2>${tx("Component Stockpile", "Запас компонентів")} · ${esc(actor.name)}</h2><p class="ginv-help">${tx("Gathered and manually granted materials persist on this Actor. Each entry records its family, Tier, value, and origin.", "Зібрані та вручну додані матеріали зберігаються на цьому персонажі. Кожен запис містить групу, Tier, вартість і походження.")}</p></div><div class="ginv-spacer"></div><button class="ginv-btn action" data-add-manual>＋ ${tx("Add Components Manually", "Додати вручну")}</button></div>
          <div class="ginv-chips"><span class="ginv-chip">Tier 3 · ${currencyAmount(totals.tier3)}</span><span class="ginv-chip">Tier 5 · ${currencyAmount(totals.tier5)}</span><span class="ginv-chip">Tier 7 · ${currencyAmount(totals.tier7)}</span><span class="ginv-chip action">${tx("Total", "Разом")} · ${currencyAmount(totals.total)}</span></div>
          ${stockpileRowsHTML(actor)}
        </div>
        <div class="ginv-gather-reference">${gatheringReferenceHTML()}</div>
      </main>
      <footer class="ginv-foot"><button class="ginv-btn" data-home>← Inventions</button><div class="ginv-spacer"></div><span class="ginv-sub">${tx("Field-gathering yield is explicit Workshop guidance; source Tier rules remain unchanged.", "Вихід польового збору є окремою Workshop-настановою; правила Tier із джерела не змінюються.")}</span></footer>
    </div>`;
    bindShellControls(overlay,state,renderGathering,close);
    overlay.querySelector("[data-home]")?.addEventListener("click",renderHome);
    overlay.querySelector("[data-add-manual]")?.addEventListener("click",async()=>{try{await openManualComponentPrompt(actor,{onSaved:renderGathering});}catch(error){ui.notifications.error(error.message);}});
    bindField(overlay,"[data-gather-domain]",v=>{state.gatherDomain=v;state.gatherSkill=recommendedGatheringSkill(actor,v);renderGathering();},"change");
    bindField(overlay,"[data-gather-skill]",v=>{state.gatherSkill=v;renderGathering();},"change");
    bindField(overlay,"[data-gather-difficulty]",v=>{state.gatherDifficulty=clamp(integer(v),0,5);renderGathering();},"change");
    bindField(overlay,"[data-gather-tier]",v=>{state.gatherTier=[3,5,7].includes(integer(v))?integer(v):3;state.gatherDifficulty=recommendedGatheringDifficulty(state.gatherTier);renderGathering();},"change");
    overlay.querySelector("[data-gather-roll]")?.addEventListener("click",async()=>{try{if(!state.gatherSkill)throw new Error(tx("Choose a Skill first.", "Спочатку оберіть навичку."));await openGatheringRollPrompt(actor,{domainId:state.gatherDomain,skillName:state.gatherSkill,difficulty:state.gatherDifficulty,tier:state.gatherTier,onRecorded:renderGathering});}catch(error){ui.notifications.error(error.message);}});
  }

  function renderRules() {
    overlay.innerHTML = `<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">
      ${shellHeader(tx("Crafting Rules & Components","Правила крафту та компоненти"), tx("Wonderous Inventions reference + clearly marked Workshop guidance","Довідка Wonderous Inventions + чітко позначені Workshop-настанови"), state)}
      <main class="ginv-main">${rulesReferenceHTML()}</main>
      <footer class="ginv-foot"><button class="ginv-btn" data-home>← Inventions</button><div class="ginv-spacer"></div><span class="ginv-sub">${tx("Source rules and module guidance are deliberately separated.","Правила джерела й модульні настанови навмисно розділено.")}</span></footer>
    </div>`;
    bindShellControls(overlay, state, renderRules, close);
    overlay.querySelector("[data-home]")?.addEventListener("click", renderHome);
  }

  function renderProjects() {
    const actor = game.actors.get(state.actorId);
    const projects = actor ? projectsForActor(actor.id) : [];
    overlay.innerHTML = `<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">
      ${shellHeader(tx("My Invention Projects","Мої проєкти винаходів"), actor?.name ?? tx("No Character","Персонажа не обрано"), state)}
      <main class="ginv-main"><div class="ginv-list">${projects.map(projectCardHTML).join("") || `<div class="ginv-listrow">${tx("No Invention Projects for this character.","У цього персонажа немає проєктів винаходів.")}</div>`}</div></main>
      <footer class="ginv-foot"><button class="ginv-btn" data-home>← Inventions</button><div class="ginv-spacer"></div><button class="ginv-btn primary" data-new>${tx("New Invention","Новий винахід")}</button></footer>
    </div>`;
    bindShellControls(overlay, state, renderProjects, close);
    overlay.querySelector("[data-home]")?.addEventListener("click", renderHome);
    overlay.querySelector("[data-new]")?.addEventListener("click", () => { if (!canUseInventorActor(actor)) { ui.notifications.warn(tx("You cannot use that Actor as the inventor.","Ви не можете використовувати цього Actor як винахідника.")); return; } close(); openNewInvention(actor, state, () => openWorkshop(actor.id)); });
    overlay.querySelectorAll("[data-open-project]").forEach(btn => btn.addEventListener("click", () => { const journal = game.journal.get(btn.dataset.openProject); if (!journal) return; close(); openProject(journal, state, () => openWorkshop(actor?.id)); }));
  }

  function renderReviewQueue() {
    if (!game.user.isGM) { renderHome(); return; }
    const pending = projectJournals().filter(j => projectFromJournal(j)?.status === "pending");
    const ready = projectJournals().filter(j => projectFromJournal(j)?.status === "ready");
    overlay.innerHTML = `<div class="ginv-shell" data-theme="${state.theme}" style="--ginv-text-adjust:${state.textSize}px">
      ${shellHeader(tx("GM Invention Queue","Черга винаходів GM"), tx(`${pending.length} pending approval · ${ready.length} ready for final crafting`,`${pending.length} очікують схвалення · ${ready.length} готові до фінального крафту`), state)}
      <main class="ginv-main"><div class="ginv-panel"><h2>${tx("Pending Approval","Очікують схвалення")}</h2><div class="ginv-list">${pending.map(projectCardHTML).join("") || `<div class="ginv-listrow">${tx("Nothing is waiting for approval.","Немає проєктів, що очікують схвалення.")}</div>`}</div></div><div class="ginv-panel" style="margin-top:14px"><h2>${tx("Ready for Final Crafting","Готові до фінального крафту")}</h2><div class="ginv-list">${ready.map(projectCardHTML).join("") || `<div class="ginv-listrow">${tx("No projects are currently marked ready.","Наразі немає проєктів зі статусом «готово».")}</div>`}</div></div></main>
      <footer class="ginv-foot"><button class="ginv-btn" data-home>← Inventions</button></footer>
    </div>`;
    bindShellControls(overlay, state, renderReviewQueue, close);
    overlay.querySelector("[data-home]")?.addEventListener("click", renderHome);
    overlay.querySelectorAll("[data-open-project]").forEach(btn => btn.addEventListener("click", () => { const journal = game.journal.get(btn.dataset.openProject); if (!journal) return; close(); const project = projectFromJournal(journal); if (project?.status === "pending") openGMReview(journal, state, () => openWorkshop(project.actorId)); else openProject(journal, state, () => openWorkshop(project?.actorId)); }));
  }

  renderHome();
}

async function ensureLauncherMacro() {
  if (!game.user?.isGM) return null;

  const launcherCommand = `const api = game.genesysInventions ?? game.modules.get("${MODULE_ID}")?.api; if (!api?.open) { ui.notifications.error("Genesys Inventions module is not active."); } else { api.open(); }`;
  const ownershipDefault = CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OBSERVER ?? 2;
  const existing = game.macros.find(macro =>
    macro.getFlag?.(MODULE_ID, "kind") === "launcher" ||
    macro.name === "Genesys Inventions"
  );

  if (existing) {
    const updates = {};
    if (existing.name !== "Genesys Inventions") updates.name = "Genesys Inventions";
    if (existing.type !== "script") updates.type = "script";
    if (existing.img !== "icons/svg/portal.svg") updates.img = "icons/svg/portal.svg";
    if (existing.command !== launcherCommand) updates.command = launcherCommand;
    if ((existing.ownership?.default ?? 0) < ownershipDefault) {
      updates.ownership = { ...(existing.ownership ?? {}), default: ownershipDefault };
    }
    if (Object.keys(updates).length) {
      try { await existing.update(updates); }
      catch (error) { console.warn("Genesys Inventions | Could not update launcher Macro", error); }
    }
    if (existing.getFlag?.(MODULE_ID, "kind") !== "launcher") {
      try { await existing.setFlag(MODULE_ID, "kind", "launcher"); } catch (_) {}
    }
    return existing;
  }

  try {
    return await Macro.create({
      name: "Genesys Inventions",
      type: "script",
      img: "icons/svg/portal.svg",
      scope: "global",
      command: launcherCommand,
      ownership: { default: ownershipDefault },
      flags: { [MODULE_ID]: { kind: "launcher", version: MODULE_VERSION } }
    });
  } catch (error) {
    console.error("Genesys Inventions | Could not create launcher Macro", error);
    ui.notifications.warn(`Genesys Inventions could not create its launcher Macro: ${error.message}`);
    return null;
  }
}

function addActorSheetButton(app, html) {
  const actor = app?.actor ?? app?.document;
  if (!canUseInventorActor(actor)) return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root) return;
  const appRoot = root.closest?.(".app") ?? root;
  const header = appRoot.querySelector?.(".window-header");
  if (!header || header.querySelector("[data-ginv-sheet-button]")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "header-control ginv-sheet-button";
  button.dataset.ginvSheetButton = "true";
  button.title = tx("Open Inventions", "Відкрити Винаходи");
  button.innerHTML = `<i class="fas fa-hammer"></i><span>${tx("Inventions", "Винаходи")}</span>`;
  button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openWorkshop(actor.id); });
  const closeButton = header.querySelector("button[data-action='close'], .close");
  if (closeButton) header.insertBefore(button, closeButton);
  else header.appendChild(button);
}

Hooks.once("init", () => {
  console.log(`Genesys Inventions | Initializing v${MODULE_VERSION}`);

  game.settings.register(MODULE_ID, LANGUAGE_SETTING, {
    name: "Interface Language / Мова інтерфейсу",
    hint: "Choose the module UI language. Auto follows Foundry's language. / Оберіть мову інтерфейсу модуля. Auto використовує мову Foundry.",
    scope: "client",
    config: true,
    type: String,
    choices: {auto: "Auto", uk: "Українська", en: "English"},
    default: "auto"
  });

  game.settings.register(MODULE_ID, GATHER_YIELD_SETTING, {
    name: "Gathering Yield (%) / Вихід компонентів (%)",
    hint: "100% = 100 currency of components per net Success. 200% = 200 per net Success. This is Workshop guidance, not RAW. / 100% = 100 одиниць валюти компонентів за net Success; 200% = 200.",
    scope: "world",
    config: true,
    type: Number,
    range: {min: 0, max: 1000, step: 25},
    default: 100
  });

  const itemSettings = [
    ["gear", "Gear"],
    ["weapon", "Weapon / Зброя"],
    ["armor", "Armor / Обладунки"],
    ["vehicle", "Vehicle / Транспорт"]
  ];
  for (const [type, label] of itemSettings) {
    game.settings.register(MODULE_ID, ITEM_TYPE_SETTINGS[type], {
      name: `Allow ${label}`,
      hint: "If disabled, this object type is hidden from New Invention. / Якщо вимкнено, цей тип не можна обрати для нового винаходу.",
      scope: "world", config: true, type: Boolean, default: true
    });
  }

  for (const [id, domain] of Object.entries(GATHERING_DOMAINS)) {
    game.settings.register(MODULE_ID, `${DOMAIN_SETTING_PREFIX}${id}`, {
      name: `Crafting family: ${domain.labelEn ?? domain.label} / ${domain.label}`,
      hint: "Controls whether this crafting/component family appears in Gathering and crafting guidance. / Визначає, чи доступна ця група крафту й компонентів.",
      scope: "world", config: true, type: Boolean, default: true
    });
  }
});

Hooks.once("ready", () => {
  if (game.system?.id !== "genesys") {
    ui.notifications.error(`Genesys Inventions requires the Genesys system. Active system: ${game.system?.id ?? "unknown"}.`);
    return;
  }
  if (game.system?.version !== "0.2.19") {
    ui.notifications.warn(`Genesys Inventions v${MODULE_VERSION} was built for Genesys 0.2.19. Current version: ${game.system?.version}.`);
  }
  game.socket.on(SOCKET, handleSocketMessage);
  if (game.user?.isGM) {
    migrateProjectJournalPermissions();
    ensureInventionCompendia().catch(error => {
      console.error("Genesys Inventions | Could not prepare invention Compendia", error);
      ui.notifications.warn(`Genesys Inventions could not prepare its Compendia: ${error.message}`);
    });
    ensureLauncherMacro();
  }
  const api = {
    version: MODULE_VERSION,
    open: openWorkshop,
    projects: projectJournals,
    openProject: id => {
      const journal = game.journal.get(id);
      if (!journal) return ui.notifications.warn("Invention Project not found.");
      const state = {theme: storedTheme(), textSize: storedTextSize()};
      openProject(journal, state, () => openWorkshop(projectFromJournal(journal)?.actorId));
    }
  };
  const moduleRecord = game.modules.get(MODULE_ID);
  if (moduleRecord) moduleRecord.api = api;
  game.genesysInventions = api;
  console.log(`Genesys Inventions | Ready v${MODULE_VERSION}`);
});

Hooks.on("renderActorSheet", addActorSheetButton);
Hooks.on("createChatMessage", message => { captureCraftingChatMessage(message); });
