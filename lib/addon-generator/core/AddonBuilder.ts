import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import type { AddonConfig, EntityDefinition, ItemDefinition, BlockDefinition, ManifestJson, AddonBuildResult } from '@/types/addon';

export class AddonBuilder {
  private config: AddonConfig;
  private behaviorPack: {
    manifest: ManifestJson;
    entities: object[];
    items: object[];
    blocks: object[];
    recipes: object[];
    lootTables: { path: string; content: object }[];
    spawnRules: object[];
    functions: string[];
    scripts: { main: string; modules: { name: string; content: string }[] } | null;
  };
  private resourcePack: {
    manifest: ManifestJson;
    entities: object[];
    textures: {
      terrain: { resource_pack_name: string; texture_name: string; texture_data: Record<string, { textures: string }> };
      items: { resource_pack_name: string; texture_name: string; texture_data: Record<string, { textures: string }> };
    };
    textureFiles: { type: string; path: string; buffer: Buffer | string }[];
    geometries: object[];
    animations: object[];
    animationControllers: object[];
    renderControllers: object[];
    sounds: object | null;
    blocksJson: Record<string, { sound: string }>;
  };
  private behaviorUUID: string;
  private resourceUUID: string;
  private behaviorModuleUUID: string;
  private resourceModuleUUID: string;

  constructor(config: AddonConfig) {
    this.config = {
      ...config,
      version: config.version || '1.0.0',
      minEngineVersion: config.minEngineVersion || '1.21.50',
    };

    this.behaviorUUID = uuidv4();
    this.resourceUUID = uuidv4();
    this.behaviorModuleUUID = uuidv4();
    this.resourceModuleUUID = uuidv4();

    this.behaviorPack = this.initBehaviorPack();
    this.resourcePack = this.initResourcePack();
  }

  private initBehaviorPack() {
    return {
      manifest: this.createBehaviorManifest(),
      entities: [] as object[],
      items: [] as object[],
      blocks: [] as object[],
      recipes: [] as object[],
      lootTables: [] as { path: string; content: object }[],
      spawnRules: [] as object[],
      functions: [] as string[],
      scripts: null as { main: string; modules: { name: string; content: string }[] } | null,
    };
  }

  private initResourcePack() {
    return {
      manifest: this.createResourceManifest(),
      entities: [] as object[],
      textures: {
        terrain: { resource_pack_name: 'vanilla', texture_name: 'atlas.terrain', texture_data: {} as Record<string, { textures: string }> },
        items: { resource_pack_name: 'vanilla', texture_name: 'atlas.items', texture_data: {} as Record<string, { textures: string }> },
      },
      textureFiles: [] as { type: string; path: string; buffer: Buffer | string }[],
      geometries: [] as object[],
      animations: [] as object[],
      animationControllers: [] as object[],
      renderControllers: [] as object[],
      sounds: null as object | null,
      blocksJson: {} as Record<string, { sound: string }>,
    };
  }

  private createBehaviorManifest(): ManifestJson {
    return {
      format_version: 2,
      header: {
        name: this.config.name,
        description: this.config.description || `${this.config.name} Behavior Pack`,
        uuid: this.behaviorUUID,
        version: this.parseVersion(this.config.version),
        min_engine_version: this.parseVersion(this.config.minEngineVersion),
      },
      modules: [{ type: 'data', uuid: this.behaviorModuleUUID, version: this.parseVersion(this.config.version) }],
      dependencies: [{ uuid: this.resourceUUID, version: this.parseVersion(this.config.version) }],
      metadata: {
        authors: this.config.authors || ['Addon Generator'],
        generated_with: { 'minecraft-addon-generator': ['1.0.0'] },
      },
    };
  }

  private createResourceManifest(): ManifestJson {
    return {
      format_version: 2,
      header: {
        name: `${this.config.name} Resources`,
        description: this.config.description || `${this.config.name} Resource Pack`,
        uuid: this.resourceUUID,
        version: this.parseVersion(this.config.version),
        min_engine_version: this.parseVersion(this.config.minEngineVersion),
      },
      modules: [{ type: 'resources', uuid: this.resourceModuleUUID, version: this.parseVersion(this.config.version) }],
      metadata: {
        authors: this.config.authors || ['Addon Generator'],
        generated_with: { 'minecraft-addon-generator': ['1.0.0'] },
      },
    };
  }

