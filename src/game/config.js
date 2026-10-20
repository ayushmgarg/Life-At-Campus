import { EXTRA_ACTIONS } from './actions.extra.js';
import { ANOMALIES, MODIFIERS } from './events.extra.js';

/**
 * World, action and event definitions.
 *
 * Every action writes into the same quantities the Google Form asks about
 * (sleep hours, meals, junk meals, water, exercise minutes, screen hours,
 * study hours, stress, mood, social connection), so the live Lifestyle Score
 * is computed from the project's own scoring model and nothing else.
 */

export const SLOT_MIN = 30; // one in-game turn
export const DAY_START = 6 * 60; // 06:00
export const DAY_LIMIT = 26 * 60; // 02:00 next morning — collapse after this
export const WEEK_LENGTH = 7;

export const METERS = {
  energy: { label: 'Energy', icon: '⚡', good: 'high', color: '#f2c14e' },
  fullness: { label: 'Fed', icon: '🍚', good: 'high', color: '#e8865c' },
  hydration: { label: 'Water', icon: '💧', good: 'high', color: '#4bb3d4' },
  mood: { label: 'Mood', icon: '🙂', good: 'high', color: '#5ac79a' },
  social: { label: 'Social', icon: '👥', good: 'high', color: '#9b72e8' },
  stress: { label: 'Stress', icon: '🔥', good: 'low', color: '#e05c5c' },
};

/** Passive drain per 30-minute slot while awake. */
export const DRAIN = { energy: -1.25, fullness: -2.6, hydration: -2.4, mood: -0.32, social: -1.0, stress: 0.65 };

export const WORLD = { w: 1640, h: 1020 };

/* ------------------------------------------------------------------ *
 * Locations
 * ------------------------------------------------------------------ */

