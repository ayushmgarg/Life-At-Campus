/**
 * Lifestyle Score model.
 *
 * Reconstructed from the project's own scored dataset: the 37 rows in the
 * "Lifestyle Scores" sheet of College_Lifestyle_Dashboard_-_Merged_Responses.xlsx
 * (same rows embedded in Final_Dashbaord_NFH.html) were regressed against their
 * survey answers. Sleep, Physical Activity, Screen Time and Academic Stress come
 * back exactly; Diet is reproduced to +/-2 points; Mental Wellbeing is the one
 * category the sheet does not reproduce additively, so it is a fitted
 * approximation (see METHOD_NOTES below).
 *
 * Category weights are the ones stated in the project document:
 * Sleep 20, Diet 15, Physical Activity 20, Screen Time 15, Academic Stress 15,
 * Mental Wellbeing 15.
 */

/**
 * Model A — "project model": exactly the weights in the project document.
 * Section J (socialising) is collected by the form but carries no weight here,
 * because it carries none in the project's scored sheet.
 */
export const WEIGHTS = {
  sleep: 0.2,
  diet: 0.15,
  activity: 0.2,
  screen: 0.15,
  academic: 0.15,
  wellbeing: 0.15,
};

/**
 * Model B — "extended model": the same six pillars scaled down proportionally
 * to make room for a seventh built from the form's own Section J (social and
 * relationships, 12%). Social connection is one of the strongest non-clinical
 * predictors of health and wellbeing outcomes, the form already measures it in
 * ten items, and almost half of that pillar is in-person contact specifically —
 * so the extended model is where face-to-face time pays off.
 */
export const WEIGHTS_EXTENDED = {
  sleep: 0.18,
  diet: 0.13,
  activity: 0.18,
  screen: 0.13,
  academic: 0.13,
  wellbeing: 0.13,
  social: 0.12,
};

export const MODELS = {
  project: { id: 'project', label: 'Project model', weights: WEIGHTS, note: 'The six pillars and weights from the project document.' },
  extended: {
    id: 'extended',
    label: 'Extended (+Social)',
    weights: WEIGHTS_EXTENDED,
    note: 'Adds a seventh pillar built from the Section J questions, weighted 12%.',
  },
};

export const weightsFor = (model) => (model === 'extended' ? WEIGHTS_EXTENDED : WEIGHTS);

export const CATEGORY_LABELS = {
  sleep: 'Sleep',
  diet: 'Diet & Nutrition',
  activity: 'Physical Activity',
  screen: 'Screen Time',
  academic: 'Academic Stress',
  wellbeing: 'Mental Wellbeing',
  social: 'Social & Relationships',
};

/** Keys scored by each model, in display order. */
export const CATEGORY_KEYS = {
  project: ['sleep', 'diet', 'activity', 'screen', 'academic', 'wellbeing'],
  extended: ['sleep', 'diet', 'activity', 'screen', 'academic', 'wellbeing', 'social'],
};

/* ------------------------------------------------------------------ *
 * Lookup tables (0-100 per survey item)
 * ------------------------------------------------------------------ */

