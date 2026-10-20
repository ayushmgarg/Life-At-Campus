/**
 * Reads the survey data embedded in ../../Final_Dashbaord_NFH.html, validates the
 * reconstructed scoring model against the 37 rows the project already scored,
 * and writes src/data/cohort.json (used for percentile comparison in the game).
 *
 *   node tools/build-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreResponse, socialScoreResponse, Q, WEIGHTS, WEIGHTS_EXTENDED } from '../src/scoring/model.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
// the dashboard file has been renamed before; find whichever copy is present
const parent = path.resolve(root, '..');
const dashboard = fs
  .readdirSync(parent)
  .filter((f) => f.toLowerCase().endsWith('.html') && /dash/i.test(f))
  .map((f) => path.join(parent, f))
  .sort((a, b) => fs.statSync(b).size - fs.statSync(a).size)[0];
if (!dashboard) {
  console.log(
    `No dashboard .html found in ${parent}.
` +
      'src/data/cohort.json is already generated and committed, so this step is optional — ' +
      'it is only needed when the survey data changes.',
  );
  process.exit(0);
}
console.log('reading', path.basename(dashboard));

const html = fs.readFileSync(dashboard, 'utf8');
const start = html.indexOf('const D=') + 'const D='.length;
const end = html.indexOf(',R=D.responses');
const D = JSON.parse(html.slice(start, end));

const responses = D.responses;
const provided = D.scores;
console.log(`responses: ${responses.length}   already-scored rows: ${provided.length}`);

/* ---- validation against the project's own scored sheet ---- */
const byTs = new Map(responses.map((r) => [r.Timestamp, r]));
const fields = {
  sleep: 'Sleep Score',
  diet: 'Diet Score',
  activity: 'Physical Activity Score',
  screen: 'Screen Time Score',
  academic: 'Academic Stress Score',
  wellbeing: 'Mental Wellbeing Score',
  overall: 'Overall Lifestyle Score',
};
const errs = Object.fromEntries(Object.keys(fields).map((k) => [k, []]));
for (const s of provided) {
  const r = byTs.get(s.Timestamp);
  if (!r) continue;
  const mine = scoreResponse(r);
  for (const [k, col] of Object.entries(fields)) errs[k].push(mine[k] - s[col]);
}
const stat = (a) => ({
  n: a.length,
  exact: a.filter((v) => v === 0).length,
  within2: a.filter((v) => Math.abs(v) <= 2).length,
  maxAbs: Math.max(...a.map(Math.abs)),
  mae: +(a.reduce((x, y) => x + Math.abs(y), 0) / a.length).toFixed(2),
});
const validation = Object.fromEntries(Object.entries(errs).map(([k, a]) => [k, stat(a)]));
console.table(validation);

/* ---- score the whole cohort with the reconstructed model ---- */
const scored = responses.map((r) => ({
  ...scoreResponse(r),
  year: r[Q.year],
  gender: r[Q.gender],
  accommodation: r[Q.accommodation],
  self: r[Q.selfRating],
}));

const sortedBy = (k) => scored.map((s) => s[k]).sort((a, b) => a - b);
const pctile = (arr, p) => {
  const a = [...arr].sort((x, y) => x - y);
  return +a[Math.min(a.length - 1, Math.max(0, Math.round((p / 100) * (a.length - 1))))].toFixed(2);
};
const mean = (a) => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);

const counts = (key, order) => {
  const c = {};
  for (const r of responses) {
    const v = r[key];
    if (v === null || v === undefined || v === '') continue;
    c[v] = (c[v] || 0) + 1;
  }
  const labels = order ? order.filter((l) => c[l] !== undefined) : Object.keys(c);
  return { labels, values: labels.map((l) => c[l]) };
};

