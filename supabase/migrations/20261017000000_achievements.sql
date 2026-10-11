-- ORIXA achievements: 12 XP badges, 4 trophies, 4 special badges.
-- Everything is derived from the authoritative COMPLETED rows in quiz_attempts, so a retry or a second
-- evaluation can never award anything twice (student_achievements has a primary key per student+achievement).
-- Calendar days (Consistency Champion) are counted in Asia/Kolkata from the server's completed_at timestamp.

BEGIN;

CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  display_order INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('XP_BADGE', 'TROPHY', 'SPECIAL')),
  description TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('LIFETIME_XP', 'PERFECT_QUIZ', 'DAYS_IN_WINDOW', 'THREE_STAR_QUIZZES', 'COMPLETED_QUIZZES')),
  threshold INTEGER NOT NULL CHECK (threshold > 0),
  rarity TEXT NOT NULL CHECK (rarity IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'SPECIAL')),
  asset_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.student_achievements (
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  evidence JSONB,
  PRIMARY KEY (student_id, achievement_id)
);

ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS achievement_definitions_select ON public.achievement_definitions;
CREATE POLICY achievement_definitions_select ON public.achievement_definitions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS student_achievements_select_own ON public.student_achievements;
CREATE POLICY student_achievements_select_own ON public.student_achievements
  FOR SELECT TO authenticated USING (student_id = auth.uid());

-- Nobody writes these tables directly: unlocks happen only through fn_evaluate_my_achievements()
REVOKE ALL ON public.achievement_definitions FROM anon, authenticated;
REVOKE ALL ON public.student_achievements FROM anon, authenticated;
GRANT SELECT ON public.achievement_definitions TO authenticated;
GRANT SELECT ON public.student_achievements TO authenticated;

INSERT INTO public.achievement_definitions (id, display_order, name, category, description, requirement_type, threshold, rarity, asset_key) VALUES
  ('first-spark',          1,  'First Spark',          'XP_BADGE', 'Reach 100 lifetime XP',    'LIFETIME_XP', 100,   'BRONZE',   'first-spark'),
  ('curious-mind',         2,  'Curious Mind',         'XP_BADGE', 'Reach 200 lifetime XP',    'LIFETIME_XP', 200,   'BRONZE',   'curious-mind'),
  ('knowledge-seeker',     3,  'Knowledge Seeker',     'XP_BADGE', 'Reach 300 lifetime XP',    'LIFETIME_XP', 300,   'BRONZE',   'knowledge-seeker'),
  ('rising-scholar',       4,  'Rising Scholar',       'XP_BADGE', 'Reach 500 lifetime XP',    'LIFETIME_XP', 500,   'BRONZE',   'rising-scholar'),
  ('quick-learner',        5,  'Quick Learner',        'XP_BADGE', 'Reach 750 lifetime XP',    'LIFETIME_XP', 750,   'SILVER',   'quick-learner'),
  ('brain-builder',        6,  'Brain Builder',        'XP_BADGE', 'Reach 1,000 lifetime XP',  'LIFETIME_XP', 1000,  'SILVER',   'brain-builder'),
  ('quiz-champion',        7,  'Quiz Champion',        'XP_BADGE', 'Reach 1,500 lifetime XP',  'LIFETIME_XP', 1500,  'SILVER',   'quiz-champion'),
  ('master-scholar',       8,  'Master Scholar',       'XP_BADGE', 'Reach 2,000 lifetime XP',  'LIFETIME_XP', 2000,  'SILVER',   'master-scholar'),
  ('knowledge-guardian',   9,  'Knowledge Guardian',   'XP_BADGE', 'Reach 3,000 lifetime XP',  'LIFETIME_XP', 3000,  'GOLD',     'knowledge-guardian'),
  ('elite-thinker',        10, 'Elite Thinker',        'XP_BADGE', 'Reach 5,000 lifetime XP',  'LIFETIME_XP', 5000,  'GOLD',     'elite-thinker'),
  ('grand-scholar',        11, 'Grand Scholar',        'XP_BADGE', 'Reach 7,500 lifetime XP',  'LIFETIME_XP', 7500,  'PLATINUM', 'grand-scholar'),
  ('legendary-intellect',  12, 'Legendary Intellect',  'XP_BADGE', 'Reach 10,000 lifetime XP', 'LIFETIME_XP', 10000, 'PLATINUM', 'legendary-intellect'),
  ('bronze-scholar',       13, 'Bronze Scholar',       'TROPHY',   'Reach 1,000 lifetime XP',  'LIFETIME_XP', 1000,  'BRONZE',   'bronze-scholar'),
  ('silver-champion',      14, 'Silver Champion',      'TROPHY',   'Reach 3,000 lifetime XP',  'LIFETIME_XP', 3000,  'SILVER',   'silver-champion'),
  ('golden-champion',      15, 'Golden Champion',      'TROPHY',   'Reach 6,000 lifetime XP',  'LIFETIME_XP', 6000,  'GOLD',     'golden-champion'),
  ('orixa-legend',         16, 'ORIXA Legend',         'TROPHY',   'Reach 10,000 lifetime XP', 'LIFETIME_XP', 10000, 'PLATINUM', 'orixa-legend'),
  ('perfect-performance',  17, 'Perfect Performance',  'SPECIAL',  'Score 100% on a completed quiz', 'PERFECT_QUIZ', 1, 'SPECIAL', 'perfect-performance'),
  ('consistency-champion', 18, 'Consistency Champion', 'SPECIAL',  'Complete quizzes on 7 different days within 14 days', 'DAYS_IN_WINDOW', 7, 'SPECIAL', 'consistency-champion'),
  ('three-star-master',    19, 'Three-Star Master',    'SPECIAL',  'Earn three stars on 10 completed quizzes', 'THREE_STAR_QUIZZES', 10, 'SPECIAL', 'three-star-master'),
  ('unstoppable-learner',  20, 'Unstoppable Learner',  'SPECIAL',  'Successfully complete 50 quizzes', 'COMPLETED_QUIZZES', 50, 'SPECIAL', 'unstoppable-learner')