export const TABLES = {
  // Sleep = 0.5 * hours + 0.5 * "feel rested" (1-5)
  sleepHours: {
    'Less than 4 hours': 20,
    '4–5 hours': 40,
    '5–6 hours': 60,
    '6–7 hours': 80,
    '7–8 hours': 100,
    '8–9 hours': 100,
    'More than 9 hours': 80, // no rows in the dataset; oversleeping penalised per the doc
  },
  // Diet = mean of meals / junk / water / skipped meals
  meals: { 1: 20, 2: 60, 3: 100, 4: 100, '5 or more': 80 },
  junk: {
    Never: 100,
    '1–2 times': 80,
    '3–4 times': 60,
    '5–6 times': 35,
    'Daily or more': 10,
  },
  water: {
    'Less than 1 litre': 20,
    '1–1.5 litres': 40,
    '1.5–2 litres': 60,
    '2–3 litres': 90,
    'More than 3 litres': 90,
  },
  skipMeals: { Never: 100, Rarely: 80, Sometimes: 60, Often: 30, Always: 10 },
  // Physical activity = 0.5 * days/week + 0.5 * minutes/day
  exerciseDays: { '0 days': 0, '1–2 days': 30, '3–4 days': 65, '5–6 days': 85, '7 days': 100 },
  exerciseMinutes: {
    None: 0,
    'Less than 15 minutes': 20,
    '15–30 minutes': 50,
    '31–60 minutes': 80,
    'More than 60 minutes': 100,
  },
  // Screen = 0.5 * daily screen hours + 0.5 * pre-sleep screen frequency
  screenHours: {
    'Less than 2 hours': 100,
    '2–4 hours': 100,
    '4–6 hours': 86,
    '6–8 hours': 66,
    '8–10 hours': 40,
    'More than 10 hours': 20,
  },
  preSleepScreens: { Never: 100, Rarely: 70, Sometimes: 50, Often: 20, Always: 0 },
  // Wellbeing
  anxiety: { Never: 100, Rarely: 75, Sometimes: 50, Often: 25, Always: 0 },
  socialSupport: { Yes: 100, Sometimes: 55, No: 10 },
};

/** Section J — social & relationships. Weights sum to 1 inside the pillar. */
export const SOCIAL_ITEMS = [
  { key: 'faceTime', weight: 0.16, label: 'Face-to-face time per day', inPerson: true },
  { key: 'meetUps', weight: 0.13, label: 'Meeting people in person outside class', inPerson: true },
  { key: 'deepTalk', weight: 0.13, label: 'Meaningful face-to-face conversations', inPerson: true },
  { key: 'satisfaction', weight: 0.12, label: 'Satisfaction with your relationships' },
  { key: 'support', weight: 0.11, label: 'Someone to talk to on a bad day' },
  { key: 'makeTime', weight: 0.09, label: 'Making time for people despite the workload' },
  { key: 'quality', weight: 0.08, label: 'Not short of quality time (reversed)' },
  { key: 'balance', weight: 0.07, label: 'Social life balanced with responsibilities' },
  { key: 'outings', weight: 0.06, label: 'Outings and recreation with people', inPerson: true },
  { key: 'connected', weight: 0.05, label: 'Overall sense of connection' },
];

export const SOCIAL_TABLES = {
  faceTime: {
    'Less than 30 minutes': 20, '30 minutes–1 hour': 45, '1–2 hours': 70,
    '2–3 hours': 90, 'More than 3 hours': 95,
  },
  meetUps: { Never: 0, Rarely: 25, '1–2 times a week': 55, '3–4 times a week': 80, 'Almost every day': 100 },
  freq5: { Never: 0, Rarely: 25, Sometimes: 55, Often: 80, 'Very often': 100, Always: 100 },
  quality: { Never: 100, Rarely: 80, Sometimes: 55, Often: 25, Always: 0 },
  support: { Yes: 100, Sometimes: 55, No: 10, None: 10, 'Prefer not to say': 55 },
};

export const METHOD_NOTES = {
  sleep: 'Sleep = 50% sleep-duration band + 50% "do you wake up rested" (1–5). Reproduces all 37 scored rows exactly. All-nighters carry no weight in the original sheet.',
  diet: 'Diet = equal quarters of meals/day, junk-food frequency, water intake and skipped meals. Reproduces the scored rows to within 2 points.',
  activity: 'Physical Activity = 50% exercise days/week + 50% minutes of activity/day. Reproduces all 37 rows exactly. Commute mode carries no weight in the original sheet.',
  screen: 'Screen Time = 50% total daily screen hours + 50% how often screens are used in the 30 minutes before sleep. Reproduces all 37 rows exactly. Social-media hours and pre-sleep duration carry no weight in the original sheet.',
  academic: 'Academic Stress = 50% inverted stress rating + 50% inverted "overwhelmed by workload" rating, both 1–5. Reproduces all 37 rows exactly. Study hours, clubs and attendance carry no weight in the original sheet.',
  social: 'Social & Relationships is built from the ten Section J questions the form already asks. Nearly half the pillar (face-to-face time, meeting people in person, meaningful in-person conversations, outings) is in-person contact rather than contact through a screen. It is scored and shown in both models, but only carries weight in the extended model.',
  wellbeing: 'Mental Wellbeing is the one category the sheet does not reproduce from a fixed table (identical answer triples carry different scores there). This model uses the best additive fit: mood 35%, campus connection 30%, inverted anxiety/burnout 20%, "someone to talk to" 15%.',
};

