import { generateJSON } from './gemini-client';
import type { ConceptAnalysis, EntityConcept, ItemConcept, BlockConcept } from '@/types/ai';

const SYSTEM_PROMPT = `You are an expert Minecraft Bedrock Edition addon developer.

CRITICAL RULES:
1. ALWAYS respond with ONLY valid JSON - no explanations, no markdown
2. The JSON must EXACTLY match the user's concept/request
3. Use the EXACT concept from the user input - do NOT substitute with unrelated content
4. All text fields should be in Korean if the input is Korean, English if English
5. Minecraft Bedrock format_version: 1.21.50

Your expertise:
- Entity components, behaviors, and AI goals
- Item components and custom mechanics
- Block components, states, and permutations
- Animation systems (Bedrock animation format)
- Molang expressions
- Scripting API (@minecraft/server)`;

export async function analyzeUserConcept(
  concept: string,
  options: { conceptType?: string; language?: string; detailed?: boolean } = {}
): Promise<ConceptAnalysis> {
  const { conceptType = 'auto', language = 'ko' } = options;

  console.log(`[ConceptAnalyzer] analyzeUserConcept called with concept: "${concept.substring(0, 100)}..."`);

  const prompt = `Analyze this Minecraft addon concept and create a specification.

USER'S CONCEPT (MUST match exactly): "${concept}"

${conceptType !== 'auto' ? `Forced concept type: ${conceptType}` : 'Detect the type: entity (mob/creature), item (weapon/tool/food), or block'}

Return this JSON structure (respond in ${language === 'ko' ? 'Korean' : 'English'}):
{
  "conceptType": "entity" or "item" or "block",
  "name": "lowercase_identifier_based_on_concept",
  "displayName": "Display Name based on concept",
  "description": "Description of what user requested",
  "category": "mob/weapon/building etc",
  "difficulty": "simple" or "moderate" or "complex",
  "estimatedTime": 30,
  "components": [{"type": "component_type", "name": "name", "description": "what it does", "params": {}}],
  "behaviors": [{"type": "behavior_type", "priority": 1, "description": "what it does"}],
  "resources": {
    "textures": ["texture descriptions"],
    "geometry": "humanoid/quadruped/custom",
    "animations": ["idle", "walk", "attack"],
    "sounds": ["ambient", "hurt", "death"]
  },
  "features": ["main features of this addon"],
  "suggestions": ["optional improvements"],
  "warnings": ["potential issues"],
  "dependencies": []
}`;

  try {
    const result = await generateJSON<ConceptAnalysis>(prompt, {
      model: 'MAIN',
      systemInstruction: SYSTEM_PROMPT,
    });
    console.log(`[ConceptAnalyzer] analyzeUserConcept result:`, JSON.stringify(result).substring(0, 300));
    return result;
  } catch (error) {
    console.error(`[ConceptAnalyzer] analyzeUserConcept error:`, error);
    throw error;
  }
}

export async function analyzeEntityConcept(concept: string): Promise<EntityConcept> {
  console.log(`[ConceptAnalyzer] analyzeEntityConcept called with: "${concept.substring(0, 100)}..."`);

  const prompt = `Create a Minecraft Bedrock entity specification for this concept:
"${concept}"

IMPORTANT: The entity MUST match the user's description exactly.

Return this JSON:
{
  "identifier": "custom:entity_name_from_concept",
  "displayName": "Name from user concept",
  "entityType": "hostile" or "passive" or "neutral" or "boss" or "npc",
  "properties": {
    "health": {"value": 20, "max": 20},
    "movement": {"value": 0.25, "type": "basic"},
    "attack": {"damage": 5},
    "scale": 1.0
  },
  "physics": {
    "hasGravity": true,
    "hasCollision": true,
    "collisionBox": {"width": 0.6, "height": 1.8}
  },
  "familyTypes": ["mob", "monster"],
  "aiGoals": [
    {"name": "float", "priority": 0},
    {"name": "melee_attack", "priority": 2, "params": {"speed_multiplier": 1.2}},
    {"name": "random_stroll", "priority": 5}
  ],
  "specialAbilities": [
    {"name": "ability_name", "type": "attack/defense/utility", "description": "what it does", "cooldown": 5}
  ],
  "animations": [
    {"name": "idle", "loop": true},
    {"name": "walk", "loop": true},
    {"name": "attack", "loop": false}
  ],
  "textureDescription": "Description of entity appearance",
  "geometryType": "humanoid" or "quadruped" or "custom",
  "loot": [
    {"item": "minecraft:bone", "chance": 1.0, "count": {"min": 0, "max": 2}}
  ],
  "spawnRules": {
    "biomes": ["plains", "forest"],
    "spawnTime": "night" or "day" or "always",
    "minGroupSize": 1,
    "maxGroupSize": 3,
    "weight": 100
  },
  "sounds": {
    "ambient": "mob.zombie.say",
    "hurt": "mob.zombie.hurt",
    "death": "mob.zombie.death"
  }
}`;

  try {
    const result = await generateJSON<EntityConcept>(prompt, {
      model: 'MAIN',
      systemInstruction: SYSTEM_PROMPT,
    });
    console.log(`[ConceptAnalyzer] analyzeEntityConcept result:`, JSON.stringify(result).substring(0, 300));
    return result;
  } catch (error) {
    console.error(`[ConceptAnalyzer] analyzeEntityConcept error:`, error);
    throw error;
  }
}

