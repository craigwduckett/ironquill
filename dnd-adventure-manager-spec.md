# D&D Adventure Manager — Project Specification

> A web app that augments tabletop D&D sessions. It helps new dungeon masters run adventures with confidence and gives players a clean interface to manage characters during play. It does NOT replace the tabletop — physical dice, verbal roleplay, and face-to-face interaction remain central.

---

## Architecture Overview

| Layer | Category | Notes |
|-------|----------|-------|
| Frontend | SPA with component framework | Responsive. Desktop-first for DM view, mobile-friendly for player view |
| Backend API | RESTful API | CRUD operations for all entities |
| Real-Time | WebSocket | Live session sync between DM and players |
| Database | Relational DB | Core structured data. JSONB columns for flexible fields (stat blocks, scene narratives, session logs) |
| Auth | Token-based | JWT or session-based. Single account model — role is per-adventure, not per-account |
| File Storage | Object storage | Curated art library, adventure cover images, NPC portraits |
| SRD Data | Pre-seeded reference tables | Read-only. D&D 5e System Reference Document (CC-licensed). Races, classes, monsters, spells, items, conditions, rules |

---

## User Roles

A single user account can act as both roles across different adventures.

**Dungeon Master (DM):** Creates adventures, runs live sessions, controls scene progression and NPC actions, manages kids characters, accesses rules reference and coaching tools.

**Player:** Creates and manages their own characters, joins adventures via invite code, views character sheet and scene info during play, tracks inventory and abilities.

---

## Route Structure

```
/                           → Landing / marketing page
/login                      → Login form
/register                   → Registration form
/dashboard                  → Home dashboard (my characters, my adventures, joined adventures)

/characters/new             → Character creation wizard (step-based)
/characters/:id             → Character sheet view/edit
/characters/:id/levelup     → Level-up flow

/adventures/new             → Adventure creation form
/adventures/:id             → Adventure overview (DM only)
/adventures/:id/scenes      → Scene builder / flow editor
/adventures/:id/npcs        → NPC roster
/adventures/:id/encounters  → Encounter builder
/adventures/:id/settings    → Ruleset config, player capacity, invite code

/session/:id/lobby          → Pre-session waiting room (DM + players)
/session/:id/dm             → DM live session view
/session/:id/player         → Player live session view
/session/:id/summary        → Post-session summary

/srd                        → SRD reference browser (standalone, always accessible)
/srd/races                  → Race index
/srd/classes                → Class index
/srd/spells                 → Spell index with filters
/srd/monsters               → Monster/bestiary index with CR filter
/srd/items                  → Equipment and magic items
/srd/rules                  → Rules reference (searchable)
/srd/conditions             → Conditions reference
```

---

## Data Model

### Core Entities

```
User {
  id                  UUID PK
  email               string UNIQUE NOT NULL
  password_hash       string NOT NULL
  display_name        string NOT NULL
  created_at          timestamp
  updated_at          timestamp
}

Character {
  id                  UUID PK
  user_id             UUID FK → User (nullable for DM-managed kids characters)
  managed_by          enum: "self" | "dm"
  preset_source_id    UUID FK → CharacterPreset (nullable)
  name                string NOT NULL
  race_id             UUID FK → SRD_Race
  class_id            UUID FK → SRD_Class
  level               int DEFAULT 1
  xp                  int DEFAULT 0
  background          string
  alignment           string (nullable)
  ability_scores      JSONB {str, dex, con, int, wis, cha}
  hp_current          int
  hp_max              int
  hp_temp             int DEFAULT 0
  ac                  int
  speed               int
  proficiency_bonus   int
  skill_proficiencies string[]
  features            JSONB[]
  personality         JSONB {traits, ideals, bonds, flaws} (nullable)
  appearance          JSONB {age, height, description} (nullable)
  portrait_id         string (reference to curated art library asset)
  notes               text (nullable)
  created_at          timestamp
  updated_at          timestamp
}

CharacterInventory {
  id                  UUID PK
  character_id        UUID FK → Character
  item_id             UUID FK → SRD_Item (nullable for custom items)
  custom_item_name    string (nullable, used when item_id is null)
  quantity            int DEFAULT 1
  equipped            boolean DEFAULT false
  notes               string (nullable)
}

CharacterSpell {
  id                  UUID PK
  character_id        UUID FK → Character
  spell_id            UUID FK → SRD_Spell
  prepared            boolean DEFAULT false
}

CharacterPreset {
  id                  UUID PK
  archetype_name      string NOT NULL (e.g., "The Hero", "The Trickster")
  display_description string NOT NULL (plain language, e.g., "Strong and brave, hits things hard")
  srd_class_id        UUID FK → SRD_Class (the real class under the hood)
  race_id             UUID FK → SRD_Race
  ability_scores      JSONB {str, dex, con, int, wis, cha}
  hp                  int
  ac                  int
  starting_gear       JSONB[]
  simplified_features JSONB[] (kid-friendly rewrites of SRD class features)
  portrait_id         string
}
```