const likert = (v) => ((Number(v) - 1) / 4) * 100;
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const round = (v) => Math.round(v + 1e-9);

/* ------------------------------------------------------------------ *
 * Scoring one survey response
 * ------------------------------------------------------------------ */

export const Q = {
  sleepHours: 'On average, how many hours do you sleep per night?',
  rested: 'How often do you feel rested when you wake up?',
  allNighters: 'How many all-nighters do you pull in a typical month?',
  meals: 'How many meals do you typically eat per day?',
  junk: 'How often do you eat outside food or junk food in a typical week?',
  water: 'Approximately how much water do you drink per day?',
  skipMeals: 'How often do you skip meals due to classes or deadlines?',
  exerciseDays: 'On how many days per week do you exercise or play sports?',
  exerciseMinutes: 'How much time do you spend on physical activity on a typical day?',
  commute: 'How do you usually commute to college?',
  screenHours: 'How many hours per day do you spend using screens, including your phone and laptop?',
  socialMedia: 'How many hours per day do you spend on social media?',
  preSleepScreens: 'How often do you use screens within 30 minutes before sleeping?',
  studyHours: 'How many hours per day do you study or complete assignments outside class?',
  stress: 'How would you rate your current stress level?',
  overwhelm: 'How often do you feel overwhelmed by academic workload?',
  clubs: 'How many extracurricular activities or clubs are you part of?',
  attendance: 'What is your approximate college attendance percentage?',
  mood: 'How would you rate your overall mood or happiness over the past two weeks?',
  connection: 'How socially connected do you feel on campus?',
  anxiety: 'How often have you felt anxious or emotionally burnt out over the past two weeks?',
  support: 'Do you have someone you can comfortably talk to when you are stressed or having a difficult day?',
  selfRating: 'On a scale of 1–10, how would you rate your overall lifestyle and daily habits?',
  faceTime: 'How much time do you spend interacting face-to-face with friends or people close to you each day?',
  meetUps: 'How often do you meet friends or people close to you in person outside of classes?',
  deepTalk: 'How often do you have meaningful face-to-face conversations with people close to you?',
  satisfaction: 'How satisfied are you with the quality of your social interactions and personal relationships?',
  makeTime: 'How often do you make time for people important to you despite your academic workload?',
  qualityTime: 'How often do you feel you do not get enough quality time with people close to you?',
  balance: 'How balanced are your social life and personal relationships alongside your other responsibilities?',
  outings: 'How often do you participate in outings or recreational activities with friends or people close to you?',
  connected: 'Overall, how connected do you feel to the people in your life?',
  year: 'Which year of study are you in?',
  gender: 'What is your gender?',
  accommodation: 'What is your mode of accommodation?',
};

const look = (table, key, fallback = null) => {
  const v = table[key];
  return v === undefined ? fallback : v;
};

/** Section J composite for one survey response (0-100). */
export function socialScoreResponse(r) {
  const parts = {
    faceTime: look(SOCIAL_TABLES.faceTime, r[Q.faceTime], 60),
    meetUps: look(SOCIAL_TABLES.meetUps, r[Q.meetUps], 55),
    deepTalk: look(SOCIAL_TABLES.freq5, r[Q.deepTalk], 55),
    satisfaction: likert(r[Q.satisfaction] ?? 3),
    support: look(SOCIAL_TABLES.support, r[Q.support], 55),
    makeTime: look(SOCIAL_TABLES.freq5, r[Q.makeTime], 55),
    quality: look(SOCIAL_TABLES.quality, r[Q.qualityTime], 55),
    balance: likert(r[Q.balance] ?? 3),
    outings: look(SOCIAL_TABLES.freq5, r[Q.outings], 55),
    connected: likert(r[Q.connected] ?? 3),
  };
  return SOCIAL_ITEMS.reduce((sum, it) => sum + parts[it.key] * it.weight, 0);
}