const cohort = {
  source: 'College Lifestyle Dashboard — Google Form responses (Final_Dashbaord_NFH.html)',
  n: responses.length,
  nPreScored: provided.length,
  validation,
  weights: WEIGHTS,
  weightsExtended: WEIGHTS_EXTENDED,
  means: Object.fromEntries(
    [...Object.keys(WEIGHTS_EXTENDED), 'overall', 'overallExtended'].map((k) => [
      k, mean(scored.map((s) => s[k])),
    ]),
  ),
  sorted: Object.fromEntries(
    [...Object.keys(WEIGHTS_EXTENDED), 'overall', 'overallExtended'].map((k) => [k, sortedBy(k)]),
  ),
  selfRatingMean: mean(responses.map((r) => r[Q.selfRating]).filter((v) => typeof v === 'number')),
  byYear: Object.entries(
    scored.reduce((acc, s) => {
      (acc[s.year] ||= []).push(s.overall);
      return acc;
    }, {}),
  )
    .map(([year, arr]) => ({ year, n: arr.length, overall: mean(arr) }))
    .sort((a, b) => a.year.localeCompare(b.year)),
  distributions: {
    sleep: counts(Q.sleepHours, [
      'Less than 4 hours',
      '4–5 hours',
      '5–6 hours',
      '6–7 hours',
      '7–8 hours',
      '8–9 hours',
      'More than 9 hours',
    ]),
    exercise: counts(Q.exerciseDays, ['0 days', '1–2 days', '3–4 days', '5–6 days', '7 days']),
    screen: counts(Q.screenHours, [
      'Less than 2 hours',
      '2–4 hours',
      '4–6 hours',
      '6–8 hours',
      '8–10 hours',
      'More than 10 hours',
    ]),
    junk: counts(Q.junk, ['Never', '1–2 times', '3–4 times', '5–6 times', 'Daily or more']),
    water: counts(Q.water, [
      'Less than 1 litre',
      '1–1.5 litres',
      '1.5–2 litres',
      '2–3 litres',
      'More than 3 litres',
    ]),
    stress: counts(Q.stress, [1, 2, 3, 4, 5]),
    preSleep: counts(Q.preSleepScreens, ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']),
    skipMeals: counts(Q.skipMeals, ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']),
  },
  headline: {
    shortSleepPct: Math.round(
      (responses.filter((r) =>
        ['Less than 4 hours', '4–5 hours', '5–6 hours'].includes(r[Q.sleepHours]),
      ).length /
        responses.length) *
        100,
    ),
    highStressPct: Math.round(
      (responses.filter((r) => Number(r[Q.stress]) >= 4).length / responses.length) * 100,
    ),
    noExercisePct: Math.round(
      (responses.filter((r) => r[Q.exerciseDays] === '0 days').length / responses.length) * 100,
    ),
    highScreenPct: Math.round(
      (responses.filter((r) => ['8–10 hours', 'More than 10 hours'].includes(r[Q.screenHours]))
        .length /
        responses.length) *
        100,
    ),
    skipMealsPct: Math.round(
      (responses.filter((r) => ['Often', 'Always', 'Sometimes'].includes(r[Q.skipMeals])).length /
        responses.length) *
        100,
    ),
  },
};


/* ---- a "typical day" for the cohort, used as the day-1 prior in the sim ---- */
const mid = (map) => (key, fallback) => (map[key] === undefined ? fallback : map[key]);
const sleepMid = mid({ 'Less than 4 hours': 3.5, '4–5 hours': 4.5, '5–6 hours': 5.5, '6–7 hours': 6.5, '7–8 hours': 7.5, '8–9 hours': 8.5, 'More than 9 hours': 9.5 });
const junkMid = mid({ Never: 0, '1–2 times': 1.5, '3–4 times': 3.5, '5–6 times': 5.5, 'Daily or more': 8 });
const waterMid = mid({ 'Less than 1 litre': 0.7, '1–1.5 litres': 1.25, '1.5–2 litres': 1.75, '2–3 litres': 2.5, 'More than 3 litres': 3.4 });
const freqMid = mid({ Never: 0, Rarely: 1, Sometimes: 3, Often: 5, Always: 6.5 });
const exDaysMid = mid({ '0 days': 0, '1–2 days': 1.5, '3–4 days': 3.5, '5–6 days': 5.5, '7 days': 7 });
const exMinMid = mid({ None: 0, 'Less than 15 minutes': 8, '15–30 minutes': 22, '31–60 minutes': 45, 'More than 60 minutes': 75 });
const screenMid = mid({ 'Less than 2 hours': 1.5, '2–4 hours': 3, '4–6 hours': 5, '6–8 hours': 7, '8–10 hours': 9, 'More than 10 hours': 11 });
const studyMid = mid({ 'Less than 1 hour': 0.5, '1–2 hours': 1.5, '2–3 hours': 2.5, '3–4 hours': 3.5, '4–6 hours': 5, 'More than 6 hours': 7 });
const faceMid = mid({ 'Less than 30 minutes': 20, '30 minutes–1 hour': 45, '1–2 hours': 90, '2–3 hours': 150, 'More than 3 hours': 210 });
const supportMid = mid({ Yes: 100, Sometimes: 55, No: 10 });
const FACE = 'How much time do you spend interacting face-to-face with friends or people close to you each day?';

const avgOf = (fn, key, fallback) => mean(responses.map((r) => fn(r[key], fallback)).filter((v) => typeof v === 'number'));

cohort.typicalDay = {
  sleepHours: avgOf(sleepMid, Q.sleepHours, 6.5),
  rested: mean(responses.map((r) => r[Q.rested]).filter((v) => typeof v === 'number')),
  meals: mean(responses.map((r) => (r[Q.meals] === '5 or more' ? 5 : Number(r[Q.meals]))).filter(Number.isFinite)),
  junkPerDay: +(avgOf(junkMid, Q.junk, 2) / 7).toFixed(3),
  water: avgOf(waterMid, Q.water, 1.8),
  skippedFrac: +(avgOf(freqMid, Q.skipMeals, 3) / 7).toFixed(3),
  exerciseMinutes: avgOf(exMinMid, Q.exerciseMinutes, 20),
  exerciseDayFrac: +(avgOf(exDaysMid, Q.exerciseDays, 2) / 7).toFixed(3),
  screenHours: avgOf(screenMid, Q.screenHours, 7),
  preSleepFrac: +(avgOf(freqMid, Q.preSleepScreens, 4) / 7).toFixed(3),
  studyHours: avgOf(studyMid, Q.studyHours, 2),
  socialMinutes: avgOf(faceMid, FACE, 60),
  support: avgOf(supportMid, Q.support, 55),
};
console.log('typical day:', cohort.typicalDay);


/* ---- social pillar extras + anomaly thresholds ---- */
const faceMinutesOf = mid({
  'Less than 30 minutes': 20, '30 minutes–1 hour': 45, '1–2 hours': 90,
  '2–3 hours': 150, 'More than 3 hours': 210,
});
const meetDaysOf = mid({ Never: 0, Rarely: 0.5, '1–2 times a week': 1.5, '3–4 times a week': 3.5, 'Almost every day': 6 });
const freqPerWeekOf = mid({ Never: 0, Rarely: 0.5, Sometimes: 2, Often: 4, 'Very often': 6, Always: 6 });

cohort.typicalDay.faceMinutes = avgOf(faceMinutesOf, Q.faceTime, 90);
cohort.typicalDay.meetDaysFrac = +(avgOf(meetDaysOf, Q.meetUps, 1.5) / 7).toFixed(3);
cohort.typicalDay.deepTalkFrac = +(avgOf(freqPerWeekOf, Q.deepTalk, 2) / 7).toFixed(3);
cohort.typicalDay.outingFrac = +(avgOf(freqPerWeekOf, Q.outings, 2) / 7).toFixed(3);
cohort.typicalDay.socialScore = mean(responses.map(socialScoreResponse));

cohort.socialItems = {
  faceTime: counts(Q.faceTime, ['Less than 30 minutes', '30 minutes–1 hour', '1–2 hours', '2–3 hours', 'More than 3 hours']),
  meetUps: counts(Q.meetUps, ['Never', 'Rarely', '1–2 times a week', '3–4 times a week', 'Almost every day']),
  deepTalk: counts(Q.deepTalk, ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often']),
  support: counts(Q.support, ['Yes', 'Sometimes', 'No', 'Prefer not to say']),
  outings: counts(Q.outings, ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often']),
  connected: counts(Q.connected, [1, 2, 3, 4, 5]),
};

// cut-offs used to flag anomalous days in the simulator's reports
const sleepNums = responses.map((r) => sleepMid(r[Q.sleepHours], 6.5));
const screenNums = responses.map((r) => screenMid(r[Q.screenHours], 7));
const faceNums = responses.map((r) => faceMinutesOf(r[Q.faceTime], 90));
const shareBelow = (arr, v) => Math.round((arr.filter((x) => x < v).length / arr.length) * 100);
const shareAbove = (arr, v) => Math.round((arr.filter((x) => x > v).length / arr.length) * 100);
cohort.thresholds = {
  sleepLow: 5, sleepVeryLow: 4, sleepHigh: 10,
  screenHigh: 10, screenVeryHigh: 12,
  faceLow: 30, mealsLow: 1, junkHigh: 3, waterLow: 1,
};
cohort.cohortShare = {
  sleepUnder5: shareBelow(sleepNums, 5),
  sleepUnder4: shareBelow(sleepNums, 4),
  screenOver10: shareAbove(screenNums, 10),
  faceUnder30: shareBelow(faceNums, 30),
  p10Sleep: pctile(sleepNums, 10),
  p90Screen: pctile(screenNums, 90),
};
console.log('social mean:', cohort.typicalDay.socialScore, 'thresholds:', cohort.thresholds);

const outDir = path.join(root, 'src', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cohort.json'), JSON.stringify(cohort, null, 1));
console.log('wrote src/data/cohort.json   cohort mean overall =', cohort.means.overall);
console.log('headline:', cohort.headline);
