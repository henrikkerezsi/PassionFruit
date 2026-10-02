import { STEP_KIND_IDS } from '../models';

const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";

const quoted = (values: readonly string[]): string => values.map((v) => `'${v}'`).join(',');

const STEP_KIND_CHECK = `CHECK (kind IS NULL OR kind IN (${quoted(STEP_KIND_IDS)}))`;
const AGITATION_CHECK = `CHECK (agitation_kind IS NULL OR agitation_kind IN ('stir','swirl','tap','none'))`;
const GRIND_UNIT_CHECK = `CHECK (grind_unit IS NULL OR grind_unit IN ('clicks','setting','microns','notch','unknown'))`;
const PHASE_CHECK = `CHECK (phase IS NULL OR phase IN ('prep','brew','finish','taste','note'))`;

function stepsTable(table: string, parentColumn: string, parentTable: string): string {
  return `
CREATE TABLE IF NOT EXISTS ${table} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  ${parentColumn} INTEGER NOT NULL,
  step_index INTEGER NOT NULL,
  kind TEXT ${STEP_KIND_CHECK},
  label TEXT,
  target_water_g REAL,
  pour_water_g REAL,
  pour_duration_s INTEGER,
  wait_after_s INTEGER,
  agitation_count INTEGER,
  agitation_kind TEXT ${AGITATION_CHECK},
  temperature_c REAL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (${parentColumn}) REFERENCES ${parentTable} (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_${table}_parent ON ${table} (${parentColumn}, step_index);
CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_uuid ON ${table} (uuid);
`;
}

