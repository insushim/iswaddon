import { NextRequest, NextResponse } from 'next/server';
import { expandUserConcept, convertExpandedToBuilderFormat, ExpandedConcept } from '@/lib/ai/ConceptExpander';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const requestId = nanoid(8);
  console.log(`[API:ai-concept][${requestId}] ========== Request Start ==========`);

  try {
    const body = await request.json();
    const { concept, language = 'ko' } = body;

    console.log(`[API:ai-concept][${requestId}] Input:`, {
      concept: concept?.substring(0, 100) + (concept?.length > 100 ? '...' : ''),
      language,
    });

    if (!concept || concept.length < 5 || concept.length > 5000) {
      console.error(`[API:ai-concept][${requestId}] Invalid concept length: ${concept?.length}`);
      return NextResponse.json({
        error: 'Invalid concept length (5-5000 characters)',
        requestId,
      }, { status: 400 });
    }

    const generationId = nanoid();
    const startTime = Date.now();

    console.log(`[API:ai-concept][${requestId}] Starting ENHANCED concept expansion...`);
    console.log(`[API:ai-concept][${requestId}] User concept: "${concept}"`);

    try {
      // Step 1: AI가 사용자의 간단한 컨셉을 전문적인 명세로 확장
      console.log(`[API:ai-concept][${requestId}] Step 1: Expanding user concept with expert AI...`);
      const expandedConcept = await expandUserConcept(concept, language);

      console.log(`[API:ai-concept][${requestId}] Expanded concept type: ${expandedConcept.conceptType}`);
      console.log(`[API:ai-concept][${requestId}] Quality score: ${expandedConcept.qualityScore}/10`);
      console.log(`[API:ai-concept][${requestId}] Design notes:`, expandedConcept.designNotes);
      console.log(`[API:ai-concept][${requestId}] Balance considerations:`, expandedConcept.balanceConsiderations);

      // Step 2: 확장된 컨셉을 Builder 형식으로 변환
      console.log(`[API:ai-concept][${requestId}] Step 2: Converting to builder format...`);
      const builderData = convertExpandedToBuilderFormat(expandedConcept);
      console.log(`[API:ai-concept][${requestId}] Builder data:`, JSON.stringify(builderData).substring(0, 500));

      // Step 3: 응답 구성 - 기존 형식과 호환되도록
      const analysis = {
        conceptType: expandedConcept.conceptType,
        name: expandedConcept.entity?.identifier?.split(':')[1] ||
              expandedConcept.item?.identifier?.split(':')[1] ||
              expandedConcept.block?.identifier?.split(':')[1] || 'custom_addon',
        displayName: expandedConcept.entity?.displayName ||
                     expandedConcept.item?.displayName ||
                     expandedConcept.block?.displayName || concept,
        description: expandedConcept.expandedDescription,
        category: expandedConcept.conceptType,
        difficulty: expandedConcept.qualityScore >= 7 ? 'complex' : expandedConcept.qualityScore >= 4 ? 'moderate' : 'simple',
        estimatedTime: expandedConcept.qualityScore * 15,
        components: [],
        behaviors: expandedConcept.entity?.behaviors || [],
        resources: {
          textures: [expandedConcept.entity?.visual?.textureStyle || expandedConcept.item?.visual?.textureStyle || ''],
          geometry: expandedConcept.entity?.visual?.geometryBase || 'humanoid',
          animations: expandedConcept.entity?.animations || ['idle', 'walk', 'attack'],
          sounds: expandedConcept.entity?.sounds ? Object.values(expandedConcept.entity.sounds) : [],
        },
        features: expandedConcept.designNotes,
        suggestions: expandedConcept.balanceConsiderations,
        warnings: [],
        dependencies: [],
      };

      // detailedAnalysis는 Builder가 직접 사용할 수 있는 형식
      let detailedAnalysis: Record<string, unknown> | null = null;

      if (expandedConcept.entity) {
        const e = expandedConcept.entity;
        detailedAnalysis = {
          identifier: e.identifier,
          displayName: e.displayName,
          entityType: e.entityType,
          properties: {
            health: { value: e.stats.health.base, max: e.stats.health.max },
            movement: { value: e.stats.movementSpeed, type: e.physics.canFly ? 'fly' : 'basic' },
            attack: { damage: e.stats.damage.base },
            scale: e.physics.scale,
          },
          physics: {
            hasGravity: e.physics.hasGravity,
            hasCollision: true,
            collisionBox: { width: e.physics.width, height: e.physics.height },
          },
          familyTypes: e.familyTypes,
          aiGoals: e.behaviors.map(b => ({
            name: b.name,
            priority: b.priority,
            params: b.params,
          })),
          specialAbilities: e.abilities.map(a => ({
            name: a.name,
            type: a.trigger,
            description: a.description,
            cooldown: a.cooldown || 5,
          })),
          animations: e.animations.map(name => ({ name, loop: name !== 'attack' && name !== 'death' })),
          textureDescription: e.visual.textureStyle,
          geometryType: e.visual.geometryBase,
          loot: e.loot.map(l => ({
            item: l.item,
            chance: l.chance,
            count: { min: l.minCount, max: l.maxCount },
          })),
          spawnRules: {
            biomes: e.spawn.biomes,
            spawnTime: e.spawn.time,
            minGroupSize: e.spawn.minGroup,
            maxGroupSize: e.spawn.maxGroup,
            weight: e.spawn.weight,
          },
          sounds: e.sounds,
        };
      } else if (expandedConcept.item) {
        const i = expandedConcept.item;
        detailedAnalysis = {
          identifier: i.identifier,
          displayName: i.displayName,
          itemType: i.itemType,
          properties: {
            maxStackSize: i.stats.maxStackSize,
            maxDurability: i.stats.durability,
            damage: i.stats.damage,
            enchantable: true,
            handEquipped: i.visual.handEquipped,
          },
          components: [],
          specialAbilities: i.abilities.map(a => ({
            name: a.name,
            trigger: a.trigger,
            description: a.description,
          })),
          craftingRecipe: i.crafting.type !== 'none' ? {
            type: i.crafting.type,
            ingredients: i.crafting.ingredients,
            pattern: i.crafting.pattern,
          } : undefined,
          textureDescription: i.visual.textureStyle,
          category: i.category,
          creativeGroup: i.creativeGroup,
        };
      } else if (expandedConcept.block) {
        const b = expandedConcept.block;
        detailedAnalysis = {
          identifier: b.identifier,
          displayName: b.displayName,
          blockType: b.blockType,
          properties: {
            hardness: b.properties.hardness,
            blastResistance: b.properties.blastResistance,
            friction: b.properties.friction,
            lightLevel: b.properties.lightEmission,
            mapColor: b.properties.mapColor,
          },
          states: b.states,
          components: [],
          permutations: [],
          loot: b.loot,
          textureDescription: {
            top: b.visual.textureTop,
            side: b.visual.textureSide,
            bottom: b.visual.textureBottom,
          },
          geometryType: b.visual.geometryType,
          sound: b.sound,
          category: b.category,
        };
      }

      const generationTime = Date.now() - startTime;
      console.log(`[API:ai-concept][${requestId}] ========== Request Complete in ${generationTime}ms ==========`);

      return NextResponse.json({
        success: true,
        generationId,
        requestId,
        analysis,
        detailedAnalysis,
        expandedConcept, // 추가: 전체 확장된 컨셉도 포함
        metadata: {
          generationTimeMs: generationTime,
          model: 'gemini-3-flash-preview',
          qualityScore: expandedConcept.qualityScore,
          designNotes: expandedConcept.designNotes,
          balanceConsiderations: expandedConcept.balanceConsiderations,
        },
      });

    } catch (aiError) {
      const errorMessage = (aiError as Error).message;
      const errorStack = (aiError as Error).stack;

      console.error(`[API:ai-concept][${requestId}] AI Generation Error:`, {
        message: errorMessage,
        stack: errorStack,
        name: (aiError as Error).name,
      });

      return NextResponse.json({
        error: 'AI generation failed',
        details: errorMessage,
        requestId,
        errorType: (aiError as Error).name,
      }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = (error as Error).message;
    const errorStack = (error as Error).stack;

    console.error(`[API:ai-concept][${requestId}] Request Error:`, {
      message: errorMessage,
      stack: errorStack,
      name: (error as Error).name,
    });

    return NextResponse.json({
      error: 'Failed to process request',
      details: errorMessage,
      requestId,
      errorType: (error as Error).name,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Concept Analysis API - Enhanced Edition',
    description: 'Transforms simple user concepts into professional Minecraft addon specifications',
    model: 'gemini-3-flash-preview',
    features: [
      'Expert-level concept expansion',
      'Balanced stats based on vanilla progression',
      'Professional AI behavior chains',
      'Quality scoring system',
      'Design notes and balance considerations',
    ],
    endpoints: {
      POST: {
        description: 'Analyze and expand a Minecraft addon concept',
        body: {
          concept: 'string (required) - Your addon idea (e.g., "fire breathing dragon boss")',
          language: 'string (optional) - ko or en (default: ko)',
        },
      },
    },
  });
}
