import { NextRequest, NextResponse } from 'next/server';
import { AddonBuilder } from '@/lib/addon-generator/core/AddonBuilder';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const requestId = nanoid(8);
  console.log(`[API:addon][${requestId}] ========== Request Start ==========`);

  try {
    const body = await request.json();
    console.log(`[API:addon][${requestId}] Request body:`, JSON.stringify(body, null, 2).substring(0, 1000));

    const {
      name,
      namespace,
      description,
      version = '1.0.0',
      minEngineVersion = '1.21.50',
      entities = [],
      items = [],
      blocks = [],
      recipes = [],
      lootTables = [],
      spawnRules = [],
      animations = [],
      scripts = null,
      enableScripting = false,
    } = body;

    console.log(`[API:addon][${requestId}] Parsed input:`, {
      name,
      namespace,
      description: description?.substring(0, 50),
      version,
      minEngineVersion,
      entityCount: entities?.length,
      itemCount: items?.length,
      blockCount: blocks?.length,
      recipeCount: recipes?.length,
      enableScripting,
    });

    if (!name || !namespace) {
      console.error(`[API:addon][${requestId}] Validation error: Missing name or namespace`);
      return NextResponse.json({
        error: 'Name and namespace are required',
        requestId,
        received: { name: !!name, namespace: !!namespace },
      }, { status: 400 });
    }

    if (!/^[a-z][a-z0-9_]*$/.test(namespace)) {
      console.error(`[API:addon][${requestId}] Validation error: Invalid namespace format: ${namespace}`);
      return NextResponse.json({
        error: 'Invalid namespace format. Use lowercase letters, numbers, and underscores only. Must start with a letter.',
        requestId,
        receivedNamespace: namespace,
      }, { status: 400 });
    }

    console.log(`[API:addon][${requestId}] Creating AddonBuilder...`);
    const builder = new AddonBuilder({
      name,
      namespace,
      description,
      version,
      minEngineVersion,
    });

    if (enableScripting) {
      console.log(`[API:addon][${requestId}] Enabling scripting...`);
      builder.enableScripting({ serverVersion: '1.17.0' });
    }

    // Add entities
    if (entities && entities.length > 0) {
      console.log(`[API:addon][${requestId}] Adding ${entities.length} entities...`);
      for (let i = 0; i < entities.length; i++) {
        try {
          console.log(`[API:addon][${requestId}] Adding entity ${i + 1}: ${entities[i]?.identifier || 'unknown'}`);
          builder.addEntity(entities[i]);
        } catch (entityError) {
          console.error(`[API:addon][${requestId}] Error adding entity ${i + 1}:`, entityError);
          throw new Error(`Failed to add entity ${i + 1} (${entities[i]?.identifier || 'unknown'}): ${(entityError as Error).message}`);
        }
      }
    }

    // Add items
    if (items && items.length > 0) {
      console.log(`[API:addon][${requestId}] Adding ${items.length} items...`);
      for (let i = 0; i < items.length; i++) {
        try {
          console.log(`[API:addon][${requestId}] Adding item ${i + 1}: ${items[i]?.identifier || 'unknown'}`);
          builder.addItem(items[i]);
        } catch (itemError) {
          console.error(`[API:addon][${requestId}] Error adding item ${i + 1}:`, itemError);
          throw new Error(`Failed to add item ${i + 1} (${items[i]?.identifier || 'unknown'}): ${(itemError as Error).message}`);
        }
      }
    }

    // Add blocks
    if (blocks && blocks.length > 0) {
      console.log(`[API:addon][${requestId}] Adding ${blocks.length} blocks...`);
      for (let i = 0; i < blocks.length; i++) {
        try {
          console.log(`[API:addon][${requestId}] Adding block ${i + 1}: ${blocks[i]?.identifier || 'unknown'}`);
          builder.addBlock(blocks[i]);
        } catch (blockError) {
          console.error(`[API:addon][${requestId}] Error adding block ${i + 1}:`, blockError);
          throw new Error(`Failed to add block ${i + 1} (${blocks[i]?.identifier || 'unknown'}): ${(blockError as Error).message}`);
        }
      }
    }

    // Add recipes
    if (recipes && recipes.length > 0) {
      console.log(`[API:addon][${requestId}] Adding ${recipes.length} recipes...`);
      for (const recipe of recipes) {
        builder.addRecipe(recipe);
      }
    }

    // Add loot tables
    if (lootTables && lootTables.length > 0) {
      console.log(`[API:addon][${requestId}] Adding ${lootTables.length} loot tables...`);
      for (const lt of lootTables) {
        builder.addLootTable(lt.path, lt.content);
      }
    }

    // Add spawn rules
    if (spawnRules && spawnRules.length > 0) {
      console.log(`[API:addon][${requestId}] Adding ${spawnRules.length} spawn rules...`);
      for (const sr of spawnRules) {
        builder.addSpawnRules(sr);
      }
    }

    // Add animations
    if (animations && animations.length > 0) {
      console.log(`[API:addon][${requestId}] Adding ${animations.length} animations...`);
      for (const anim of animations) {
        builder.addAnimation(anim);
      }
    }

    // Add scripts
    if (scripts && enableScripting) {
      console.log(`[API:addon][${requestId}] Adding scripts...`);
      if (scripts.main) {
        builder.addScript('main', scripts.main);
      }
      if (scripts.modules) {
        for (const mod of scripts.modules) {
          builder.addScript(mod.name, mod.content);
        }
      }
    }

    console.log(`[API:addon][${requestId}] Building addon...`);
    const buildResult = await builder.build();
    console.log(`[API:addon][${requestId}] Build complete:`, buildResult.metadata);

    const addonId = nanoid();

    console.log(`[API:addon][${requestId}] Converting to base64...`);
    const mcaddonBase64 = buildResult.mcaddon.toString('base64');
    const bpBase64 = buildResult.behaviorPack.toString('base64');
    const rpBase64 = buildResult.resourcePack.toString('base64');

    console.log(`[API:addon][${requestId}] ========== Request Complete ==========`);
    console.log(`[API:addon][${requestId}] File sizes: mcaddon=${mcaddonBase64.length}, bp=${bpBase64.length}, rp=${rpBase64.length}`);

    return NextResponse.json({
      success: true,
      addonId,
      requestId,
      downloads: {
        mcaddon: {
          filename: `${name}.mcaddon`,
          data: mcaddonBase64,
          mimeType: 'application/octet-stream',
        },
        behaviorPack: {
          filename: `${name}_BP.mcpack`,
          data: bpBase64,
          mimeType: 'application/octet-stream',
        },
        resourcePack: {
          filename: `${name}_RP.mcpack`,
          data: rpBase64,
          mimeType: 'application/octet-stream',
        },
      },
      metadata: buildResult.metadata,
    });

  } catch (error) {
    const errorMessage = (error as Error).message;
    const errorStack = (error as Error).stack;

    console.error(`[API:addon][${requestId}] ========== Error ==========`);
    console.error(`[API:addon][${requestId}] Error message:`, errorMessage);
    console.error(`[API:addon][${requestId}] Error stack:`, errorStack);
    console.error(`[API:addon][${requestId}] Error name:`, (error as Error).name);

    return NextResponse.json({
      error: 'Failed to generate addon',
      details: errorMessage,
      requestId,
      errorType: (error as Error).name,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Addon Generation API',
    endpoints: {
      POST: {
        description: 'Generate a Minecraft Bedrock addon',
        body: {
          name: 'string (required) - Addon name',
          namespace: 'string (required) - Addon namespace (lowercase)',
          description: 'string (optional) - Addon description',
          version: 'string (optional) - Addon version (default: 1.0.0)',
          minEngineVersion: 'string (optional) - Min engine version (default: 1.21.50)',
          entities: 'array (optional) - Entity definitions',
          items: 'array (optional) - Item definitions',
          blocks: 'array (optional) - Block definitions',
          recipes: 'array (optional) - Recipe definitions',
          enableScripting: 'boolean (optional) - Enable scripting API',
          scripts: 'object (optional) - Script content',
        },
      },
    },
  });
}
