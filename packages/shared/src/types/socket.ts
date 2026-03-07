// DM → All Players
export type SceneChangeEvent = {
  sceneId: string;
  narrativeReadAloud: string | null;
};

export type HpUpdateEvent = {
  characterId: string;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
};

export type ConditionApplyEvent = {
  characterId: string;
  conditionName: string;
};

export type ConditionRemoveEvent = {
  characterId: string;
  conditionName: string;
};

export type InitiativeEntry = {
  characterId: string | null;
  npcId: string | null;
  value: number;
  isCurrent: boolean;
};

export type InitiativeUpdateEvent = {
  entries: InitiativeEntry[];
};

export type TurnAdvanceEvent = {
  currentCharacterId: string | null;
  round: number;
};

export type LootItem = {
  itemId: string | null;
  customName: string | null;
  quantity: number;
};

export type LootDistributeEvent = {
  characterId: string;
  items: LootItem[];
  gold: number;
  xp: number;
};

export type SessionEndEvent = {
  summary: string | null;
};

// DM → Specific Player
export type CharacterUpdateEvent = {
  characterId: string;
  changes: Record<string, unknown>;
};

// Player → DM
export type RollLogEvent = {
  characterId: string;
  rollType: string;
  result: number;
};

export type ItemUseEvent = {
  characterId: string;
  itemId: string;
};

export type SpellCastEvent = {
  characterId: string;
  spellId: string;
};

export type ReadyActionEvent = {
  characterId: string;
  actionDescription: string;
};

// Server → All
export type SessionStartedEvent = {
  sessionId: string;
};

export type PlayerJoinedEvent = {
  userId: string;
  characterId: string;
  displayName: string;
};

export type PlayerLeftEvent = {
  userId: string;
};

// Event map for typed Socket.io usage
export type ServerToClientEvents = {
  'scene:change': (data: SceneChangeEvent) => void;
  'narrative:share': (data: { text: string }) => void;
  'hp:update': (data: HpUpdateEvent) => void;
  'condition:apply': (data: ConditionApplyEvent) => void;
  'condition:remove': (data: ConditionRemoveEvent) => void;
  'initiative:update': (data: InitiativeUpdateEvent) => void;
  'turn:advance': (data: TurnAdvanceEvent) => void;
  'loot:distribute': (data: LootDistributeEvent) => void;
  'session:pause': () => void;
  'session:end': (data: SessionEndEvent) => void;
  'session:started': (data: SessionStartedEvent) => void;
  'player:joined': (data: PlayerJoinedEvent) => void;
  'player:left': (data: PlayerLeftEvent) => void;
  'character:update': (data: CharacterUpdateEvent) => void;
};

export type ClientToServerEvents = {
  'roll:log': (data: RollLogEvent) => void;
  'item:use': (data: ItemUseEvent) => void;
  'spell:cast': (data: SpellCastEvent) => void;
  'ready:action': (data: ReadyActionEvent) => void;
  'session:join': (data: { sessionId: string; characterId: string }) => void;
  'session:leave': (data: { sessionId: string }) => void;
};
