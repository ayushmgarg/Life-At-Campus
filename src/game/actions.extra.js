/**
 * The rest of student life.
 *
 * These actions are not drawn from the project's questionnaire the way the core
 * set is — they are the habits the survey does not ask about directly (caffeine,
 * smoking, drinking, part-time work, chores, counselling, volunteering, gaming,
 * procrastination). None of them score points of their own: they move the meters
 * and the sleep/diet/activity/screen/social counters that the validated model
 * already reads, so the score stays the project's score.
 */

export const EXTRA_ACTIONS = [
  /* ---------------- food ---------------- */
  {
    id: 'breakfast', loc: ['canteen', 'home', 'hostel'], label: 'Actually eat breakfast', icon: '🥣', anim: 'eat',
    mins: 30, m: { fullness: 32, energy: 11, mood: 3, hydration: 5 }, agg: { meals: 1, water: 0.2 },
    desc: 'The meal students skip most. Counts as a full meal.',
    windows: [[6 * 60, 10 * 60 + 30]],
  },
  {
    id: 'cookSelf', loc: ['hostel', 'home'], label: 'Cook / meal prep', icon: '🍳', anim: 'eat',
    mins: 60, m: { fullness: 44, energy: 6, mood: 7, stress: -4 }, agg: { meals: 1, water: 0.2, cooked: 1 },
    desc: 'Pantry maggi upgraded with eggs and vegetables. Better than ordering, cheaper than both.',
  },
  {
    id: 'orderIn', loc: ['hostel', 'home'], label: 'Order in', icon: '🛵', anim: 'eat',
    mins: 45, m: { fullness: 42, mood: 9, energy: 2 }, agg: { meals: 1, junk: 1, screenHours: 0.5 },
    desc: 'Forty minutes of browsing, one biryani. Junk counter +1.',
  },
  {
    id: 'coffee', loc: ['canteen', 'cafe', 'library'], label: 'Third coffee / energy drink', icon: '🥤', anim: 'eat',
    mins: 15, m: { energy: 16, stress: 5, hydration: -6 }, agg: { caffeine: 1 },
    desc: 'Buys an hour now. Costs sleep quality tonight.',
  },

  /* ---------------- body ---------------- */
  {
    id: 'yoga', loc: ['garden', 'hostel', 'home'], label: 'Yoga / stretching', icon: '🧘', anim: 'gym',
    mins: 40, m: { energy: 4, stress: -14, mood: 8 }, agg: { exerciseMinutes: 30 },
    desc: 'Counts as activity and is the cheapest stress drop in the game.',
  },
  {
    id: 'morningRun', loc: ['ground', 'garden'], label: 'Morning run', icon: '🏃', anim: 'gym',
    mins: 45, m: { energy: -7, mood: 13, stress: -11, hydration: -8 }, agg: { exerciseMinutes: 35 },
    desc: 'Before class. Sets up the whole day.',
    windows: [[5 * 60, 9 * 60]],
  },
  {
    id: 'tournament', loc: ['ground'], label: 'Inter-college tournament', icon: '🏆', anim: 'gym',
    mins: 180, m: { energy: -20, mood: 20, stress: -12, social: 22, hydration: -16, fullness: -16 },
    agg: { exerciseMinutes: 120, socialMinutes: 150, outing: 1, meetUp: 1 },
    desc: 'An afternoon of sport and people. Huge on activity and social, brutal on time.',
  },
  {
    id: 'walkTogether', loc: ['garden', 'ground'], label: 'Long walk with a friend', icon: '🚶‍♀️', anim: 'walkloop',
    mins: 60, m: { energy: -4, mood: 14, stress: -14, social: 14 },
    agg: { exerciseMinutes: 45, socialMinutes: 60, deepTalk: 1, meetUp: 1 },
    desc: 'Activity and in-person conversation in one hour — the best-value social action.',
  },

  /* ---------------- health & support ---------------- */
  {
    id: 'counselling', loc: ['wellness'], label: 'Counselling session', icon: '🫱', anim: 'social',
    mins: 60, m: { stress: -24, mood: 12, social: 6 }, agg: { support: 2, deepTalk: 1, counselling: 1 },
    desc: 'Free on campus. The largest single stress drop available.',
  },
  {
    id: 'clinic', loc: ['wellness'], label: 'See the campus doctor', icon: '💊', anim: 'idle',
    mins: 60, m: { energy: 8, stress: -6 }, agg: { treated: 1 },
    desc: 'Clears illness in a day instead of three.',
  },

  /* ---------------- people ---------------- */
  {
    id: 'volunteer', loc: ['club', 'garden'], label: 'NSS / volunteering drive', icon: '🤝', anim: 'social',
    mins: 150, m: { energy: -10, mood: 16, stress: -8, social: 16 },
    agg: { socialMinutes: 120, exerciseMinutes: 20, meetUp: 1, volunteer: 1 },
    desc: 'Tiring, and reliably good for mood and connection.',
  },
  {
    id: 'fest', loc: ['club', 'ground'], label: 'College fest night', icon: '🎪', anim: 'social',
    mins: 210, m: { energy: -18, mood: 24, stress: -14, social: 28, fullness: -10 },
    agg: { socialMinutes: 180, junk: 1, meals: 1, outing: 1, meetUp: 1 },
    desc: 'The best night of the semester and the worst night of sleep.',
    after: 18 * 60,
  },
  {
    id: 'groupProject', loc: ['library', 'club'], label: 'Group project meeting', icon: '🧑‍🤝‍🧑', anim: 'study',
    mins: 120, m: { energy: -10, stress: 4, social: 12 },
    agg: { studyHours: 1.5, assignments: -1, socialMinutes: 80, meetUp: 1 },
    desc: 'Half of it is work. All of it is face-to-face time.',
  },
  {
    id: 'familyTime', loc: ['home'], label: 'Sit with family', icon: '👪', anim: 'social',
    mins: 90, m: { mood: 14, stress: -12, social: 14 },
    agg: { socialMinutes: 90, support: 1, deepTalk: 1, meetUp: 1 },
    desc: 'The day-scholar advantage, part two.',
  },
  {
    id: 'callFriend', loc: ['hostel', 'home', 'garden', 'library'], label: 'Long call with a close friend', icon: '☎️', anim: 'phone',
    mins: 60, m: { mood: 12, stress: -10, social: 12 },
    agg: { screenHours: 0.5, digitalSocial: 60, support: 1, deepTalk: 1 },
    desc: 'Counts as connection — but not as in-person contact.',
  },

  /* ---------------- offline time ---------------- */
  {
    id: 'reading', loc: ['library', 'garden', 'hostel', 'home'], label: 'Read something not for marks', icon: '📕', anim: 'study',
    mins: 60, m: { mood: 10, stress: -10, energy: -2 }, agg: { offline: 1 },
    desc: 'Leisure with no screen time attached.',
  },
  {
    id: 'journal', loc: ['hostel', 'home'], label: 'Journal before bed', icon: '✍️', anim: 'study',
    mins: 30, m: { stress: -12, mood: 6 }, agg: { offline: 1, windDown: 1 },
    desc: 'Winds you down without a screen, so it protects the screen score too.',
    after: 20 * 60,
  },
  {
    id: 'chores', loc: ['hostel', 'home'], label: 'Laundry & clean the room', icon: '🧺', anim: 'idle',
    mins: 60, m: { energy: -6, mood: 8, stress: -6 }, agg: { chores: 1 },
    desc: 'Boring, and the room you sleep in gets better.',
  },

  /* ---------------- work ---------------- */
  {
    id: 'partTime', loc: ['cafe', 'library'], label: 'Part-time shift / freelance', icon: '💼', anim: 'study',
    mins: 180, m: { energy: -16, stress: 9, mood: 2, social: 3 }, agg: { screenHours: 2, work: 1 },
    desc: 'Three hours of paid work. Real for a lot of students, expensive in everything else.',
  },

  /* ---------------- the costly habits ---------------- */
  {
    id: 'gaming', loc: ['hostel', 'home'], label: 'Late-night gaming lobby', icon: '🎮', anim: 'phone',
    mins: 180, m: { mood: 14, stress: -8, social: 9, energy: -8 },
    agg: { screenHours: 3, digitalSocial: 60 },
    desc: 'Friends, but through a headset, after midnight.',
    after: 20 * 60,
  },
  {
    id: 'datingApps', loc: ['hostel', 'home', 'cafe'], label: 'Swipe through dating apps', icon: '💘', anim: 'phone',
    mins: 45, m: { mood: -3, stress: 4, social: 2 }, agg: { screenHours: 0.75 },
    desc: 'Mostly screen time with a side of disappointment.',
  },
  {
    id: 'groupChatFight', loc: ['hostel', 'home', 'canteen'], label: 'Argue in the group chat', icon: '💢', anim: 'phone',
    mins: 45, m: { mood: -12, stress: 14, social: -6 }, agg: { screenHours: 0.75, conflict: 1 },
    desc: 'Nobody wins. Costs mood, stress and screen time at once.',
  },
  {
    id: 'smoke', loc: ['canteen', 'street', 'hostel'], label: 'Smoke break outside', icon: '🚬', anim: 'idle',
    mins: 20, m: { stress: -7, mood: 2, energy: -3 }, agg: { smoke: 1, socialMinutes: 15 },
    desc: 'Short relief now, worse sleep and recovery tonight.',
  },
  {
    id: 'drinks', loc: ['street', 'cafe'], label: 'Drinks with the batch', icon: '🍻', anim: 'social',
    mins: 180, m: { mood: 20, stress: -16, social: 24, fullness: 16, energy: -10 },
    agg: { socialMinutes: 150, junk: 1, meals: 1, alcohol: 1, outing: 1, meetUp: 1 },
    desc: 'Great night, flat morning: less energy tomorrow and worse sleep quality tonight.',
    after: 20 * 60,
  },
  {
    id: 'procrastinate', loc: ['hostel', 'home', 'library'], label: 'Procrastination spiral', icon: '🌀', anim: 'phone',
    mins: 120, m: { mood: -8, stress: 12, energy: -5 }, agg: { screenHours: 2 },
    desc: 'Two hours gone, assignment untouched, guilt added.',
  },
];

/**
 * Habits that carry over into the next day rather than scoring immediately.
 * Applied in the store when a day ends.
 */
export const CARRY_OVER = {
  alcohol: {
    label: 'Hangover',
    rested: -0.8,
    next: { energy: -18, mood: -6, stress: 6, hydration: -20 },
    note: 'Last night\'s drinking: you wake up flat and dehydrated.',
  },
  caffeine: {
    label: 'Over-caffeinated',
    perUnitRested: -0.35,
    note: 'Caffeine late in the day cut your sleep quality.',
  },
  smoke: {
    label: 'Smoking',
    perUnitRested: -0.2,
    next: { energy: -3 },
    note: 'Smoking took a bite out of your recovery.',
  },
};
