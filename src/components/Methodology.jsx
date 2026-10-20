import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  CATEGORY_LABELS, METHOD_NOTES, SOCIAL_ITEMS, TABLES, WEIGHTS, WEIGHTS_EXTENDED,
} from '../scoring/model.js';
import { ACTIONS, MODIFIERS } from '../game/config.js';
import { EXTRA_ACTIONS } from '../game/actions.extra.js';
import cohort from '../data/cohort.json';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const KEYS = ['sleep', 'diet', 'activity', 'screen', 'academic', 'wellbeing'];
const KEYS_EXT = [...KEYS, 'social'];
const COLORS = ['#6284f4', '#e9b95b', '#23b8a7', '#9b72e8', '#ee8d79', '#5bb7d0', '#e2719f'];

const SURVEY_MAP = [
  ['Hours of sleep per night', 'Bed time and alarm choice each night', 'Sleep'],
  ['Do you wake up rested (1–5)', 'Derived from sleep length, stress at bedtime and pre-sleep screen use', 'Sleep'],
  ['Meals per day', 'Thali, maggi, curd rice, home food, street food, party food', 'Diet'],
  ['Junk food per week', 'Maggi + samosa, street food runs, cake, ordering in', 'Diet'],
  ['Water per day', 'Drink water (free action), meals, gym', 'Diet'],
  ['Skipping meals for class or deadlines', '"Skip the meal, keep working", days that end with no meal', 'Diet'],
  ['Exercise days per week', 'Any day with 20+ minutes of activity', 'Physical Activity'],
  ['Minutes of activity per day', 'Gym, cricket, walking laps, walking across campus, walk/cycle commute', 'Physical Activity'],
  ['Daily screen hours', 'Doomscrolling, binge watching, laptop study, phone calls, transport scrolling', 'Screen Time'],
  ['Screens within 30 min of sleep', 'Whether your last screen action was within 45 minutes of bed time', 'Screen Time'],
  ['Stress rating (1–5)', 'Stress meter at the time of scoring', 'Academic Stress'],
  ['Overwhelmed by workload (1–5)', 'Pending assignments plus stress meter', 'Academic Stress'],
  ['Mood / happiness (1–5)', 'Mood meter', 'Mental Wellbeing'],
  ['Socially connected on campus (1–5)', 'Social meter plus face-to-face minutes per day', 'Mental Wellbeing'],
  ['Anxious or burnt out', 'Rolling stress and low mood, softened by time with animals', 'Mental Wellbeing'],
  ['Someone to talk to', 'Venting, calls home, partner time, roommate crisis choices', 'Mental Wellbeing'],
];

function TableCard({ title, note, rows }) {
  return (
    <div className="m-card">
      <h4>{title}</h4>
      <table className="m-table">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}><th>{k}</th><td><div className="mini-bar"><span style={{ width: `${v}%` }} /></div>{v}</td></tr>
          ))}
        </tbody>
      </table>
      {note && <p className="m-note">{note}</p>}
    </div>
  );
}

