/**
 * Anomalies — the rare, disruptive things that derail a week.
 *
 * Unlike the ordinary events, most of these attach a *modifier* that lasts for
 * one or more days: illness, an injury, exam week, a dead phone, no money left.
 * Modifiers block some actions and bend the meters, which is what makes a bad
 * week look different from a lazy one in the end-of-week report.
 */

export const MODIFIERS = {
  fever: {
    id: 'fever', label: 'Viral fever', icon: '🤒', days: 3,
    blocks: ['lift', 'cardio', 'cricket', 'tournament', 'morningRun', 'party', 'drinks', 'fest'],
    dayStart: { energy: -22, mood: -10, stress: 6 },
    restedPenalty: 0.6,
    note: 'Rest, fluids, and the campus doctor shortens it.',
  },
  foodPoisoning: {
    id: 'foodPoisoning', label: 'Food poisoning', icon: '🤢', days: 2,
    blocks: ['maggi', 'streetFood', 'orderIn', 'party', 'drinks', 'lift', 'cricket'],
    dayStart: { energy: -18, fullness: -25, hydration: -25, mood: -8 },
    note: 'Nothing heavy, plenty of fluids.',
  },
  sprain: {
    id: 'sprain', label: 'Sprained ankle', icon: '🩼', days: 4,
    blocks: ['lift', 'cardio', 'cricket', 'tournament', 'morningRun', 'walkLaps', 'walkTogether', 'yoga'],
    dayStart: { mood: -6, stress: 4 },
    note: 'No exercise for a few days — activity is 20% of the score, so this hurts.',
  },
  examWeek: {
    id: 'examWeek', label: 'Exam week', icon: '📝', days: 5,
    assignmentsPerDay: 2,
    dayStart: { stress: 10, mood: -4 },
    note: 'Deadlines stack up every morning.',
  },
  brokeTillMonth: {
    id: 'brokeTillMonth', label: 'Broke till the 1st', icon: '🪙', days: 3,
    blocks: ['orderIn', 'streetFood', 'drinks', 'party', 'chai', 'coffee', 'hangout'],
    note: 'Mess food only. Free things still work: ground, garden, library, friends.',
  },
  phoneDead: {
    id: 'phoneDead', label: 'Phone screen cracked', icon: '📵', days: 2,
    blocks: ['scroll', 'datingApps', 'gaming', 'groupChatFight', 'procrastinate', 'series'],
    dayStart: { mood: -5, stress: 5 },
    note: 'Annoying — and your screen-time score has never looked better.',
  },
  heartbreak: {
    id: 'heartbreak', label: 'Break-up', icon: '💔', days: 3,
    blocks: ['partnerTime', 'partnerStay'],
    dayStart: { mood: -16, stress: 10, social: -8 },
    restedPenalty: 0.4,
    note: 'Talking to someone shortens this more than anything else does.',
  },
  homesick: {
    id: 'homesick', label: 'Homesick', icon: '🏚️', days: 2,
    dayStart: { mood: -10, social: -8 },
    note: 'A long call home or time with people takes the edge off.',
  },
  heatwave: {
    id: 'heatwave', label: 'Heatwave', icon: '🥵', days: 2,
    blocks: ['cricket', 'tournament', 'morningRun'],
    dayStart: { hydration: -20, energy: -8 },
    note: 'Outdoor sport is off. Drink more water than usual.',
  },
  festWeek: {
    id: 'festWeek', label: 'Fest week', icon: '🎊', days: 3,
    dayStart: { mood: 8, social: 10, energy: -6 },
    note: 'Everything is happening at once and nobody is sleeping.',
  },
};