  private parseVersion(version: string): [number, number, number] {
    const parts = version.split('.').map(Number);
    return [parts[0] || 1, parts[1] || 0, parts[2] || 0];
  }

  enableScripting(options: { serverVersion?: string } = {}): this {
    const { serverVersion = '1.17.0' } = options;
    const scriptUUID = uuidv4();

    this.behaviorPack.manifest.modules.push({
      type: 'script',
      language: 'javascript',
      uuid: scriptUUID,
      version: this.parseVersion(this.config.version),
      entry: 'scripts/main.js',
    });

    if (!this.behaviorPack.manifest.dependencies) {
      this.behaviorPack.manifest.dependencies = [];
    }
    this.behaviorPack.manifest.dependencies.push({
      module_name: '@minecraft/server',
      version: serverVersion,
    });

    this.behaviorPack.scripts = { main: '', modules: [] };
    return this;
  }

  addEntity(entity: EntityDefinition): this {
    const namespace = this.config.namespace;
    const fullIdentifier = entity.identifier.includes(':') ? entity.identifier : `${namespace}:${entity.identifier}`;
    const baseName = fullIdentifier.split(':')[1];

    const behaviorEntity = this.buildBehaviorEntity(entity, fullIdentifier);
    this.behaviorPack.entities.push(behaviorEntity);

    const resourceEntity = this.buildResourceEntity(entity, fullIdentifier, baseName);
    this.resourcePack.entities.push(resourceEntity);

    if (entity.geometry) this.resourcePack.geometries.push(entity.geometry);
    if (entity.animations) this.resourcePack.animations.push(...entity.animations);
    if (entity.animationControllers) this.resourcePack.animationControllers.push(...entity.animationControllers);
    if (entity.renderController) this.resourcePack.renderControllers.push(entity.renderController);
    if (entity.spawnRules) this.behaviorPack.spawnRules.push(entity.spawnRules);
    if (entity.lootTable) this.behaviorPack.lootTables.push({ path: `loot_tables/entities/${baseName}.json`, content: entity.lootTable });

    return this;
  }

  private buildBehaviorEntity(entity: EntityDefinition, fullIdentifier: string): object {
    const components: Record<string, unknown> = {};

    if (entity.health) {
      components['minecraft:health'] = { value: entity.health.value, max: entity.health.max };
    }

    if (entity.movement) {
      components['minecraft:movement'] = { value: entity.movement.value };
      components[`minecraft:movement.${entity.movement.type || 'basic'}`] = {};
    }

    if (entity.physics !== false) {
      components['minecraft:physics'] = { has_gravity: true, has_collision: true };
    }

    if (entity.collisionBox) {
      components['minecraft:collision_box'] = { width: entity.collisionBox.width, height: entity.collisionBox.height };
    }

    if (entity.familyTypes?.length) {
      components['minecraft:type_family'] = { family: entity.familyTypes };
    }

    if (entity.attack) {
      components['minecraft:attack'] = { damage: entity.attack.damage };
    }

    if (entity.navigation) {
      components[`minecraft:navigation.${entity.navigation.type || 'walk'}`] = {
        can_path_over_water: entity.navigation.canPathOverWater ?? false,
        can_swim: entity.navigation.canSwim ?? false,
        avoid_water: entity.navigation.avoidWater ?? true,
      };
    }

    if (entity.behaviors) {
      for (const behavior of entity.behaviors) {
        components[`minecraft:behavior.${behavior.type}`] = { priority: behavior.priority, ...behavior.params };
      }
    }

    if (entity.additionalComponents) {
      Object.assign(components, entity.additionalComponents);
    }

    return {
      format_version: '1.21.50',
      'minecraft:entity': {
        description: {
          identifier: fullIdentifier,
          is_spawnable: entity.isSpawnable ?? true,
          is_summonable: entity.isSummonable ?? true,
          is_experimental: entity.isExperimental ?? false,
        },
        component_groups: entity.componentGroups || {},
        components,
        events: entity.events || {},
      },
    };
  }