### Adventure Entities

```
Adventure {
  id                  UUID PK
  dm_user_id          UUID FK → User
  title               string NOT NULL
  description         text
  setting             string (nullable)
  level_range_min     int DEFAULT 1
  level_range_max     int DEFAULT 5
  cover_image_id      string (nullable)
  adventure_type      enum: "campaign" | "one_shot"
  ruleset             enum: "standard" | "kids" | "custom"
  ruleset_overrides   JSONB (nullable — for kids mode toggle overrides)
  player_capacity_min int DEFAULT 1
  player_capacity_max int DEFAULT 6
  invite_code         string UNIQUE
  status              enum: "draft" | "published" | "active" | "completed"
  created_at          timestamp
  updated_at          timestamp
}

-- ruleset_overrides schema (for kids mode toggles):
-- {
--   "simplified_rolls": true,      // d20 binary: <10 fail, 10+ success
--   "weaker_enemies": true,        // 50-70% HP, lower AC, no legendary actions
--   "forgiving_combat": true,      // unconscious at 0 HP, no death saves
--   "simplified_spellcasting": true, // spells X times per rest, no slot tracking
--   "streamlined_inventory": true  // no weight/encumbrance
-- }
-- Each defaults to true when ruleset="kids". DM can toggle any to false.

Scene {
  id                  UUID PK
  adventure_id        UUID FK → Adventure
  title               string NOT NULL
  scene_type          enum: "exploration" | "social" | "combat" | "puzzle" | "rest" | "transition"
  narrative_read_aloud text (nullable — text DM can share with players)
  narrative_dm_notes  text (nullable — DM-only notes)
  dm_tips             text (nullable — coaching reminders)
  loot                JSONB[] (nullable — items, gold, XP)
  sort_order          int (for default linear ordering)
  position_x          float (nullable — for node-based visual editor)
  position_y          float (nullable — for node-based visual editor)
  created_at          timestamp
  updated_at          timestamp
}

SceneConnection {
  id                  UUID PK
  from_scene_id       UUID FK → Scene
  to_scene_id         UUID FK → Scene
  label               string (nullable — e.g., "If players negotiate", "If combat breaks out")
  condition_notes     string (nullable)
}

NPC {
  id                  UUID PK
  adventure_id        UUID FK → Adventure
  name                string NOT NULL
  race                string
  role                string (nullable — e.g., "Tavern keeper", "Quest giver")
  disposition         enum: "ally" | "neutral" | "hostile"
  stat_block          JSONB (nullable — full stat block for combat-relevant NPCs)
  srd_monster_id      UUID FK → SRD_Monster (nullable — if based on SRD template)
  portrait_id         string (nullable)
  notes               text (nullable)
  created_at          timestamp
}

SceneNPC {
  id                  UUID PK
  scene_id            UUID FK → Scene
  npc_id              UUID FK → NPC
}

Encounter {
  id                  UUID PK
  scene_id            UUID FK → Scene
  difficulty_rating   enum: "easy" | "medium" | "hard" | "deadly" (calculated)
  terrain_notes       text (nullable)
}

EncounterMonster {
  id                  UUID PK
  encounter_id        UUID FK → Encounter
  srd_monster_id      UUID FK → SRD_Monster (nullable for custom)
  custom_stat_block   JSONB (nullable)
  quantity            int DEFAULT 1
}
```

### Session Entities (Live Play)