export const ANOMALIES = [
  {
    id: 'aFever', title: 'You are running a temperature', icon: '🤒', anomaly: true,
    text: 'Body ache since morning, and the hostel wing already has four cases.',
    when: (s) => s.day >= 2 && s.timeMin > 8 * 60 && !s.modifiers.some((m) => m.id === 'fever'),
    choices: [
      { label: 'Go to the health centre now', effect: { m: { energy: -4, stress: -4 }, time: 60, modifier: 'fever', modifierDays: 2 }, note: 'Shorter illness.' },
      { label: 'Paracetamol and push through', effect: { m: { stress: 8, energy: -10 }, modifier: 'fever' }, note: 'Full three days of it.' },
    ],
  },
  {
    id: 'aFood', title: 'Something you ate', icon: '🤢', anomaly: true,
    text: 'The mess paneer from last night is not sitting right.',
    when: (s) => (s.yesterday ? s.yesterday.junk >= 1 : false) && s.timeMin > 7 * 60,
    choices: [
      { label: 'ORS and rest the morning', effect: { m: { hydration: 20, energy: -6 }, time: 120, modifier: 'foodPoisoning', modifierDays: 1 } },
      { label: 'Ignore it, go to class', effect: { m: { stress: 8, fullness: -15 }, modifier: 'foodPoisoning' } },
    ],
  },
  {
    id: 'aSprain', title: 'Bad landing on the ground', icon: '🩼', anomaly: true,
    text: 'You went for a catch you were never getting. The ankle is swelling.',
    when: (s) => s.today.exerciseMinutes >= 60,
    choices: [
      { label: 'Ice it and get it strapped', effect: { m: { stress: 4 }, time: 60, modifier: 'sprain', modifierDays: 3 } },
      { label: 'Walk it off', effect: { m: { mood: -6, stress: 6 }, modifier: 'sprain' } },
    ],
  },
  {
    id: 'aExams', title: 'Internals moved to next week', icon: '📝', anomaly: true,
    text: 'Four subjects, five days, and the syllabus has not changed.',
    when: (s) => s.day <= 3 && s.timeMin > 10 * 60,
    choices: [
      { label: 'Make a plan tonight', effect: { m: { stress: 6 }, time: 60, agg: { studyHours: 1 }, modifier: 'examWeek' } },
      { label: 'Panic later', effect: { m: { stress: 12, mood: -6 }, modifier: 'examWeek' } },
    ],
  },
  {
    id: 'aBroke', title: 'Account balance: ₹212', icon: '🪙', anomaly: true,
    text: 'Eleven days to go before money comes in.',
    when: (s) => s.day >= 2,
    choices: [
      { label: 'Mess food and free plans only', effect: { modifier: 'brokeTillMonth' } },
      { label: 'Ask a friend to cover you', effect: { m: { mood: -4, social: 6, stress: -4 }, agg: { socialMinutes: 20 }, modifier: 'brokeTillMonth', modifierDays: 2 } },
    ],
  },
  {
    id: 'aPhone', title: 'Your phone slid off the desk', icon: '📵', anomaly: true,
    text: 'The screen is a spiderweb. Repair takes two days.',
    when: (s) => s.day >= 2 && s.today.screenHours >= 2,
    choices: [
      { label: 'Leave it at the repair shop', effect: { modifier: 'phoneDead' }, note: 'Two days with no phone.' },
      { label: 'Use it cracked', effect: { m: { mood: -6, stress: 6 }, agg: { screenHours: 1 } } },
    ],
  },
  {
    id: 'aBreakup', title: 'That conversation happened', icon: '💔', anomaly: true,
    text: 'It had been coming for a week. It still lands like a truck.',
    when: (s) => s.day >= 3 && s.today.intimacy === 0 && s.timeMin > 17 * 60,
    choices: [
      { label: 'Call the friend who gets it', effect: { m: { mood: 4, social: 10, stress: -8 }, agg: { socialMinutes: 60, support: 2, deepTalk: 1 }, time: 60, modifier: 'heartbreak', modifierDays: 2 } },
      { label: 'Put on headphones and disappear', effect: { m: { mood: -10, social: -10 }, agg: { screenHours: 2 }, time: 120, modifier: 'heartbreak' } },
    ],
  },
  {
    id: 'aHomesick', title: 'Everyone has gone home for the weekend', icon: '🏚️', anomaly: true,
    text: 'The wing is empty and the mess is serving for eleven people.',
    when: (s) => s.profile.stay === 'Hostel resident' && s.day >= 4,
    choices: [
      { label: 'Video call home for an hour', effect: { m: { mood: 10, stress: -8 }, agg: { screenHours: 1, digitalSocial: 60, support: 1 }, time: 60 } },
      { label: 'Sit with it', effect: { modifier: 'homesick' } },
    ],
  },
  {
    id: 'aHeat', title: '41°C and the fans are losing', icon: '🥵', anomaly: true,
    text: 'Ground is closed till evening. Everyone is horizontal.',
    when: (s) => s.timeMin > 11 * 60 && s.timeMin < 17 * 60,
    choices: [
      { label: 'Indoors, hydrate, nap', effect: { m: { hydration: 25, energy: 10 }, agg: { water: 0.5 }, time: 60, modifier: 'heatwave', modifierDays: 1 } },
      { label: 'Train anyway', effect: { m: { energy: -16, hydration: -22, mood: 4 }, agg: { exerciseMinutes: 30 }, time: 60, modifier: 'heatwave' } },
    ],
  },
  {
    id: 'aFest', title: 'Fest week is declared', icon: '🎊', anomaly: true,
    text: 'Three stages, six events, and every deadline still exactly where it was.',
    when: (s) => s.day >= 2 && s.day <= 5,
    choices: [
      { label: 'In, fully', effect: { m: { mood: 12, social: 14, energy: -8 }, agg: { socialMinutes: 90, outing: 1, meetUp: 1 }, time: 90, modifier: 'festWeek' } },
      { label: 'Watch from the sidelines', effect: { m: { mood: 2 }, modifier: 'festWeek', modifierDays: 1 } },
    ],
  },
  {
    id: 'aPower', title: 'Power cut across the hostel', icon: '🔌', anomaly: true,
    text: 'No wifi, no fans, no laptop. Everyone is out in the corridor.',
    when: (s) => s.profile.stay === 'Hostel resident' && s.timeMin > 19 * 60,
    choices: [
      { label: 'Corridor adda with the wing', effect: { m: { mood: 12, social: 16, stress: -10 }, agg: { socialMinutes: 90, meetUp: 1, deepTalk: 1 }, time: 90 } },
      { label: 'Sleep early for once', effect: { m: { stress: -6 }, agg: { windDown: 1 } }, note: 'An early night is worth more than it feels like.' },
    ],
  },
  {
    id: 'aFamily', title: 'Call from home at 11 PM', icon: '📳', anomaly: true,
    text: 'Dadi is in hospital. Nothing critical, but nobody is sleeping tonight.',
    when: (s) => s.day >= 3 && s.timeMin > 22 * 60,
    choices: [
      { label: 'Book the early morning train', effect: { m: { stress: 12, mood: -8, energy: -10 }, agg: { screenHours: 1, socialMinutes: 60, support: 1 }, time: 90 }, note: 'Tomorrow is mostly travel.' },
      { label: 'Stay up on the phone with them', effect: { m: { stress: 8, mood: -4, social: 8 }, agg: { screenHours: 1.5, digitalSocial: 90, support: 1, deepTalk: 1 }, time: 90 } },
    ],
  },
  {
    id: 'aInterview', title: 'Interview call for tomorrow 9 AM', icon: '👔', anomaly: true,
    text: 'The company you forgot you applied to wants you tomorrow morning.',
    when: (s) => s.day >= 3 && s.timeMin > 18 * 60 && s.timeMin < 23 * 60,
    choices: [
      { label: 'Prepare for two hours, sleep early', effect: { m: { stress: 6, energy: -8 }, agg: { studyHours: 2, screenHours: 1 }, time: 120 } },
      { label: 'Wing it, sleep normally', effect: { m: { stress: 10 } } },
      { label: 'All-nighter on company research', effect: { m: { stress: 16, energy: -16 }, agg: { studyHours: 4, screenHours: 3, allNighter: 1 }, time: 240 } },
    ],
  },
  {
    id: 'aStrike', title: 'Transport strike', icon: '🚏', anomaly: true,
    text: 'No buses, no autos, surge pricing everywhere.',
    when: (s) => s.profile.stay !== 'Hostel resident' && s.timeMin < 11 * 60 && s.day >= 2,
    choices: [
      { label: 'Walk the 6 km', effect: { m: { energy: -12, mood: 4 }, agg: { exerciseMinutes: 70 }, time: 90 }, note: 'Counts as a full day of activity.' },
      { label: 'Stay home, attend online', effect: { m: { stress: 4 }, agg: { screenHours: 2, studyHours: 1 }, time: 120 } },
    ],
  },
];
