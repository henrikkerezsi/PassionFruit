export const SEED_CANONICAL_RECIPES_SQL = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_steps_unique ON recipe_steps (recipe_id, step_index);

INSERT OR IGNORE INTO recipes (
  id, name, method_id, source, is_builtin, dose_g, water_total_g, water_temp_c,
  expected_total_time_s, notes
) VALUES
  (1, 'V60 — classic 1:16.7', 'v60', 'builtin', 1, 15, 250, 93, 165,
   'A forgiving starting point: 15 g to 250 g at 1:16.7.'),
  (2, 'Chemex — 1:16.7', 'chemex', 'builtin', 1, 30, 500, 94, 255,
   'Thick filter, slow drawdown, clean cup.'),
  (3, 'Kalita Wave — 1:16', 'kalita', 'builtin', 1, 20, 320, 93, 195,
   'Flat bed, multiple even pulses.'),
  (4, 'French Press — 4:00 steep', 'french-press', 'builtin', 1, 30, 500, 94, 240,
   'Full immersion, 4:00 steep, slow press.'),
  (5, 'AeroPress — 1:14.7', 'aeropress', 'builtin', 1, 15, 220, 88, 105,
   'Standard orientation, 1:00 steep then a slow press.'),
  (6, 'Clever Dripper — 2:30 steep', 'clever', 'builtin', 1, 20, 320, 93, 195,
   'Valve closed for the steep, opened to drain.'),
  (7, 'Cold Brew — 16 h steep', 'cold-brew', 'builtin', 1, 100, 1000, 20, 57600,
   '1:10 concentrate, 16 hours in the fridge.'),
  (8, 'Espresso — 18 g in, 36 g out', 'espresso', 'builtin', 1, 18, 36, 93, 28,
   '1:2 yield in about 28 s. water_total_g holds the yield.'),
  (9, 'Moka Pot — medium-fine', 'moka', 'builtin', 1, 18, 150, NULL, 240,
   'No temperature control: grind and gentle heat do the work.');