/** Score one raw Google-Form response row. Returns null-safe category scores. */
export function scoreResponse(r) {
  const sleep =
    0.5 * look(TABLES.sleepHours, r[Q.sleepHours], 60) + 0.5 * likert(r[Q.rested] ?? 3);

  const diet =
    (look(TABLES.meals, r[Q.meals], 60) +
      look(TABLES.junk, r[Q.junk], 60) +
      look(TABLES.water, r[Q.water], 50) +
      look(TABLES.skipMeals, r[Q.skipMeals], 60)) /
    4;

  const activity =
    0.5 * look(TABLES.exerciseDays, r[Q.exerciseDays], 30) +
    0.5 * look(TABLES.exerciseMinutes, r[Q.exerciseMinutes], 20);

  const screen =
    0.5 * look(TABLES.screenHours, r[Q.screenHours], 66) +
    0.5 * look(TABLES.preSleepScreens, r[Q.preSleepScreens], 50);

  const academic = 0.5 * (100 - likert(r[Q.stress] ?? 3)) + 0.5 * (100 - likert(r[Q.overwhelm] ?? 3));

  const wellbeing =
    0.35 * likert(r[Q.mood] ?? 3) +
    0.3 * likert(r[Q.connection] ?? 3) +
    0.2 * look(TABLES.anxiety, r[Q.anxiety], 50) +
    0.15 * look(TABLES.socialSupport, r[Q.support], 55);

  const social = socialScoreResponse(r);
  return finalise({ sleep, diet, activity, screen, academic, wellbeing, social });
}

/**
 * Rounds the pillars and computes both overall scores: `overall` follows the
 * project document's weights, `overallExtended` adds the social pillar.
 */
export function finalise(cat) {
  const out = {};
  for (const k of Object.keys(CATEGORY_LABELS)) out[k] = round(clamp(cat[k] ?? 0));
  out.overall = round(Object.keys(WEIGHTS).reduce((s, k) => s + out[k] * WEIGHTS[k], 0));
  out.overallExtended = round(
    Object.keys(WEIGHTS_EXTENDED).reduce((s, k) => s + out[k] * WEIGHTS_EXTENDED[k], 0),
  );
  return out;
}

/** The overall score under the chosen model. */
export const overallFor = (cat, model) => (model === 'extended' ? cat.overallExtended : cat.overall);

/* ------------------------------------------------------------------ *
 * Scoring a simulated week
 * ------------------------------------------------------------------ *
 * The simulator tracks the same quantities the questionnaire asks about, but as
 * continuous weekly aggregates rather than survey bands, so the score can move
 * live. Each aggregate is mapped onto the same 0-100 curve as its survey band,
 * interpolating between band centres so small in-game changes are visible.
 */