export const LOCATIONS = [
  {
    id: 'hostel',
    name: 'Hostel Room',
    short: 'Hostel',
    x: 180, y: 235, door: { x: 180, y: 318 },
    w: 230, h: 150, color: '#c9ddd0', roof: '#7fa894', icon: '🛏️',
    blurb: 'Your room. Bed, charger, and the laptop that eats your night.',
    onlyIf: (s) => s.profile.stay === 'Hostel resident',
  },
  {
    id: 'home',
    name: 'Home',
    short: 'Home',
    x: 180, y: 235, door: { x: 180, y: 318 },
    w: 230, h: 150, color: '#e3d6c3', roof: '#b08f6a', icon: '🏠',
    blurb: 'Family house. Real food, real questions about your CGPA.',
    onlyIf: (s) => s.profile.stay !== 'Hostel resident',
  },
  {
    id: 'lecture',
    name: 'Lecture Hall',
    short: 'Lectures',
    x: 600, y: 200, door: { x: 600, y: 300 },
    w: 280, h: 170, color: '#dfe3ef', roof: '#8d99c4', icon: '🎓',
    blurb: 'Attendance is counted. So is sleeping in the third row.',
  },
  {
    id: 'library',
    name: 'Library',
    short: 'Library',
    x: 1010, y: 205, door: { x: 1010, y: 290 },
    w: 220, h: 150, color: '#ead9c6', roof: '#a8805a', icon: '📚',
    blurb: 'Quiet, cold AC, and the only place assignments actually move.',
  },
  {
    id: 'canteen',
    name: 'Canteen & Mess',
    short: 'Canteen',
    x: 600, y: 540, door: { x: 600, y: 614 },
    w: 250, h: 140, color: '#f6dcc0', roof: '#d09a5a', icon: '🍛',
    blurb: 'Thali, maggi, samosa, cutting chai. Your diet score lives here.',
  },
  {
    id: 'gym',
    name: 'Campus Gym',
    short: 'Gym',
    x: 200, y: 560, door: { x: 200, y: 630 },
    w: 210, h: 130, color: '#d6d9e0', roof: '#6f7686', icon: '🏋️',
    blurb: 'Three machines work. The mirror is always free.',
  },
  {
    id: 'ground',
    name: 'Sports Ground',
    short: 'Ground',
    x: 1240, y: 560, door: { x: 1180, y: 620 },
    w: 320, h: 200, color: '#b8d99a', roof: null, icon: '🏏',
    blurb: 'Evening cricket. Counts as exercise and as friends.',
    open: true,
  },
  {
    id: 'garden',
    name: 'Campus Garden',
    short: 'Garden',
    x: 380, y: 830, door: { x: 380, y: 790 },
    w: 280, h: 150, color: '#aed49b', roof: null, icon: '🌳',
    blurb: 'Benches, a banyan tree, and four campus dogs who know you.',
    open: true,
  },
  {
    id: 'club',
    name: 'Club Room',
    short: 'Club',
    x: 790, y: 830, door: { x: 790, y: 780 },
    w: 200, h: 130, color: '#e7d2ea', roof: '#9b72e8', icon: '🎭',
    blurb: 'Fest work, jam sessions, and a whiteboard nobody erases.',
  },
  {
    id: 'wellness',
    name: 'Health & Counselling Centre',
    short: 'Wellness',
    x: 1010, y: 540, door: { x: 1010, y: 610 },
    w: 210, h: 130, color: '#d7ebe3', roof: '#5aa391', icon: '🩺',
    blurb: 'Campus doctor, free counselling slots, and a very quiet waiting room.',
  },
  {
    id: 'cafe',
    name: 'Chai Café',
    short: 'Café',
    x: 1330, y: 300, door: { x: 1330, y: 370 },
    w: 210, h: 130, color: '#f4cdb4', roof: '#c4714a', icon: '☕',
    blurb: 'Where two hours disappear and nobody regrets it.',
  },
  {
    id: 'street',
    name: 'Street Food Lane',
    short: 'Street',
    x: 1070, y: 830, door: { x: 1070, y: 785 },
    w: 240, h: 120, color: '#f2c9a0', roof: '#b9743b', icon: '🌯',
    blurb: 'Open till 1 AM. Vada pav, rolls, and regret at 2 AM.',
    open: true,
  },
  {
    id: 'partner',
    name: "Partner's Place",
    short: 'Partner',
    x: 1430, y: 760, door: { x: 1400, y: 700 },
    w: 190, h: 120, color: '#f0c3cd', roof: '#c4607a', icon: '💗',
    blurb: 'Closeness, comfort, and a 1 AM auto back to campus.',
  },
];

/* Walkable waypoints so the character takes roads rather than walking through
 * buildings. Simple visibility graph: each location door links to road nodes. */
export const ROAD_NODES = [
  { id: 'r1', x: 180, y: 400 },
  { id: 'r2', x: 600, y: 400 },
  { id: 'r3', x: 1010, y: 400 },
  { id: 'r4', x: 1330, y: 440 },
  { id: 'r5', x: 180, y: 700 },
  { id: 'r6', x: 600, y: 700 },
  { id: 'r7', x: 1010, y: 700 },
  { id: 'r8', x: 1330, y: 700 },
];
export const ROAD_EDGES = [
  ['r1', 'r2'], ['r2', 'r3'], ['r3', 'r4'],
  ['r5', 'r6'], ['r6', 'r7'], ['r7', 'r8'],
  ['r1', 'r5'], ['r2', 'r6'], ['r3', 'r7'], ['r4', 'r8'],
];

/* ------------------------------------------------------------------ *
 * Actions
 * ------------------------------------------------------------------ *
 * mins   : in-game minutes consumed
 * m      : meter deltas
 * agg    : survey-aligned counters written for the day
 * anim   : character animation played at the location
 */

