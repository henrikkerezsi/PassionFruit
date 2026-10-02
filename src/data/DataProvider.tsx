import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AiState,
  Bean,
  Brewer,
  FlavourTag,
  GrindSetting,
  Method,
  Recipe,
  Roaster,
  Settings,
} from '../models';
import { getDatabase } from '../database/database';
import {
  clearAiCredentials as clearAiCredentialsRow,
  getAiState,
  updateAiState as updateAiStateRow,
} from '../database/aiState';
import {
  DEFAULT_SETTINGS,
  getSettings,
  updateSettings as updateSettingsRow,
} from '../database/settings';
import {
  createRoaster,
  deleteRoaster,
  getAllRoasters,
  updateRoaster,
} from '../database/roasters';
import type { RoasterInput } from '../database/roasters';
import {
  createBean,
  deleteBean,
  getAllBeans,
  hardDeleteBean,
  setBeanRemainingWeight,
  updateBean,
} from '../database/beans';
import type { BeanInput } from '../database/beans';
import {
  createBrewer,
  deleteBrewer,
  getAllBrewers,
  updateBrewer,
} from '../database/brewers';
import type { BrewerInput } from '../database/brewers';
import {
  createGrindSetting,
  deleteGrindSetting,
  getAllGrindSettings,
  updateGrindSetting,
} from '../database/grinders';
import type { GrindSettingInput } from '../database/grinders';
import {
  adoptBuiltinRecipe,
  createRecipe,
  deleteRecipe,
  getAllRecipes,
  updateRecipe,
} from '../database/recipes';
import type { RecipeInput } from '../database/recipes';
import { getAllMethods } from '../database/methods';
import { addOtherFlavourTag, getAllFlavourTags } from '../database/flavourTags';

export interface AppData {
  ready: boolean;
  error: string | null;
  settings: Settings;
  aiState: AiState;
  roasters: Roaster[];
  beans: Bean[];
  brewers: Brewer[];
  grindSettings: GrindSetting[];
  methods: Method[];
  recipes: Recipe[];
  flavourTags: FlavourTag[];
  refresh: () => Promise<void>;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;
  saveAiState: (patch: Partial<AiState>) => Promise<void>;
  clearAiCredentials: () => Promise<void>;
  addRoaster: (input: RoasterInput) => Promise<number>;
  saveRoaster: (id: number, input: RoasterInput) => Promise<void>;
  removeRoaster: (id: number) => Promise<void>;
  addBean: (input: BeanInput) => Promise<number>;
  saveBean: (id: number, input: BeanInput) => Promise<void>;
  removeBean: (id: number) => Promise<void>;
  hardRemoveBean: (id: number) => Promise<void>;
  setBeanRemaining: (id: number, remainingWeightG: number | null) => Promise<void>;
  addBrewer: (input: BrewerInput) => Promise<number>;
  saveBrewer: (id: number, input: BrewerInput) => Promise<void>;
  removeBrewer: (id: number) => Promise<void>;
  addGrindSetting: (input: GrindSettingInput) => Promise<number>;
  saveGrindSetting: (id: number, input: GrindSettingInput) => Promise<void>;
  removeGrindSetting: (id: number) => Promise<void>;
  addRecipe: (input: RecipeInput) => Promise<number>;
  saveRecipe: (id: number, input: RecipeInput) => Promise<void>;
  removeRecipe: (id: number) => Promise<void>;
  adoptRecipe: (builtinId: number) => Promise<number>;
  addFlavourTag: (name: string) => Promise<string>;
}

const DataContext = createContext<AppData | null>(null);

