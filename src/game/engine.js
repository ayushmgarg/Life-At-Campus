/** Pure game logic: aggregation, scoring bridge, pathfinding, events. */
import {
  scoreSimulation, CATEGORY_LABELS, CATEGORY_KEYS, percentile, weightsFor, overallFor,
} from '../scoring/model.js';
import cohort from '../data/cohort.json';
import {
  ACTIONS, ARCHETYPES, ADVICE, DAY_START, DRAIN, EVENTS, LOCATIONS, MODIFIERS, ROAD_EDGES, ROAD_NODES,
} from './config.js';

export const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
export const r1 = (v) => Math.round(v * 10) / 10;

export const emptyDay = () => ({
  sleepHours: 0, rested: 0, meals: 0, junk: 0, water: 0, skipped: 0,
  exerciseMinutes: 0, screenHours: 0, studyHours: 0, socialMinutes: 0,
  animalMinutes: 0, intimacy: 0, support: 0, attended: 0, bunked: 0, classes: 0,
  allNighter: 0, preSleepScreen: 0, assignmentsCleared: 0, bedTime: null, wakeTime: null,
  // social detail
  digitalSocial: 0, deepTalk: 0, meetUp: 0, outing: 0,
  // wider habits
  caffeine: 0, smoke: 0, alcohol: 0, conflict: 0, offline: 0, windDown: 0,
  chores: 0, work: 0, volunteer: 0, counselling: 0, cooked: 0, treated: 0,
});