const CORE_ACTIONS = [
  /* ---------------- sleep & room ---------------- */
  {
    id: 'sleep', loc: ['hostel', 'home'], label: 'Sleep', icon: '😴', anim: 'sleep',
    desc: 'End the day. Sleep length is whatever is left before your alarm.',
    sleep: true, mins: 0, m: {}, agg: {},
    tip: 'Sleep is 20% of the score — the single heaviest category.',
  },
  {
    id: 'nap', loc: ['hostel', 'home'], label: 'Power nap', icon: '🥱', anim: 'sleep',
    mins: 60, m: { energy: 16, stress: -4, mood: 2 }, agg: {},
    desc: 'An hour back. Does not count as night sleep.',
  },
  {
    id: 'scroll', loc: ['hostel', 'home', 'canteen', 'library', 'cafe', 'garden'], label: 'Doomscroll', icon: '📱', anim: 'phone',
    mins: 60, m: { energy: -3, mood: 3, stress: 2, social: 2 }, agg: { screenHours: 1 },
    desc: 'Reels. One hour. Screen time is 15% of the score.',
  },
  {
    id: 'series', loc: ['hostel', 'home'], label: 'Binge a series', icon: '📺', anim: 'phone',
    mins: 120, m: { energy: -5, mood: 9, stress: -6, social: -2 }, agg: { screenHours: 2 },
    desc: 'Two episodes become four. Relaxing, expensive in screen hours.',
  },
  {
    id: 'studyRoom', loc: ['hostel', 'home'], label: 'Study in room', icon: '💻', anim: 'study',
    mins: 120, m: { energy: -10, stress: 6, mood: -3 }, agg: { studyHours: 2, screenHours: 1.5, assignments: -1 },
    desc: 'Laptop work. Clears assignment load, adds screen time.',
  },
  {
    id: 'callHome', loc: ['hostel', 'home', 'garden'], label: 'Call home', icon: '📞', anim: 'phone',
    mins: 30, m: { mood: 8, stress: -7, social: 7 }, agg: { screenHours: 0.5, support: 1 },
    desc: 'Twelve minutes of advice, eight of silence. Still helps.',
  },
  {
    id: 'shower', loc: ['hostel', 'home'], label: 'Shower & reset', icon: '🚿', anim: 'idle',
    mins: 30, m: { energy: 6, mood: 5, stress: -5 }, agg: {},
    desc: 'Cheap stress relief.',
  },

  /* ---------------- academics ---------------- */
  {
    id: 'lectures', loc: ['lecture'], label: 'Attend lectures', icon: '🎓', anim: 'class',
    mins: 180, m: { energy: -12, stress: 3, social: 6, fullness: -4 }, agg: { attended: 1, studyHours: 0.5, classes: 1 },
    desc: 'Three hours. Attendance up, energy down.',
    windows: [[8 * 60, 15 * 60]],
  },
  {
    id: 'bunk', loc: ['lecture'], label: 'Bunk with friends', icon: '🚪', anim: 'social',
    mins: 120, m: { energy: 4, mood: 9, stress: -6, social: 14 }, agg: { bunked: 1, socialMinutes: 120 },
    desc: 'Canteen parliament instead of class. Mood up, attendance down.',
    windows: [[8 * 60, 15 * 60]],
  },
  {
    id: 'deepStudy', loc: ['library'], label: 'Deep study', icon: '📖', anim: 'study',
    mins: 150, m: { energy: -13, stress: -2, mood: -2, social: -4 }, agg: { studyHours: 2.5, assignments: -2 },
    desc: 'Phone face down. Best assignment clearance per hour.',
  },
  {
    id: 'groupStudy', loc: ['library'], label: 'Group study', icon: '👩‍💻', anim: 'study',
    mins: 120, m: { energy: -9, stress: -4, social: 10 }, agg: { studyHours: 1.5, assignments: -1, socialMinutes: 60 },
    desc: 'Half work, half gossip. Less output, better for your head.',
  },

  /* ---------------- food ---------------- */
  {
    id: 'thali', loc: ['canteen'], label: 'Full thali', icon: '🍛', anim: 'eat',
    mins: 45, m: { fullness: 46, energy: 14, mood: 4, hydration: 6 }, agg: { meals: 1, water: 0.3 },
    desc: 'Dal, sabzi, rice, roti. A proper meal.',
  },
  {
    id: 'maggi', loc: ['canteen'], label: 'Maggi + samosa', icon: '🍜', anim: 'eat',
    mins: 30, m: { fullness: 28, energy: 9, mood: 7 }, agg: { meals: 1, junk: 1 },
    desc: 'Fast, cheap, comforting. Junk counter +1.',
  },
  {
    id: 'fruit', loc: ['canteen'], label: 'Curd rice & fruit', icon: '🥗', anim: 'eat',
    mins: 30, m: { fullness: 30, energy: 10, hydration: 10, mood: 1 }, agg: { meals: 1, water: 0.3 },
    desc: 'Light, clean, slightly sad. Diet score likes it.',
  },
  {
    id: 'chai', loc: ['canteen', 'cafe'], label: 'Cutting chai with friends', icon: '☕', anim: 'social',
    mins: 45, m: { energy: 9, mood: 8, stress: -7, social: 12, hydration: 4 }, agg: { socialMinutes: 45 },
    desc: 'The campus therapy session.',
  },
  {
    id: 'water', loc: ['canteen', 'gym', 'library', 'garden', 'hostel', 'home'], label: 'Drink water', icon: '💧', anim: 'idle',
    mins: 0, m: { hydration: 26 }, agg: { water: 0.5 },
    desc: 'Half a litre. Free action.',
  },
  {
    id: 'skipMeal', loc: ['lecture', 'library', 'club'], label: 'Skip the meal, keep working', icon: '⏭️', anim: 'study',
    mins: 30, m: { fullness: -8, stress: 5, energy: -6 }, agg: { skipped: 1, studyHours: 0.5 },
    desc: 'Deadline over food. The survey asks about this for a reason.',
  },
  {
    id: 'streetFood', loc: ['street'], label: 'Late-night street food run', icon: '🌯', anim: 'eat',
    mins: 60, m: { fullness: 40, mood: 12, social: 10, energy: 6 }, agg: { meals: 1, junk: 1, socialMinutes: 45 },
    desc: 'Rolls at midnight with the hostel crew. Fun, junk, and a late bed.',
  },
  {
    id: 'homeFood', loc: ['home'], label: 'Home-cooked meal', icon: '🍲', anim: 'eat',
    mins: 45, m: { fullness: 48, energy: 16, mood: 10, hydration: 6, stress: -4 }, agg: { meals: 1, water: 0.3, socialMinutes: 20 },
    desc: 'The day-scholar advantage.',
  },

  /* ---------------- body ---------------- */
  {
    id: 'lift', loc: ['gym'], label: 'Weights (45 min)', icon: '🏋️', anim: 'gym',
    mins: 60, m: { energy: -12, mood: 12, stress: -12, fullness: -12, hydration: -12 }, agg: { exerciseMinutes: 45, water: 0.3 },
    desc: 'Physical Activity is 20% of the score — the joint-heaviest category.',
  },
  {
    id: 'cardio', loc: ['gym'], label: 'Treadmill (30 min)', icon: '🏃', anim: 'gym',
    mins: 45, m: { energy: -8, mood: 8, stress: -9, hydration: -9 }, agg: { exerciseMinutes: 30, water: 0.3 },
    desc: 'Short, honest cardio.',
  },
  {
    id: 'cricket', loc: ['ground'], label: 'Cricket with the batch', icon: '🏏', anim: 'gym',
    mins: 90, m: { energy: -14, mood: 16, stress: -14, social: 18, hydration: -12, fullness: -12 },
    agg: { exerciseMinutes: 70, socialMinutes: 90 },
    desc: 'Exercise and friends in one slot. The best-value action in the game.',
  },
  {
    id: 'walkLaps', loc: ['garden', 'ground'], label: 'Walk laps', icon: '🚶', anim: 'walkloop',
    mins: 30, m: { energy: -4, mood: 6, stress: -8 }, agg: { exerciseMinutes: 25 },
    desc: 'Low effort, real returns on stress.',
  },

  /* ---------------- people, animals, rest ---------------- */
  {
    id: 'dogs', loc: ['garden'], label: 'Sit with the campus dogs', icon: '🐕', anim: 'pet',
    mins: 45, m: { mood: 15, stress: -14, social: 6, energy: 2 }, agg: { animalMinutes: 45 },
    desc: 'Four dogs, zero expectations. Strong mood and stress effect.',
  },
  {
    id: 'breathe', loc: ['garden'], label: 'Sit quietly, no phone', icon: '🧘', anim: 'idle',
    mins: 30, m: { stress: -13, mood: 6, energy: 4 }, agg: {},
    desc: 'Twenty minutes of nothing. Counts against burnout.',
  },
  {
    id: 'hangout', loc: ['cafe'], label: 'Hang out with friends', icon: '🫂', anim: 'social',
    mins: 120, m: { mood: 16, stress: -13, social: 22, energy: -6, fullness: -8 },
    agg: { socialMinutes: 120, support: 1 },
    desc: 'Face-to-face time — what the social section of the survey measures.',
  },
  {
    id: 'vent', loc: ['cafe', 'garden', 'hostel', 'home'], label: 'Talk to someone about it', icon: '💬', anim: 'social',
    mins: 60, m: { mood: 11, stress: -18, social: 10 }, agg: { socialMinutes: 60, support: 2 },
    desc: '"Do you have someone you can comfortably talk to?" — this is that.',
  },
  {
    id: 'clubWork', loc: ['club'], label: 'Club / fest work', icon: '🎭', anim: 'study',
    mins: 120, m: { energy: -9, mood: 10, stress: 4, social: 15 }, agg: { socialMinutes: 60, club: 1 },
    desc: 'Extracurriculars: good for mood and people, costly in time.',
  },
  {
    id: 'jam', loc: ['club'], label: 'Jam session', icon: '🎸', anim: 'social',
    mins: 90, m: { energy: -6, mood: 17, stress: -12, social: 14 }, agg: { socialMinutes: 90 },
    desc: 'Nobody is good. Everybody is happy.',
  },
  {
    id: 'partnerTime', loc: ['partner'], label: 'Time with your partner', icon: '💗', anim: 'social',
    mins: 150, m: { mood: 20, stress: -17, social: 18, energy: -4 }, agg: { socialMinutes: 120, intimacy: 1, support: 2 },
    desc: 'Intimacy and closeness: large mood and stress effect, large time cost.',
  },
  {
    id: 'partnerStay', loc: ['partner'], label: 'Stay the night', icon: '🌙', anim: 'sleep',
    mins: 0, sleep: true, stayOver: true, m: { mood: 14, stress: -10, social: 12 },
    agg: { socialMinutes: 90, intimacy: 1, support: 1 },
    desc: 'Ends the day here. Late bed, good mood, 8 AM commute.',
    after: 21 * 60,
  },
  {
    id: 'party', loc: ['cafe', 'street', 'club'], label: 'Night out with the batch', icon: '🎉', anim: 'social',
    mins: 180, m: { mood: 22, stress: -16, social: 26, energy: -12, fullness: 18 },
    agg: { socialMinutes: 180, junk: 1, meals: 1 },
    desc: 'Three hours, one junk meal, and a very late bed.',
    after: 19 * 60,
  },
];

