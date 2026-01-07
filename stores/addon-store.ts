import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EntityDefinition, ItemDefinition, BlockDefinition } from '@/types/addon';

interface AddonState {
  name: string;
  namespace: string;
  description: string;
  version: string;
  minEngineVersion: string;

  entities: EntityDefinition[];
  items: ItemDefinition[];
  blocks: BlockDefinition[];
  recipes: object[];
  lootTables: object[];
  spawnRules: object[];
  animations: object[];
  scripts: { main: string; modules: { name: string; content: string }[] } | null;

  enableScripting: boolean;

  setAddonInfo: (info: Partial<Pick<AddonState, 'name' | 'namespace' | 'description' | 'version' | 'minEngineVersion'>>) => void;
  addEntity: (entity: EntityDefinition) => void;
  updateEntity: (index: number, entity: EntityDefinition) => void;
  removeEntity: (index: number) => void;
  addItem: (item: ItemDefinition) => void;
  updateItem: (index: number, item: ItemDefinition) => void;
  removeItem: (index: number) => void;
  addBlock: (block: BlockDefinition) => void;
  updateBlock: (index: number, block: BlockDefinition) => void;
  removeBlock: (index: number) => void;
  addRecipe: (recipe: object) => void;
  removeRecipe: (index: number) => void;
  setScripting: (enabled: boolean) => void;
  setScriptContent: (main: string, modules?: { name: string; content: string }[]) => void;
  reset: () => void;
  loadFromAnalysis: (analysis: { conceptType: string; analysis: { displayName?: string }; detailedAnalysis?: EntityDefinition | ItemDefinition | BlockDefinition }) => void;
}

const initialState = {
  name: '',
  namespace: '',
  description: '',
  version: '1.0.0',
  minEngineVersion: '1.21.50',
  entities: [] as EntityDefinition[],
  items: [] as ItemDefinition[],
  blocks: [] as BlockDefinition[],
  recipes: [] as object[],
  lootTables: [] as object[],
  spawnRules: [] as object[],
  animations: [] as object[],
  scripts: null as { main: string; modules: { name: string; content: string }[] } | null,
  enableScripting: false,
};

export const useAddonStore = create<AddonState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAddonInfo: (info) => set((state) => ({ ...state, ...info })),

      addEntity: (entity) => set((state) => ({ entities: [...state.entities, entity] })),
      updateEntity: (index, entity) => set((state) => {
        const entities = [...state.entities];
        entities[index] = entity;
        return { entities };
      }),
      removeEntity: (index) => set((state) => ({
        entities: state.entities.filter((_, i) => i !== index),
      })),

      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      updateItem: (index, item) => set((state) => {
        const items = [...state.items];
        items[index] = item;
        return { items };
      }),
      removeItem: (index) => set((state) => ({
        items: state.items.filter((_, i) => i !== index),
      })),

      addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
      updateBlock: (index, block) => set((state) => {
        const blocks = [...state.blocks];
        blocks[index] = block;
        return { blocks };
      }),
      removeBlock: (index) => set((state) => ({
        blocks: state.blocks.filter((_, i) => i !== index),
      })),

      addRecipe: (recipe) => set((state) => ({ recipes: [...state.recipes, recipe] })),
      removeRecipe: (index) => set((state) => ({
        recipes: state.recipes.filter((_, i) => i !== index),
      })),

      setScripting: (enabled) => set({
        enableScripting: enabled,
        scripts: enabled ? { main: '', modules: [] } : null,
      }),

      setScriptContent: (main, modules = []) => set({
        scripts: { main, modules },
      }),

      reset: () => set(initialState),

      loadFromAnalysis: (analysis) => {
        const state = get();
        if (analysis.conceptType === 'entity' && analysis.detailedAnalysis) {
          const entity = analysis.detailedAnalysis as EntityDefinition;
          set({
            name: analysis.analysis.displayName || state.name,
            namespace: state.namespace || 'custom',
            entities: [entity],
          });
        } else if (analysis.conceptType === 'item' && analysis.detailedAnalysis) {
          const item = analysis.detailedAnalysis as ItemDefinition;
          set({
            name: analysis.analysis.displayName || state.name,
            namespace: state.namespace || 'custom',
            items: [item],
          });
        } else if (analysis.conceptType === 'block' && analysis.detailedAnalysis) {
          const block = analysis.detailedAnalysis as BlockDefinition;
          set({
            name: analysis.analysis.displayName || state.name,
            namespace: state.namespace || 'custom',
            blocks: [block],
          });
        }
      },
    }),
    {
      name: 'addon-store',
      partialize: (state) => ({
        name: state.name,
        namespace: state.namespace,
        description: state.description,
      }),
    }
  )
);