```
Session {
  id                  UUID PK
  adventure_id        UUID FK → Adventure
  session_number      int (campaigns: 1, 2, 3... — one-shots: always 1)
  status              enum: "lobby" | "active" | "paused" | "completed"
  active_scene_id     UUID FK → Scene (nullable)
  started_at          timestamp (nullable)
  ended_at            timestamp (nullable)
  end_state_snapshot  JSONB (nullable — for campaign resume)
  summary             text (nullable — auto-generated post-session)
}

SessionParticipant {
  id                  UUID PK
  session_id          UUID FK → Session
  user_id             UUID FK → User (nullable for DM-managed kids)
  character_id        UUID FK → Character
  role                enum: "player" | "dm_managed"
  joined_at           timestamp
}

SessionLog {
  id                  UUID PK
  session_id          UUID FK → Session
  timestamp           timestamp
  log_type            enum: "roll" | "hp_change" | "condition" | "scene_change" | "loot" | "note" | "combat_action"
  actor_character_id  UUID FK → Character (nullable)
  data                JSONB
  -- Roll log data example: {roll_type: "attack", result: 14, modifier: 5, total: 19, outcome: "hit", target: "Goblin"}
  -- HP change example: {change: -8, new_hp: 12, source: "Goblin attack"}
  -- Condition example: {condition: "poisoned", action: "applied", source: "Poison trap"}
}

InitiativeEntry {
  id                  UUID PK
  session_id          UUID FK → Session
  character_id        UUID FK → Character (nullable — for NPCs use npc_id)
  npc_id              UUID FK → NPC (nullable)
  initiative_value    int
  is_current_turn     boolean DEFAULT false
  has_acted           boolean DEFAULT false
  sort_order          int
}

AdventureParticipation {
  id                  UUID PK
  adventure_id        UUID FK → Adventure
  user_id             UUID FK → User
  character_id        UUID FK → Character
  status              enum: "active" | "left" | "removed"
  joined_at           timestamp
}
```

### SRD Reference Data (Pre-Seeded, Read-Only)

```
SRD_Race {
  id                  UUID PK
  name                string NOT NULL
  description         text
  traits              JSONB[]
  ability_bonuses     JSONB {str, dex, con, int, wis, cha}
  languages           string[]
  speed               int
  size                string
}

SRD_Class {
  id                  UUID PK
  name                string NOT NULL
  description         text
  hit_die             string (e.g., "d10")
  primary_abilities   string[]
  saving_throws       string[]
  armor_proficiencies string[]
  weapon_proficiencies string[]
  skill_choices       JSONB {choose: int, from: string[]}
  features_by_level   JSONB {level: int, features: [{name, description}]}
  spellcasting_info   JSONB (nullable)
  starting_equipment  JSONB[]
}

SRD_Background {
  id                  UUID PK
  name                string NOT NULL
  description         text
  skill_proficiencies string[]
  tool_proficiencies  string[] (nullable)
  languages_count     int DEFAULT 0
  equipment           JSONB[]
  feature_name        string
  feature_description text
}

SRD_Spell {
  id                  UUID PK
  name                string NOT NULL
  level               int (0 for cantrips)
  school              string
  casting_time        string
  range               string
  components          JSONB {verbal: bool, somatic: bool, material: string|null}
  duration            string
  concentration       boolean DEFAULT false
  ritual              boolean DEFAULT false
  description         text
  higher_levels       text (nullable)
  classes             string[] (which classes can use this spell)
}

SRD_Monster {
  id                  UUID PK
  name                string NOT NULL
  size                string
  type                string
  alignment           string
  ac                  int
  ac_type             string (nullable)
  hp                  int
  hp_formula          string (e.g., "7d8+7")
  speed               JSONB {walk, fly, swim, climb, burrow}
  ability_scores      JSONB {str, dex, con, int, wis, cha}
  saving_throws       JSONB (nullable)
  skills              JSONB (nullable)
  damage_resistances  string[] (nullable)
  damage_immunities   string[] (nullable)
  condition_immunities string[] (nullable)
  senses              string
  languages           string
  cr                  float
  xp                  int
  actions             JSONB[]
  legendary_actions   JSONB[] (nullable)
  special_abilities   JSONB[] (nullable)
}

SRD_Item {
  id                  UUID PK
  name                string NOT NULL
  category            enum: "weapon" | "armor" | "adventuring_gear" | "tool" | "magic_item"
  cost                JSONB {amount, unit} (nullable)
  weight              float (nullable)
  properties          JSONB (varies by category — damage, AC bonus, etc.)
  description         text
  rarity              string (nullable — for magic items)
  requires_attunement boolean DEFAULT false
}

SRD_Condition {
  id                  UUID PK
  name                string NOT NULL
  description         text
  mechanical_effects  string[]
}

SRD_Rule {
  id                  UUID PK
  category            string (e.g., "combat", "spellcasting", "adventuring", "abilities")
  topic               string NOT NULL
  description         text
  keywords            string[] (for search indexing)
}
```