  private buildResourceEntity(entity: EntityDefinition, fullIdentifier: string, baseName: string): object {
    const textures: Record<string, string> = {};
    if (entity.textures) {
      for (const [key] of Object.entries(entity.textures)) {
        textures[key] = `textures/entity/${baseName}/${key}`;
      }
    } else {
      textures.default = `textures/entity/${baseName}`;
    }

    return {
      format_version: '1.10.0',
      'minecraft:client_entity': {
        description: {
          identifier: fullIdentifier,
          materials: entity.materials || { default: 'entity_alphatest' },
          textures,
          geometry: entity.geometryReferences || { default: `geometry.${baseName}` },
          animations: entity.animationReferences || {},
          animation_controllers: entity.animationControllerReferences || [],
          render_controllers: entity.renderControllerReferences || ['controller.render.default'],
          spawn_egg: entity.spawnEgg || { base_color: '#4A90D9', overlay_color: '#87CEEB' },
        },
      },
    };
  }

  addItem(item: ItemDefinition): this {
    const namespace = this.config.namespace;
    const fullIdentifier = item.identifier.includes(':') ? item.identifier : `${namespace}:${item.identifier}`;
    const baseName = fullIdentifier.split(':')[1];

    const behaviorItem = this.buildBehaviorItem(item, fullIdentifier, baseName);
    this.behaviorPack.items.push(behaviorItem);

    this.resourcePack.textures.items.texture_data[baseName] = {
      textures: `textures/items/${baseName}`,
    };

    return this;
  }

  private buildBehaviorItem(item: ItemDefinition, fullIdentifier: string, baseName: string): object {
    const components: Record<string, unknown> = {};

    components['minecraft:icon'] = { texture: item.icon || baseName };
    if (item.displayName) components['minecraft:display_name'] = { value: item.displayName };
    if (item.maxStackSize && item.maxStackSize !== 64) components['minecraft:max_stack_size'] = item.maxStackSize;
    if (item.durability) components['minecraft:durability'] = { max_durability: item.durability.max };
    if (item.damage) components['minecraft:damage'] = { value: item.damage };
    if (item.food) {
      components['minecraft:food'] = {
        nutrition: item.food.nutrition,
        saturation_modifier: item.food.saturation,
        can_always_eat: item.food.canAlwaysEat ?? false,
      };
    }
    if (item.additionalComponents) Object.assign(components, item.additionalComponents);

    return {
      format_version: '1.21.50',
      'minecraft:item': {
        description: {
          identifier: fullIdentifier,
          menu_category: {
            category: item.category || 'items',
            group: item.group,
          },
        },
        components,
      },
    };
  }

  addBlock(block: BlockDefinition): this {
    const namespace = this.config.namespace;
    const fullIdentifier = block.identifier.includes(':') ? block.identifier : `${namespace}:${block.identifier}`;
    const baseName = fullIdentifier.split(':')[1];

    const behaviorBlock = this.buildBehaviorBlock(block, fullIdentifier);
    this.behaviorPack.blocks.push(behaviorBlock);

    this.resourcePack.textures.terrain.texture_data[baseName] = {
      textures: `textures/blocks/${baseName}`,
    };

    this.resourcePack.blocksJson[baseName] = { sound: block.sound || 'stone' };

    return this;
  }

  private buildBehaviorBlock(block: BlockDefinition, fullIdentifier: string): object {
    const components: Record<string, unknown> = {};

    if (block.destructibleByMining !== undefined) {
      components['minecraft:destructible_by_mining'] = typeof block.destructibleByMining === 'boolean'
        ? block.destructibleByMining
        : { seconds_to_destroy: block.destructibleByMining };
    }
    if (block.destructibleByExplosion !== undefined) {
      components['minecraft:destructible_by_explosion'] = typeof block.destructibleByExplosion === 'boolean'
        ? block.destructibleByExplosion
        : { explosion_resistance: block.destructibleByExplosion };
    }
    if (block.friction !== undefined) components['minecraft:friction'] = block.friction;
    if (block.lightEmission) components['minecraft:light_emission'] = block.lightEmission;
    if (block.mapColor) components['minecraft:map_color'] = block.mapColor;
    if (block.geometry) components['minecraft:geometry'] = block.geometry;
    if (block.materialInstances) components['minecraft:material_instances'] = block.materialInstances;
    if (block.additionalComponents) Object.assign(components, block.additionalComponents);

    const blockDef: Record<string, unknown> = {
      format_version: '1.21.50',
      'minecraft:block': {
        description: {
          identifier: fullIdentifier,
          menu_category: { category: block.category || 'construction' },
        },
        components,
      },
    };

    if (block.states) (blockDef['minecraft:block'] as Record<string, unknown>).description = {
      ...(blockDef['minecraft:block'] as Record<string, unknown>).description as object,
      states: block.states
    };
    if (block.permutations) (blockDef['minecraft:block'] as Record<string, unknown>).permutations = block.permutations;

    return blockDef;
  }

