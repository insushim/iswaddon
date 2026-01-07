import { generateJSON } from './gemini-client';

/**
 * 사용자의 간단한 컨셉을 전문적인 마인크래프트 에드온 명세로 확장합니다.
 * 수많은 고품질 에드온들의 패턴과 모범 사례를 기반으로 합니다.
 */

const ADDON_EXPERT_SYSTEM_PROMPT = `You are a master Minecraft Bedrock addon developer with 10+ years of experience.
You have analyzed thousands of high-quality addons from MCPEDL, CurseForge, and official Minecraft Marketplace.

YOUR EXPERTISE INCLUDES:
1. Entity Design Patterns:
   - Balanced stat scaling (HP = base × difficulty_multiplier, typically 20-500 for mobs, 100-1000 for bosses)
   - Movement speeds (0.15-0.3 for slow, 0.3-0.5 for normal, 0.5-0.8 for fast)
   - Attack damage scaling (2-6 for weak, 6-12 for normal, 12-25 for strong, 25+ for bosses)
   - AI behavior priority chains (float=0, attack=1-2, target=3, wander=5-7)
   - Component group state machines for phases

2. Boss Design Best Practices:
   - Multiple attack phases (typically 3 phases at 75%, 50%, 25% HP)
   - Minion summoning mechanics
   - Area denial attacks (projectiles, AoE)
   - Visual/audio feedback for attacks
   - Proper loot tables with rare drops

3. Item Design Standards:
   - Durability scaling (wood=59, stone=131, iron=250, diamond=1561, netherite=2031)
   - Damage tiers matching vanilla progression
   - Cooldown-based special abilities (typically 3-10 seconds)
   - Enchantability values

4. Animation & Visual Polish:
   - Idle, walk, attack, hurt, death animations minimum
   - Scale appropriate to role (0.5-1.0 small, 1.0-2.0 normal, 2.0-5.0 large, 5.0+ giant)
   - Proper collision boxes matching visual size

5. Balance Considerations:
   - Spawn weights (10-20 rare, 50-100 common, 100+ very common)
   - Biome-appropriate spawning
   - Day/night cycle awareness
   - Player progression matching

CRITICAL: Always respond with valid JSON only. No explanations.`;

interface ExpandedEntityConcept {
  identifier: string;
  displayName: string;
  description: string;
  entityType: 'passive' | 'neutral' | 'hostile' | 'boss' | 'npc';

  // 상세 스탯
  stats: {
    health: { base: number; max: number };
    damage: { base: number; type: 'melee' | 'ranged' | 'magic' };
    armor: number;
    knockbackResistance: number;
    movementSpeed: number;
    followRange: number;
    attackSpeed: number;
  };

  // 물리
  physics: {
    width: number;
    height: number;
    scale: number;
    hasGravity: boolean;
    canFly: boolean;
    canSwim: boolean;
  };

  // AI 행동
  behaviors: Array<{
    name: string;
    priority: number;
    description: string;
    params: Record<string, unknown>;
  }>;

  // 특수 능력
  abilities: Array<{
    name: string;
    trigger: 'passive' | 'on_hit' | 'on_hurt' | 'timed' | 'health_threshold';
    description: string;
    cooldown?: number;
    threshold?: number;
    effects: string[];
  }>;

  // 페이즈 (보스용)
  phases?: Array<{
    name: string;
    healthThreshold: number;
    description: string;
    modifiers: Record<string, unknown>;
  }>;

  // 드롭 아이템
  loot: Array<{
    item: string;
    chance: number;
    minCount: number;
    maxCount: number;
    conditions?: string[];
  }>;

  // 스폰 규칙
  spawn: {
    biomes: string[];
    time: 'day' | 'night' | 'always';
    minLight: number;
    maxLight: number;
    weight: number;
    minGroup: number;
    maxGroup: number;
  };

  // 사운드
  sounds: {
    ambient: string;
    hurt: string;
    death: string;
    attack?: string;
    special?: string;
  };

  // 비주얼
  visual: {
    textureStyle: string;
    geometryBase: 'humanoid' | 'quadruped' | 'flying' | 'spider' | 'custom';
    particleEffects: string[];
    glowEffect: boolean;
  };

  // 애니메이션
  animations: string[];

  // 가족 타입
  familyTypes: string[];
}

interface ExpandedItemConcept {
  identifier: string;
  displayName: string;
  description: string;
  itemType: 'weapon' | 'tool' | 'armor' | 'food' | 'throwable' | 'material' | 'special';

