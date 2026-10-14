-- Submitting an answer to a question that was already solved (a student reopening an unfinished quiz) used to
-- return "correct" whatever the answer was. The answer is now checked every time; a wrong answer to an already
-- solved question is reported as wrong and changes nothing in the saved result.
-- Also keeps the Match the Following check from 20261016. Safe to run more than once.
CREATE OR REPLACE FUNCTION public.fn_submit_question_answer(
  p_attempt_id UUID,
  p_question_id UUID,
  p_answer_json JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student_id UUID;
  v_attempt RECORD;
  v_quiz RECORD;
  v_question RECORD;
  v_max_chances INTEGER;
  v_existing RECORD;
  v_is_correct BOOLEAN := false;
  v_prev_mistakes INTEGER := 0;
  v_prev_chances INTEGER := 0;
  v_new_mistakes INTEGER;
  v_new_chances INTEGER;
  v_is_solved BOOLEAN;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_attempt
  FROM public.quiz_attempts
  WHERE id = p_attempt_id;

  IF v_attempt.id IS NULL THEN
    RAISE EXCEPTION 'Attempt not found.';
  END IF;

  IF v_attempt.student_id != v_student_id THEN
    RAISE EXCEPTION 'Unauthorized attempt access.';
  END IF;

  IF v_attempt.status != 'IN_PROGRESS' THEN
    RAISE EXCEPTION 'Attempt is not in progress.';
  END IF;

  SELECT * INTO v_question
  FROM public.quiz_questions
  WHERE id = p_question_id AND quiz_id = v_attempt.quiz_id;

  IF v_question.id IS NULL THEN
    RAISE EXCEPTION 'Question does not belong to the attempt quiz.';
  END IF;

  SELECT * INTO v_quiz
  FROM public.quizzes
  WHERE id = v_attempt.quiz_id;

  v_max_chances := COALESCE(v_question.max_chances, v_quiz.default_max_chances);

  -- Judge the submitted answer first: an already solved question must not call every answer correct
  IF v_quiz.game_type = 'TILE_PUZZLE' THEN
    v_is_correct := (p_answer_json->>'selected_option_index' = v_question.game_payload->>'correct_option_index');
  ELSIF v_quiz.game_type = 'MATCH_FOLLOWING' THEN
    -- Client sends [{id: <prompt pair id>, choice: <chosen pair id>}]; correct iff every id matches its choice
    v_is_correct := jsonb_typeof(p_answer_json->'pairs') = 'array'
                AND jsonb_array_length(p_answer_json->'pairs') = jsonb_array_length(v_question.game_payload->'pairs')
                AND NOT EXISTS (
                  SELECT 1 FROM jsonb_array_elements(p_answer_json->'pairs') AS a(elem)
                  WHERE (a.elem->>'id') IS DISTINCT FROM (a.elem->>'choice')
                     OR NOT (v_question.game_payload->'pairs' @> jsonb_build_array(jsonb_build_object('id', a.elem->>'id')))
                );
  ELSIF v_quiz.game_type = 'FILL_BLANKS' THEN
    v_is_correct := (p_answer_json->'submitted_words' = v_question.game_payload->'correct_words');
  ELSIF v_quiz.game_type = 'TRUE_FALSE' THEN
    v_is_correct := (lower(p_answer_json->>'submitted_boolean') = lower(v_question.game_payload->>'correct_boolean'));
  ELSE
    RAISE EXCEPTION 'Unsupported game type: %', v_quiz.game_type;
  END IF;


  SELECT * INTO v_existing
  FROM public.question_attempts
  WHERE attempt_id = p_attempt_id AND question_id = p_question_id;

  IF v_existing.id IS NOT NULL THEN
    v_prev_mistakes := v_existing.mistakes_count;
    v_prev_chances := v_existing.chances_used;

    IF v_existing.is_solved THEN
      RETURN jsonb_build_object(
        'is_correct', v_is_correct,
        'is_solved', true,
        'chances_used', v_prev_chances,
        'mistakes_count', v_prev_mistakes,
        'max_chances', v_max_chances
      );
    END IF;

    IF v_prev_chances >= v_max_chances THEN
      RAISE EXCEPTION 'Maximum chances exhausted for this question (Attempt ID: %, Question ID: %).', p_attempt_id, p_question_id;
    END IF;
  END IF;

  IF v_is_correct THEN
    v_is_solved := true;
    v_new_mistakes := v_prev_mistakes;
    v_new_chances := v_prev_chances + 1;
  ELSE
    v_is_solved := false;
    v_new_mistakes := v_prev_mistakes + 1;
    v_new_chances := v_prev_chances + 1;
  END IF;

  INSERT INTO public.question_attempts (
    attempt_id,
    quiz_id,
    question_id,
    selected_answer_json,
    mistakes_count,
    chances_used,
    is_solved
  ) VALUES (
    p_attempt_id,
    v_attempt.quiz_id,
    p_question_id,
    p_answer_json,
    v_new_mistakes,
    v_new_chances,
    v_is_solved
  )
  ON CONFLICT (attempt_id, question_id) DO UPDATE SET
    selected_answer_json = EXCLUDED.selected_answer_json,
    mistakes_count = EXCLUDED.mistakes_count,
    chances_used = EXCLUDED.chances_used,
    is_solved = EXCLUDED.is_solved;

  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'is_solved', v_is_solved,
    'mistakes_count', v_new_mistakes,
    'chances_used', v_new_chances,
    'max_chances', v_max_chances
  );
END;
$$;