---

## Component Hierarchy

### Shared / Layout

```
<AppShell>
  <TopNav />                          — Logo, user menu, notifications
  <SideNav />                         — Context-dependent navigation
  <MainContent />                     — Route-specific content
  <SRDPopover />                      — Global: tap any game term → SRD popup
</AppShell>

<SRDPopover>                          — Reusable popup for inline SRD lookups
  <SpellCard />                       — Spell name, level, school, description
  <ConditionCard />                   — Condition name, effects
  <MonsterStatBlock />                — Full stat block display
  <RuleCard />                        — Rule topic, description
  <FeatureCard />                     — Class/race feature description
</SRDPopover>
```

### Dashboard (`/dashboard`)

```
<DashboardPage>
  <MyCharacters />                    — List of user's characters with portraits, quick stats
    <CharacterCard />                 — Name, race, class, level, portrait, HP bar
  <MyAdventures />                    — DM-created adventures with status badges
    <AdventureCard />                 — Title, type tag (campaign/one-shot), status, player count
    <ResumeCampaignButton />          — Quick action for active campaigns
  <JoinedAdventures />                — Adventures the user has joined as player
  <QuickActions />                    — "Create Character", "Create Adventure", "Join Adventure"
  <RecentActivity />                  — Feed of last session, character updates
</DashboardPage>
```

### Character Creation (`/characters/new`)

```
<CharacterCreationWizard>
  <StepIndicator />                   — Progress bar showing current step (1-5)
  <CharacterPreview />                — Side panel: visual preview updates with each selection
  
  <Step1_RaceSelection>
    <RaceCard />                      — Grid of SRD races. Illustration, name, trait summary
    <RaceDetails />                   — Expanded: full traits, ability bonuses, languages, flavour
  </Step1_RaceSelection>
  
  <Step2_ClassSelection>
    <ClassCard />                     — Grid of SRD classes. Illustration, name, role summary
    <ClassDetails />                  — Hit die, proficiencies, level 1 features, spellcasting info
  </Step2_ClassSelection>
  
  <Step3_AbilityScores>
    <MethodSelector />                — Standard Array | Point Buy | Manual Entry
    <StatAllocator />                 — Interactive controls per ability score
    <ModifierSummary />               — Real-time: modifiers, race bonuses applied, warnings
  </Step3_AbilityScores>
  
  <Step4_BackgroundDetails>
    <BackgroundPicker />              — SRD backgrounds with proficiencies and flavour
    <NameInput />
    <AlignmentPicker />               — Optional, with descriptions
    <AppearanceFields />              — Age, height, description (freeform)
    <PersonalityFields />             — Traits, ideals, bonds, flaws (with random roll option)
  </Step4_BackgroundDetails>
  
  <Step5_Review>
    <CharacterSheetPreview />         — Full sheet: calculated AC, HP, initiative, skills, equipment, spells
    <SaveButton />
  </Step5_Review>
</CharacterCreationWizard>
```

### Character Sheet (`/characters/:id`)

```
<CharacterSheet>
  <CharacterHeader />                 — Name, race, class, level, portrait, XP bar
  <CoreStats />                       — HP bar, AC, speed, initiative, proficiency bonus
  <AbilityScores />                   — 6 scores with modifiers, saving throw proficiencies
  <SkillList />                       — All 18 skills with modifiers, proficiency indicators
  <CombatStats />                     — Attack options with to-hit and damage (derived from equipment + stats)
  <SpellManager />                    — Spell slots, prepared spells, spell cards (casters only)
  <InventoryManager />                — Equipment list, equipped items, weight (if standard rules)
  <FeaturesTraits />                  — Racial traits, class features, background feature
  <NotesSection />                    — Freeform text for session notes
  <LevelUpPrompt />                   — Appears when XP threshold is crossed
</CharacterSheet>
```

### Adventure Builder (`/adventures/:id/*`)