/** The full action list: core (survey-aligned) plus the wider habit set. */
export const ACTIONS = [...CORE_ACTIONS, ...EXTRA_ACTIONS];

/* ------------------------------------------------------------------ *
 * Commute (day scholars) — mirrors the survey's commute question
 * ------------------------------------------------------------------ */
export const COMMUTES = {
  Walking: { mins: 60, m: { energy: -6, mood: 3 }, agg: { exerciseMinutes: 45 }, icon: '🚶' },
  Cycling: { mins: 45, m: { energy: -8, mood: 4 }, agg: { exerciseMinutes: 40 }, icon: '🚲' },
  'Public transport': { mins: 90, m: { energy: -9, stress: 6, mood: -3 }, agg: { screenHours: 1 }, icon: '🚌' },
  'Private vehicle': { mins: 45, m: { energy: -4, stress: 3 }, agg: {}, icon: '🛵' },
};

/* ------------------------------------------------------------------ *
 * Events — fired at day start or after actions
 * ------------------------------------------------------------------ */

const CORE_EVENTS = [
  {
    id: 'surpriseViva', title: 'Surprise viva tomorrow', icon: '📣',
    text: 'The WhatsApp group explodes at 9 PM: viva tomorrow, whole unit.',
    when: (s) => s.timeMin > 20 * 60 && s.day >= 2,
    choices: [
      { label: 'All-nighter', effect: { m: { stress: 18, energy: -10 }, agg: { studyHours: 4, screenHours: 2, assignments: -3, allNighter: 1 } }, note: 'Prepared, but the night is gone.' },
      { label: 'Study 1 hour, then sleep', effect: { m: { stress: 6 }, agg: { studyHours: 1, assignments: -1 }, time: 60 }, note: 'Partial prep, normal sleep.' },
      { label: 'Ignore it', effect: { m: { stress: 12, mood: -6 } }, note: 'Tomorrow-you deals with it.' },
    ],
  },
  {
    id: 'birthday', title: "It's someone's birthday", icon: '🎂',
    text: 'Cake at midnight outside the hostel gate. Everyone is going.',
    when: (s) => s.timeMin > 21 * 60,
    choices: [
      { label: 'Go (1 hour)', effect: { m: { mood: 16, social: 20, stress: -8 }, agg: { socialMinutes: 60, junk: 1 }, time: 60 }, note: 'Cake counts as junk food.' },
      { label: 'Wave from the window', effect: { m: { mood: -4, social: -6 } }, note: 'Sleep preserved.' },
    ],
  },
  {
    id: 'deadline', title: 'Assignment deadline moved up', icon: '⏰',
    text: 'The portal now says 11:59 PM tonight. It said Sunday yesterday.',
    when: (s) => s.timeMin > 15 * 60 && s.assignments > 1,
    choices: [
      { label: 'Submit something, anything', effect: { m: { stress: 14, energy: -12 }, agg: { studyHours: 2, screenHours: 1.5, assignments: -2 }, time: 120 } },
      { label: 'Take the penalty', effect: { m: { stress: 8, mood: -8 } } },
    ],
  },
  {
    id: 'messOff', title: 'Mess is shut', icon: '🚫',
    text: 'Gas cylinder problem. No dinner at the mess tonight.',
    when: (s) => s.timeMin > 18 * 60 && s.timeMin < 21 * 60 && s.profile.stay === 'Hostel resident',
    choices: [
      { label: 'Order in', effect: { m: { fullness: 38, mood: 4 }, agg: { meals: 1, junk: 1, screenHours: 0.5 }, time: 60 } },
      { label: 'Sleep hungry', effect: { m: { fullness: -10, mood: -8, stress: 6 }, agg: { skipped: 1 } } },
    ],
  },
  {
    id: 'rain', title: 'Mumbai rain', icon: '🌧️',
    text: 'Ground flooded, gym generator down. Outdoor plans cancelled.',
    when: (s) => s.timeMin > 16 * 60 && s.timeMin < 20 * 60,
    choices: [
      { label: 'Corridor workout', effect: { m: { energy: -10, mood: 6, stress: -8 }, agg: { exerciseMinutes: 30 }, time: 45 } },
      { label: 'Chai and a long chat', effect: { m: { mood: 10, social: 12, stress: -8 }, agg: { socialMinutes: 60 }, time: 60 } },
      { label: 'Back to the room', effect: { m: { mood: -2 }, agg: { screenHours: 1 }, time: 60 } },
    ],
  },
  {
    id: 'roommate', title: 'Roommate crisis at 1 AM', icon: '🌃',
    text: 'They are not okay and they want to talk.',
    when: (s) => s.timeMin > 23 * 60 && s.profile.stay === 'Hostel resident',
    choices: [
      { label: 'Stay up with them', effect: { m: { mood: 6, social: 14, stress: 4, energy: -8 }, agg: { socialMinutes: 60, support: 2 }, time: 60 }, note: 'Costs sleep, builds the support answer.' },
      { label: 'Twenty minutes, then sleep', effect: { m: { social: 7, mood: 2 }, agg: { socialMinutes: 20, support: 1 }, time: 30 } },
    ],
  },
  {
    id: 'stomach', title: 'Street food backfired', icon: '🤢',
    text: 'Yesterday\'s roll is making itself known.',
    when: (s) => s.yesterday && s.yesterday.junk >= 2,
    choices: [
      { label: 'Skip breakfast, rest', effect: { m: { energy: -8, mood: -8, fullness: -10 }, agg: { skipped: 1 }, time: 60 } },
      { label: 'ORS, curd rice, push through', effect: { m: { hydration: 25, fullness: 20, energy: -4 }, agg: { meals: 1, water: 0.5 }, time: 45 } },
    ],
  },
  {
    id: 'placement', title: 'Placement notice', icon: '📄',
    text: 'Aptitude round on Saturday. Everyone is suddenly revising.',
    when: (s) => s.day >= 3 && s.timeMin > 11 * 60 && s.timeMin < 18 * 60,
    choices: [
      { label: 'Start prep now', effect: { m: { stress: 10, energy: -10 }, agg: { studyHours: 2, screenHours: 1 }, time: 120 } },
      { label: 'Next week', effect: { m: { stress: 6, mood: -4 } } },
    ],
  },
  {
    id: 'parentCall', title: 'Mum is calling', icon: '📞',
    text: 'Third missed call. It is about nothing and everything.',
    when: (s) => s.timeMin > 19 * 60,
    choices: [
      { label: 'Pick up, talk properly', effect: { m: { mood: 10, stress: -9, social: 8 }, agg: { socialMinutes: 30, support: 1 }, time: 30 } },
      { label: 'Text back later', effect: { m: { mood: -3, stress: 3 } } },
    ],
  },
  {
    id: 'dogHurt', title: 'Campus dog is limping', icon: '🐕',
    text: 'Bruno is favouring his back leg near the canteen.',
    when: (s) => s.timeMin > 9 * 60 && s.timeMin < 20 * 60,
    choices: [
      { label: 'Take him to the vet', effect: { m: { mood: 14, stress: -6, energy: -8, social: 6 }, agg: { animalMinutes: 60 }, time: 90 } },
      { label: 'Feed him and inform the NGO', effect: { m: { mood: 8, stress: -3 }, agg: { animalMinutes: 20 }, time: 30 } },
    ],
  },
  {
    id: 'fomo', title: 'Everyone is out and you are not', icon: '📵',
    text: 'Three stories from the same table. You stayed in to study.',
    when: (s) => s.timeMin > 21 * 60 && s.today.socialMinutes < 40,
    choices: [
      { label: 'Put the phone away', effect: { m: { mood: 2, stress: -4 } } },
      { label: 'Scroll through all of it', effect: { m: { mood: -10, stress: 8 }, agg: { screenHours: 1 }, time: 60 } },
      { label: 'Call one of them', effect: { m: { mood: 9, social: 10, stress: -6 }, agg: { socialMinutes: 30, screenHours: 0.5, support: 1 }, time: 30 } },
    ],
  },
  {
    id: 'attendanceWarning', title: 'Attendance warning', icon: '⚠️',
    text: 'Below 75% in two subjects. Mail from the department.',
    when: (s) => s.attendance < 72 && s.day >= 3,
    choices: [
      { label: 'Full attendance from tomorrow', effect: { m: { stress: 8, mood: -4 } } },
      { label: 'Medical certificate route', effect: { m: { stress: 5, mood: -2 } } },
    ],
  },
];