  addRecipe(recipe: object): this {
    this.behaviorPack.recipes.push(recipe);
    return this;
  }

  addLootTable(path: string, content: object): this {
    this.behaviorPack.lootTables.push({ path, content });
    return this;
  }

  addSpawnRules(rules: object): this {
    this.behaviorPack.spawnRules.push(rules);
    return this;
  }

  addAnimation(animation: object): this {
    this.resourcePack.animations.push(animation);
    return this;
  }

  addScript(name: string, content: string): this {
    if (!this.behaviorPack.scripts) throw new Error('Enable scripting first');
    if (name === 'main') {
      this.behaviorPack.scripts.main = content;
    } else {
      this.behaviorPack.scripts.modules.push({ name, content });
    }
    return this;
  }

  addTextureFile(type: string, path: string, buffer: Buffer | string): this {
    this.resourcePack.textureFiles.push({ type, path, buffer });
    return this;
  }

  async buildBehaviorPack(): Promise<Buffer> {
    const zip = new JSZip();

    zip.file('manifest.json', JSON.stringify(this.behaviorPack.manifest, null, 2));

    for (const entity of this.behaviorPack.entities) {
      const entityData = entity as { 'minecraft:entity': { description: { identifier: string } } };
      const id = entityData['minecraft:entity'].description.identifier.split(':')[1];
      zip.file(`entities/${id}.json`, JSON.stringify(entity, null, 2));
    }

    for (const item of this.behaviorPack.items) {
      const itemData = item as { 'minecraft:item': { description: { identifier: string } } };
      const id = itemData['minecraft:item'].description.identifier.split(':')[1];
      zip.file(`items/${id}.json`, JSON.stringify(item, null, 2));
    }

    for (const block of this.behaviorPack.blocks) {
      const blockData = block as { 'minecraft:block': { description: { identifier: string } } };
      const id = blockData['minecraft:block'].description.identifier.split(':')[1];
      zip.file(`blocks/${id}.json`, JSON.stringify(block, null, 2));
    }

    for (const recipe of this.behaviorPack.recipes) {
      const recipeObj = recipe as Record<string, { description?: { identifier?: string } }>;
      const type = Object.keys(recipeObj).find(k => k.startsWith('minecraft:recipe_'));
      if (type && recipeObj[type]?.description?.identifier) {
        const id = recipeObj[type].description!.identifier!.split(':')[1];
        zip.file(`recipes/${id}.json`, JSON.stringify(recipe, null, 2));
      }
    }

    for (const lt of this.behaviorPack.lootTables) {
      zip.file(lt.path, JSON.stringify(lt.content, null, 2));
    }

    for (const sr of this.behaviorPack.spawnRules) {
      const spawnRule = sr as { 'minecraft:spawn_rules': { description: { identifier: string } } };
      const id = spawnRule['minecraft:spawn_rules'].description.identifier.split(':')[1];
      zip.file(`spawn_rules/${id}.json`, JSON.stringify(sr, null, 2));
    }

    if (this.behaviorPack.scripts) {
      zip.file('scripts/main.js', this.behaviorPack.scripts.main);
      for (const mod of this.behaviorPack.scripts.modules) {
        zip.file(`scripts/${mod.name}.js`, mod.content);
      }
    }

    return Buffer.from(await zip.generateAsync({ type: 'arraybuffer' }));
  }

