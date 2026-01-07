import { generateJSON } from './gemini-client';
import type { ConceptAnalysis, EntityConcept, ItemConcept, BlockConcept } from '@/types/ai';

const SYSTEM_PROMPT = `You are an expert Minecraft Bedrock Edition addon developer with deep knowledge of:
- Entity components, behaviors, and AI goals
- Item components and custom mechanics
- Block components, states, and permutations
- Animation systems (Bedrock animation format)
- Molang expressions
- Scripting API (@minecraft/server)

Your task is to analyze user concepts and generate detailed technical specifications.
Always provide accurate Minecraft Bedrock format_version 1.21.50 compatible configurations.
Respond in the language the user uses (Korean or English).`;

export async function analyzeUserConcept(
  concept: string,
  options: { conceptType?: string; language?: string; detailed?: boolean } = {}
): Promise<ConceptAnalysis> {
  const { conceptType = 'auto', language = 'ko', detailed = true } = options;

  const prompt = `
Analyze the following Minecraft addon concept and provide a detailed technical specification.

User Concept: "${concept}"

${conceptType !== 'auto' ? `Concept Type: ${conceptType}` : 'Automatically detect the concept type (entity, item, block, or full addon).'}
Response Language: ${language === 'ko' ? 'Korean' : 'English'}

Provide JSON with this exact structure:
{
  "conceptType": "entity" | "item" | "block" | "addon",
  "name": "identifier_name_lowercase_with_underscores",
  "displayName": "Display Name",
  "description": "Brief description",
  "category": "category",
  "difficulty": "simple" | "moderate" | "complex",
  "estimatedTime": 30,
  "components": [
    { "type": "type", "name": "name", "description": "desc", "params": {} }
  ],
  "behaviors": [
    { "type": "type", "priority": 0, "description": "desc" }
  ],
  "resources": {
    "textures": ["texture descriptions"],
    "geometry": "geometry type",
    "animations": ["animation names"],
    "sounds": ["sound names"]
  },
  "features": ["feature1", "feature2"],
  "suggestions": ["suggestion1"],
  "warnings": ["warning1"],
  "dependencies": ["dependency1"]
}
`;

  return generateJSON<ConceptAnalysis>(prompt, {
    model: 'MAIN',
    systemInstruction: SYSTEM_PROMPT,
  });
}

export async function analyzeEntityConcept(concept: string): Promise<EntityConcept> {
  const prompt = `
Analyze this Minecraft entity concept and create a complete entity specification:
"${concept}"

Provide complete JSON specification with this exact structure:
{
  "identifier": "namespace:entity_name",
  "displayName": "Display Name",
  "entityType": "hostile" | "passive" | "neutral" | "boss" | "npc",
  "properties": {
    "health": { "value": 20, "max": 20 },
    "movement": { "value": 0.25, "type": "basic" },
    "attack": { "damage": 3 },
    "scale": 1.0
  },
  "physics": {
    "hasGravity": true,
    "hasCollision": true,
    "collisionBox": { "width": 0.6, "height": 1.8 }
  },
  "familyTypes": ["mob"],
  "aiGoals": [
    { "name": "float", "priority": 0 },
    { "name": "melee_attack", "priority": 3, "params": {} }
  ],
  "specialAbilities": [
    { "name": "ability", "type": "attack", "description": "desc", "cooldown": 5 }
  ],
  "animations": [
    { "name": "idle", "loop": true },
    { "name": "walk", "loop": true },
    { "name": "attack", "loop": false }
  ],
  "textureDescription": "texture description",
  "geometryType": "humanoid" | "quadruped" | "custom",
  "loot": [
    { "item": "minecraft:item", "chance": 1.0, "count": { "min": 1, "max": 3 } }
  ],
  "spawnRules": {
    "biomes": ["plains"],
    "spawnTime": "night" | "day" | "always",
    "minGroupSize": 1,
    "maxGroupSize": 4,
    "weight": 100
  },
  "sounds": {
    "ambient": "mob.zombie.say",
    "hurt": "mob.zombie.hurt",
    "death": "mob.zombie.death"
  }
}
`;

  return generateJSON<EntityConcept>(prompt, {
    model: 'MAIN',
    systemInstruction: SYSTEM_PROMPT,
  });
}

export async function analyzeItemConcept(concept: string): Promise<ItemConcept> {
  const prompt = `
Analyze this Minecraft item concept:
"${concept}"

Provide complete JSON specification with this exact structure:
{
  "identifier": "namespace:item_name",
  "displayName": "Display Name",
  "itemType": "weapon" | "tool" | "armor" | "food" | "throwable" | "material",
  "properties": {
    "maxStackSize": 64,
    "maxDurability": 250,
    "damage": 7,
    "enchantable": true,
    "handEquipped": true
  },
  "components": [
    { "type": "minecraft:weapon", "params": {} }
  ],
  "specialAbilities": [
    { "name": "ability", "trigger": "on_use", "description": "desc" }
  ],
  "craftingRecipe": {
    "type": "shaped",
    "ingredients": ["minecraft:diamond"],
    "pattern": ["D", "D", "S"]
  },
  "textureDescription": "16x16 pixel art description",
  "category": "Equipment",
  "creativeGroup": "itemGroup.name"
}
`;

  return generateJSON<ItemConcept>(prompt, {
    model: 'MAIN',
    systemInstruction: SYSTEM_PROMPT,
  });
}

export async function analyzeBlockConcept(concept: string): Promise<BlockConcept> {
  const prompt = `
Analyze this Minecraft block concept:
"${concept}"

Provide complete JSON specification with this exact structure:
{
  "identifier": "namespace:block_name",
  "displayName": "Display Name",
  "blockType": "decorative" | "functional" | "building" | "crop",
  "properties": {
    "hardness": 3.0,
    "blastResistance": 6.0,
    "friction": 0.6,
    "lightLevel": 0,
    "mapColor": "#808080"
  },
  "states": [
    { "name": "facing", "values": ["north", "south", "east", "west"], "default": "north" }
  ],
  "components": [
    { "type": "minecraft:destructible_by_mining", "params": {} }
  ],
  "permutations": [
    { "condition": "query.block_state('facing') == 'north'", "components": {} }
  ],
  "loot": {
    "dropsSelf": true,
    "toolRequired": "pickaxe"
  },
  "textureDescription": { "top": "top tex", "side": "side tex", "bottom": "bottom tex" },
  "geometryType": "full_block" | "slab" | "custom",
  "sound": "stone",
  "category": "Construction"
}
`;

  return generateJSON<BlockConcept>(prompt, {
    model: 'MAIN',
    systemInstruction: SYSTEM_PROMPT,
  });
}