export async function analyzeItemConcept(concept: string): Promise<ItemConcept> {
  console.log(`[ConceptAnalyzer] analyzeItemConcept called with: "${concept.substring(0, 100)}..."`);

  const prompt = `Create a Minecraft Bedrock item specification for this concept:
"${concept}"

IMPORTANT: The item MUST match the user's description exactly.

Return this JSON:
{
  "identifier": "custom:item_name_from_concept",
  "displayName": "Name from user concept",
  "itemType": "weapon" or "tool" or "armor" or "food" or "throwable" or "material",
  "properties": {
    "maxStackSize": 1,
    "maxDurability": 250,
    "damage": 7,
    "enchantable": true,
    "handEquipped": true
  },
  "components": [
    {"type": "minecraft:weapon", "params": {"on_hurt_entity": {"event": "custom_attack"}}}
  ],
  "specialAbilities": [
    {"name": "ability_name", "trigger": "on_use/on_hit/passive", "description": "what it does"}
  ],
  "craftingRecipe": {
    "type": "shaped",
    "ingredients": ["minecraft:diamond", "minecraft:stick"],
    "pattern": ["D", "D", "S"]
  },
  "textureDescription": "Description of item appearance (16x16 pixel art)",
  "category": "Equipment",
  "creativeGroup": "itemGroup.name.sword"
}`;

  try {
    const result = await generateJSON<ItemConcept>(prompt, {
      model: 'MAIN',
      systemInstruction: SYSTEM_PROMPT,
    });
    console.log(`[ConceptAnalyzer] analyzeItemConcept result:`, JSON.stringify(result).substring(0, 300));
    return result;
  } catch (error) {
    console.error(`[ConceptAnalyzer] analyzeItemConcept error:`, error);
    throw error;
  }
}

export async function analyzeBlockConcept(concept: string): Promise<BlockConcept> {
  console.log(`[ConceptAnalyzer] analyzeBlockConcept called with: "${concept.substring(0, 100)}..."`);

  const prompt = `Create a Minecraft Bedrock block specification for this concept:
"${concept}"

IMPORTANT: The block MUST match the user's description exactly.

Return this JSON:
{
  "identifier": "custom:block_name_from_concept",
  "displayName": "Name from user concept",
  "blockType": "decorative" or "functional" or "building" or "crop",
  "properties": {
    "hardness": 3.0,
    "blastResistance": 6.0,
    "friction": 0.6,
    "lightLevel": 0,
    "mapColor": "#808080"
  },
  "states": [
    {"name": "facing", "values": ["north", "south", "east", "west"], "default": "north"}
  ],
  "components": [
    {"type": "minecraft:destructible_by_mining", "params": {"seconds_to_destroy": 1.5}}
  ],
  "permutations": [
    {"condition": "query.block_state('facing') == 'north'", "components": {}}
  ],
  "loot": {
    "dropsSelf": true,
    "toolRequired": "pickaxe"
  },
  "textureDescription": {"top": "top texture", "side": "side texture", "bottom": "bottom texture"},
  "geometryType": "full_block" or "slab" or "custom",
  "sound": "stone",
  "category": "Construction"
}`;

  try {
    const result = await generateJSON<BlockConcept>(prompt, {
      model: 'MAIN',
      systemInstruction: SYSTEM_PROMPT,
    });
    console.log(`[ConceptAnalyzer] analyzeBlockConcept result:`, JSON.stringify(result).substring(0, 300));
    return result;
  } catch (error) {
    console.error(`[ConceptAnalyzer] analyzeBlockConcept error:`, error);
    throw error;
  }
}