  stats: {
    damage?: number;
    durability?: number;
    attackSpeed?: number;
    maxStackSize: number;
    enchantability?: number;
  };

  abilities: Array<{
    name: string;
    trigger: 'on_use' | 'on_hit' | 'passive' | 'charged';
    description: string;
    cooldown?: number;
    effects: string[];
  }>;

  crafting: {
    type: 'shaped' | 'shapeless' | 'smithing' | 'none';
    ingredients: string[];
    pattern?: string[];
    result: { count: number };
  };

  visual: {
    textureStyle: string;
    glint: boolean;
    handEquipped: boolean;
  };

  category: string;
  creativeGroup: string;
}

interface ExpandedBlockConcept {
  identifier: string;
  displayName: string;
  description: string;
  blockType: 'building' | 'decorative' | 'functional' | 'natural' | 'redstone';

  properties: {
    hardness: number;
    blastResistance: number;
    friction: number;
    lightEmission: number;
    flammable: boolean;
    mapColor: string;
  };

  states?: Array<{
    name: string;
    values: (string | number | boolean)[];
    default: string | number | boolean;
  }>;

  interactions?: Array<{
    trigger: 'on_interact' | 'on_step' | 'on_fall' | 'redstone';
    description: string;
    effects: string[];
  }>;

  loot: {
    dropsSelf: boolean;
    silkTouch: boolean;
    fortuneAffected: boolean;
    customDrops?: Array<{ item: string; chance: number; count: { min: number; max: number } }>;
  };

  crafting?: {
    type: 'shaped' | 'shapeless';
    ingredients: string[];
    pattern?: string[];
    result: { count: number };
  };

  visual: {
    textureTop: string;
    textureSide: string;
    textureBottom: string;
    renderMethod: 'opaque' | 'blend' | 'alpha_test';
    geometryType: 'full_block' | 'slab' | 'stairs' | 'custom';
  };

  sound: string;
  category: string;
}

export interface ExpandedConcept {
  originalConcept: string;
  expandedDescription: string;
  conceptType: 'entity' | 'item' | 'block';
  qualityScore: number;
  entity?: ExpandedEntityConcept;
  item?: ExpandedItemConcept;
  block?: ExpandedBlockConcept;
  designNotes: string[];
  balanceConsiderations: string[];
}