/** Everyday events plus the rarer anomalies. */
export const EVENTS = [...CORE_EVENTS, ...ANOMALIES];
export { MODIFIERS };

/* ------------------------------------------------------------------ *
 * Lifestyle archetypes (the project's clustering outcome, as rules)
 * ------------------------------------------------------------------ */

export const ARCHETYPES = [
  {
    id: 'balanced', name: 'The Balanced One', icon: '🌿',
    test: (c) => c.overall >= 70 && Math.min(c.sleep, c.diet, c.activity, c.wellbeing) >= 55,
    blurb: 'Sleep, food, movement and people all get a slot. Rare, and it shows in every category.',
  },
  {
    id: 'achiever', name: 'Sleep-Deprived Achiever', icon: '🌙',
    test: (c) => c.sleep < 50 && c.academic < 55,
    blurb: 'Output is high, the night is short. Your sleep and stress scores are paying for your marks.',
  },
  {
    id: 'sedentary', name: 'Sedentary & Stressed', icon: '🪑',
    test: (c) => c.activity < 45 && c.academic < 55,
    blurb: 'Hours at a desk, almost none on your feet. Activity is 20% of the score and it is dragging.',
  },
  {
    id: 'nocturnal', name: 'Nocturnal Scroller', icon: '📱',
    test: (c) => c.screen < 50 && c.sleep < 60,
    blurb: 'The screen keeps the night going. Pre-sleep screen use is half of the screen category.',
  },
  {
    id: 'social', name: 'Social Butterfly', icon: '🫂',
    test: (c) => c.wellbeing >= 70 && c.academic < 60,
    blurb: 'People keep your mood high while the academic load keeps climbing.',
  },
  {
    id: 'athlete', name: 'Ground Regular', icon: '🏏',
    test: (c) => c.activity >= 75,
    blurb: 'Daily movement. Your strongest category is the one most students score lowest on.',
  },
  {
    id: 'surviving', name: 'Running on Empty', icon: '🫗',
    test: (c) => c.overall < 45,
    blurb: 'Most categories are below half. One fixed habit — sleep first — moves the whole score.',
  },
  {
    id: 'steady', name: 'Quietly Coping', icon: '🧭',
    test: () => true,
    blurb: 'Nothing is broken, nothing is excellent. The weakest category is where the points are.',
  },
];