export const fmtTime = (min) => {
  const m = ((min % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = String(Math.floor(m % 60)).padStart(2, '0');
  const ap = h24 >= 12 && h24 < 24 ? 'PM' : 'AM';
  let h = h24 % 12;
  if (h === 0) h = 12;
  return `${h}:${mm} ${ap}`;
};

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* ------------------------------------------------------------------ *
 * Aggregation: in-game days -> the survey quantities -> score
 * ------------------------------------------------------------------ */

/**
 * Until the player has generated a few days of their own data, the week is
 * blended with a "typical day" computed from the 137 survey responses, with a
 * weight of one day that decays as real days accumulate (day 1: 1.0, day 2:
 * 0.5, day 7: 0.17). Without it the first morning would report 0 activity and
 * a perfect screen score purely because nothing has happened yet.
 */
export const TYPICAL = cohort.typicalDay;

export function weeklyAggregates(history, today, timeMin, meters, extra) {
  const days = [...history];
  const dayFraction = clamp((timeMin - DAY_START) / (18 * 60), 0.3, 1);
  const w = 1 / (1 + days.length); // weight of the cohort prior, in days
  const n = days.length + dayFraction + w;
  const raw = (k) => days.reduce((s, d) => s + (d[k] || 0), 0) + (today[k] || 0);
  const sum = (k, priorPerDay) => raw(k) + (priorPerDay || 0) * w;

  // nights actually slept, plus the prior night
  const nights = history.filter((d) => d.sleepHours > 0);
  const sleepHours =
    (nights.reduce((s, d) => s + d.sleepHours, 0) + TYPICAL.sleepHours * w) / (nights.length + w);
  const rested =
    (nights.reduce((s, d) => s + d.rested, 0) + TYPICAL.rested * w) / (nights.length + w);

  const exerciseDayCount =
    days.filter((d) => d.exerciseMinutes >= 20).length +
    (today.exerciseMinutes >= 20 ? 1 : 0) +
    TYPICAL.exerciseDayFrac * w;
  const skippedDays =
    days.filter((d) => d.skipped > 0).length + (today.skipped > 0 ? 1 : 0) + TYPICAL.skippedFrac * w;
  const preSleepNights =
    days.filter((d) => d.preSleepScreen > 0).length + TYPICAL.preSleepFrac * w;
  const preSleepDenom = days.length + w;

  const socialPerDay = sum('socialMinutes', TYPICAL.socialMinutes) / n;
  const animalPerDay = raw('animalMinutes') / n;

  const stress = 1 + (meters.stress / 100) * 4;
  const mood = 1 + (meters.mood / 100) * 4;
  const connection = clamp(1 + (meters.social / 100) * 3.4 + Math.min(socialPerDay / 150, 0.6), 1, 5);
  const overwhelm = clamp(1 + extra.assignments * 0.45 + (meters.stress / 100) * 2.6, 1, 5);
  const anxiety = clamp(
    1 + (meters.stress / 100) * 2.4 + (1 - meters.mood / 100) * 1.8 - (animalPerDay / 60) * 0.3,
    1, 5,
  );
  const ownSupport = clamp(10 + raw('support') * 16 + (socialPerDay > 60 ? 15 : 0), 10, 100);
  const support = (ownSupport * (n - w) + TYPICAL.support * w) / n;

  /* ---- social & relationships pillar inputs ---- */
  const digitalPerDay = sum('digitalSocial', 0) / n;
  const faceMinutes = Math.max(0, socialPerDay - digitalPerDay);
  const allDays = [...days, today];
  const faceOf = (d) => Math.max(0, (d.socialMinutes || 0) - (d.digitalSocial || 0));
  const meetDaysRaw = days.filter((d) => d.meetUp > 0 || faceOf(d) >= 45).length +
    (today.meetUp > 0 || faceOf(today) >= 45 ? 1 : 0);
  const socialDays = allDays.filter((d) => faceOf(d) >= 30).length;
  const lonelyDays = days.filter((d) => faceOf(d) < 20).length + (faceOf(today) < 20 ? 1 : 0);
  const studyScreenPerDay = (sum('studyHours', TYPICAL.studyHours) + sum('screenHours', TYPICAL.screenHours)) / n;
  const balance = clamp(35 + (socialPerDay / 60) * 22 - Math.max(0, studyScreenPerDay - 6) * 6);

  return {
    sleepHours, rested,
    mealsPerDay: sum('meals', TYPICAL.meals) / n,
    junkPerWeek: (sum('junk', TYPICAL.junkPerDay) / n) * 7,
    waterLitres: sum('water', TYPICAL.water) / n,
    skippedMealDays: (skippedDays / n) * 7,
    exerciseDays: (exerciseDayCount / n) * 7,
    exerciseMinutes: sum('exerciseMinutes', TYPICAL.exerciseMinutes) / n,
    screenHours: sum('screenHours', TYPICAL.screenHours) / n,
    preSleepNights: (preSleepNights / preSleepDenom) * 7,
    studyHours: sum('studyHours', TYPICAL.studyHours) / n,
    socialMinutes: socialPerDay,
    stress, overwhelm, mood, connection, anxiety, support,
    // social pillar
    faceMinutes: (faceMinutes * (n - w) + TYPICAL.socialMinutes * 0.75 * w) / n,
    digitalSocial: digitalPerDay,
    meetDays: (meetDaysRaw / n) * 7,
    deepTalks: (sum('deepTalk', 0.4) / n) * 7,
    outings: (sum('outing', 0.3) / n) * 7,
    socialDayShare: socialDays / Math.max(1, allDays.length),
    lonelyDayShare: lonelyDays / Math.max(1, allDays.length),
    balance,
    socialMeter: meters.social,
    moodMeter: meters.mood,
    // habits (reported, not scored directly)
    caffeinePerDay: raw('caffeine') / n,
    smokesPerWeek: (raw('smoke') / n) * 7,
    drinkNights: raw('alcohol'),
    offlineHours: raw('offline') / n,
    workDays: raw('work'),
    choresDays: raw('chores'),
    daysCounted: n,
    priorWeight: w,
  };
}

export const scoreFrom = (agg) => scoreSimulation(agg);

/** Weakest / strongest category under the active model. */
export function weakest(cat, model = 'project') {
  const keys = CATEGORY_KEYS[model] || CATEGORY_KEYS.project;
  return keys.reduce((a, b) => (cat[a] <= cat[b] ? a : b));
}
export function strongest(cat, model = 'project') {
  const keys = CATEGORY_KEYS[model] || CATEGORY_KEYS.project;
  return keys.reduce((a, b) => (cat[a] >= cat[b] ? a : b));
}

export function archetypeOf(cat) {
  return ARCHETYPES.find((a) => a.test(cat)) || ARCHETYPES[ARCHETYPES.length - 1];
}

export function adviceFor(cat, model = 'project') {
  const w = weakest(cat, model);
  return { key: w, label: CATEGORY_LABELS[w], lines: ADVICE[w] };
}

/**
 * What is actually moving the score right now: each pillar's distance from the
 * cohort average, multiplied by its weight. Positive = pulling the score up.
 */
export function scoreDrivers(cat, cohort, model = 'project') {
  const weights = weightsFor(model);
  return (CATEGORY_KEYS[model] || CATEGORY_KEYS.project)
    .map((k) => ({
      key: k,
      label: CATEGORY_LABELS[k],
      value: cat[k],
      cohort: cohort.means[k],
      points: +((cat[k] - cohort.means[k]) * weights[k]).toFixed(1),
    }))
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
}

/**
 * Days that fall outside what the survey cohort looks like. Thresholds and the
 * "n% of the cohort" lines both come from the 137 responses.
 */
export function detectAnomalies(day, cohort, dayName = '') {
  const t = cohort.thresholds;
  const share = cohort.cohortShare;
  const out = [];
  const face = Math.max(0, (day.socialMinutes || 0) - (day.digitalSocial || 0));
  const push = (icon, text, severity = 'warn') => out.push({ icon, text, severity, day: dayName });

  if (day.sleepHours && day.sleepHours < t.sleepVeryLow) {
    push('🌙', `${r1(day.sleepHours)} h of sleep — only ${share.sleepUnder4}% of the cohort sleeps this little`, 'bad');
  } else if (day.sleepHours && day.sleepHours < t.sleepLow) {
    push('🌙', `${r1(day.sleepHours)} h of sleep — bottom ${share.sleepUnder5}% of the cohort`);
  }
  if (day.sleepHours > t.sleepHigh) push('🛌', `${r1(day.sleepHours)} h in bed — oversleeping scores lower than 7–9 h`);
  if (day.screenHours >= t.screenVeryHigh) {
    push('📱', `${r1(day.screenHours)} h of screens — above all but ${share.screenOver10}% of the cohort`, 'bad');
  } else if (day.screenHours >= t.screenHigh) {
    push('📱', `${r1(day.screenHours)} h of screens — top ${share.screenOver10}% of the cohort`);
  }
  if (day.meals <= t.mealsLow) push('🍽️', `${day.meals} meal${day.meals === 1 ? '' : 's'} all day`, 'bad');
  if (day.junk >= t.junkHigh) push('🍟', `${day.junk} junk meals in one day`);
  if (day.water < t.waterLow) push('💧', `${r1(day.water)} L of water — under a litre`);
  if (face < t.faceLow) push('🫥', `${Math.round(face)} min face-to-face — ${share.faceUnder30}% of the cohort is this isolated`);
  if (day.allNighter) push('☕', 'All-nighter pulled');
  if (day.exerciseMinutes === 0) push('🪑', 'No movement at all today');
  if (day.alcohol) push('🍻', 'Drinking — sleep quality and tomorrow both take the hit');
  if (day.caffeine >= 2) push('🥤', `${day.caffeine} energy drinks / late coffees`);
  if (day.smoke >= 2) push('🚬', `${day.smoke} smoke breaks`);
  if (day.conflict) push('💢', 'A fight in the group chat');
  return out;
}

export function weekAnomalies(history, cohort) {
  return history.flatMap((d, i) => detectAnomalies(d, cohort, DAY_NAMES[i % 7]));
}

export function cohortStanding(cohort, cat, model = 'project') {
  const out = {};
  for (const k of Object.keys(CATEGORY_LABELS)) {
    out[k] = percentile(cohort.sorted[k], cat[k]);
  }
  out.overall = percentile(
    model === 'extended' ? cohort.sorted.overallExtended : cohort.sorted.overall,
    overallFor(cat, model),
  );
  return out;
}

/* ------------------------------------------------------------------ *
 * Pathfinding over the road graph
 * ------------------------------------------------------------------ */

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const nodeById = Object.fromEntries(ROAD_NODES.map((n) => [n.id, n]));
const neighbours = {};
for (const [a, b] of ROAD_EDGES) {
  (neighbours[a] ||= []).push(b);
  (neighbours[b] ||= []).push(a);
}
const nearestNode = (p) =>
  ROAD_NODES.reduce((best, n) => (dist(n, p) < dist(best, p) ? n : best), ROAD_NODES[0]);

/** Dijkstra between road nodes, then stitch start/end points on. */
export function routeTo(from, to) {
  const a = nearestNode(from);
  const b = nearestNode(to);
  if (a.id === b.id) return [a, to];
  const prev = {}; const dd = { [a.id]: 0 }; const seen = new Set();
  const queue = [a.id];
  while (queue.length) {
    queue.sort((x, y) => (dd[x] ?? 1e9) - (dd[y] ?? 1e9));
    const cur = queue.shift();
    if (cur === b.id) break;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const nb of neighbours[cur] || []) {
      const alt = dd[cur] + dist(nodeById[cur], nodeById[nb]);
      if (alt < (dd[nb] ?? 1e9)) { dd[nb] = alt; prev[nb] = cur; queue.push(nb); }
    }
  }
  const path = [];
  let cur = b.id;
  while (cur) { path.unshift(nodeById[cur]); cur = prev[cur]; }
  return [...path, to];
}

export const pathLength = (points, from) => {
  let total = 0; let p = from;
  for (const q of points) { total += dist(p, q); p = q; }
  return total;
};

/* ------------------------------------------------------------------ *
 * Actions
 * ------------------------------------------------------------------ */

/** Action ids currently blocked by an active modifier (illness, injury, no money…). */
export function blockedActions(modifiers = []) {
  const set = new Set();
  for (const m of modifiers) for (const id of MODIFIERS[m.id]?.blocks || []) set.add(id);
  return set;
}

export function actionsAt(locId, state) {
  const blocked = blockedActions(state.modifiers);
  return ACTIONS.filter((a) => {
    if (!a.loc.includes(locId)) return false;
    if (blocked.has(a.id)) return false;
    if (a.after && state.timeMin < a.after) return false;
    if (a.windows && !a.windows.some(([s, e]) => state.timeMin >= s && state.timeMin <= e)) return false;
    if (a.id === 'lectures' && state.today.classes > 0) return false;
    if (a.id === 'bunk' && state.today.classes > 0) return false;
    return true;
  });
}

export const locById = (id) => LOCATIONS.find((l) => l.id === id);

export function visibleLocations(state) {
  return LOCATIONS.filter((l) => !l.onlyIf || l.onlyIf(state));
}

/* ------------------------------------------------------------------ *
 * Meters
 * ------------------------------------------------------------------ */

export function applyMeters(meters, delta = {}, minutes = 0) {
  const out = { ...meters };
  const slots = minutes / 30;
  for (const k of Object.keys(DRAIN)) out[k] = (out[k] ?? 50) + DRAIN[k] * slots;
  for (const [k, v] of Object.entries(delta)) out[k] = (out[k] ?? 50) + v;
  // knock-on effects of neglect
  if (out.fullness < 25) { out.mood -= 2 * slots; out.stress += 1.6 * slots; }
  if (out.hydration < 25) { out.energy -= 1.6 * slots; out.mood -= 1 * slots; }
  if (out.energy < 20) { out.stress += 1.4 * slots; out.mood -= 1.2 * slots; }
  for (const k of Object.keys(out)) out[k] = clamp(out[k]);
  return out;
}

export function mergeAgg(today, agg = {}, mult = 1) {
  const out = { ...today };
  for (const [k, v] of Object.entries(agg)) {
    if (k === 'assignments') continue;
    out[k] = (out[k] || 0) + v * mult;
  }
  return out;
}

/** How rested you wake up (survey item, 1-5). */
export function restedFrom(sleepHours, stressAtBed, preSleepScreen) {
  const base = sleepHours >= 7 && sleepHours <= 9 ? 4.6
    : sleepHours >= 6 ? 3.8
      : sleepHours >= 5 ? 3.0
        : sleepHours >= 4 ? 2.2 : 1.5;
  const v = base - (stressAtBed / 100) * 1.3 - (preSleepScreen ? 0.5 : 0) + (sleepHours > 9.5 ? -0.4 : 0);
  return clamp(v, 1, 5);
}

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

/**
 * Ordinary events are common; anomalies are rare by design — roughly one in
 * four eligible draws, so a week usually carries one or two of them.
 */
export function pickEvent(state, firedIds) {
  const pool = EVENTS.filter((e) => !firedIds.includes(e.id) && safeWhen(e, state));
  if (!pool.length) return null;
  const anomalies = pool.filter((e) => e.anomaly);
  const ordinary = pool.filter((e) => !e.anomaly);
  const wantAnomaly = anomalies.length && (!ordinary.length || Math.random() < 0.26);
  const chosen = wantAnomaly ? anomalies : ordinary;
  return chosen[Math.floor(Math.random() * chosen.length)];
}
const safeWhen = (e, s) => { try { return e.when(s); } catch { return false; } };

/* ------------------------------------------------------------------ *
 * Day report text
 * ------------------------------------------------------------------ */

export function dayHeadlines(day) {
  const out = [];
  out.push(`${r1(day.sleepHours)} h sleep · woke ${day.rested >= 4 ? 'rested' : day.rested >= 3 ? 'okay' : 'tired'}`);
  out.push(`${day.meals} meal${day.meals === 1 ? '' : 's'}${day.junk ? ` (${day.junk} junk)` : ''}${day.skipped ? ' · skipped one' : ''}`);
  out.push(`${Math.round(day.water * 10) / 10} L water`);
  out.push(day.exerciseMinutes ? `${Math.round(day.exerciseMinutes)} min active` : 'no exercise');
  out.push(`${r1(day.screenHours)} h screens${day.preSleepScreen ? ' · screens before bed' : ''}`);
  out.push(day.socialMinutes ? `${Math.round(day.socialMinutes)} min with people` : 'no face-to-face time');
  if (day.studyHours) out.push(`${r1(day.studyHours)} h study`);
  if (day.animalMinutes) out.push(`${Math.round(day.animalMinutes)} min with the dogs`);
  return out;
}

export { CATEGORY_LABELS };
