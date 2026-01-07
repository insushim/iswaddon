export interface ManifestJson {
  format_version: number;
  header: {
    name: string;
    description: string;
    uuid: string;
    version: [number, number, number];
    min_engine_version: [number, number, number];
  };
  modules: Array<{
    type: 'data' | 'resources' | 'script';
    uuid: string;
    version: [number, number, number];
    language?: 'javascript';
    entry?: string;
  }>;
  dependencies?: Array<{ uuid?: string; module_name?: string; version: [number, number, number] | string }>;
  metadata?: { authors?: string[]; generated_with?: Record<string, string[]> };
}

export interface AddonConfig {
  name: string;
  namespace: string;
  description?: string;
  version: string;
  minEngineVersion: string;
  authors?: string[];
  packIcon?: Buffer;
}

export interface EntityDefinition {
  identifier: string;
  isSpawnable?: boolean;
  isSummonable?: boolean;
  isExperimental?: boolean;
  health?: { value: number; max: number };
  movement?: { type: string; value: number };
  physics?: boolean;
  collisionBox?: { width: number; height: number };
  familyTypes?: string[];
  attack?: { damage: number; effect?: string; effectDuration?: number };
  navigation?: {
    type?: 'walk' | 'climb' | 'fly' | 'swim';
    canPathOverWater?: boolean;
    canSwim?: boolean;
    avoidWater?: boolean;
  };
  behaviors?: Array<{ type?: string; name?: string; priority: number; params?: Record<string, unknown> }>;
  componentGroups?: Record<string, Record<string, unknown>>;
  events?: Record<string, unknown>;
  additionalComponents?: Record<string, unknown>;
  materials?: Record<string, string>;
  textures?: Record<string, string>;
  geometry?: object;
  geometryReferences?: Record<string, string>;
  animations?: object[];
  animationReferences?: Record<string, string>;
  animationControllers?: object[];
  animationControllerReferences?: string[];
  renderController?: object;
  renderControllerReferences?: string[];
  spawnEgg?: { base_color?: string; overlay_color?: string };
  lootTable?: object;
  spawnRules?: object;
}

export interface ItemDefinition {
  identifier: string;
  displayName?: string;
  category?: string;
  group?: string;
  icon?: string;
  maxStackSize?: number;
  durability?: { max: number; damageChance?: { min: number; max: number } };
  damage?: number;
  food?: {
    nutrition: number;
    saturation: string;
    canAlwaysEat?: boolean;
    convertsTo?: string;
  };
  cooldown?: { category: string; duration: number };
  throwable?: { doSwingAnimation?: boolean; projectile?: string };
  wearable?: { slot: string; protection?: number };
  attachable?: { materials?: Record<string, string>; textures?: Record<string, string>; geometry?: Record<string, string> };
  additionalComponents?: Record<string, unknown>;
}

export interface BlockDefinition {
  identifier: string;
  category?: string;
  group?: string;
  geometry?: string;
  materialInstances?: Record<string, { texture: string; render_method?: string }>;
  destructibleByMining?: boolean | number;
  destructibleByExplosion?: boolean | number;
  friction?: number;
  lightEmission?: number;
  mapColor?: string;
  collisionBox?: boolean | { origin: [number, number, number]; size: [number, number, number] };
  selectionBox?: boolean | { origin: [number, number, number]; size: [number, number, number] };
  loot?: string;
  flammable?: { catchChance?: number; destroyChance?: number };
  states?: Record<string, (string | number | boolean)[]>;
  permutations?: Array<{ condition: string; components: Record<string, unknown> }>;
  sound?: string;
  additionalComponents?: Record<string, unknown>;
}

export interface RecipeDefinition {
  type: 'shaped' | 'shapeless' | 'furnace' | 'brewing';
  identifier: string;
  tags: string[];
  input?: Record<string, string> | string[];
  pattern?: string[];
  output: { item: string; count?: number; data?: number };
}

export interface LootTableDefinition {
  pools: Array<{
    rolls: number | { min: number; max: number };
    entries: Array<{
      type: 'item' | 'loot_table' | 'empty';
      name?: string;
      weight?: number;
      functions?: Array<{
        function: string;
        count?: { min: number; max: number };
        [key: string]: unknown;
      }>;
    }>;
  }>;
}

export interface SpawnRulesDefinition {
  identifier: string;
  population_control: string;
  conditions: Array<{
    type: string;
    [key: string]: unknown;
  }>;
}

export interface AddonBuildResult {
  behaviorPack: Buffer;
  resourcePack: Buffer;
  mcaddon: Buffer;
  metadata: {
    name: string;
    namespace: string;
    version: string;
    behaviorUUID: string;
    resourceUUID: string;
    entityCount: number;
    itemCount: number;
    blockCount: number;
  };
}