ON CONFLICT (id) DO UPDATE SET
  display_order = EXCLUDED.display_order, name = EXCLUDED.name, category = EXCLUDED.category,
  description = EXCLUDED.description, requirement_type = EXCLUDED.requirement_type,
  threshold = EXCLUDED.threshold, rarity = EXCLUDED.rarity, asset_key = EXCLUDED.asset_key;

-- The student's progress numbers, from completed attempts only
CREATE OR REPLACE FUNCTION private_auth.achievement_progress(p_student_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH done AS (
    SELECT final_earned_xp, final_accuracy_pct, final_stars,
           (completed_at AT TIME ZONE 'Asia/Kolkata')::date AS day
    FROM public.quiz_attempts
    WHERE student_id = p_student_id AND status = 'COMPLETED'
  ),
  days AS (SELECT DISTINCT day FROM done WHERE day IS NOT NULL),
  window_best AS (
    SELECT COALESCE(MAX(c), 0) AS best
    FROM (SELECT (SELECT COUNT(*) FROM days d2 WHERE d2.day BETWEEN d1.day - 13 AND d1.day) AS c FROM days d1) x
  )
  SELECT jsonb_build_object(
    'lifetime_xp',        COALESCE((SELECT SUM(final_earned_xp) FROM done), 0),
    'completed_quizzes',  (SELECT COUNT(*) FROM done),
    'three_star_quizzes', (SELECT COUNT(*) FROM done WHERE final_stars = 3),
    'perfect_quizzes',    (SELECT COUNT(*) FROM done WHERE final_accuracy_pct = 100),
    'best_days_in_14',    (SELECT best FROM window_best)
  );
$$;
REVOKE ALL ON FUNCTION private_auth.achievement_progress(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.fn_get_achievement_state()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;
  RETURN private_auth.achievement_progress(v_uid) || jsonb_build_object(
    'unlocked', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('achievement_id', achievement_id, 'unlocked_at', unlocked_at))
      FROM public.student_achievements WHERE student_id = v_uid
    ), '[]'::jsonb)
  );
END;
$$;

-- Unlocks everything the student now qualifies for and returns only the achievements unlocked by THIS call
CREATE OR REPLACE FUNCTION public.fn_evaluate_my_achievements()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_progress JSONB;
  v_new JSONB := '[]'::jsonb;
  v_def RECORD;
  v_value BIGINT;
  v_inserted TEXT;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND role = 'STUDENT') THEN
    RETURN jsonb_build_object('newly_unlocked', '[]'::jsonb);
  END IF;

  -- one evaluation per student at a time, so concurrent finishes cannot interleave
  PERFORM pg_advisory_xact_lock(hashtextextended('achievements:' || v_uid::text, 0));

  v_progress := private_auth.achievement_progress(v_uid);

  FOR v_def IN
    SELECT * FROM public.achievement_definitions WHERE is_active ORDER BY display_order
  LOOP
    v_value := CASE v_def.requirement_type
      WHEN 'LIFETIME_XP'        THEN (v_progress->>'lifetime_xp')::bigint
      WHEN 'PERFECT_QUIZ'       THEN (v_progress->>'perfect_quizzes')::bigint
      WHEN 'DAYS_IN_WINDOW'     THEN (v_progress->>'best_days_in_14')::bigint
      WHEN 'THREE_STAR_QUIZZES' THEN (v_progress->>'three_star_quizzes')::bigint
      WHEN 'COMPLETED_QUIZZES'  THEN (v_progress->>'completed_quizzes')::bigint
    END;

    IF v_value >= v_def.threshold THEN
      v_inserted := NULL;
      INSERT INTO public.student_achievements (student_id, achievement_id, evidence)
      VALUES (v_uid, v_def.id, jsonb_build_object('value', v_value, 'threshold', v_def.threshold))
      ON CONFLICT (student_id, achievement_id) DO NOTHING
      RETURNING achievement_id INTO v_inserted;

      IF v_inserted IS NOT NULL THEN
        v_new := v_new || to_jsonb(v_inserted);
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('newly_unlocked', v_new);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_get_achievement_state() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_evaluate_my_achievements() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_get_achievement_state() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_evaluate_my_achievements() TO authenticated;

COMMIT;