export const SCHEMA_SQL = `
-- Reference and configuration ------------------------------------------------

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS ai_state (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  llm_base_url TEXT,
  llm_api_key TEXT,
  llm_model TEXT,
  stt_engine TEXT CHECK (stt_engine IS NULL OR stt_engine IN ('openai-compatible','android','manual')),
  stt_base_url TEXT,
  stt_api_key TEXT,
  stt_model TEXT,
  stt_language TEXT,
  enabled INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS app_prefs (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS methods (
  id TEXT PRIMARY KEY NOT NULL,
  uuid TEXT,
  name TEXT NOT NULL,
  family TEXT NOT NULL CHECK (family IN ('pour-over','immersion','pressure','cold')),
  brewer_kind TEXT,
  supports_pressure INTEGER NOT NULL DEFAULT 0,
  supports_grinder INTEGER NOT NULL DEFAULT 1,
  default_step_template TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_methods_uuid ON methods (uuid);

CREATE TABLE IF NOT EXISTS flavour_tags (
  id TEXT PRIMARY KEY NOT NULL,
  uuid TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fruit','floral','sweet','nutty_cocoa','spice','roasted','green_vegetative','sour_fermented','chemical','other')),
  is_seeded INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_flavour_tags_uuid ON flavour_tags (uuid);
CREATE INDEX IF NOT EXISTS idx_flavour_tags_category ON flavour_tags (category, sort_order);

-- Coffee and equipment -------------------------------------------------------

CREATE TABLE IF NOT EXISTS roasters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  name TEXT NOT NULL,
  location TEXT,
  url TEXT,
  notes TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_roasters_uuid ON roasters (uuid);
CREATE INDEX IF NOT EXISTS idx_roasters_active ON roasters (active);

CREATE TABLE IF NOT EXISTS beans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  name TEXT NOT NULL,
  roaster_id INTEGER,
  origin_country TEXT,
  origin_region TEXT,
  farm TEXT,
  producer TEXT,
  varietal TEXT,
  process TEXT CHECK (process IS NULL OR process IN ('washed','natural','honey','anaerobic','carbonic','wet-hulled','experimental','unknown')),
  altitude_m REAL,
  roast_level TEXT CHECK (roast_level IS NULL OR roast_level IN ('light','medium-light','medium','medium-dark','dark','unknown')),
  roast_date TEXT,
  purchased_date TEXT,
  opened_date TEXT,
  finished_date TEXT,
  bag_weight_g REAL,
  remaining_weight_g REAL,
  price_cents INTEGER,
  currency TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (roaster_id) REFERENCES roasters (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_beans_uuid ON beans (uuid);
CREATE INDEX IF NOT EXISTS idx_beans_roaster ON beans (roaster_id);
CREATE INDEX IF NOT EXISTS idx_beans_active ON beans (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_beans_roast_date ON beans (roast_date);

CREATE TABLE IF NOT EXISTS brewers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('dripper','kettle','scale','grinder','press','filter','carafe','portafilter','moka','cup','other')),
  manufacturer TEXT,
  model TEXT,
  capacity_ml REAL,
  material TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_brewers_uuid ON brewers (uuid);
CREATE INDEX IF NOT EXISTS idx_brewers_kind ON brewers (kind, is_active, sort_order);

CREATE TABLE IF NOT EXISTS grind_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  brewer_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  selection_label TEXT,
  step_count INTEGER,
  is_zero_based INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (brewer_id) REFERENCES brewers (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_grind_settings_uuid ON grind_settings (uuid);
CREATE INDEX IF NOT EXISTS idx_grind_settings_brewer ON grind_settings (brewer_id);

-- Recipes and plans ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  name TEXT NOT NULL,
  method_id TEXT NOT NULL,
  brewer_id INTEGER,
  bean_id INTEGER,
  source TEXT NOT NULL CHECK (source IN ('builtin','own','recommendation')),
  parent_recipe_id INTEGER,
  is_builtin INTEGER NOT NULL DEFAULT 0,
  dose_g REAL,
  water_total_g REAL,
  water_temp_c REAL,
  grinder_id INTEGER,
  grind_setting_id INTEGER,
  grind_value REAL,
  grind_unit TEXT ${GRIND_UNIT_CHECK},
  expected_total_time_s INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (method_id) REFERENCES methods (id),
  FOREIGN KEY (brewer_id) REFERENCES brewers (id) ON DELETE SET NULL,
  FOREIGN KEY (bean_id) REFERENCES beans (id) ON DELETE SET NULL,
  FOREIGN KEY (parent_recipe_id) REFERENCES recipes (id) ON DELETE SET NULL,
  FOREIGN KEY (grinder_id) REFERENCES brewers (id) ON DELETE SET NULL,
  FOREIGN KEY (grind_setting_id) REFERENCES grind_settings (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_uuid ON recipes (uuid);
CREATE INDEX IF NOT EXISTS idx_recipes_method ON recipes (method_id);
CREATE INDEX IF NOT EXISTS idx_recipes_source ON recipes (source, is_builtin);

${stepsTable('recipe_steps', 'recipe_id', 'recipes')}

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  name TEXT,
  method_id TEXT NOT NULL,
  brewer_id INTEGER,
  bean_id INTEGER,
  recipe_id INTEGER,
  recommendation_id INTEGER,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','active','brewed','abandoned')),
  target_date TEXT,
  dose_g REAL,
  water_total_g REAL,
  water_temp_c REAL,
  grinder_id INTEGER,
  grind_setting_id INTEGER,
  grind_value REAL,
  grind_unit TEXT ${GRIND_UNIT_CHECK},
  expected_total_time_s INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (method_id) REFERENCES methods (id),
  FOREIGN KEY (brewer_id) REFERENCES brewers (id) ON DELETE SET NULL,
  FOREIGN KEY (bean_id) REFERENCES beans (id) ON DELETE SET NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE SET NULL,
  FOREIGN KEY (grinder_id) REFERENCES brewers (id) ON DELETE SET NULL,
  FOREIGN KEY (grind_setting_id) REFERENCES grind_settings (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_uuid ON plans (uuid);
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans (status);
CREATE INDEX IF NOT EXISTS idx_plans_target_date ON plans (target_date);

${stepsTable('plan_steps', 'plan_id', 'plans')}

CREATE TABLE IF NOT EXISTS plan_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  plan_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  field TEXT,
  previous_value TEXT,
  new_value TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_events_uuid ON plan_events (uuid);
CREATE INDEX IF NOT EXISTS idx_plan_events_plan ON plan_events (plan_id, id);

CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  method_id TEXT,
  base_brew_id INTEGER,
  base_recipe_id INTEGER,
  mode TEXT NOT NULL CHECK (mode IN ('safe','curious','adventurous')),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','declined','brewed','superseded','expired')),
  proposed_json TEXT,
  rationale_json TEXT,
  narrative TEXT,
  flaw_first INTEGER NOT NULL DEFAULT 0,
  flaw_source TEXT CHECK (flaw_source IS NULL OR flaw_source IN ('canonical','history','assistance')),
  declined_reason TEXT,
  planned_for_date TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (method_id) REFERENCES methods (id),
  FOREIGN KEY (base_brew_id) REFERENCES brews (id) ON DELETE SET NULL,
  FOREIGN KEY (base_recipe_id) REFERENCES recipes (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_recommendations_uuid ON recommendations (uuid);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations (status, created_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_method ON recommendations (method_id);

CREATE TABLE IF NOT EXISTS recommendation_diffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  recommendation_id INTEGER NOT NULL,
  knob TEXT NOT NULL,
  current_value TEXT,
  proposed_value TEXT,
  sensitivity REAL,
  confidence REAL,
  n INTEGER,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (recommendation_id) REFERENCES recommendations (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_recommendation_diffs_uuid ON recommendation_diffs (uuid);
CREATE INDEX IF NOT EXISTS idx_recommendation_diffs_rec ON recommendation_diffs (recommendation_id, id);

-- Voice and AI provenance ----------------------------------------------------

CREATE TABLE IF NOT EXISTS voice_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  brew_id INTEGER,
  plan_id INTEGER,
  state TEXT NOT NULL DEFAULT 'recording' CHECK (state IN ('recording','paused','stopped','transcribing','extracting','review','committed','discarded')),
  started_at TEXT NOT NULL DEFAULT (${NOW}),
  ended_at TEXT,
  default_phase TEXT,
  engine TEXT CHECK (engine IS NULL OR engine IN ('openai-compatible','android','manual')),
  language TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (brew_id) REFERENCES brews (id) ON DELETE SET NULL,
  FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_sessions_uuid ON voice_sessions (uuid);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_state ON voice_sessions (state);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_brew ON voice_sessions (brew_id);

CREATE TABLE IF NOT EXISTS voice_moments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  session_id INTEGER NOT NULL,
  phase TEXT ${PHASE_CHECK},
  start_offset_ms INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  audio_path TEXT,
  transcript TEXT,
  transcript_confidence REAL,
  transcript_engine TEXT,
  transcript_status TEXT CHECK (transcript_status IS NULL OR transcript_status IN ('pending','succeeded','failed','skipped')),
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (session_id) REFERENCES voice_sessions (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_moments_uuid ON voice_moments (uuid);
CREATE INDEX IF NOT EXISTS idx_voice_moments_session ON voice_moments (session_id, start_offset_ms);

CREATE TABLE IF NOT EXISTS phase_markers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  session_id INTEGER NOT NULL,
  phase TEXT NOT NULL ${PHASE_CHECK},
  offset_ms INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (session_id) REFERENCES voice_sessions (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_phase_markers_uuid ON phase_markers (uuid);
CREATE INDEX IF NOT EXISTS idx_phase_markers_session ON phase_markers (session_id, offset_ms);

CREATE TABLE IF NOT EXISTS extraction_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  session_id INTEGER,
  brew_id INTEGER,
  kind TEXT NOT NULL CHECK (kind IN ('extraction','narration','insight','assistance')),
  prompt_id TEXT,
  prompt_version TEXT,
  model TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','succeeded','failed')),
  request_summary TEXT,
  response_json TEXT,
  error TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_estimate_cents INTEGER,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (session_id) REFERENCES voice_sessions (id) ON DELETE SET NULL,
  FOREIGN KEY (brew_id) REFERENCES brews (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_extraction_runs_uuid ON extraction_runs (uuid);
CREATE INDEX IF NOT EXISTS idx_extraction_runs_session ON extraction_runs (session_id, created_at);

CREATE TABLE IF NOT EXISTS extraction_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  run_id INTEGER NOT NULL,
  target TEXT CHECK (target IS NULL OR target IN ('brew','tasting','session')),
  target_id INTEGER,
  field_path TEXT NOT NULL,
  value_json TEXT,
  confidence REAL,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (run_id) REFERENCES extraction_runs (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_extraction_results_uuid ON extraction_results (uuid);
CREATE INDEX IF NOT EXISTS idx_extraction_results_run ON extraction_results (run_id);

CREATE TABLE IF NOT EXISTS extraction_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  run_id INTEGER NOT NULL,
  field_path TEXT NOT NULL,
  question TEXT NOT NULL,
  options_json TEXT,
  answer TEXT,
  answered_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (run_id) REFERENCES extraction_runs (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_extraction_questions_uuid ON extraction_questions (uuid);
CREATE INDEX IF NOT EXISTS idx_extraction_questions_run ON extraction_questions (run_id, sort_order);

CREATE TABLE IF NOT EXISTS extraction_provenance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  run_id INTEGER NOT NULL,
  target TEXT CHECK (target IS NULL OR target IN ('brew','tasting','session')),
  target_id INTEGER,
  field_path TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('automated','manual','assistant')),
  accepted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (run_id) REFERENCES extraction_runs (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_extraction_provenance_uuid ON extraction_provenance (uuid);
CREATE INDEX IF NOT EXISTS idx_extraction_provenance_run ON extraction_provenance (run_id);

-- The record -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS brews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  method_id TEXT NOT NULL,
  brewer_id INTEGER,
  bean_id INTEGER,
  plan_id INTEGER,
  recommendation_id INTEGER,
  voice_session_id INTEGER,
  brew_date TEXT NOT NULL,
  started_at TEXT,
  ended_at TEXT,
  dose_g REAL,
  water_total_g REAL,
  water_temp_c REAL,
  yield_g REAL,
  grinder_id INTEGER,
  grind_setting_id INTEGER,
  grind_value REAL,
  grind_unit TEXT ${GRIND_UNIT_CHECK},
  total_time_s INTEGER,
  bean_name_snapshot TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (method_id) REFERENCES methods (id),
  FOREIGN KEY (brewer_id) REFERENCES brewers (id) ON DELETE SET NULL,
  FOREIGN KEY (bean_id) REFERENCES beans (id) ON DELETE SET NULL,
  FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE SET NULL,
  FOREIGN KEY (recommendation_id) REFERENCES recommendations (id) ON DELETE SET NULL,
  FOREIGN KEY (grinder_id) REFERENCES brewers (id) ON DELETE SET NULL,
  FOREIGN KEY (grind_setting_id) REFERENCES grind_settings (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_brews_uuid ON brews (uuid);
CREATE INDEX IF NOT EXISTS idx_brews_date ON brews (brew_date);
CREATE INDEX IF NOT EXISTS idx_brews_method ON brews (method_id);
CREATE INDEX IF NOT EXISTS idx_brews_bean ON brews (bean_id);
CREATE INDEX IF NOT EXISTS idx_brews_plan ON brews (plan_id);

${stepsTable('brew_steps', 'brew_id', 'brews')}

CREATE TABLE IF NOT EXISTS tastings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  brew_id INTEGER NOT NULL,
  verdict TEXT CHECK (verdict IS NULL OR verdict IN ('liked','disliked','unsure')),
  overall_rating INTEGER CHECK (overall_rating IS NULL OR (overall_rating BETWEEN 1 AND 5)),
  tasted_at TEXT,
  temperature_c REAL,
  attribute_acidity TEXT CHECK (attribute_acidity IS NULL OR attribute_acidity IN ('low','medium','high')),
  attribute_sweetness TEXT CHECK (attribute_sweetness IS NULL OR attribute_sweetness IN ('low','medium','high')),
  attribute_body TEXT CHECK (attribute_body IS NULL OR attribute_body IN ('low','medium','high')),
  attribute_bitterness TEXT CHECK (attribute_bitterness IS NULL OR attribute_bitterness IN ('low','medium','high')),
  attribute_finish TEXT CHECK (attribute_finish IS NULL OR attribute_finish IN ('low','medium','high')),
  sca_aroma INTEGER CHECK (sca_aroma IS NULL OR (sca_aroma BETWEEN 1 AND 10)),
  sca_flavour INTEGER CHECK (sca_flavour IS NULL OR (sca_flavour BETWEEN 1 AND 10)),
  sca_aftertaste INTEGER CHECK (sca_aftertaste IS NULL OR (sca_aftertaste BETWEEN 1 AND 10)),
  sca_acidity INTEGER CHECK (sca_acidity IS NULL OR (sca_acidity BETWEEN 1 AND 10)),
  sca_body INTEGER CHECK (sca_body IS NULL OR (sca_body BETWEEN 1 AND 10)),
  sca_balance INTEGER CHECK (sca_balance IS NULL OR (sca_balance BETWEEN 1 AND 10)),
  sca_uniformity INTEGER CHECK (sca_uniformity IS NULL OR (sca_uniformity BETWEEN 1 AND 10)),
  sca_clean_cup INTEGER CHECK (sca_clean_cup IS NULL OR (sca_clean_cup BETWEEN 1 AND 10)),
  sca_sweetness INTEGER CHECK (sca_sweetness IS NULL OR (sca_sweetness BETWEEN 1 AND 10)),
  sca_overall INTEGER CHECK (sca_overall IS NULL OR (sca_overall BETWEEN 1 AND 10)),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (brew_id) REFERENCES brews (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tastings_uuid ON tastings (uuid);
CREATE INDEX IF NOT EXISTS idx_tastings_brew ON tastings (brew_id, tasted_at);

CREATE TABLE IF NOT EXISTS tasting_flavour_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  tasting_id INTEGER NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (tasting_id) REFERENCES tastings (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES flavour_tags (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tasting_flavour_tags_uuid ON tasting_flavour_tags (uuid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasting_flavour_tags_unique ON tasting_flavour_tags (tasting_id, tag_id);

-- Derived and delivered ------------------------------------------------------

CREATE TABLE IF NOT EXISTS insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  kind TEXT NOT NULL,
  scope TEXT,
  title TEXT,
  body TEXT,
  score REAL,
  confidence REAL,
  evidence_json TEXT,
  dismissed INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_insights_uuid ON insights (uuid);
CREATE INDEX IF NOT EXISTS idx_insights_kind ON insights (kind, dismissed);

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('bean_freshness','low_bean','unlogged_session')),
  bean_id INTEGER,
  brew_id INTEGER,
  due_at TEXT,
  dismissed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW}),
  updated_at TEXT,
  FOREIGN KEY (bean_id) REFERENCES beans (id) ON DELETE CASCADE,
  FOREIGN KEY (brew_id) REFERENCES brews (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_uuid ON reminders (uuid);
CREATE INDEX IF NOT EXISTS idx_reminders_kind ON reminders (kind, dismissed_at);
`;