```
<AdventureBuilder>
  <AdventureOverview />               — Title, description, type, ruleset, status, invite code
    <RulesetConfig />                 — Standard / Kids selector
    <KidsRuleToggles />               — Individual toggle switches (visible when ruleset=kids)
    <KidsPresetManager />             — Manage DM-controlled kids characters
      <PresetPicker />                — Grid of archetype presets (The Hero, The Healer, etc.)
      <PresetCustomizer />            — Tweak name, HP, gear before session
  
  <SceneBuilder />                    — Core planning interface
    <SceneFlowGraph />                — Node-based visual editor (scenes as nodes, arrows as connections)
      <SceneNode />                   — Colour-coded by scene type, title, mini status
      <ConnectionArrow />             — Labelled with branch condition
    <SceneEditor />                   — Edit panel for selected scene
      <NarrativeEditor />             — Read-aloud text + DM-only notes
      <SceneTypeSelector />           — Exploration, Social, Combat, Puzzle, Rest, Transition
      <SceneNPCPicker />              — Link NPCs from roster to this scene
      <SceneBranchEditor />           — Define connections to other scenes with labels
      <EncounterPanel />              — Attach encounter (combat scenes)
      <LootEditor />                  — Items, gold, XP for this scene
      <DMTipsEditor />                — Coaching notes, DC thresholds
  
  <NPCRoster />                       — All NPCs for this adventure
    <NPCCard />                       — Name, race, role, disposition tag, portrait
    <NPCEditor />                     — Full NPC form with optional stat block
    <SRDMonsterPicker />              — Search SRD bestiary, import as NPC base
  
  <EncounterBuilder />                — Standalone encounter design
    <MonsterPicker />                 — Search/filter SRD monsters by CR, type, name
    <DifficultyCalculator />          — Auto-calculates Easy/Medium/Hard/Deadly based on party
    <EncounterMonsterList />          — Selected monsters with quantities
</AdventureBuilder>
```

### Live Session — DM View (`/session/:id/dm`)

```
<DMSessionView>
  <LeftPanel_AdventureNavigator>
    <SceneFlowMini />                 — Simplified node view, current scene highlighted
    <SceneJumpList />                 — Click any scene to navigate (with confirmation)
    <QuickAddScene />                 — Improvise a new scene on the fly
  </LeftPanel_AdventureNavigator>
  
  <CenterPanel_ActiveScene>
    <NarrativeDisplay />              — Read-aloud text with "show to players" toggle
    <DMNotes />                       — DM-only notes and tips
    <EncounterStatus />               — Active encounter: monsters, HP bars, turn order
    <LootDistributor />               — Assign loot/XP to characters
  </CenterPanel_ActiveScene>
  
  <RightPanel_PartyAndNPCs>
    <PartyOverview>
      <CharacterQuickCard />          — Name, HP bar, AC, active conditions
      <KidsCharacterCard />           — Same as above but with DM edit controls (HP +/-, inventory, conditions)
    </PartyOverview>
    <ActiveNPCs>
      <NPCQuickCard />                — Name, HP bar, disposition, expandable stat block
    </ActiveNPCs>
    <ConditionApplicator />           — Quick-apply conditions to any character/NPC
    <HPAdjuster />                    — +/- controls for any character/NPC
  </RightPanel_PartyAndNPCs>
  
  <BottomBar_Tools>
    <RollLogger />                    — Quick-entry: character → roll type → result → auto-calculate
    <InitiativeTracker />             — Sortable turn order, round counter, next/prev turn
    <SRDQuickReference />             — Searchable rules index, inline lookups
    <SessionTimer />                  — Real-world timer or in-game countdown
    <SessionLog />                    — Auto-recorded events, roll history, HP changes
    <DMCoachingTips />                — Contextual tips based on scene type and ruleset
  </BottomBar_Tools>
</DMSessionView>
```

### Live Session — Player View (`/session/:id/player`)

```
<PlayerSessionView>
  <MainArea_SceneAndAction>
    <SceneNarrative />                — Current scene text (what the DM has shared)
    <ActiveConditions />              — Conditions/effects on the character
    <ActionReference />               — What the character can do: attacks, spells, items with modifiers
  </MainArea_SceneAndAction>
  
  <SidePanel_CharacterSheet>
    <HPBar />                         — Current/max with temp HP
    <CoreStats />                     — AC, speed, initiative
    <AbilityScores />                 — Scores and modifiers
    <SkillProficiencies />            — Skills with modifiers
    <SpellSlots />                    — Remaining slots (casters)
    <ActiveConditions />              — With tap-to-lookup SRD descriptions
  </SidePanel_CharacterSheet>
  
  <BottomSection_InventoryAndAbilities>
    <TabView>
      <InventoryTab />                — Items with quick-use for consumables
      <SpellsTab />                   — Spell cards with descriptions and "Cast" action
      <FeaturesTab />                 — Class features and racial traits
    </TabView>
  </BottomSection_InventoryAndAbilities>
  
  <PartyView />                       — Toggle sidebar: party members, name, class, HP bar (general health, not exact numbers)
</PlayerSessionView>
```

