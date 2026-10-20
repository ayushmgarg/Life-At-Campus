import { create } from 'zustand';
import {
  ACTIONS, COMMUTES, DAY_LIMIT, DAY_START, LOCATIONS, MODIFIERS, WEEK_LENGTH,
} from './config.js';
import { CARRY_OVER } from './actions.extra.js';
import cohort from '../data/cohort.json';
import {
  applyMeters, blockedActions, clamp, DAY_NAMES, detectAnomalies, emptyDay, locById, mergeAgg,
  pickEvent, restedFrom, routeTo, scoreFrom, weeklyAggregates,
} from './engine.js';

const WALK_PX_PER_MIN = 78; // world units of walking per in-game minute
const WALK_PX_PER_SEC = 430; // on-screen walking speed

let floatId = 0;

const startState = () => ({
  phase: 'intro',
  model: 'project',
  modifiers: [],
  anomalies: [],
  profile: { name: '', year: '3rd Year', stay: 'Hostel resident', commute: 'Public transport', avatar: 0 },
  day: 1,
  timeMin: DAY_START,
  meters: { energy: 72, fullness: 55, hydration: 55, mood: 60, social: 55, stress: 38 },
  today: emptyDay(),
  history: [],
  scoreHistory: [],
  assignments: 2,
  classDays: 0,
  attendedDays: 0,
  startSleepHours: 6.5,
  startRested: 3,
  pos: { x: 180, y: 330 },
  path: [],
  walking: false,
  anim: 'idle',
  facing: 1,
  atLocation: 'hostel',
  openLocation: null,
  pendingEvent: null,
  firedEvents: [],
  lastScreenEnd: -999,
  floaters: [],
  log: [],
  dayReport: null,
  weekReport: null,
  sleepPrompt: false,
  busy: null,
});