export const SEED_METHODS_SQL = `
INSERT OR IGNORE INTO methods (id, name, family, brewer_kind, supports_pressure, supports_grinder, sort_order) VALUES
  ('v60', 'V60', 'pour-over', 'dripper', 0, 1, 1),
  ('chemex', 'Chemex', 'pour-over', 'dripper', 0, 1, 2),
  ('kalita', 'Kalita Wave', 'pour-over', 'dripper', 0, 1, 3),
  ('french-press', 'French Press', 'immersion', 'press', 0, 1, 4),
  ('aeropress', 'AeroPress', 'pressure', 'press', 1, 1, 5),
  ('clever', 'Clever Dripper', 'immersion', 'dripper', 0, 1, 6),
  ('cold-brew', 'Cold Brew', 'cold', 'carafe', 0, 1, 7),
  ('espresso', 'Espresso', 'pressure', 'portafilter', 1, 1, 8),
  ('moka', 'Moka Pot', 'pressure', 'moka', 1, 1, 9);
`;

export const SEED_FLAVOUR_TAGS_SQL = `
INSERT OR IGNORE INTO flavour_tags (id, name, category, is_seeded, sort_order) VALUES
  ('fruit-berry', 'Berry', 'fruit', 1, 1),
  ('fruit-citrus', 'Citrus', 'fruit', 1, 2),
  ('fruit-stone', 'Stone fruit', 'fruit', 1, 3),
  ('fruit-tropical', 'Tropical', 'fruit', 1, 4),
  ('fruit-dried', 'Dried fruit', 'fruit', 1, 5),
  ('floral-jasmine', 'Jasmine', 'floral', 1, 1),
  ('floral-rose', 'Rose', 'floral', 1, 2),
  ('floral-chamomile', 'Chamomile', 'floral', 1, 3),
  ('sweet-caramel', 'Caramel', 'sweet', 1, 1),
  ('sweet-honey', 'Honey', 'sweet', 1, 2),
  ('sweet-maple', 'Maple', 'sweet', 1, 3),
  ('sweet-brown-sugar', 'Brown sugar', 'sweet', 1, 4),
  ('nutty-almond', 'Almond', 'nutty_cocoa', 1, 1),
  ('nutty-hazelnut', 'Hazelnut', 'nutty_cocoa', 1, 2),
  ('cocoa-dark', 'Dark chocolate', 'nutty_cocoa', 1, 3),
  ('cocoa-milk', 'Milk chocolate', 'nutty_cocoa', 1, 4),
  ('spice-cinnamon', 'Cinnamon', 'spice', 1, 1),
  ('spice-clove', 'Clove', 'spice', 1, 2),
  ('spice-pepper', 'Pepper', 'spice', 1, 3),
  ('roasted-toast', 'Toast', 'roasted', 1, 1),
  ('roasted-smoky', 'Smoky', 'roasted', 1, 2),
  ('green-grassy', 'Grassy', 'green_vegetative', 1, 1),
  ('green-herbal', 'Herbal', 'green_vegetative', 1, 2),
  ('green-vegetal', 'Vegetal', 'green_vegetative', 1, 3),
  ('sour-fermented', 'Fermented', 'sour_fermented', 1, 1),
  ('sour-yogurt', 'Yogurt', 'sour_fermented', 1, 2),
  ('chemical-medicinal', 'Medicinal', 'chemical', 1, 1),
  ('chemical-rubber', 'Rubber', 'chemical', 1, 2),
  ('other-other', 'Other', 'other', 1, 1);
`;