### Session Lobby (`/session/:id/lobby`)

```
<SessionLobby>
  <SessionInfo />                     — Adventure title, type, ruleset, session number
  <ConnectedPlayers />                — List of joined players with character cards
  <KidsCharacters />                  — DM-managed characters joining this session
  <InviteCode />                      — Shareable code/link
  <StartingSceneSelector />           — DM picks which scene to start on
  <BeginAdventureButton />            — DM only — launches session for all
</SessionLobby>
```

### SRD Browser (`/srd/*`)

```
<SRDBrowser>
  <SRDSearchBar />                    — Global search across all SRD content
  <SRDNavigation />                   — Category tabs: Races, Classes, Spells, Monsters, Items, Rules, Conditions
  
  <RaceIndex />                       — Filterable list/grid of all SRD races
  <ClassIndex />                      — Filterable list/grid of all SRD classes
  <SpellIndex />                      — Filterable by level, school, class, concentration, ritual
  <MonsterIndex />                    — Filterable by CR, type, size, alignment
  <ItemIndex />                       — Filterable by category, rarity
  <RulesIndex />                      — Browsable by category, searchable
  <ConditionsIndex />                 — All 15 conditions with full mechanical effects
  
  <DetailView />                      — Full detail page for any SRD entity
</SRDBrowser>
```

---

## Feature Specifications

### Roll Logging (Not a Dice Roller)

The app does NOT replace physical dice. Rolling happens at the table. The app supports rolls in two ways:

**During Live Sessions:**
- DM can log roll results as they happen
- Quick-entry flow: select character → select roll type (attack, save, skill check) → enter result → app auto-applies modifiers and determines outcome
- Roll history/log per session (who rolled what, when, outcome)
- All logged rolls feed into the session log

**During Adventure Planning:**
- DM can simulate rolls against encounters while building scenes
- Test encounter balance: simulate rounds to check difficulty
- Plan DC thresholds for skill checks and note them in scene tips

### Initiative Tracker

- Manual entry (DM enters values from physical rolls)
- Sortable turn order list
- Visual indicator of whose turn it is
- "Next Turn" / "Previous Turn" controls (DM only)
- Round counter
- Delay/ready action support
- Auto-populated from scene encounter monsters + party characters

### Condition Tracker

- Apply standard SRD conditions to any character/NPC
- Visual indicator on character cards (icon + tooltip)
- Auto-remind when conditions might expire ("Concentration check needed")
- All 15 standard conditions: Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious, Exhaustion (levels 1-6)
- Tap any condition anywhere → SRD popup with full description and mechanical effects

### Combat Log

- Automatic logging of: attacks, damage, healing, conditions applied/removed, kills
- Timestamped entries
- Exportable as session notes

### Rest Mechanics

- Short Rest: prompt to roll hit dice for healing, reset short-rest abilities
- Long Rest: reset HP, spell slots, and long-rest abilities
- DM confirmation before rest completes
- Kids mode: simplified rest (full heal, reset everything)

### DM Coaching System

Contextual tips that surface based on scene type and ruleset:
- Combat tips: opportunity attacks, cover rules, grappling
- Social tips: passive Insight/Perception scores for the party, DC guidelines
- Exploration tips: travel pace, foraging, random encounters
- Kids mode: tips rewritten for kid-friendly sessions ("Let them try creative solutions", "Reward roleplay")
- Session pacing: nudges when combat drags, suggestions for rest/fun moments
- All tips link to relevant SRD rules for deeper reading

### Kids Mode

**Ruleset Toggles (each independently configurable per adventure):**