export async function expandUserConcept(userConcept: string, language: string = 'ko'): Promise<ExpandedConcept> {
  console.log(`[ConceptExpander] Expanding concept: "${userConcept.substring(0, 100)}..."`);

  const expandPrompt = `Analyze this user's Minecraft addon concept and expand it into a professional, detailed specification.

USER'S CONCEPT: "${userConcept}"

First, determine the concept type (entity/item/block), then create a HIGHLY DETAILED specification.

IMPORTANT GUIDELINES:
1. If user mentions a creature/mob/boss → entity
2. If user mentions weapon/tool/food/item → item
3. If user mentions block/ore/decoration → block

For ENTITIES, ensure:
- Balanced stats based on entity type (passive/hostile/boss)
- Complete AI behavior chain with proper priorities
- Multiple abilities if it's a boss
- Appropriate loot drops
- Biome-appropriate spawning

For ITEMS, ensure:
- Stats comparable to vanilla tiers
- Interesting special abilities with balanced cooldowns
- Logical crafting recipes
- Proper categorization

For BLOCKS, ensure:
- Mining properties matching material type
- Appropriate light/friction values
- Logical crafting if applicable

Response language: ${language === 'ko' ? 'Korean for displayName/description/notes, English for identifiers' : 'English'}

Return this JSON structure:
{
  "originalConcept": "user's original input",
  "expandedDescription": "detailed professional description of the addon (2-3 sentences)",
  "conceptType": "entity" or "item" or "block",
  "qualityScore": 1-10,
  "entity": { /* if conceptType is entity, include full ExpandedEntityConcept */ },
  "item": { /* if conceptType is item, include full ExpandedItemConcept */ },
  "block": { /* if conceptType is block, include full ExpandedBlockConcept */ },
  "designNotes": ["note about design decisions"],
  "balanceConsiderations": ["balance note 1", "balance note 2"]
}

ENTITY STRUCTURE (if applicable):
{
  "identifier": "namespace:entity_name",
  "displayName": "Display Name",
  "description": "Detailed description",
  "entityType": "hostile/passive/neutral/boss/npc",
  "stats": {
    "health": {"base": 20, "max": 20},
    "damage": {"base": 5, "type": "melee"},
    "armor": 0,
    "knockbackResistance": 0,
    "movementSpeed": 0.3,
    "followRange": 16,
    "attackSpeed": 1.0
  },
  "physics": {
    "width": 0.6, "height": 1.8, "scale": 1.0,
    "hasGravity": true, "canFly": false, "canSwim": false
  },
  "behaviors": [
    {"name": "float", "priority": 0, "description": "Floats in water", "params": {}},
    {"name": "melee_attack", "priority": 2, "description": "Attacks target", "params": {"speed_multiplier": 1.2}}
  ],
  "abilities": [
    {"name": "Fire Breath", "trigger": "timed", "description": "Breathes fire", "cooldown": 5, "effects": ["fire damage", "burning"]}
  ],
  "phases": [
    {"name": "Phase 1", "healthThreshold": 100, "description": "Normal attacks", "modifiers": {}}
  ],
  "loot": [
    {"item": "minecraft:diamond", "chance": 0.1, "minCount": 1, "maxCount": 2}
  ],
  "spawn": {
    "biomes": ["plains"], "time": "night", "minLight": 0, "maxLight": 7,
    "weight": 50, "minGroup": 1, "maxGroup": 3
  },
  "sounds": {"ambient": "mob.zombie.say", "hurt": "mob.zombie.hurt", "death": "mob.zombie.death"},
  "visual": {
    "textureStyle": "Description of appearance",
    "geometryBase": "humanoid",
    "particleEffects": [],
    "glowEffect": false
  },
  "animations": ["idle", "walk", "attack", "death"],
  "familyTypes": ["mob", "monster"]
}`;

  try {
    const result = await generateJSON<ExpandedConcept>(expandPrompt, {
      model: 'MAIN',
      systemInstruction: ADDON_EXPERT_SYSTEM_PROMPT,
    });

    console.log(`[ConceptExpander] Expansion complete. Type: ${result.conceptType}, Quality: ${result.qualityScore}`);
    console.log(`[ConceptExpander] Design notes:`, result.designNotes);

    return result;
  } catch (error) {
    console.error(`[ConceptExpander] Error expanding concept:`, error);
    throw error;
  }
}

/**
 * 확장된 컨셉을 AddonBuilder가 이해하는 형식으로 변환
 */
export function convertExpandedToBuilderFormat(expanded: ExpandedConcept): {
  entities: Record<string, unknown>[];
  items: Record<string, unknown>[];
  blocks: Record<string, unknown>[];
} {
  const result = {
    entities: [] as Record<string, unknown>[],
    items: [] as Record<string, unknown>[],
    blocks: [] as Record<string, unknown>[],
  };

  if (expanded.entity) {
    const e = expanded.entity;
    result.entities.push({
      identifier: e.identifier,
      health: e.stats.health,
      movement: {
        value: e.stats.movementSpeed,
        type: e.physics.canFly ? 'fly' : 'basic',
      },
      attack: { damage: e.stats.damage.base },
      collisionBox: { width: e.physics.width, height: e.physics.height },
      familyTypes: e.familyTypes,
      behaviors: e.behaviors.map(b => ({
        type: b.name,
        priority: b.priority,
        params: b.params,
      })),
      navigation: {
        type: e.physics.canFly ? 'fly' : 'walk',
        canPathOverWater: e.physics.canSwim,
        canSwim: e.physics.canSwim,
        avoidWater: !e.physics.canSwim,
      },
      isSpawnable: true,
      isSummonable: true,
      isExperimental: false,
    });
  }

  if (expanded.item) {
    const i = expanded.item;
    result.items.push({
      identifier: i.identifier,
      displayName: i.displayName,
      maxStackSize: i.stats.maxStackSize,
      durability: i.stats.durability ? { max: i.stats.durability } : undefined,
      damage: i.stats.damage,
      category: i.category,
    });
  }

  if (expanded.block) {
    const b = expanded.block;
    result.blocks.push({
      identifier: b.identifier,
      destructibleByMining: b.properties.hardness,
      destructibleByExplosion: b.properties.blastResistance,
      friction: b.properties.friction,
      lightEmission: b.properties.lightEmission,
      mapColor: b.properties.mapColor,
      sound: b.sound,
      category: 'construction',
    });
  }

  return result;
}