  async buildResourcePack(): Promise<Buffer> {
    const zip = new JSZip();

    zip.file('manifest.json', JSON.stringify(this.resourcePack.manifest, null, 2));

    for (const entity of this.resourcePack.entities) {
      const entityData = entity as { 'minecraft:client_entity': { description: { identifier: string } } };
      const id = entityData['minecraft:client_entity'].description.identifier.split(':')[1];
      zip.file(`entity/${id}.entity.json`, JSON.stringify(entity, null, 2));
    }

    if (Object.keys(this.resourcePack.textures.terrain.texture_data).length > 0) {
      zip.file('textures/terrain_texture.json', JSON.stringify(this.resourcePack.textures.terrain, null, 2));
    }

    if (Object.keys(this.resourcePack.textures.items.texture_data).length > 0) {
      zip.file('textures/item_texture.json', JSON.stringify(this.resourcePack.textures.items, null, 2));
    }

    for (const tf of this.resourcePack.textureFiles) {
      const buf = typeof tf.buffer === 'string' ? Buffer.from(tf.buffer, 'base64') : tf.buffer;
      zip.file(tf.path, buf);
    }

    for (const geo of this.resourcePack.geometries) {
      const geoData = geo as { 'minecraft:geometry'?: Array<{ description?: { identifier?: string } }> };
      const id = geoData['minecraft:geometry']?.[0]?.description?.identifier?.replace('geometry.', '') || 'custom';
      zip.file(`models/entity/${id}.geo.json`, JSON.stringify(geo, null, 2));
    }

    for (const anim of this.resourcePack.animations) {
      const animData = anim as { animations: Record<string, unknown> };
      const firstKey = Object.keys(animData.animations)[0];
      const name = firstKey?.replace('animation.', '') || 'default';
      zip.file(`animations/${name}.animation.json`, JSON.stringify(anim, null, 2));
    }

    for (const ac of this.resourcePack.animationControllers) {
      const acData = ac as { animation_controllers: Record<string, unknown> };
      const firstKey = Object.keys(acData.animation_controllers)[0];
      const name = firstKey?.replace('controller.animation.', '') || 'default';
      zip.file(`animation_controllers/${name}.json`, JSON.stringify(ac, null, 2));
    }

    for (const rc of this.resourcePack.renderControllers) {
      const rcData = rc as { render_controllers: Record<string, unknown> };
      const firstKey = Object.keys(rcData.render_controllers)[0];
      const name = firstKey?.replace('controller.render.', '') || 'default';
      zip.file(`render_controllers/${name}.json`, JSON.stringify(rc, null, 2));
    }

    if (this.resourcePack.sounds) {
      zip.file('sounds/sound_definitions.json', JSON.stringify(this.resourcePack.sounds, null, 2));
    }

    if (Object.keys(this.resourcePack.blocksJson).length > 0) {
      zip.file('blocks.json', JSON.stringify(this.resourcePack.blocksJson, null, 2));
    }

    return Buffer.from(await zip.generateAsync({ type: 'arraybuffer' }));
  }

  async buildMcaddon(): Promise<Buffer> {
    const zip = new JSZip();

    const bpBuffer = await this.buildBehaviorPack();
    const bpZip = await JSZip.loadAsync(bpBuffer);
    const bpFolder = zip.folder(`${this.config.name}_BP`)!;
    const bpFiles = bpZip.files;
    for (const [path, file] of Object.entries(bpFiles)) {
      if (!file.dir) {
        bpFolder.file(path, await file.async('arraybuffer'));
      }
    }

    const rpBuffer = await this.buildResourcePack();
    const rpZip = await JSZip.loadAsync(rpBuffer);
    const rpFolder = zip.folder(`${this.config.name}_RP`)!;
    const rpFiles = rpZip.files;
    for (const [path, file] of Object.entries(rpFiles)) {
      if (!file.dir) {
        rpFolder.file(path, await file.async('arraybuffer'));
      }
    }

    return Buffer.from(await zip.generateAsync({ type: 'arraybuffer' }));
  }

  async build(): Promise<AddonBuildResult> {
    return {
      behaviorPack: await this.buildBehaviorPack(),
      resourcePack: await this.buildResourcePack(),
      mcaddon: await this.buildMcaddon(),
      metadata: {
        name: this.config.name,
        namespace: this.config.namespace,
        version: this.config.version,
        behaviorUUID: this.behaviorUUID,
        resourceUUID: this.resourceUUID,
        entityCount: this.behaviorPack.entities.length,
        itemCount: this.behaviorPack.items.length,
        blockCount: this.behaviorPack.blocks.length,
      },
    };
  }
}