| Toggle | Default (Kids) | Effect When ON |
|--------|----------------|----------------|
| Simplified Rolls | ON | d20 binary: <10 fail, 10+ success. No modifiers |
| Weaker Enemies | ON | Monster HP at 50-70% of SRD value, lower AC, no legendary/lair actions |
| Forgiving Combat | ON | 0 HP = unconscious (easy revive), no death saves, no permanent death |
| Simplified Spellcasting | ON | Spells usable X times per rest, no slot tracking or components |
| Streamlined Inventory | ON | No weight/encumbrance, simplified equipment |

**Kids Character Presets:**

| Archetype | SRD Class | Description |
|-----------|-----------|-------------|
| The Hero | Fighter | Strong, brave, hits things hard |
| The Healer | Cleric | Protects friends, heals wounds, channels light |
| The Trickster | Rogue | Sneaky, clever, finds hidden things |
| The Wizard | Wizard | Casts spells, solves puzzles with magic |
| The Wild One | Barbarian | Tough, fierce, hard to knock down |
| The Ranger | Ranger | Good with animals, great with a bow, tracks enemies |

Each preset includes: archetype name (editable), pre-assigned simplified stats, starting gear, curated portrait, and plain-language ability descriptions. DM can customise any preset before a session.

### Campaign Persistence (Multi-Session)

- All character state persists between sessions: XP, HP, inventory, spell slots, conditions
- Adventure state persists: current scene, NPC statuses, session history
- "Resume Campaign" picks up exactly where the last session ended
- Session history log: list of past sessions with dates, summaries, participants
- End-of-session state snapshot stored for reliable resume
- Characters can be "released" from a campaign and used in other adventures

---

## SRD Integration Points

The SRD is the backbone of the app. Every screen that deals with game mechanics is powered by SRD data.

| Screen | SRD Usage |
|--------|-----------|
| Character Creation — Race | Race cards populated from SRD_Race: traits, ability bonuses, languages, speed |
| Character Creation — Class | Class cards from SRD_Class: hit die, proficiencies, features, spellcasting |
| Character Creation — Background | Backgrounds from SRD_Background: skill proficiencies, equipment, features |
| Character Creation — Spells | Spell picker from SRD_Spell: descriptions, level, school, components, range |
| Character Sheet | Equipment from SRD_Item, spell descriptions from SRD_Spell, features from SRD_Class |
| Adventure — NPC Builder | SRD_Monster as template base, adjustable by DM |
| Adventure — Encounter Builder | CR-based difficulty calculator using SRD_Monster CR + party level |
| Adventure — Loot | Standard treasure and magic items from SRD_Item |
| Live Session — DM Rules Panel | Full searchable index: SRD_Rule, SRD_Condition, combat actions |
| Live Session — Any Game Term | Tap-to-lookup: spells, conditions, actions, features → SRD popup |
| Live Session — Player Spells | Tap spell → full SRD description |
| Live Session — Player Conditions | Tap condition → mechanical effects from SRD_Condition |
| Kids Mode | SRD data is source of truth but auto-translated to simplified language |
| Standalone SRD Browser | Full browsable/searchable SRD reference, always accessible |

Custom/homebrew entries use separate tables with identical structure, flagged with `source: "custom"`. SRD data remains read-only and independently updatable.

---

## Real-Time Communication (WebSocket Events)

### DM → All Players
```
scene:change          { scene_id, narrative_read_aloud }
narrative:share       { text }
hp:update             { character_id, hp_current, hp_max, hp_temp }
condition:apply       { character_id, condition_name }
condition:remove      { character_id, condition_name }
initiative:update     { entries: [{character_id, npc_id, value, is_current}] }
turn:advance          { current_character_id, round }
loot:distribute       { character_id, items[], gold, xp }
session:pause         {}
session:end           { summary }
```

### DM → Specific Player
```
character:update      { character_id, changes: {} }
```

### Player → DM
```
roll:log              { character_id, roll_type, result }
item:use              { character_id, item_id }
spell:cast            { character_id, spell_id }
ready:action          { character_id, action_description }
```

### Server → All
```
session:started       { session_id }
player:joined         { user_id, character_id, display_name }
player:left           { user_id }
```

---

## Phased Build Plan

### Phase 1 — Foundation
- [ ] User auth: registration, login, logout, JWT token management
- [ ] Dashboard page: my characters, my adventures, joined adventures, quick actions
- [ ] SRD data: seed all reference tables (races, classes, spells, monsters, items, conditions, rules)
- [ ] SRD browser: standalone browsable/searchable reference at `/srd`
- [ ] Character creation wizard: 5-step flow with curated art library
- [ ] Character sheet: view and edit, all calculated fields, inventory, spells, features
- [ ] Database schema: all core entities (User, Character, SRD tables)