const EMPTY_AI_STATE: AiState = {
  llmBaseUrl: null,
  llmApiKey: null,
  llmModel: null,
  sttEngine: 'manual',
  sttBaseUrl: null,
  sttApiKey: null,
  sttModel: null,
  sttLanguage: null,
  enabled: false,
  lastError: null,
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [aiState, setAiState] = useState<AiState>(EMPTY_AI_STATE);
  const [roasters, setRoasters] = useState<Roaster[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brewers, setBrewers] = useState<Brewer[]>([]);
  const [grindSettings, setGrindSettings] = useState<GrindSetting[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [flavourTags, setFlavourTags] = useState<FlavourTag[]>([]);

  const refresh = useCallback(async () => {
    try {
      const db = await getDatabase();
      const [
        nextSettings,
        nextAiState,
        nextRoasters,
        nextBeans,
        nextBrewers,
        nextGrindSettings,
        nextMethods,
        nextRecipes,
        nextFlavourTags,
      ] = await Promise.all([
        getSettings(db),
        getAiState(db),
        getAllRoasters(db),
        getAllBeans(db),
        getAllBrewers(db),
        getAllGrindSettings(db),
        getAllMethods(db),
        getAllRecipes(db),
        getAllFlavourTags(db),
      ]);
      setSettings(nextSettings);
      setAiState(nextAiState);
      setRoasters(nextRoasters);
      setBeans(nextBeans);
      setBrewers(nextBrewers);
      setGrindSettings(nextGrindSettings);
      setMethods(nextMethods);
      setRecipes(nextRecipes);
      setFlavourTags(nextFlavourTags);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load local data');
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      await refresh();
      if (active) {
        setReady(true);
      }
    }
    void initialize();
    return () => {
      active = false;
    };
  }, [refresh]);

  const saveSettings = useCallback(async (patch: Partial<Settings>) => {
    const db = await getDatabase();
    const next = await updateSettingsRow(patch, db);
    setSettings(next);
  }, []);

  const saveAiState = useCallback(async (patch: Partial<AiState>) => {
    const db = await getDatabase();
    const next = await updateAiStateRow(patch, db);
    setAiState(next);
  }, []);

  const clearAiCredentials = useCallback(async () => {
    const db = await getDatabase();
    const next = await clearAiCredentialsRow(db);
    setAiState(next);
  }, []);

  const value = useMemo<AppData>(
    () => ({
      ready,
      error,
      settings,
      aiState,
      roasters,
      beans,
      brewers,
      grindSettings,
      methods,
      recipes,
      flavourTags,
      refresh,
      saveSettings,
      saveAiState,
      clearAiCredentials,
      addRoaster: async (input) => {
        const db = await getDatabase();
        const id = await createRoaster({ ...input, sortOrder: roasters.length }, db);
        await refresh();
        return id;
      },
      saveRoaster: async (id, input) => {
        const db = await getDatabase();
        await updateRoaster(id, input, db);
        await refresh();
      },
      removeRoaster: async (id) => {
        const db = await getDatabase();
        await deleteRoaster(id, db);
        await refresh();
      },
      addBean: async (input) => {
        const db = await getDatabase();
        const id = await createBean({ ...input, sortOrder: beans.length }, db);
        await refresh();
        return id;
      },
      saveBean: async (id, input) => {
        const db = await getDatabase();
        await updateBean(id, input, db);
        await refresh();
      },
      removeBean: async (id) => {
        const db = await getDatabase();
        await deleteBean(id, db);
        await refresh();
      },
      hardRemoveBean: async (id) => {
        const db = await getDatabase();
        await hardDeleteBean(id, db);
        await refresh();
      },
      setBeanRemaining: async (id, remainingWeightG) => {
        const db = await getDatabase();
        await setBeanRemainingWeight(id, remainingWeightG, db);
        await refresh();
      },
      addBrewer: async (input) => {
        const db = await getDatabase();
        const id = await createBrewer({ ...input, sortOrder: brewers.length }, db);
        await refresh();
        return id;
      },
      saveBrewer: async (id, input) => {
        const db = await getDatabase();
        await updateBrewer(id, input, db);
        await refresh();
      },
      removeBrewer: async (id) => {
        const db = await getDatabase();
        await deleteBrewer(id, db);
        await refresh();
      },
      addGrindSetting: async (input) => {
        const db = await getDatabase();
        const id = await createGrindSetting(input, db);
        await refresh();
        return id;
      },
      saveGrindSetting: async (id, input) => {
        const db = await getDatabase();
        await updateGrindSetting(id, input, db);
        await refresh();
      },
      removeGrindSetting: async (id) => {
        const db = await getDatabase();
        await deleteGrindSetting(id, db);
        await refresh();
      },
      addRecipe: async (input) => {
        const db = await getDatabase();
        const id = await createRecipe(input, db);
        await refresh();
        return id;
      },
      saveRecipe: async (id, input) => {
        const db = await getDatabase();
        await updateRecipe(id, input, db);
        await refresh();
      },
      removeRecipe: async (id) => {
        const db = await getDatabase();
        await deleteRecipe(id, db);
        await refresh();
      },
      adoptRecipe: async (builtinId) => {
        const db = await getDatabase();
        const id = await adoptBuiltinRecipe(builtinId, db);
        await refresh();
        return id;
      },
      addFlavourTag: async (name) => {
        const db = await getDatabase();
        const id = await addOtherFlavourTag(name, db);
        await refresh();
        return id;
      },
    }),
    [
      ready,
      error,
      settings,
      aiState,
      roasters,
      beans,
      brewers,
      grindSettings,
      methods,
      recipes,
      flavourTags,
      refresh,
      saveSettings,
      saveAiState,
      clearAiCredentials,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData(): AppData {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useAppData must be used within a DataProvider');
  }
  return context;
}