/** Recommendation lines, keyed by weakest category (document outcome 3). */
export const ADVICE = {
  sleep: [
    'Sleep is the heaviest single category at 20%. Moving your bed time 45 minutes earlier is the cheapest point gain available.',
    'Half the category is "do you wake up rested" — consistent timing matters as much as total hours.',
  ],
  diet: [
    'Diet is four equal parts: meals a day, junk frequency, water, skipped meals. Skipped meals are the easiest to fix.',
    'Three real meals beats two meals plus two snacks on this scale.',
  ],
  activity: [
    'Activity is 20% of the score and splits evenly between days per week and minutes per day. Four short sessions beat one long one.',
    'Cricket on the ground pays twice — activity and social connection in the same slot.',
  ],
  screen: [
    'Half of the screen category is pre-sleep use. Stopping screens 30 minutes before bed moves it more than cutting total hours.',
    'Two hours less on the phone shifts you a full band on the screen-time curve.',
  ],
  academic: [
    'The academic category is built from your stress and overwhelm ratings, not your study hours — managing load beats grinding.',
    'Short walks and talking to someone cut stress faster than extra study clears it.',
  ],
  wellbeing: [
    'Wellbeing leans on mood, campus connection and having someone to talk to. Face-to-face time is the lever.',
    'Time with friends, a partner, or the campus dogs all register here — isolation costs more than it feels like it does.',
  ],
};