### Phase 2 — Adventure Building
- [ ] Adventure CRUD: create, edit, publish with Campaign/One-Shot type
- [ ] Ruleset selection: Standard / Kids with toggleable rules per adventure
- [ ] Scene builder: create/edit scenes with narrative, type, NPCs, branches, loot, DM tips
- [ ] Scene flow graph: node-based visual editor with drag, connect, colour-coding
- [ ] NPC roster: CRUD with SRD monster import as template
- [ ] Encounter builder: monster picker, quantity, difficulty calculator
- [ ] Kids preset manager: preset picker, customisation, DM-managed character creation
- [ ] Invite code generation and join flow
- [ ] Database schema: Adventure, Scene, SceneConnection, NPC, Encounter entities

### Phase 3 — Live Sessions
- [ ] WebSocket server: connection management, room-based messaging
- [ ] Session lobby: create session, invite code, waiting room, character selection
- [ ] DM view: 3-panel layout (navigator, active scene, party/NPCs) + bottom toolbar
- [ ] Player view: scene narrative, condensed character sheet, action reference, inventory tabs
- [ ] Real-time sync: scene changes, HP updates, condition changes push to all clients
- [ ] Roll logger: DM quick-entry with auto-calculated outcomes
- [ ] Session log: auto-record events, rolls, state changes
- [ ] DM-managed kids characters: DM can update HP, inventory, conditions in real-time

### Phase 4 — Combat & Tracking
- [ ] Initiative tracker: manual entry, sortable, turn advancement, round counter
- [ ] Combat state: HP management, condition application/removal with SRD lookups
- [ ] Encounter difficulty: real-time updates as monsters are defeated/added
- [ ] Combat log: timestamped attack, damage, healing, condition, kill entries
- [ ] Condition tracker: all 15 SRD conditions with icons, tooltips, expiry reminders

### Phase 5 — DM Coaching & Polish
- [ ] SRD quick-reference panel: integrated in DM view, searchable
- [ ] Tap-to-lookup: any game term anywhere in app → SRD popup
- [ ] Contextual DM tips: scene-type-aware, ruleset-aware coaching
- [ ] Session summaries: auto-generated from session log
- [ ] Rest mechanics: short/long rest with resets and DM confirmation
- [ ] Level-up flow: XP threshold detection, guided feature/spell selection
- [ ] Campaign persistence: end-state snapshots, resume from last session
- [ ] Kids mode coaching: adapted tips, pacing nudges

### Phase 6 — Future Enhancements
- [ ] Sound/ambiance: presets per scene, DM-triggered cues
- [ ] Adventure templates: pre-built starter adventures for new DMs
- [ ] Export/import: adventures as JSON
- [ ] Mobile-optimised player view
- [ ] AI-generated character portraits or avatar builder
- [ ] In-app chat for remote sessions
- [ ] Offline adventure editing with sync
- [ ] Custom rulesets: DM builds house rules from scratch

---

## Decisions Log

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | SRD Scope | Core pillar, deeply integrated | Powers character creation, encounter building, rules reference, and live session lookups. Homebrew supported alongside. |
| 2 | Kids Accounts | DM-managed, no kid accounts | Kids pick from preset archetypes. DM creates, customises, and updates their characters. |
| 3 | Dice Rolling | Roll logging only | Physical dice at the table. App logs results for tracking and planning. Not a digital dice roller. |
| 4 | Character Visuals | Curated art library first | Hand-picked illustrations. AI portraits or avatar builder deferred to Phase 6. |
| 5 | Player Chat | Not in MVP | Assumes same table or external voice chat. Revisit for remote play later. |
| 6 | Offline Support | Nice to have, not priority | Online-first. Offline adventure editing in Phase 6. |
| 7 | Multi-Campaign | Both Campaign and One-Shot | Adventures flagged by type. Campaigns get persistent state, session history, and resume. |
| 8 | Map/Grid | No maps | Theatre-of-mind only. Tabletop handles positioning. |
| 9 | Kids Ruleset | Tweakable preset | Kids mode defaults with individually toggleable rules per adventure. |
| 10 | Kids Presets | Archetypes backed by SRD classes | Thematic names ("The Hero" → Fighter) with simplified descriptions. SRD mechanics under the hood. |