INSERT OR IGNORE INTO recipe_steps (
  recipe_id, step_index, kind, label, target_water_g, pour_water_g, pour_duration_s,
  wait_after_s, agitation_count, agitation_kind, temperature_c, note
) VALUES
  (1, 0, 'rinse', 'Rinse the filter', NULL, NULL, NULL, NULL, NULL, NULL, NULL,
   'Warm the cone and discard the rinse water.'),
  (1, 1, 'grind', 'Grind medium-fine', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (1, 2, 'bloom', 'Bloom', 45, 45, 10, 40, NULL, NULL, 93, 'Swirl gently to saturate.'),
  (1, 3, 'pour', 'First pour', 150, 105, 25, 15, NULL, NULL, 93, NULL),
  (1, 4, 'pour', 'Second pour', 250, 100, 25, 15, NULL, NULL, 93, NULL),
  (1, 5, 'swirl', 'Level the bed', NULL, NULL, NULL, NULL, 1, 'swirl', NULL, NULL),

  (2, 0, 'rinse', 'Rinse the filter', NULL, NULL, NULL, NULL, NULL, NULL, NULL,
   'Rinse well to remove papery flavour.'),
  (2, 1, 'grind', 'Grind medium-coarse', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (2, 2, 'bloom', 'Bloom', 90, 90, 15, 45, NULL, NULL, 94, NULL),
  (2, 3, 'pour', 'First pour', 300, 210, 35, 20, NULL, NULL, 94, NULL),
  (2, 4, 'pour', 'Second pour', 500, 200, 35, 20, NULL, NULL, 94, NULL),
  (2, 5, 'swirl', 'Level the bed', NULL, NULL, NULL, NULL, 1, 'swirl', NULL, NULL),

  (3, 0, 'rinse', 'Rinse the filter', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (3, 1, 'grind', 'Grind medium', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (3, 2, 'bloom', 'Bloom', 60, 60, 12, 40, NULL, NULL, 93, NULL),
  (3, 3, 'pour', 'First pour', 140, 80, 20, 15, NULL, NULL, 93, NULL),
  (3, 4, 'pour', 'Second pour', 220, 80, 20, 15, NULL, NULL, 93, NULL),
  (3, 5, 'pour', 'Third pour', 320, 100, 25, 15, NULL, NULL, 93, NULL),
  (3, 6, 'swirl', 'Level the bed', NULL, NULL, NULL, NULL, 1, 'swirl', NULL, NULL),

  (4, 0, 'grind', 'Grind coarse', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (4, 1, 'add_water', 'Add all the water', 500, 500, 30, NULL, NULL, NULL, 94,
   'Start the timer as the water goes in.'),
  (4, 2, 'steep', 'Steep 4:00', NULL, NULL, NULL, 240, NULL, NULL, NULL, NULL),
  (4, 3, 'break_crust', 'Break the crust', NULL, NULL, NULL, NULL, 3, 'stir', NULL, NULL),
  (4, 4, 'skim', 'Skim the grounds', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (4, 5, 'press', 'Press slowly', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL),

  (5, 0, 'rinse', 'Rinse the filter', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (5, 1, 'grind', 'Grind medium-fine', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (5, 2, 'add_water', 'Add the water', 220, 220, 20, NULL, NULL, NULL, 88, NULL),
  (5, 3, 'stir', 'Stir', NULL, NULL, 5, NULL, 2, 'stir', NULL, NULL),
  (5, 4, 'steep', 'Steep 1:00', NULL, NULL, NULL, 60, NULL, NULL, NULL, NULL),
  (5, 5, 'press', 'Press slowly', NULL, NULL, 30, NULL, NULL, NULL, NULL, 'Stop at the hiss.'),

  (6, 0, 'rinse', 'Rinse the filter', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (6, 1, 'grind', 'Grind medium', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (6, 2, 'add_water', 'Add all the water', 320, 320, 30, NULL, NULL, NULL, 93,
   'Keep the valve closed.'),
  (6, 3, 'steep', 'Steep 2:30', NULL, NULL, NULL, 150, NULL, NULL, NULL, NULL),
  (6, 4, 'stir', 'Gentle stir', NULL, NULL, 5, NULL, 1, 'stir', NULL, NULL),
  (6, 5, 'drain', 'Open the valve', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (7, 0, 'grind', 'Grind coarse', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (7, 1, 'add_water', 'Add cold water', 1000, 1000, 60, NULL, NULL, NULL, 20, NULL),
  (7, 2, 'steep', 'Steep 16 h', NULL, NULL, NULL, 57600, NULL, NULL, NULL,
   'Refrigerate overnight.'),
  (7, 3, 'drain', 'Filter', NULL, NULL, NULL, NULL, NULL, NULL, NULL,
   'Filter through paper or cloth.'),

  (8, 0, 'dose', 'Dose 18 g', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (8, 1, 'grind', 'Grind fine', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (8, 2, 'tap', 'Distribute and tamp', NULL, NULL, NULL, NULL, 1, 'tap', NULL, NULL),
  (8, 3, 'extract', 'Pull the shot', NULL, NULL, 28, NULL, NULL, NULL, 93,
   'Target 36 g out.'),
  (8, 4, 'stop', 'Stop on weight', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (9, 0, 'fill_water', 'Fill the base', 150, 150, NULL, NULL, NULL, NULL, NULL,
   'Hot water up to the valve.'),
  (9, 1, 'fill_grounds', 'Fill the basket', NULL, NULL, NULL, NULL, NULL, NULL, NULL,
   'Level without tamping.'),
  (9, 2, 'assemble', 'Assemble the pot', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (9, 3, 'heat', 'Heat gently', NULL, NULL, NULL, NULL, NULL, NULL, NULL,
   'Lid open; listen for the gurgle.'),
  (9, 4, 'stop', 'Remove from heat', NULL, NULL, NULL, NULL, NULL, NULL, NULL,
   'Cool the base immediately.');
`;