/** Piecewise-linear interpolation over [[x, score], ...] sorted by x. */
export function curve(points, x) {
  if (x <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return last[1];
}

/** Hours of sleep per night -> 0-100, anchored on the survey bands. */
export const sleepHoursCurve = (h) =>
  curve(
    [
      [0, 0],
      [3.5, 20],
      [4.5, 40],
      [5.5, 60],
      [6.5, 80],
      [7.5, 100],
      [8.5, 100],
      [9.5, 80],
      [12, 55],
    ],
    h,
  );

export const screenHoursCurve = (h) =>
  curve(
    [
      [0, 100],
      [3, 100],
      [5, 86],
      [7, 66],
      [9, 40],
      [11, 20],
      [16, 5],
    ],
    h,
  );

export const exerciseDaysCurve = (d) =>
  curve(
    [
      [0, 0],
      [1.5, 30],
      [3.5, 65],
      [5.5, 85],
      [7, 100],
    ],
    d,
  );

export const exerciseMinutesCurve = (m) =>
  curve(
    [
      [0, 0],
      [10, 20],
      [22, 50],
      [45, 80],
      [75, 100],
    ],
    m,
  );

export const mealsCurve = (m) =>
  curve(
    [
      [0, 0],
      [1, 20],
      [2, 60],
      [3, 100],
      [4, 100],
      [5, 80],
      [7, 60],
    ],
    m,
  );

export const junkCurve = (perWeek) =>
  curve(
    [
      [0, 100],
      [1.5, 80],
      [3.5, 60],
      [5.5, 35],
      [8, 10],
      [14, 0],
    ],
    perWeek,
  );

export const waterCurve = (litres) =>
  curve(
    [
      [0, 0],
      [0.8, 20],
      [1.25, 40],
      [1.75, 60],
      [2.5, 90],
      [3.5, 90],
      [5, 75],
    ],
    litres,
  );

export const frequencyCurve = (per7days) =>
  // Never / Rarely / Sometimes / Often / Always on a 0-7 days-per-week axis
  curve(
    [
      [0, 100],
      [1, 80],
      [3, 60],
      [5, 30],
      [7, 10],
    ],
    per7days,
  );

export const preSleepCurve = (nightsPerWeek) =>
  curve(
    [
      [0, 100],
      [1, 70],
      [3, 50],
      [5, 20],
      [7, 0],
    ],
    nightsPerWeek,
  );

/* ---- social curves for the simulated week ---- */

export const faceTimeCurve = (minPerDay) =>
  curve([[0, 0], [20, 20], [45, 45], [90, 70], [150, 90], [210, 95]], minPerDay);

export const meetUpsCurve = (daysPerWeek) =>
  curve([[0, 0], [1, 25], [2, 55], [3.5, 80], [6, 100]], daysPerWeek);

export const freqCurve = (perWeek) =>
  curve([[0, 0], [1, 25], [2.5, 55], [4, 80], [6, 100]], perWeek);

export const shareCurve = (share) =>
  curve([[0, 0], [0.2, 25], [0.45, 55], [0.7, 80], [1, 100]], share);

/** Social & relationships pillar for a simulated week. */
export function socialScoreSimulation(a) {
  const parts = {
    faceTime: faceTimeCurve(a.faceMinutes),
    meetUps: meetUpsCurve(a.meetDays),
    deepTalk: freqCurve(a.deepTalks),
    satisfaction: clamp(0.6 * a.socialMeter + 0.4 * a.moodMeter),
    support: a.support,
    makeTime: shareCurve(a.socialDayShare),
    quality: clamp(100 - shareCurve(a.lonelyDayShare)),
    balance: clamp(a.balance),
    outings: freqCurve(a.outings),
    connected: clamp(a.socialMeter),
  };
  return SOCIAL_ITEMS.reduce((sum, it) => sum + parts[it.key] * it.weight, 0);
}

/**
 * Turn the simulator's running weekly aggregates into the category scores.
 * `a` carries per-week averages already divided by days played.
 */
export function scoreSimulation(a) {
  const sleep = 0.5 * sleepHoursCurve(a.sleepHours) + 0.5 * likert(a.rested);
  const diet =
    (mealsCurve(a.mealsPerDay) +
      junkCurve(a.junkPerWeek) +
      waterCurve(a.waterLitres) +
      frequencyCurve(a.skippedMealDays)) /
    4;
  const activity =
    0.5 * exerciseDaysCurve(a.exerciseDays) + 0.5 * exerciseMinutesCurve(a.exerciseMinutes);
  const screen = 0.5 * screenHoursCurve(a.screenHours) + 0.5 * preSleepCurve(a.preSleepNights);
  const academic = 0.5 * (100 - likert(a.stress)) + 0.5 * (100 - likert(a.overwhelm));
  const wellbeing =
    0.35 * likert(a.mood) +
    0.3 * likert(a.connection) +
    0.2 * (100 - likert(a.anxiety)) +
    0.15 * a.support;
  const social = socialScoreSimulation(a);
  return finalise({ sleep, diet, activity, screen, academic, wellbeing, social });
}

/** Percentile of a value inside a sorted cohort array (0-100). */
export function percentile(sorted, value) {
  if (!sorted || !sorted.length) return null;
  let below = 0;
  for (const v of sorted) {
    if (v < value) below++;
    else break;
  }
  return Math.round((below / sorted.length) * 100);
}