export const useGame = create((set, get) => ({
  ...startState(),

  /* ---------------- lifecycle ---------------- */
  reset: () => set({ ...startState(), model: get().model }),

  setModel: (model) => set({ model }),

  start: (profile) => {
    const home = profile.stay === 'Hostel resident' ? 'hostel' : 'home';
    set({
      ...startState(),
      model: get().model,
      profile,
      phase: 'playing',
      atLocation: home,
      pos: { ...locById(home).door },
      log: [
        {
          t: DAY_START,
          text: `Monday, 6:00 AM. ${
            !profile.name || profile.name === 'You' ? 'You wake' : `${profile.name} wakes`
          } up after 6.5 hours of sleep.`,
        },
      ],
    });
    if (profile.stay !== 'Hostel resident') get().commute();
  },

  /* ---------------- derived ---------------- */
  aggregates: () => {
    const s = get();
    return weeklyAggregates(s.history, s.today, s.timeMin, s.meters, {
      assignments: s.assignments,
      startSleepHours: s.startSleepHours,
      startRested: s.startRested,
    });
  },
  score: () => scoreFrom(get().aggregates()),

  attendancePct: () => {
    const s = get();
    return Math.round(((78 * 3 + s.attendedDays * 100) / (3 + s.classDays)) || 78);
  },

  /* ---------------- feedback ---------------- */
  float: (text, kind = 'info') => {
    const id = ++floatId;
    set((s) => ({ floaters: [...s.floaters, { id, text, kind }] }));
    setTimeout(() => set((s) => ({ floaters: s.floaters.filter((f) => f.id !== id) })), 2100);
  },
  say: (text) => set((s) => ({ log: [...s.log.slice(-40), { t: s.timeMin, text }] })),

  /* ---------------- movement ---------------- */
  goTo: (locId) => {
    const s = get();
    if (s.walking || s.phase !== 'playing' || s.pendingEvent) return;
    const loc = locById(locId);
    if (!loc) return;
    if (s.atLocation === locId) { set({ openLocation: locId }); return; }
    const path = routeTo(s.pos, loc.door);
    set({ path, walking: true, anim: 'walk', atLocation: null, openLocation: null, destination: locId });
  },

  /** click-to-walk anywhere on the map */
  goToPoint: (pt) => {
    const s = get();
    if (s.walking || s.phase !== 'playing' || s.pendingEvent) return;
    set({ path: [pt], walking: true, anim: 'walk', atLocation: null, openLocation: null, destination: null });
  },

  /** called from the animation loop */
  step: (dt) => {
    const s = get();
    if (!s.walking || !s.path.length) return;
    let remaining = WALK_PX_PER_SEC * dt;
    let { x, y } = s.pos;
    let path = s.path;
    let facing = s.facing;
    let moved = 0;
    while (remaining > 0 && path.length) {
      const target = path[0];
      const dx = target.x - x;
      const dy = target.y - y;
      const d = Math.hypot(dx, dy);
      if (d <= remaining) {
        x = target.x; y = target.y; remaining -= d; moved += d; path = path.slice(1);
      } else {
        x += (dx / d) * remaining; y += (dy / d) * remaining; moved += remaining; remaining = 0;
      }
      if (Math.abs(dx) > 2) facing = dx > 0 ? 1 : -1;
    }
    set({ pos: { x, y }, path, facing, walkedPx: (s.walkedPx || 0) + moved });
    if (!path.length) get().arrive();
  },

  arrive: () => {
    const s = get();
    const px = s.walkedPx || 0;
    const mins = Math.max(5, Math.round(px / WALK_PX_PER_MIN / 5) * 5);
    set({ walking: false, anim: 'idle', walkedPx: 0, atLocation: s.destination, openLocation: s.destination });
    get().advance(mins, { energy: -1.5 }, { exerciseMinutes: mins * 0.5 });
    get().say(
      s.destination
        ? `Walked to ${locById(s.destination).name} — ${mins} min.`
        : `Walked around campus — ${mins} min.`,
    );
    if (s.destination) get().maybeEvent();
  },

  /* ---------------- time & actions ---------------- */
  advance: (mins, meterDelta = {}, agg = {}) => {
    const s = get();
    set({
      timeMin: s.timeMin + mins,
      meters: applyMeters(s.meters, meterDelta, mins),
      today: mergeAgg(s.today, agg),
      assignments: clamp(s.assignments + (agg.assignments || 0), 0, 12),
    });
    const after = get();
    if (after.meters.energy < 16 && after.meters.energy > 0 && s.meters.energy >= 16) {
      get().say('Running on empty — you need sleep or food.');
    }
    if (after.timeMin >= DAY_LIMIT && after.phase === 'playing') {
      get().say('2 AM. You cannot keep your eyes open.');
      get().finishDay({ wake: 7.5 * 60, collapsed: true });
    } else if (after.meters.energy <= 0 && after.phase === 'playing') {
      get().say('Energy gone. You fall asleep where you are.');
      get().finishDay({ wake: 7.5 * 60, collapsed: true });
    }
  },

  doAction: (actionId) => {
    const s = get();
    if (s.phase !== 'playing' || s.pendingEvent || s.busy) return;
    const a = ACTIONS.find((x) => x.id === actionId);
    if (!a) return;
    if (blockedActions(s.modifiers).has(a.id)) {
      get().say('Not today — see the status bar.');
      return;
    }
    if (a.after && s.timeMin < a.after) return;
    if (a.windows && !a.windows.some(([from, to]) => s.timeMin >= from && s.timeMin <= to)) return;
    if (a.sleep) { set({ sleepPrompt: a.stayOver ? 'partner' : true, openLocation: null }); return; }

    const before = get().score().overall;
    set({ anim: a.anim || 'idle', busy: a.id, openLocation: null });

    get().advance(a.mins, a.m, a.agg);
    if (a.agg && (a.agg.screenHours || a.id === 'scroll' || a.id === 'series')) {
      set({ lastScreenEnd: get().timeMin });
    }
    if (a.agg && a.agg.attended) set((st) => ({ attendedDays: st.attendedDays + 1, classDays: st.classDays + 1 }));
    if (a.id === 'bunk') set((st) => ({ classDays: st.classDays + 1 }));

    get().say(`${a.icon} ${a.label}${a.mins ? ` (${a.mins} min)` : ''}.`);
    const after = get().score().overall;
    const d = after - before;
    if (Math.abs(d) >= 0.5) get().float(`${d > 0 ? '+' : ''}${d.toFixed(1)} score`, d > 0 ? 'good' : 'bad');
    for (const [k, v] of Object.entries(a.m || {})) {
      if (Math.abs(v) >= 8) get().float(`${k} ${v > 0 ? '+' : ''}${Math.round(v)}`, metersGood(k, v) ? 'good' : 'bad');
    }

    setTimeout(() => {
      set({ busy: null, anim: 'idle' });
      if (get().phase === 'playing') { get().maybeEvent(); set({ openLocation: get().atLocation }); }
    }, 850);
  },

  /* ---------------- events ---------------- */
  maybeEvent: () => {
    const s = get();
    if (s.pendingEvent || s.phase !== 'playing') return;
    if (s.timeMin - (s.lastEventAt ?? -999) < 150) return; // no two events back to back
    if (Math.random() > 0.3) return;
    const ev = pickEvent(
      {
        ...s,
        attendance: get().attendancePct(),
        yesterday: s.history[s.history.length - 1],
      },
      s.firedEvents,
    );
    if (ev) set({ pendingEvent: ev, openLocation: null, lastEventAt: s.timeMin });
  },

  resolveEvent: (index) => {
    const s = get();
    const ev = s.pendingEvent;
    if (!ev) return;
    const c = ev.choices[index];
    set({ pendingEvent: null, firedEvents: [...s.firedEvents, ev.id] });
    const eff = c.effect || {};
    get().advance(eff.time || 0, eff.m || {}, eff.agg || {});
    if (eff.modifier) get().addModifier(eff.modifier, eff.modifierDays);
    if (eff.agg && eff.agg.allNighter) {
      set({ lastScreenEnd: get().timeMin });
      get().say('All-nighter pulled.');
    }
    get().say(`${ev.icon} ${ev.title} — ${c.label}.`);
    if (get().phase === 'playing') set({ openLocation: get().atLocation });
  },

  /* ---------------- modifiers (illness, injury, exam week…) ---------------- */
  addModifier: (id, days) => {
    const def = MODIFIERS[id];
    if (!def) return;
    const s = get();
    if (s.modifiers.some((m) => m.id === id)) return;
    set({ modifiers: [...s.modifiers, { id, daysLeft: days ?? def.days }] });
    get().say(`${def.icon} ${def.label} — ${def.note}`);
    get().float(`${def.icon} ${def.label}`, 'bad');
  },

  clearModifier: (id) => set((s) => ({ modifiers: s.modifiers.filter((m) => m.id !== id) })),

  /* ---------------- sleep & day boundary ---------------- */
  finishDay: ({ wake, collapsed = false, stayOver = false }) => {
    const s = get();
    const bed = s.timeMin;
    const wakeAbs = wake + 24 * 60;
    const sleepHours = clamp((wakeAbs - bed) / 60, 0, 12);
    const preSleepScreen = bed - s.lastScreenEnd <= 45 ? 1 : 0;

    // habits and conditions that cost sleep quality rather than sleep length
    let restedPenalty = collapsed ? 0.7 : 0;
    if (s.today.alcohol) restedPenalty += CARRY_OVER.alcohol.rested * -1;
    restedPenalty += (s.today.caffeine || 0) * -CARRY_OVER.caffeine.perUnitRested;
    restedPenalty += (s.today.smoke || 0) * -CARRY_OVER.smoke.perUnitRested;
    if (s.today.windDown) restedPenalty -= 0.3;
    for (const m of s.modifiers) restedPenalty += MODIFIERS[m.id]?.restedPenalty || 0;
    const rested = restedFrom(sleepHours, s.meters.stress, preSleepScreen) - restedPenalty;

    const day = {
      ...s.today,
      sleepHours,
      rested: clamp(rested, 1, 5),
      preSleepScreen,
      bedTime: bed,
      wakeTime: wake,
      meals: s.today.meals,
      skipped: s.today.meals === 0 ? Math.max(1, s.today.skipped) : s.today.skipped,
    };

    const history = [...s.history, day];
    const dayAnomalies = detectAnomalies(day, cohort, DAY_NAMES[(s.day - 1) % 7]);
    const metersAtBed = s.meters;
    const report = {
      dayIndex: s.day,
      name: DAY_NAMES[(s.day - 1) % 7],
      day,
      meters: metersAtBed,
      score: scoreFrom(
        weeklyAggregates(history, emptyDay(), DAY_START + 18 * 60, metersAtBed, {
          assignments: s.assignments,
          startSleepHours: s.startSleepHours,
          startRested: s.startRested,
        }),
      ),
    };

    report.anomalies = dayAnomalies;
    set({ history, anomalies: [...s.anomalies, ...dayAnomalies], scoreHistory: [...s.scoreHistory, report.score], dayReport: report, phase: s.day >= WEEK_LENGTH ? 'weekReport' : 'dayReport', sleepPrompt: false, stayOver });

    if (s.day >= WEEK_LENGTH) {
      const agg = weeklyAggregates(history, emptyDay(), DAY_START + 18 * 60, metersAtBed, {
        assignments: s.assignments,
        startSleepHours: s.startSleepHours,
        startRested: s.startRested,
      });
      set({ weekReport: { agg, score: scoreFrom(agg), history, attendance: get().attendancePct() } });
    }
  },

  sleepNow: (wake, stayOver = false) => get().finishDay({ wake, stayOver }),

  nextDay: () => {
    const s = get();
    const last = s.history[s.history.length - 1];
    const wake = last.wakeTime;
    const restedBonus = last.rested - 3;
    let meters = {
      energy: clamp(18 + (last.sleepHours / 8) * 72 + restedBonus * 5),
      fullness: clamp(s.meters.fullness - 28),
      hydration: clamp(s.meters.hydration - 22, 12, 100),
      mood: clamp(s.meters.mood + restedBonus * 5 - 2),
      social: clamp(s.meters.social - 5),
      stress: clamp(s.meters.stress - restedBonus * 7 + 3),
    };

    // last night's drinking lands this morning
    const notes = [];
    if (last.alcohol) {
      meters = applyMeters(meters, CARRY_OVER.alcohol.next, 0);
      notes.push(`${'🍻'} ${CARRY_OVER.alcohol.note}`);
    }
    if (last.smoke) meters = applyMeters(meters, CARRY_OVER.smoke.next, 0);

    // modifiers tick down and take their toll
    const modifiers = [];
    let extraAssignments = 0;
    for (const m of s.modifiers) {
      const def = MODIFIERS[m.id];
      if (!def) continue;
      if (def.dayStart) meters = applyMeters(meters, def.dayStart, 0);
      if (def.assignmentsPerDay) extraAssignments += def.assignmentsPerDay;
      const treatedToday = last.treated && (m.id === 'fever' || m.id === 'foodPoisoning');
      const left = m.daysLeft - (treatedToday ? 2 : 1);
      if (left > 0) modifiers.push({ ...m, daysLeft: left });
      else notes.push(`${def.icon} ${def.label} has passed.`);
    }

    const newDay = s.day + 1;
    const weekday = ((newDay - 1) % 7) < 5;
    const home = s.profile.stay === 'Hostel resident' ? 'hostel' : 'home';
    const startLoc = s.stayOver ? 'partner' : home;

    set({
      day: newDay,
      timeMin: wake,
      meters,
      today: emptyDay(),
      phase: 'playing',
      dayReport: null,
      atLocation: startLoc,
      openLocation: null,
      pos: { ...locById(startLoc).door },
      assignments: clamp(s.assignments + (weekday ? 1 : 0) + extraAssignments, 0, 14),
      lastScreenEnd: -999,
      stayOver: false,
      modifiers,
      log: [
        ...s.log.slice(-40),
        {
          t: wake,
          text: `${DAY_NAMES[(newDay - 1) % 7]}. Woke up after ${Math.round(last.sleepHours * 10) / 10} h — ${last.rested >= 4 ? 'rested' : last.rested >= 3 ? 'okay' : 'still tired'}.`,
        },
        ...notes.map((text) => ({ t: wake, text })),
      ],
    });
    if (s.stayOver) {
      get().advance(45, { energy: -5, stress: 3 }, {});
      get().say('45-minute ride back to campus.');
    } else if (s.profile.stay !== 'Hostel resident') {
      get().commute();
    }
  },

  commute: () => {
    const s = get();
    const c = COMMUTES[s.profile.commute] || COMMUTES['Public transport'];
    get().advance(c.mins, c.m, c.agg);
    get().say(`${c.icon} Commute to college — ${c.mins} min by ${s.profile.commute.toLowerCase()}.`);
    const gate = locById('lecture');
    set({ pos: { ...gate.door }, atLocation: 'lecture', openLocation: null });
  },

  closePanel: () => set({ openLocation: null }),
  openPanel: (id) => set({ openLocation: id }),
  dismissSleepPrompt: () => set({ sleepPrompt: false }),
}));

// handy during development: drive the simulation from the console
if (import.meta.env && import.meta.env.DEV && typeof window !== 'undefined') {
  window.__game = useGame;
}

function metersGood(k, v) {
  return k === 'stress' ? v < 0 : v > 0;
}

export const LOCATION_LIST = LOCATIONS;
