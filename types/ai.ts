export interface ConceptAnalysis {
  conceptType: 'entity' | 'item' | 'block' | 'addon';
  name: string;
  displayName: string;
  description: string;
  category: string;
  difficulty: 'simple' | 'moderate' | 'complex';
  estimatedTime: number;
  components: Array<{ type: string; name: string; description: string; params: Record<string, unknown> }>;
  behaviors: Array<{ type: string; priority: number; description: string }>;
  resources: {
    textures: string[];
    geometry: string;
    animations: string[];
    sounds: string[];
  };
  features: string[];
  suggestions: string[];
  warnings: string[];
  dependencies: string[];
}

export interface EntityConcept {
  identifier: string;
  displayName: string;
  entityType: 'hostile' | 'passive' | 'neutral' | 'boss' | 'npc';
  properties: {
    health: { value: number; max: number };
    movement: { value: number; type: string };
    attack?: { damage: number };
    scale: number;
  };
  physics: {
    hasGravity: boolean;
    hasCollision: boolean;
    collisionBox: { width: number; height: number };
  };
  familyTypes: string[];
  aiGoals: Array<{ name: string; priority: number; params?: Record<string, unknown> }>;
  specialAbilities: Array<{ name: string; type: string; description: string; cooldown?: number }>;
  animations: Array<{ name: string; loop: boolean }>;
  textureDescription: string;
  geometryType: string;
  loot: Array<{ item: string; chance: number; count: { min: number; max: number } }>;
  spawnRules: {
    biomes: string[];
    spawnTime: string;
    minGroupSize: number;
    maxGroupSize: number;
    weight: number;
  };
  sounds: { ambient: string; hurt: string; death: string };
}

export interface ItemConcept {
  identifier: string;
  displayName: string;
  itemType: 'weapon' | 'tool' | 'armor' | 'food' | 'throwable' | 'material';
  properties: {
    maxStackSize: number;
    maxDurability?: number;
    damage?: number;
    enchantable?: boolean;
    handEquipped?: boolean;
  };
  components: Array<{ type: string; params: Record<string, unknown> }>;
  specialAbilities: Array<{ name: string; trigger: string; description: string }>;
  craftingRecipe?: {
    type: string;
    ingredients: string[];
    pattern?: string[];
  };
  textureDescription: string;
  category: string;
  creativeGroup: string;
}

export interface BlockConcept {
  identifier: string;
  displayName: string;
  blockType: 'decorative' | 'functional' | 'building' | 'crop';
  properties: {
    hardness: number;
    blastResistance: number;
    friction: number;
    lightLevel: number;
    mapColor: string;
  };
  states: Array<{ name: string; values: string[]; default: string }>;
  components: Array<{ type: string; params: Record<string, unknown> }>;
  permutations: Array<{ condition: string; components: Record<string, unknown> }>;
  loot: { dropsSelf: boolean; toolRequired?: string };
  textureDescription: { top?: string; side?: string; bottom?: string; all?: string };
  geometryType: string;
  sound: string;
  category: string;
}

export interface GenerationPlan {
  steps: Array<{
    order: number;
    type: string;
    target: string;
    complexity: string;
    dependencies: string[];
  }>;
  estimatedTime: number;
  dependencies: string[];
}

export interface AIGenerationRequest {
  concept: string;
  conceptType?: 'entity' | 'item' | 'block' | 'addon' | 'auto';
  detailed?: boolean;
  language?: 'ko' | 'en';
}

export interface AIGenerationResponse {
  success: boolean;
  generationId: string;
  analysis: ConceptAnalysis;
  detailedAnalysis?: EntityConcept | ItemConcept | BlockConcept;
  metadata: {
    generationTimeMs: number;
    model: string;
  };
}