export default function Methodology() {
  const dist = cohort.distributions;
  const distChart = (d, color) => ({
    labels: d.labels,
    datasets: [{ data: d.values, backgroundColor: color, borderRadius: 5 }],
  });
  const distOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { grid: { color: '#edf0f6' }, ticks: { precision: 0 } }, y: { grid: { display: false } } },
  };

  return (
    <div className="method">
      <header className="m-head">
        <a className="back" href="#/">← Back to the simulator</a>
        <h1>Methodology</h1>
        <p>
          How the simulator turns a week of choices into the same Lifestyle Score the project's
          dashboard reports, and where the numbers come from.
        </p>
      </header>

      <section>
        <h2>1 · The project</h2>
        <p>
          The study collects lifestyle and health data from college students through a Google Form —
          sleep, diet, physical activity, screen time, academic load and stress, mental wellbeing,
          social life — and converts each response into a composite <b>Lifestyle Score out of 100</b>,
          plus six category sub-scores shown on an interactive dashboard. The stated aims are a
          validated scoring model, a dashboard with category breakdowns and peer comparison, an
          actionable recommendation layer, and lifestyle profiling of students into archetypes.
        </p>
        <p>
          This simulator is the playable form of the same model: instead of filling the form once, you
          live a week and the form fills itself from what you did.
        </p>
      </section>

      <section>
        <h2>2 · Two models</h2>
        <p>
          <b>Model A — the project model.</b> The six pillars and the exact weights set out in the
          project document. Section J of the form (socialising and relationships) is collected but
          carries no weight, because it carries none in the project's scored sheet either.
        </p>
        <div className="weights-row">
          {KEYS.map((k, i) => (
            <div className="weight" key={k} style={{ borderColor: COLORS[i] }}>
              <b>{Math.round(WEIGHTS[k] * 100)}%</b>
              <span>{CATEGORY_LABELS[k]}</span>
            </div>
          ))}
        </div>
        <p>
          <b>Model B — the extended model.</b> The same six pillars scaled down proportionally to
          make room for a seventh built from Section J, weighted 12%. Social connection is one of
          the strongest non-clinical predictors of health and wellbeing, the form already measures
          it across ten questions, and the simulator can distinguish time spent with people in
          person from time spent with them through a screen — which the survey cannot. Switch
          between the two models in the score panel; every chart and percentile follows the switch.
        </p>
        <div className="weights-row seven">
          {KEYS_EXT.map((k, i) => (
            <div className="weight" key={k} style={{ borderColor: COLORS[i] }}>
              <b>{Math.round(WEIGHTS_EXTENDED[k] * 100)}%</b>
              <span>{CATEGORY_LABELS[k]}</span>
            </div>
          ))}
        </div>
        <p className="m-note">
          Lifestyle Score = Σ (category score × weight) in both models. Model A is reported first
          everywhere, because it is the project's own definition; Model B is the research-leaning
          variant and is labelled as such.
        </p>

        <h4>Inside the social pillar</h4>
        <table className="m-table map">
          <thead><tr><th>Section J item</th><th>Weight in the pillar</th><th>In person?</th></tr></thead>
          <tbody>
            {SOCIAL_ITEMS.map((it) => (
              <tr key={it.key}>
                <td>{it.label}</td>
                <td>{Math.round(it.weight * 100)}%</td>
                <td>{it.inPerson ? <span className="pill">face-to-face</span> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="m-note">
          {Math.round(SOCIAL_ITEMS.filter((i) => i.inPerson).reduce((s, i) => s + i.weight, 0) * 100)}%
          of the social pillar is in-person contact. A long phone call registers as connection and
          support; it does not register as face-to-face time. Cohort average on this pillar:
          <b> {cohort.means.social}</b>/100.
        </p>
      </section>

      <section>
        <h2>3 · Where the scoring tables come from</h2>
        <p>
          The project's workbook already contains {cohort.nPreScored} scored responses
          (<i>Lifestyle Scores</i> sheet) but not the formulas behind them. The tables below were
          recovered by regressing those {cohort.nPreScored} scored rows against their survey answers,
          then checked back against them.
        </p>
        <div className="valid">
          <table className="m-table">
            <thead>
              <tr><th>Category</th><th>Exact matches</th><th>Within ±2</th><th>Mean error</th></tr>
            </thead>
            <tbody>
              {[...KEYS, 'overall'].map((k) => {
                const v = cohort.validation[k];
                return (
                  <tr key={k}>
                    <td>{k === 'overall' ? 'Overall score' : CATEGORY_LABELS[k]}</td>
                    <td>{v.exact}/{v.n}</td>
                    <td>{v.within2}/{v.n}</td>
                    <td>{v.mae}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="m-note">
          Sleep, Physical Activity, Screen Time and Academic Stress reproduce the workbook exactly.
          Diet reproduces {cohort.validation.diet.exact} of {cohort.validation.diet.n} rows exactly and
          the rest within one point. Mental Wellbeing is the one category the workbook does not
          reproduce from a fixed table — identical answer triples carry different scores there — so the
          simulator uses the best additive fit and says so.
        </p>
        <div className="m-grid">
          <TableCard title="Sleep — hours band" rows={Object.entries(TABLES.sleepHours)} note={METHOD_NOTES.sleep} />
          <TableCard title="Screen time — daily hours" rows={Object.entries(TABLES.screenHours)} note={METHOD_NOTES.screen} />
          <TableCard title="Screens before sleep" rows={Object.entries(TABLES.preSleepScreens)} />
          <TableCard title="Exercise — days per week" rows={Object.entries(TABLES.exerciseDays)} note={METHOD_NOTES.activity} />
          <TableCard title="Exercise — minutes per day" rows={Object.entries(TABLES.exerciseMinutes)} />
          <TableCard title="Junk food per week" rows={Object.entries(TABLES.junk)} note={METHOD_NOTES.diet} />
          <TableCard title="Water per day" rows={Object.entries(TABLES.water)} />
          <TableCard title="Skipping meals" rows={Object.entries(TABLES.skipMeals)} />
          <TableCard title="Meals per day" rows={Object.entries(TABLES.meals)} />
        </div>
        <p className="m-note">
          Academic Stress = 50% inverted stress rating + 50% inverted "overwhelmed by workload", both
          1–5. {METHOD_NOTES.wellbeing}
        </p>
      </section>

      <section>
        <h2>4 · From survey bands to live play</h2>
        <p>
          A survey asks "how many hours do you sleep" and gets a band. The simulator knows the exact
          number, so each band table becomes a piecewise-linear curve through the band centres. A night
          of 6 h 20 m therefore scores between the 6–7 and 7–8 bands instead of snapping to one of them,
          which is what lets the score move while you play.
        </p>
        <table className="m-table map">
          <thead><tr><th>Survey item</th><th>Filled in-game by</th><th>Category</th></tr></thead>
          <tbody>
            {SURVEY_MAP.map(([q, how, cat]) => (
              <tr key={q}><td>{q}</td><td>{how}</td><td><span className="pill">{cat}</span></td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>5 · The cohort you are compared against</h2>
        <p>
          Percentiles and the dashed markers on every bar come from the {cohort.n} form responses in
          the project dataset, re-scored with the model above (mean overall score
          <b> {cohort.means.overall}</b>, self-rated lifestyle averaged {cohort.selfRatingMean}/10).
        </p>
        <div className="m-grid charts">
          <div className="m-card"><h4>Hours of sleep per night</h4><div className="chart sm"><Bar data={distChart(dist.sleep, '#6284f4')} options={distOpts} /></div></div>
          <div className="m-card"><h4>Exercise days per week</h4><div className="chart sm"><Bar data={distChart(dist.exercise, '#23b8a7')} options={distOpts} /></div></div>
          <div className="m-card"><h4>Daily screen hours</h4><div className="chart sm"><Bar data={distChart(dist.screen, '#9b72e8')} options={distOpts} /></div></div>
          <div className="m-card"><h4>Junk food per week</h4><div className="chart sm"><Bar data={distChart(dist.junk, '#e9b95b')} options={distOpts} /></div></div>
          <div className="m-card"><h4>Water per day</h4><div className="chart sm"><Bar data={distChart(dist.water, '#5bb7d0')} options={distOpts} /></div></div>
          <div className="m-card"><h4>Skipping meals</h4><div className="chart sm"><Bar data={distChart(dist.skipMeals, '#ee8d79')} options={distOpts} /></div></div>
          <div className="m-card"><h4>Face-to-face time per day</h4><div className="chart sm"><Bar data={distChart(cohort.socialItems.faceTime, '#e2719f')} options={distOpts} /></div></div>
          <div className="m-card"><h4>Meeting people outside class</h4><div className="chart sm"><Bar data={distChart(cohort.socialItems.meetUps, '#e2719f')} options={distOpts} /></div></div>
          <div className="m-card"><h4>Someone to talk to on a bad day</h4><div className="chart sm"><Bar data={distChart(cohort.socialItems.support, '#5bb7d0')} options={distOpts} /></div></div>
        </div>
        <div className="byyear">
          <h4>Average score by year of study</h4>
          <div className="byyear-row">
            {cohort.byYear.map((y) => (
              <div key={y.year} className="byyear-item">
                <b>{y.overall}</b><span>{y.year}</span><i>n={y.n}</i>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>6 · Habits the survey does not ask about</h2>
        <p>
          A questionnaire of 43 questions cannot cover a week of student life. The simulator adds
          caffeine, smoking, drinking, part-time work, chores, cooking, counselling, volunteering,
          gaming, dating apps, group-chat fights and procrastination — {EXTRA_ACTIONS.length} actions
          in all. None of them score points of their own. They move the meters and the counters the
          validated model already reads, so the score stays the project's score:
        </p>
        <ul className="limits">
          <li><b>Caffeine, smoking, alcohol</b> cost sleep <i>quality</i>, not sleep length — they reduce how rested you wake, which is half of the sleep category.</li>
          <li><b>Drinking</b> also carries into the next morning as lost energy, mood and hydration.</li>
          <li><b>Gaming, dating apps, procrastination, group-chat fights</b> are screen hours, and screen hours are 15% of the score.</li>
          <li><b>Reading, journalling, chores</b> are leisure with no screen attached, and journalling before bed clears the pre-sleep screen flag.</li>
          <li><b>Counselling, volunteering, family time, long walks</b> feed the support and face-to-face counters that the wellbeing and social pillars read.</li>
          <li><b>Part-time work</b> costs time, energy and stress — the trade-off a working student actually makes.</li>
        </ul>
      </section>

      <section>
        <h2>7 · Anomalies</h2>
        <p>
          Two different things are called anomalies here.
        </p>
        <p>
          <b>Anomalous days</b> are flagged in the day and week reports when a day falls outside
          what the cohort looks like. The cut-offs and the "n% of the cohort" lines are computed
          from the {cohort.n} responses:
        </p>
        <table className="m-table map">
          <thead><tr><th>Flag</th><th>Triggers at</th><th>In the cohort</th></tr></thead>
          <tbody>
            <tr><td>Severe short sleep</td><td>under {cohort.thresholds.sleepVeryLow} h</td><td>{cohort.cohortShare.sleepUnder4}% of students</td></tr>
            <tr><td>Short sleep</td><td>under {cohort.thresholds.sleepLow} h</td><td>{cohort.cohortShare.sleepUnder5}% of students</td></tr>
            <tr><td>Oversleeping</td><td>over {cohort.thresholds.sleepHigh} h</td><td>scores below the 7–9 h band</td></tr>
            <tr><td>Heavy screen day</td><td>{cohort.thresholds.screenHigh} h or more</td><td>{cohort.cohortShare.screenOver10}% of students</td></tr>
            <tr><td>Socially isolated day</td><td>under {cohort.thresholds.faceLow} min face-to-face</td><td>{cohort.cohortShare.faceUnder30}% of students</td></tr>
            <tr><td>Barely ate</td><td>{cohort.thresholds.mealsLow} meal or fewer</td><td>—</td></tr>
            <tr><td>Junk-heavy day</td><td>{cohort.thresholds.junkHigh}+ junk meals</td><td>—</td></tr>
            <tr><td>Dehydrated</td><td>under {cohort.thresholds.waterLow} L</td><td>—</td></tr>
            <tr><td>Others</td><td colSpan={2}>all-nighter · no movement at all · drinking · 2+ late coffees · 2+ smoke breaks · a fight in the group chat</td></tr>
          </tbody>
        </table>
        <p>
          <b>Anomaly events</b> are the rare disruptions that derail a week: viral fever, food
          poisoning, a sprained ankle, exam week, running out of money, a cracked phone, a break-up,
          a heatwave, fest week, a power cut, a family emergency, a surprise interview, a transport
          strike. Most attach a condition that lasts days, blocks some actions and bends the meters:
        </p>
        <div className="m-grid">
          {Object.values(MODIFIERS).map((m) => (
            <div className="m-card" key={m.id}>
              <h4>{m.icon} {m.label} · {m.days} days</h4>
              <p className="m-note">
                {m.note}
                {m.blocks ? <><br /><i>blocks: {m.blocks.length} actions</i></> : null}
              </p>
            </div>
          ))}
        </div>
        <p className="m-note">
          Anomaly events are deliberately rarer than ordinary events — about one in four eligible
          draws — so a week usually carries one or two of them. Seeing the campus doctor cuts an
          illness short.
        </p>
      </section>

      <section>
        <h2>8 · Action effects</h2>
        <p>Every action in the game and what it writes into the score.</p>
        <table className="m-table map">
          <thead><tr><th>Action</th><th>Time</th><th>Writes</th></tr></thead>
          <tbody>
            {ACTIONS.filter((a) => !a.sleep).map((a) => (
              <tr key={a.id}>
                <td>{a.icon} {a.label}</td>
                <td>{a.mins} min</td>
                <td className="small">
                  {Object.entries(a.agg || {}).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(' · ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>9 · Limits</h2>
        <ul className="limits">
          <li>The scoring tables are reconstructed, not copied from the original workbook formulas, which were not stored in the file.</li>
          <li>Mental Wellbeing is a fitted approximation (mean error {cohort.validation.wellbeing.mae} points against the workbook).</li>
          <li>The cohort is {cohort.n} responses from one college, self-reported, and includes generated responses merged into the real ones by the project team.</li>
          <li>Action effects on the meters are designed for a readable one-week arc, not measured from the literature. The scoring step after the meters is the part that follows the dataset.</li>
          <li>Attendance, CGPA, clubs, commute mode and social-media hours are tracked and shown but carry no weight in model A, because they carry none in the original scored sheet.</li>
          <li>The 12% weight on the social pillar in model B is a judgement call, not a number estimated from this dataset. It is kept separate from model A for exactly that reason.</li>
          <li>Caffeine, smoking, drinking and the other added habits have plausible directions of effect but their magnitudes here are tuned for a readable week, not taken from trial data.</li>
          <li>Anomaly cut-offs use the cohort's own distribution, which is 137 self-reported responses from one college — a wider sample would move them.</li>
        </ul>
      </section>

      <footer className="m-foot">
        College Lifestyle Score + Health Dashboard · simulator built on the project's own survey data
        ({cohort.n} responses) and scoring model.
      </footer>
    </div>
  );
}
