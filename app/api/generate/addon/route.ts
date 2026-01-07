import { NextRequest, NextResponse } from 'next/server';
import { AddonBuilder } from '@/lib/addon-generator/core/AddonBuilder';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    if (!name || !namespace) {
      return NextResponse.json({ error: 'Name and namespace are required' }, { status: 400 });
    }

    if (!/^[a-z][a-z0-9_]*$/.test(namespace)) {
      return NextResponse.json({ error: 'Invalid namespace format. Use lowercase letters, numbers, and underscores only.' }, { status: 400 });
    }

    const builder = new AddonBuilder({
      name,
      namespace,
      description,
      version,
      minEngineVersion,
    });

    if (enableScripting) {
      builder.enableScripting({ serverVersion: '1.17.0' });
    }

    for (const entity of entities) {
      builder.addEntity(entity);
    }

    for (const item of items) {
      builder.addItem(item);
    }

    for (const block of blocks) {
      builder.addBlock(block);
    }

    for (const recipe of recipes) {
      builder.addRecipe(recipe);
    }

    for (const lt of lootTables) {
      builder.addLootTable(lt.path, lt.content);
    }

    for (const sr of spawnRules) {
      builder.addSpawnRules(sr);
    }

    for (const anim of animations) {
      builder.addAnimation(anim);
    }

    if (scripts && enableScripting) {
      if (scripts.main) {
        builder.addScript('main', scripts.main);
      }
      if (scripts.modules) {
        for (const mod of scripts.modules) {
          builder.addScript(mod.name, mod.content);
        }
      }
    }

    const buildResult = await builder.build();
    const addonId = nanoid();

    const mcaddonBase64 = buildResult.mcaddon.toString('base64');
    const bpBase64 = buildResult.behaviorPack.toString('base64');
    const rpBase64 = buildResult.resourcePack.toString('base64');

    return NextResponse.json({
      success: true,
      addonId,
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
    console.error('Addon Generation Error:', error);
    return NextResponse.json({
      error: 'Failed to generate addon',
      details: (error as Error).message
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
